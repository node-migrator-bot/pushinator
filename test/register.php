#!/usr/bin/env php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:9600/user/register');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

for ($i = 1; $i <= 10; ++$i) {
	$obj = new StdClass;
	$obj->userId = $i;
	$obj->hash = $i."-".md5(rand(1, 1000000));

	$postData = json_encode($obj);

	echo $postData."\n";

	curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
	curl_exec($ch);
}
