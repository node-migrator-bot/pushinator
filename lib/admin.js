module.exports = new function () {
	var http = require('http');
	var url = require('url');

	var log = null;
	var storage = null;
	var client = null;
	var server = null;

	this.setLog = function(newLog) {
		log = newLog;
	}

	this.setStorage = function(newStorage) {
		storage = newStorage;
	}

	this.setClient = function(newClient) {
		client = newClient;
	}

	this.listen = function(config) {
		server = http.createServer(processRequest);
		try {
			server.listen(config.port, config.host, function() {
				log.info('Admin server bound to '+config.host+':'+config.port);
			});
		}
		catch (e) {
			log.error('Could not bind Admin Server to '+config.host+':'+config.port);
		}
	}

	function processRequest(req, res) {
		var path = url.parse(req.url).pathname;

		log.debug('processing '+req.method+' request, path: '+path);

		if (req.method == 'POST') {
			switch (path) {
				case '/user/register':
					handlePost(req, res, function(data) {
						if (data.userId && data.hash) {
							storage.register(data.userId, data.hash);
							sendResponse(res, 200, {'result': 'OK'});
						}
						else {
							var error = 'Missing userId or hash in data';
							log.error(error + ': ' + JSON.stringify(data));
							sendResponse(res, 400, {'error': error, 'data': data});
						}
					});
					break;
				case '/user/send':
					handlePost(req, res, function(data) {
						if (data.userId && data.message) {
							client.send(data.userId, data.message);
							sendResponse(res, 200, {'result': 'OK'});
						}
						else {
							var error = 'Missing userId or message in data';
							log.error(error + ': ' + JSON.stringify(data));
							sendResponse(res, 400, {'error': error, 'data': data});
						}
					});
					break;
				case '/user/list':
					var users = storage.getUsers();
					sendResponse(res, 200, {'result': 'OK', 'users': users});
					break;
				case '/doit':
					sendResponse(res, 200, {'result': 'it\'s done'});
					break;
				case '/dude':
					sendResponse(res, 200, {'result': 'sweet'});
					break;
				case '/teapot':
					sendResponse(res, 200, {'result': 'i\'m a teapot'});
					break;
				case '/ping':
					sendResponse(res, 200, {'result': 'pong'});
					break;
				case '/stats':
					var stats = {
						'memoryUsage': process.memoryUsage()
					}
					sendResponse(res, 200, {'result': 'OK', 'stats': stats});
					break;
				default:
					log.debug('404 Path Not Found: '+path);
					sendResponse(res, 404, {'error': 'Not Found'});
			}
		}
		else {
			log.debug('405 Method Not Allowed: '+req.method+" "+path);
			sendResponse(res, 405, {'error': 'Method Not Allowed'});
		}
	}

	function sendResponse(res, code, body) {
		body.status = code;
		res.writeHead(code, {'Content-Type': 'application/json'})
		res.write(JSON.stringify(body), 'utf8');
		res.end();
	}

	function handlePost(req, res, callback) {
		req.setEncoding('utf8');

		var body = '';
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			try {
				var data = JSON.parse(body.toString());
				log.debug(data);
			}
			catch (e) {
				var error = 'Not A JSON Body: ' + body;
				log.error(error);
				sendResponse(res, 400, {'error': error});
				return;
			}
			callback(data);
		});
	}
}
