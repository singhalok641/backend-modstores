const mongoose = require('mongoose');
const config = require('../config/database');

const CounterSchema = mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counter', CounterSchema);

//General Schema
const OrderSchema = mongoose.Schema({
	order_id:{
		type: String,
		unique: true
	},
	cart: {
		type: Object, 
		required: true
	},
	store_id:{
		type:String,
		required:true
	},
	orderStatus: {
		type: String,
		default: 'Request'
	},
	delivery_address:{
		type: String,
		required: true
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date, 
		default: Date.now
	}
});

// Middleware executed to auto increment order_id by 1
OrderSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'order_id'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.order_id = counter.seq;
        next();
    });
});

const Order = module.exports = mongoose.model('Order',OrderSchema);

module.exports.getOrdersByStore = function(store_id,callback) {
	const query = {store_id: store_id}
  	Order.find(query, callback);
}

module.exports.getOrderById = function(id, callback){
  Order.findById(id, callback);
}

module.exports.addOrder = function(newOrder, callback) {
	newOrder.save(callback);
}