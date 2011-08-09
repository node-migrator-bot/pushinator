#!/usr/bin/env node

var log = require('./lib/log.js')
  , storage = require('./lib/storage.js')
  , client = require('./lib/client.js')
  , admin = require('./lib/admin.js')
  , daemon = require('daemon')
  , path = require('path')
  , fs = require('fs')
  , init = require('init')
;

var config = {};

// parse options
var options = require("nomnom").opts({
	command: {
		position: 0,
		help: 'Init command: start, stop, status, restart'
	},
	config: {
		abbr: 'c',
		metavar: 'FILE',
		default: '/etc/pushinator.conf',
		help: 'Config file to use'
	}
}).parseArgs();

// check config file
if (!path.existsSync(options.config)) {
	log.error('invalid config: '+options.config);
	process.exit(1);
}
config = require(path.resolve(__dirname, options.config));

// daemonize
if (options.command) {
	init.simple({
		pidfile : config.pidfile,
		command : options.command,
		run     : function () {
			runPushinator();
		}
	})
}
else {
	runPushinator();
}

function runPushinator() {
	log.setConfig(config.log);
	log.logToConsole(options.command ? false : true);
	log.info("Starting pushinator");

	storage.setLog(log);
	client.setLog(log);
	client.setStorage(storage);
	client.listen(config.client);

	admin.setLog(log);
	admin.setStorage(storage);
	admin.setClient(client);
	admin.listen(config.admin);
}
