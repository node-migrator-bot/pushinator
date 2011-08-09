module.exports = new function () {
	var logToConsole = false;
	var syslog = null;
	var config = {};

	this.setConfig = function(newConfig) {
		config = newConfig;
		if (config.syslog && config.syslog.enable) {
			syslog = require('./ain').set(config.syslog.tag, config.syslog.facility, config.syslog.hostname);
		}
		else {
			syslog = null;
		}
	}

	this.logToConsole = function(state) {
		logToConsole = state;
	}

	this.log = function(level, messageList) {
		if ('debug' == level && !config.debug) {
			return;
		}

		var length = messageList.length;
		for (var i=0; i<length; ++i) {
			var message = messageList[i];

			if ('object' == typeof message || 'array' == typeof message) {
				message = JSON.stringify(message);
			}

			if (syslog) {
				switch (level) {
					case 'debug':
						syslog.debug(message);
						break;
					case 'info':
						syslog.info(message);
						break;
					case 'error':
						syslog.error(message);
						break;
					case 'warn':
						syslog.warn(message);
						break;
				}
			}

			if (logToConsole) {
				console.log(new Date().toLocaleString() + ' pushinator[' + process.pid + '] ' + level + ': ' + message);
			}
		}
	}

	this.debug = function() {
		this.log('debug', arguments);
	}

	this.info = function() {
		this.log('info', arguments);
	}

	this.error = function() {
		this.log('error', arguments);
	}

	this.warn = function() {
		this.log('warn', arguments);
	}
}
