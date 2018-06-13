const mongoose = require('mongoose');
const config = require('../config/database');

var CounterSchema = mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counter = mongoose.model('counter', CounterSchema);

//General Schema
const OrderSchema = mongoose.Schema({
	order_id:{
		type: String,
		required: true,
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

const Order = module.exports = mongoose.model('Order',OrderSchema);

OrderSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'order_id'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.order_id = counter.seq;
        next();
    });
});

module.exports.getOrdersByStore = function(store_id,callback) {
	const query = {store_id: store_id}
  	Order.find(query, callback);
}

module.exports.addOrder = function(newOrder,callback) {
	newOrder.save(callback);
}