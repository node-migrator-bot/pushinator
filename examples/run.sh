#!/bin/bash

echo 'Make sure, that pushinator is running and listening on 127.0.0.1:9600, then press Enter to continue'
read a

echo -n 'Registering user 55866 with hash 7f81776793e31d71d1ed71038e78dbf5... '
register=$(curl -s http://127.0.0.1:9600/user/register -d '{"userId":55866,"hash":"7f81776793e31d71d1ed71038e78dbf5"}')
if [[ "$register" == *OK* ]]; then
	echo 'Done'
else
	echo 'Failed'
	exit 1
fi

echo 'Open client.html in your browser and press Enter to continue'
read b

echo -n 'Sending message "Hey there!" to user 55866... '
send=$(curl -s http://127.0.0.1:9600/user/send -d '{"userId":55866,"message":"Hey there!"}')
if [[ "$send" == *OK* ]]; then
	echo 'Done'
else
	echo 'Failed'
	exit 1
fi
