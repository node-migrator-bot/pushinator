# pushinator

A simple server to push messages in realtime from your application to http clients, based on socket.io

## Installation

	npm install pushinator

## Example configuration

```javascript
	module.exports = {
		// Path to pid file
	        pidfile: '/tmp/pushinator.pid',
		// Admin section
	        admin: {
			// Host or IP to listen
	                host: 0,
			// Port to listen
	                port: 9600,
	        },
		// Client section
	        client: {
			// Host or IP to listen
	                host: 0,
			// Port to listen
	                port: 9601,
			// socket.io transports available and usage order
	                socketIoTransports: ['websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling', 'htmlfile'],
			// Use SSL on client port
	                useSSL: false,
			// Path to SSL private key file
	                sslKey: '/path/to/ssl.key',
			// Path to SSL certificate file
	                sslCert: '/path/to.crt',
	        },
		// Log section
	        log: {
			// Enable debug logging, can be true or false
	                debug: false,
			// Syslog configuration
	                syslog: {
				// Enable logging through syslog
	                        enable: true,
				// Syslog tag to use
	                        tag: 'pushinator',
				// Facility to use
	                        facility: 'LOG_DAEMON',
	                },
	        },
	}
```

## Usage

### In foreground

	pushinator -c /path/to/configuration

### As daemon

Pushinator can be run as daemon. It can be used as an init script and supports the following commands

	start, restart, stop, status

If you want to run pushinator without config arguement, the configuration must be placed in /etc/pushinator.conf.

The following command starts pushinator as a daemon with config file located in /etc/pushinator/node1.conf

	pushinator start -c /etc/pushinator/node1.conf

To stop it, use the following command

	pushinator stop -c /etc/pushinator/node1.conf

### Logging

By default, pushinator is logging to stdout if it's not started as a daemon.
In daemon mode it's logging to syslog, if enabled. If syslog is not enabled,
and pushinator is running as daemon, it's logging to /dev/null.

### socket.io transports

You can specify the transports used by socket.io in the pushinator configuration. Order matters.

### Admin connection

Through the admin connection, you can register new clients and send messages to them.

Registering a new user expects an userId and a hash.
	curl http://127.0.0.1:9600/user/register -d '{"userId":5,"hash":"xxx1234"}'

Sending a message to an user expects an userId and a message.
	curl http://127.0.0.1:9600/user/send -d '{"userId":5,"message":"example message"}'

### Client connection

Before a socket.io client is able to receive messages from pushinator, it has to authenticate itself
through the hash (which was set through the admin connection) and it's userId.

```javascript
	var userId = 5;
	var hash = 'xx1234';

	var socket = io.connect('http://127.0.0.1:9601');
	socket.on('connect', function () {
		// authenticate
		socket.emit('auth', userId, hash);
	});

	socket.on('message', function (message) {
		// handle received message
		alert(message);
	});
```

For more thorough examples, look at the `examples/` directory.
