const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Order = require('../models/orders');

import {pushNotification, listTokenDevice, registerTokenDevice} from '../routes';
import {secretCodeMiddleware} from '../middlewares';

/**
 * List token device
 */
router.get('/list-token-device', listTokenDevice)

/**
 * Push notification
 * @tokenDevice: string
 * @message: string
 * @data: object
 */
router.post('/push-notification', pushNotification);

/**
 * Register token device
 * @tokenDevice: string
 * @userId: string
 */
router.post('/register-token-device', secretCodeMiddleware, registerTokenDevice)

// RegisterUser
router.post('/register', (req, res, next) => {
  let newUser = new User({
    storeName: req.body.storeName,
    email: req.body.email,
    store_id: req.body.store_id,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if(err){
      res.json({success: false, msg:'Failed to register store'});
    } else {
      res.json({success: true, msg:'Store registered'});
    }
  });
});

// AuthenticateUser
router.post('/authenticate', (req, res, next) => {
  const store_id = req.body.store_id;
  const password = req.body.password;

  //console.log("logging in");

  User.getUserByStoreId(store_id, (err, store) => {
    if(err) throw err;
    if(!store){
      return res.json({success: false, msg: 'Store not found'});
    }

    User.comparePassword(password, store.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign(store.toJSON(), config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: 'JWT '+token,
          store: {
            id: store._id,
            name: store.storeName,
            store_id: user.store_id,
            email: user.email
          }
        });
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

//Get Store Orders
router.get('/orders/:mod_store', (req,res) => {
  //console.log(req.params.mod_store);
  Order.getOrdersByStore(req.params.mod_store, function(err,orders){
    if(err){
      throw err;
    }
    //console.log(orders);
    //Divide the Store orders into active and past orders depending on the status value of the particular order
    var past_orders=[];
    var active_orders=[];

    //Loop to divide the orders
    for(var k=0;k<orders.length;k++)
    {
      if(orders[k].status=='Delivered'||orders[k].status=='Cancelled')
      {
        past_orders.push(orders[k]);
      }

      else
      {
        active_orders.push(orders[k]);
      }
    }

    res.json({past_orders:past_orders, active_orders: active_orders});
    
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

module.exports = router;
