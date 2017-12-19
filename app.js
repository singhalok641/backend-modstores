var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

Account = require('./models/accounts');
//Connect to mongoose
mongoose.connect('mongodb://localhost/modstores');
var db = mongoose.connection;

db.on('error', err => {
  console.error(`Error while connecting to DB: ${err.message}`);
});

/*
db.once('open', () => {
  console.log('DB connected successfully!');
});*/

app.get('/', function(req, res){
	res.send("Please use /api/modstores");
});

app.get('/api/accounts', function(req, res){
	Account.getAccounts(function(err, account){
		if(err){
			throw err;
		}
		console.log(account);
		res.json(account);
	});
});

app.listen(3000);
console.log('Running on port 3000....');



