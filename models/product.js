const mongoose = require('mongoose');
const config = require('../config/database');

//General Schema
const ProductSchema = mongoose.Schema({
	product_id:{
		type:Number,
		required:true,
		unique:true
	},
	name:{
		type: String,
		required: true,
	},
	imagePath:{
		type: String,
		required: true
	},
	manufacturer:{
		type: String,
		required:true
	},
	description:{
		type: String,
		required: true
	},
	price:{
		type: Number,
		required: true
	},
	category:{
		type: String,
		required: true
	},
	sub_category:{
		type: String,
		required: true
	}
});

const Product = module.exports = mongoose.model('Product',ProductSchema);

module.exports.addProduct = function(newProduct,callback) {
	newProduct.save(callback);
}
