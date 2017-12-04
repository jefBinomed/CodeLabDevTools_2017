'use strict'

var express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	http = require('http').createServer(app);

var draws = {};

/*
Init Server
*/
app.use(bodyParser.json());

http.listen(9000, function(){
  console.info(`listening on *:9000`);
});	

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/draw/:user', function(req, res){
	var result = draws[req.params.user];
	if (!result){
		result = {};
	}
	//req.params.user;
	res.json(result);
});

app.post('/draw/:user', function(req, res){
	if (!draws[req.params.user]){
		draws[req.params.user] = {};
	}
	draws[req.params.user]['draw'+Date.now()] = req.body;
	res.json({status:'ok'});
	
});

