const mongoose = require('mongoose');
const config = require('../config/database');

//General Schema
const CartSchema = mongoose.Schema({
	cart_id:{
		type:Number,
		required:true,
		unique:true
	},
	items:{
		type:Object,
		required:true
	},
	totalQty:{
		type:Number,
		required:true
	},
	totalPrice:{
		type:Number,
		required:true
	},
	user_id:{
		type:String,
		required:true,
		unique: true
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

	this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
	};

	this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
	};

	this.generateArray = function(){
		var arr = [];
		for (var id in this.items){
			arr.push(this.items[id]);
		}
		return arr;
	};
}

/*module.exports.addCart = function(cart,callback) {
	console.log(cart);
	cart.save(callback);
}*/
