var mongoose = require('mongoose');

//General Schema
var accountSchema = mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	create_date:{
		type: Date,
		default: Date.now
	}
});

var Account = module.exports = mongoose.model('Account',accountSchema);

//Get Stores
module.exports.getAccounts = function(callback, limit){
	Account.find(callback).limit(limit);
} 
