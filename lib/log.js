module.exports = new function () {
	var logToConsole = true;
	var syslog = null;
	var config = {};

	this.setConfig = function(newConfig) {
		config = newConfig;
		if (config.syslog && config.syslog.enable) {
			syslog = require('node-syslog');
			syslog.init(config.syslog.tag, syslog.LOG_PID | syslog.LOG_ODELAY, syslog[config.syslog.facility]);
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
						syslog.log(syslog.LOG_DEBUG, message);
						break;
					case 'info':
						syslog.log(syslog.LOG_INFO, message);
						break;
					case 'error':
						syslog.log(syslog.LOG_ERR, message);
						break;
					case 'warn':
						syslog.log(syslog.LOG_WARNING, message);
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
