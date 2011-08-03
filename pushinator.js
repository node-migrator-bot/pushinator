#!/usr/bin/env node

var log = require('./lib/log.js');
var daemon = require('daemon');
var path = require('path');

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

// load config file
if ('/' == options.config[0]) {
	var config = require(options.config);
}
else {
	var config = require('./'+options.config);
}

// daemonize
if (options.daemon) {
	daemon.daemonize(config.logfile, config.pidfile, function (err, pid) {
		if (err) {
			return log.error('Error starting daemon: ' + err);
		}
		log.info('Daemon started successfully with pid: ' + pid);
		runPushinator(log, config);
	});
}
else {
	runPushinator(log, config);
}

function fileExist(fileName) {
	var fs = require('fs');

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

function runPushinator(log, config) {
	// TODO run Pushinator
	log.info("running Pushinator with config", config);

	var storage = require('./lib/storage.js');
	storage.setLog(log);

	var admin = require('./lib/admin.js');
	admin.setLog(log);
	admin.setStorage(storage);
	admin.listen(config.admin);
}