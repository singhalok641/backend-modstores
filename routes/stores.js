const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Store = require('../models/store');
const Order = require('../models/orders');
const users = require('./users');

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

//routes for MOD user account creation
//router.get('/users/new', users.showCreate);
router.post('/users/:phone/login', users.login);
router.post('/users', users.create);
//router.get('/users/:id/verify', users.showVerify);
router.post('/users/:id/verify', users.verify);
router.post('/users/:id/resend', users.resend);
//router.get('/users/:id', users.showUser);

// Register Store
router.post('/register', (req, res, next) => {
  let newStore = new Store({
    storeName: req.body.storeName,
    email: req.body.email,
    store_id: req.body.store_id,
    password: req.body.password
  });

  Store.addStore(newStore, (err, store) => {
    if(err){
      res.json({success: false, msg:'Failed to register store'});
    } else {
      res.json({success: true, msg:'Store registered'});
    }
  });
});

// AuthenticateStore
router.post('/authenticate', (req, res, next) => {
  const store_id = req.body.store_id;
  const password = req.body.password;

  Store.getStoreByStoreId(store_id, (err, store) => {
    if(err) throw err;
    if(!store){
      return res.json({success: false, msg: 'Store not found'});
    }

    Store.comparePassword(password, store.password, (err, isMatch) => {
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
            store_id: store.store_id,
            email: store.email
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
  console.log(req.params.mod_store);
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

/*// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});*/

module.exports = router;
