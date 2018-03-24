const mongoose = require('mongoose');
const config = require('../config/database');

//General Schema
const CartSchema = mongoose.Schema({
	cart_id:{
		type:Number,
		required:true,
		unique:true
	},
	itemsRequiringPrescription:{
		type:Object,
		required:true
	},
	itemsNotRequiringPrescription:{
		type:Object,
		required:true
	},
	mrp_total:{
		type:Number,
		required:true
	},
	coupon:{
		type:Object,
		required:true
	},
	discount:{
		type:Number,
		required:true
	},
	total:{
		type:Number,
		required:true
	},
	user_id:{
		type:String,
		required:true
	}
});

const Product = module.exports = mongoose.model('Product',ProductSchema);

module.exports.addProduct = function(newProduct,callback) {
	newProduct.save(callback);
}
