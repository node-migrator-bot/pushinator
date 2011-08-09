module.exports = new function () {
	var data = {};
	var log = null;

	this.setLog = function(newLog) {
		log = newLog;
	}

	this.register = function(userId, hash) {
		if (null == data[userId]) {
			data[userId] = {
				hash: hash,
				sessions: {}
			};
			log.info('Registered new user with userId ' + userId + ', hash ' + hash);
		}
		else {
			data[userId].hash = hash;
			log.info('Updated user with userId ' + userId + ', hash ' + hash);
		}
	}

	this.auth = function(userId, hash, sessionId) {
		if (null == data[userId]) {
			log.debug('Authentication failed for user ' + userId + ', unknown');
			return false;
		}

		if (hash != data[userId].hash) {
			log.debug('Authentication failed for user ' + userId + ', wrong hash, expected ' + data[userId].hash + ', got ' + hash);
			return false;
		}

		log.info('User authenticated with userId ' + userId + ', hash ' + hash + ', sessionId ' + sessionId);
		data[userId].sessions[sessionId] = true;
		return true;
	}

	this.disconnect = function(userId, sessionId) {
		if (null == data[userId]) {
			log.debug('Disconnect failed for user ' + userId + ', unknown');
			return;
		}

		log.info('Deleting session ' + sessionId + ' of user ' + userId);
		delete data[userId].sessions[sessionId];

		if (0 == getCount(data[userId].sessions)) {
			log.info('Deleting user ' + userId + ', last session has left the building');
			delete data[userId];
		}
	}

	this.getUsers = function() {
		log.debug('getUsers', data);

		var result = [];
		for (userId in data) {
			if (data.hasOwnProperty(userId)) {
				result.push(userId);
			}
		}
		return result;
	}

	this.getSessions = function(userId) {
		var result = [];

		if (null == data[userId]) {
			log.debug('No sessions found for user ' + userId + ', unknown');
			return result;
		}

		for (sessionId in data[userId].sessions) {
			if (data[userId].sessions.hasOwnProperty(sessionId)) {
				result.push(sessionId);
			}
		}

		return result;
	}

	function getCount(obj) {
    	var size = 0;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				++size;
			}
		}
		return size;
	}
}
