const User = require('../models/user');
const Order = require('../models/orders');
const Product = require('../models/product');
const Cart = require('../models/cart');
const jwt = require('jsonwebtoken');
const passport = require('passport');
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
                const token = jwt.sign({data:user, type:"mod-user"}, config.secret, {
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
    /*User.findById(request.params.id, function(err, user) {
        if (err || !user) {
            // 404
            return next();
        }

        response.json({
            success: true,
            user: user,
            // any errors
            //errors: request.flash('errors'),
            // any success messages
            //successes: request.flash('successes'),
        });
    });*/
    passport.authenticate('jwt', {session:false})
    response.json({success:"hey", user: request.user});
};

exports.addOrder = function(request, response, next) {

    if(!request.session.cart){
        response.json({message:"session expired"});
    }

    var cart = new Cart(request.session.cart);

    let newOrder = new Order({
        order_id:request.body.order_id,
        status:request.body.status,
        cart:cart,
        // itemsRequiringPrescription:request.body.itemsRequiringPrescription,
        // itemsNotRequiringPrescription:request.body.itemsNotRequiringPrescription,
        prescription:request.body.prescription,
        order_time:request.body.order_time,
        delivery_time:request.body.delivery_time,
        delivery_address:request.body.delivery_address,
        //mrp_total:request.body.mrp_total,
        //coupon:request.body.coupon,
        //discount:request.body.discount,
        //delivery_charge:request.body.delivery_charge,
        //total:request.body.total,
        payment_mode:request.body.payment_mode,
        payment_id:request.body.payment_id,
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
        imagePath:request.body.imagePath,
        brand:request.body.brand,
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

exports.addToCart = function(request, response, next) {
    var product_id = request.params.id;
    var cart = new Cart(request.session.cart ?  request.session.cart : {});
    Product.findById(request.params.id, function(err, product){
        if (err) {
            response.json({success: false});
        }
        cart.add(product, product_id);
        request.session.cart = cart;
        //console.log(cart);
        /*Cart.addCart(cart, (err, cart) => {
            if(err){
                response.json({success:false, message: err});
            }
            else{
                response.json({success:true, cart: cart});
            }
        });*/
        response.json({success:true, cart: cart});
    });
};

exports.reduceByOne = function(request, response, next) {
    var productId = request.params.id;
    var cart = new Cart(request.session.cart ? request.session.cart : {});
    cart.reduceByOne(productId);
    request.session.cart = cart;
    console.log(request.session.cart);
    response.json({success:true, message:"item reduced by one"});
}

exports.increaseByOne = function(request, response, next) {
    var productId = request.params.id;
    var cart = new Cart(request.session.cart ? request.session.cart : {});
    cart.increaseByOne(productId);
    request.session.cart = cart;
    console.log(request.session.cart);
    response.json({success:true, message:"item increased by one"});
}

exports.removeItem = function(request, response, next) {
    var productId = request.params.id;
    var cart = new Cart(request.session.cart ? request.session.cart : {});

    cart.removeItem(productId);
    request.session.cart = cart;
    console.log(request.session.cart);
    response.json({success: true, message:"removed item"});
}

exports.getCart = function(request, response, next){
    if (!request.session.cart) {
        response.json({products: null});
    } 
    var cart = new Cart(request.session.cart);
    response.json({products: cart.generateArray(), totalPrice: cart.totalPrice, totalQty: cart.totalQty});
}

exports.getProducts = function(request, response, next){
    var pageNo = parseInt(request.query.pageNo)
    var size = parseInt(request.query.size)
    var productCategory = request.params.category
    var query = {}

    if(pageNo < 0 || pageNo === 0) {
        res = {"error" : true,"message" : "invalid page number, should start with 1"};
        response.json(res)
    }

    query.skip = size * (pageNo - 1)
    query.limit = size
    //query.category = productCategory
    
    /*Product.getProductsByCategory(query, productCategory, function(err, products){
        if(err){
            throw err;
        }
        response.json({success: true, products: products});
    });*/
    Product.count({category: productCategory}, function(err, totalCount){
        if (err){
            throw(err)
        }
        console.log(totalCount)
        Product.find({category:productCategory},{},query,function(err,products){
            if (err){
                throw err;
            }
            var totalPages = Math.ceil(totalCount / size)
            response.json({success: true, products: products, totalPages: totalPages})
        });
    });    
}
