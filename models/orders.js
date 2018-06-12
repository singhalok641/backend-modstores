const mongoose = require('mongoose');
const config = require('../config/database');

//General Schema
const OrderSchema = mongoose.Schema({
	order_id:{
		type:Number,
		required:true,
		unique:true
	},
	cart: {
		type: Object, 
		required: true
	},
	/*status:{
		type:String,
		required:true
	},
	prescription:{
		type:String
	},
	order_time:{
		type:Date,
		//required:true
	},
	delivery_time:{
		type:Date,
		//required:true
	},
	delivery_address:{
		type:String,
		required:true
	},
	payment_mode:{
		type:String,
		required:true
	},
	payment_id:{
		type:String,
		required: true
	},*/
	store_id:{
		type:String,
		required:true
	}
});

const Order = module.exports = mongoose.model('Order',OrderSchema);

module.exports.getOrdersByStore = function(store_id,callback) {
	const query = {store_id: store_id}
  	Order.find(query, callback);
}

module.exports.addOrder = function(newOrder,callback) {
	newOrder.save(callback);
}
