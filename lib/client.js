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
		try {
			server.listen(config.port, config.host, function() {
				log.info('Client server bound to '+config.host+':'+config.port);
			});
		}
		catch (e) {
			log.error('Could not bind Client Server to '+config.host+':'+config.port);
		}

		io = socketIo.listen(server);
		io.set('logger', log);

		io.sockets.on('connection', function(socket) {
			socket.on('auth', function(userId, hash) {
				onAuth(socket, userId, hash);
			});
			socket.on('disconnect', function() {
				onDisconnect(socket);
			});
		});
	}

	this.send = function(userId, message) {
		var sessions = storage.getSessions(userId);

		var length = sessions.length, i, socket;
		for (i = 0; i < length; ++i) {
			socket = getSocket(sessions[i]);
			if (socket) {
				socket.send(JSON.stringify(message));
			}
		}
	}

	function getSocket(sessionId) {
		return io.sockets.sockets[sessionId];
	}

	function onAuth(socket, userId, hash) {
		if (userId && hash) {
			log.debug('Authing userId ' + userId + ', hash ' + hash);
			if (storage.auth(userId, hash, socket.id)) {
				socket.userId = userId;
				socket.hash = hash;
			}
			else {
				socket.disconnect();
			}
		}
	}

	function onDisconnect(socket) {
		if (socket.userId) {
			log.debug('Disconnected userId ' + socket.userId + ', socketId ' + socket.id);
			storage.disconnect(socket.userId, socket.id);
		}
	}
}