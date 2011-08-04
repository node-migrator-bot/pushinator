#!/usr/bin/env node

var log = require('./lib/log.js')
  , storage = require('./lib/storage.js')
  , client = require('./lib/client.js')
  , admin = require('./lib/admin.js')
  , daemon = require('daemon')
  , path = require('path')
  , fs = require('fs');

var config = {};

// parse options
var options = require("nomnom").opts({
	config: {
		abbr: 'c',
		metavar: 'FILE',
		default: '/etc/pushinator.conf',
		help: 'Config file to use'
	},
	daemon: {
		abbr: 'd',
		default: false,
		help: 'Run in the background'
	}
}).parseArgs();

// check config file
if (!fileExist(options.config)) {
	log.error('invalid config: '+options.config);
	process.exit(0);
}

loadConfig();

// daemonize
if (options.daemon) {
	daemon.daemonize(config.logfile, config.pidfile, function (err, pid) {
		if (err) {
			return log.error('Error starting daemon: ' + err);
		}
		log.info('Daemon started successfully with pid: ' + pid);
		runPushinator();
	});
}
else {
	runPushinator();
}

function loadConfig() {
	// load config file
	if ('/' == options.config[0]) {
		config = require(options.config);
	}
	else {
		config = require('./'+options.config);
	}
}

function fileExist(fileName) {
	if ('string' != typeof fileName) {
		return false;
	}

	try {
		fs.statSync(fileName);
	}
	catch (e) {
		return false;
	}

	return true;
}

function runPushinator() {
	log.info("Running pushinator with config", config);

	storage.setLog(log);
	client.setLog(log);
	client.setStorage(storage);

	client.listen(config.client);
	admin.setLog(log);
	admin.setStorage(storage);
	admin.setClient(client);
	admin.listen(config.admin);
}
