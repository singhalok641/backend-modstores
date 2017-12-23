const mongoose = require('mongoose');
const config = require('../config/database');

//General Schema
const OrderSchema = mongoose.Schema({
	order_id:{
		type:Number,
		required:true
	},
	status:{
		type:String,
		required:true
	},
	items:{
		type:Array,
		required:true
	},
	prescription:{
		type:String
	},
	order_time:{
		type:Date,
		required:true
	},
	delivery_time:{
		type:Date,
		required:true
	},
	delivery_address:{
		type:String,
		required:true
	},
	MRP_total:{
		type:Number,
		required:true
	},
	Coupon:{
		type:Object,
		required:true
	},
	Discount:{
		type:Number,
		required:true
	},
	delivery_charge:{
		type:Number,
		required:true
	},
	total:{
		type:Number,
		required:true
	},
	payment_mode:{
		type:String,
		required:true
	},
	mod_store:{
		type:String,
		required:true
	}
});

const Order = module.exports = mongoose.model('Order',OrderSchema);

module.exports.getOrdersByStore = function(id,callback) {
	const query = {mod_store: id}
  	Order.find(query, callback);
  	console.log(query);
  	//console.log(Order);
}
