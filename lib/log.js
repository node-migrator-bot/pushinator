module.exports = new function () {
	var sys = require('sys');

	this.option = {};

	this.setOptions = function(options) {
		this.options = options;
	}

	this.log = function(level, messageList) {
		var length = messageList.length;
		for (var i=0; i<length; ++i) {
			var message = messageList[i];

			if ('object' == typeof message || 'array' == typeof message) {
				message = JSON.stringify(message);
			}

			sys.puts(level+': '+message);
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
}
