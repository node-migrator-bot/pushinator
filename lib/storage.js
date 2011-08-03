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
			log.debug('register new user with userId ' + userId + ', hash ' + hash);
		}
		else {
			data[userId].hash = hash;
			log.debug('updating user with userId ' + userId + ', hash ' + hash);
		}
	}

	this.auth = function(userId, hash, sessionId) {
		if (null == data[userId]) {
			log.debug('auth failed for user ' + userId + ', unknown');
			return false;
		}

		if (hash != data[userId].hash) {
			log.debug('auth failed for user ' + userId + ', wrong hash, expected ' + data[userId].hash + ', got ' + hash);
			return false;
		}

		log.debug('user authed with userId ' + userId + ', hash ' + hash + ', sessionId ' + sessionId);
		data[userId].sessions[sessionId] = true;
		return true;
	}

	this.disconnect = function(userId, sessionId) {
		if (null == data[userId]) {
			log.debug('disconnect failed for user ' + userId + ', unknown');
			return;
		}

		log.debug('deleting session ' + sessionId + ' of user ' + userId);
		delete data[userId].sessions[sessionId];

		if (0 == getCount(data[userId].sessions)) {
			log.debug('deleting user ' + userId + ', last session has left the building');
			delete data[userId];
		}
	}

	this.getUsers = function() {
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
			log.debug('no sessions found for user ' + userId + ', unknown');
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