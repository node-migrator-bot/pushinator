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
		server.listen(config.port, config.host, function() {
			log.info('Admin server bound to '+config.host+':'+config.port);
		});
	}

	function processRequest(req, res) {
		/*
		var code = 200;
		var response = "{'status': "+code+", 'error': 'I\\'m a Teapot'}";
		*/

		var path = url.parse(req.url).pathname;

		log.debug('processing '+req.method+' request, path: '+path);

		if (req.method == 'POST') {
			switch (path) {
				case '/user/register':
					handlePost(req, res, function(data) {
						if (data.userId && data.hash) {
							log.debug('POST /user/register', data);
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
							log.debug('POST /user/send', data);
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
					log.debug('POST /user/list');
					var users = storage.getUsers();
					sendResponse(res, 200, {'result': 'OK', 'users': users});
					break;
				default:
					sendResponse(res, 404, {'error': 'Not Found'});
			}
		}
		else {
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
