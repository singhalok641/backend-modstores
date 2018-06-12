const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// Store Schema
const StoreSchema = mongoose.Schema({
  storeName: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  store_id: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const Store = module.exports = mongoose.model('Store', StoreSchema);

module.exports.getStoreById = function(id, callback){
  Store.findById(id, callback);
}

module.exports.getStoreByStoreId = function(StoreId, callback){
  const query = {store_id: StoreId}
  Store.findOne(query, callback);
}

module.exports.addStore = function(newStore, callback){
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newStore.password, salt, (err, hash) => {
      if(err) throw err;
      newStore.password = hash;
      newStore.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
