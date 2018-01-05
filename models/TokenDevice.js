const mongoose = require('mongoose');
const config = require('../config/database');

const TokenDevice = mongoose.Schema({
	tokenDevice: String,
	userId: String,
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date, default: Date.now}
});

const Token = module.exports = mongoose.model('Token', TokenDevice);

module.exports.checkExistsToken = function(tokenDevice,callback) {
	const query = {tokenDevice: tokenDevice}
  	Token.findOne(query, callback);
  	//console.log(Token.findOne(query, callback));
}