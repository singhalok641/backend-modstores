const User = require('../models/user');
const Order = require('../models/orders');
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

// Display a form that allows users to sign up for a new account
exports.showCreate = function(request, response) {
    response.render('users/create', {
        title: 'Create User Account',
        // include any errors (success messages not possible for view)
        errors: request.flash('errors'),
    });
};

// create a new user based on the form submission
exports.create = function(request, response) {
    const params = request.body;
    console.log(params);
    // Create a new user based on form parameters
    const user = new User({
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        countryCode: '+91',
        password: params.password,
    });

    user.save(function(err, doc) {
        if (err) {
            // To improve on this example, you should include a better
            // error message, especially around form field validation. But
            // for now, just indicate that the save operation failed
            /*request.flash('errors', 'There was a problem creating your'
                + ' account - note that all fields are required. Please'
                + ' double-check your input and try again.');*/
            response.json({success: false, msg:'Failed to register user'});
            //response.redirect('/users/new');
        } else {
            // If the user is created successfully, send them an account
            // verification token
            user.sendAuthyToken(function(err) {
                if (err) {
                    /*request.flash('errors', 'There was a problem sending '
                        + 'your token - sorry :(');*/
                    response.json({error: 'There was a problem sending your token - sorry :('});
                }

                // call token verification function
                //response.redirect('/users/'+doc._id+'/verify');
                response.json({success: true, msg:'User registered', user: doc});
            });
        }
    });
};

// Display a form that allows users to enter a verification token
exports.showVerify = function(request, response) {
    response.render('users/verify', {
        title: 'Verify Phone Number',
        // include any errors
        errors: request.flash('errors'),
        // success messsages
        successes: request.flash('successes'),
        // Include database ID to include in form POST action
        id: request.params.id,
    });
};

// Resend a code if it was not received
exports.resend = function(request, response) {
    // Load user model
    User.findById(request.params.id, function(err, user) {
        if (err || !user) {
            return die('User not found for this ID.');
        }

        // If we find the user, let's send them a new code
        user.sendAuthyToken(postSend);
    });

    // Handle send code response
    function postSend(err) {
        if (err) {
            return die('There was a problem sending you the code - please '
                + 'retry.');
        }

        //request.flash('successes', 'Code re-sent!');
        //response.redirect('/users/'+request.params.id+'/verify');
        response.json({message: "code re-sent!"});
    }

    // respond with an error
    function die(message) {
        //request.flash('errors', message);
        //response.redirect('/users/'+request.params.id+'/verify');
        response.json({message: message});
    }
};

// Check if user exists and login user
exports.userExists = function(request, response) {
    const query = {phone:request.params.phone};
    console.log(request.params.phone);
    User.findOne(query, function(err, user) {
        if(err || !user){
            return die('User not found for this ID.');
        }
        response.json({success: true, user:user});
    });
    // Load user model
    /*User.findById(request.params.id, function(err, user) {
        if (err || !user) {
            return die('User not found for this ID.');
        }
        // If we find the user, we send the response
        response.json({success:true});
    });*/



    // respond with an error
    function die(message) {
        //request.flash('errors', message);
        //response.redirect('/users/'+request.params.id+'/verify');
        response.json({success: false ,message:message});
    }
};

exports.login = function(request, response) {
    const params = request.body;
    const query = {phone:params.phone};
    const password = params.password;
    console.log(params.phone);

    User.findOne(query, function(err, user) {
        if(err) throw err;
        if(!user){
            return die('User not found for this ID.');
        }

        user.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });

                response.json({
                    success: true,
                    token: 'JWT '+token,
                    user: user
                })
            }
            else{
                return response.json({success: false, msg: 'Wrong password'});
            }
        });
    });

    // respond with an error
    function die(message) {
        //request.flash('errors', message);
        //response.redirect('/users/'+request.params.id+'/verify');
        response.json({success: false ,message:message});
    }
};

// Handle submission of verification token
exports.verify = function(request, response) {
    let user = {};

    // Load user model
    User.findById(request.params.id, function(err, doc) {
        if (err || !doc) {
            return die('User not found for this ID.');
        }

        // If we find the user, let's validate the token they entered
        user = doc;
        user.verifyAuthyToken(request.body.code, postVerify);
    });

    // Handle verification response
    function postVerify(err) {
        if (err) {
            return die('The token you entered was invalid - please retry.');
        }

        // If the token was valid, flip the bit to validate the user account
        user.verified = true;
        user.save(postSave);
    }

    // after we save the user, handle sending a confirmation
    function postSave(err) {
        if (err) {
            return die('There was a problem validating your account '
                + '- please enter your token again.');
        }

        // Send confirmation text message
        const message = 'You did it! Signup complete :)';
        user.sendMessage(message, function() {
          // show success page
          //request.flash('successes', message);
          //response.redirect(`/users/${user._id}`);
          response.json({success:true, message:"success"});
        }, function(err) {
          /*request.flash('errors', 'You are signed up, but '
              + 'we could not send you a message. Our bad :(');*/
            response.json({success:true, message:"You are signed up but we could not send you a message"});
        });
    }

    // respond with an error
    function die(message) {
        //request.flash('errors', message);
        //response.redirect('/users/'+request.params.id+'/verify');\
        response.json({success:false ,message:message});
    }
};

// Show details about the user
exports.showUser = function(request, response, next) {
    // Load user model
    User.findById(request.params.id, function(err, user) {
        if (err || !user) {
            // 404
            return next();
        }

        response.json({
            title: 'Hi there ' + user.fullName + '!',
            user: user,
            // any errors
            //errors: request.flash('errors'),
            // any success messages
            //successes: request.flash('successes'),
        });
    });
};

exports.addOrder = function(request, response, next) {
    let newOrder = new Order({
        order_id:request.body.order_id,
        status:request.body.status,
        itemsRequiringPrescription:request.body.itemsRequiringPrescription,
        itemsNotRequiringPrescription:request.body.itemsNotRequiringPrescription,
        prescription:request.body.prescription,
        order_time:request.body.order_time,
        delivery_time:request.body.delivery_time,
        delivery_address:request.body.delivery_address,
        mrp_total:request.body.mrp_total,
        coupon:request.body.coupon,
        discount:request.body.discount,
        delivery_charge:request.body.delivery_charge,
        total:request.body.total,
        payment_mode:request.body.payment_mode,
        store_id:request.body.store_id
    })

    Order.addOrder(newOrder, (err,order) =>{
        if(err){
          response.json({success: false, msg:'Failed to confirm your order',"error":err});
        } else {
          response.json({success: true, msg:'Awaiting modstore confirmation!!', order:order});
        }
    });
};

exports.addProduct = function(request, response, next) {
    let newProduct = new Product({
        product_id:request.body.product_id,
        name:request.body.name,
        manufacturer:request.body.manufacturer,
        description:request.body.description,
        price:request.body.price,
        category:request.body.category,
        sub_category:request.body.sub_category
    })

    Product.addProduct(newProduct, (err,product) =>{
        if(err){
          response.json({success: false, msg:'Failed to add new product',"error":err});
        } else {
          response.json({success: true, msg:'Added new product to the database', product:product});
        }
    });
};
