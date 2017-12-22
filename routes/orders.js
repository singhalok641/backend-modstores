const Order = require('../models/orders');

//Get Store Orders
module.exports.getOrdersByStore = function(id ,callback){
	Order.findByStore(id,callback);
}
