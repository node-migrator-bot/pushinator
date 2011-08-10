module.exports = new function () {
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
		if (config.useSSL) {
			var https = require('https');
			var fs = require('fs');
			server = https.createServer({
				key: fs.readFileSync(config.sslKey),
				cert: fs.readFileSync(config.sslCert)
			});
		}
		else {
			var http = require('http');
			server = http.createServer();
		}

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
		io.set('transports', config.socketIoTransports);

		log.debug('transports', io.get('transports'));

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
			log.debug('Authenticating userId ' + userId + ', hash ' + hash);
			if (storage.auth(userId, hash, socket.id)) {
				socket.set('userId', userId);
			}
			else {
				socket.disconnect();
			}
		}
	}

	function onDisconnect(socket) {
		socket.get('userId', function(err, userId) {
			log.debug('Disconnecting userId ' + userId + ', socketId ' + socket.id);
			storage.disconnect(userId, socket.id);
		});
	}
}
