module.exports = new function () {
	var http = require('http');
	var socketIo = require('socket.io');

	var log = null;
	var storage = null;
	var server = null;
	var io = null;

	this.setLog = function(newLog) {
		log = newLog;
	}

	this.setStorage = function(newStorage) {
		storage = newStorage;
	}

	this.listen = function(config) {
		server = http.createServer();
		server.listen(config.port, config.host, function() {
			log.info('Client server bound to '+config.host+':'+config.port);
		});

		io = socketIo.listen(server);

		io.sockets.on('connection', function(socket) {
			socket.on('auth', function(userId, hash) {
				onMessage(socket, userId, hash);
			});
			socket.on('disconnect', function() {
				onDisconnect(socket);
			});
		});
	}

	function onMessage(socket, userId, hash) {
		log.debug('Authing userId ' + userId + ', hash ' + hash);
		if (storage.auth(userId, hash, socket.id)) {
			socket.userId = userId;
			socket.hash = hash;
		}
		else {
			// TODO disconnect client
		}
	}

	function onDisconnect(socket) {
		log.debug('Disconnected userId ' + socket.userId + ', socketId ' + socket.id);
		storage.disconnect(socket.userId, socket.id);
	}
}