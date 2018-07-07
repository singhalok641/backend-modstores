const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
var assert = require('assert');
const config = require('../config/database');
const Store = require('../models/store');
const Order = require('../models/orders');
const users = require('./users');
var MongoClient = require('mongodb').MongoClient;
var multer = require('multer');
var url = 'mongodb://159.89.168.254:27017/mod';

import {pushNotification, listTokenDevice, registerTokenDevice} from '../routes';
import {secretCodeMiddleware} from '../middlewares';
//const pushNotification = require('./pushNotification');
//const listTokenDevice = require('./listTokenDevice');
//const secretCodeMiddleware = require('../middlewares/secretCodeMiddleware');
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


//ROUTES FOR MOD USER APP
//routes for MOD user account creation and login

//router.get('/users/new', users.showCreate);
router.post('/users/:phone/userExists', users.userExists);
router.post('/users', users.create);
router.post('/users/login', users.login);
//router.get('/users/:id/verify', users.showVerify);
router.post('/users/:id/verify', users.verify);
router.post('/users/:id/resend', users.resend);
router.get('/users/profile',passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({success: true, user: req.user});
});

//route for addingOrders 
router.post('/users/addOrder', users.addOrder);

//route for addingProduct
router.post('/users/addProduct', users.addProduct);
//routes for fetching products
router.get('/users/getProducts/:category', users.getProducts);

//routes for cart
router.get('/users/addToCart/:id', users.addToCart);
router.get('/users/reduceByOne/:id',users.reduceByOne);
router.get('/users/increaseByOne/:id',users.increaseByOne);
router.get('/users/removeItem/:id',users.removeItem);
router.get('/users/emptyCart', users.emptyCart);
router.get('/users/getCart', users.getCart);

//ROUTES FOR MOD STORE APP
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
        const token = jwt.sign({data:store, type:"mod-store"},config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: token,
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

// mod store profile details fetch
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({success: true, store: req.user});
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
    /*var past_orders=[];
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
    res.json({past_orders:past_orders, active_orders: active_orders});*/
    res.json({orderRequests: orders})    
  });
});

/*router.get('/orders/:mod_store/reduceByOne/:id', (req,res) => {
  var productId = request.params.id;
})*/

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/prescriptionUploads/')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({storage: storage});

router.post('/users/prescriptionUpload', upload.single('photo'), (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        assert.equal(null, err);
        insertDocuments(db, 'public/images/prescriptionUploads/' + req.file.filename, () => {
            db.close();
            res.json(req.file);
        });
    });
});

module.exports = router;

var insertDocuments = function(db, filePath, callback) {
    var collection = db.collection('user');
    collection.insertOne({'imagePath' : filePath }, (err, result) => {
        assert.equal(err, null);
        callback(result);
    });
}
