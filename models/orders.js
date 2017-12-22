var mongoose = require('mongoose');

//General Schema
var orderSchema = mongoose.Schema({
	order_id:{
		type:Number,
		required:true
	}
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
	}
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
	discount:{
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
	modstore:{
		type:Number;
		required:true
	}
});

var Order = module.exports = mongoose.model('Order',orderSchema);
