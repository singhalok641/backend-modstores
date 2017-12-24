const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Order = require('../models/orders');

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if(err){
      res.json({success: false, msg:'Failed to register user'});
    } else {
      res.json({success: true, msg:'User registered'});
    }
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  //console.log("logging in");

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      return res.json({success: false, msg: 'User not found'});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign(user.toJSON(), config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
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
  console.log(req.params.mod_store);
  Order.getOrdersByStore(req.params.mod_store, function(err,orders){
    if(err){
      throw err;
    }
    console.log(orders);
    //Divide the Store orders into active and past orders depending on the status value of the particular order
    var past_orders=[];
    var active_orders=[];

    //Loop to divide the orders
    for(var k=0;k<orders.length;k++)
    {
      if(orders[k].status=='delivered'||orders[k].status=='cancelled')
      {
        past_orders.push(orders[k]);
      }

      else
      {
        active_orders.push(orders[k]);
      }
    }

    res.send(past_orders);
    
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

module.exports = router;
