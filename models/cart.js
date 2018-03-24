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

const Cart = module.exports = mongoose.model('Cart',CartSchema);

module.exports = function Cart(oldCart) {
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.totalPrice = oldCart.totalPrice || 0;

	this.add = function(item, id){
		var storedItem = this.items[id];
		if (!storedItem) {
			storedItem = this.items[id] = {item: item, qty: 0, price: 0};
		}
		storedItem.qty++;
		storedItem.price = storedItem.item.price * storedItem.qty;
		this.totalQty++;
		this.totalPrice += storedItem.item.price;
	};

	this.generateArray = function(){
		var arr = [];
		for (var id in this.items){
			arr.push(this.items[id]);
		}
		return arr;
	};
}
