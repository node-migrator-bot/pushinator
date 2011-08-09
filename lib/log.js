module.exports = new function () {
	var loggers = {
		'syslog': null,
		'console': null
	};

	var config = {};

	this.setConfig = function(newConfig) {
		config = newConfig;
		if (config.syslog && config.syslog.enable) {
			loggers['syslog'] = require('./ain').set(config.syslog.tag, config.syslog.facility, config.syslog.hostname);
		}
		else {
			loggers['syslog'] = null;
		}
	}

	this.logToConsole = function(state) {
		if (state) {
			loggers['console'] = console;
		}
		else {
			loggers['console'] = null;
		}
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

			for (key in loggers) {
				if (loggers.hasOwnProperty(key) && loggers[key]) {
					switch (level) {
						case 'debug':
							loggers[key].debug(message);
							break;
						case 'info':
							loggers[key].info(message);
							break;
						case 'error':
							loggers[key].error(message);
							break;
						case 'warn':
							loggers[key].warn(message);
							break;
					}
				}
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
