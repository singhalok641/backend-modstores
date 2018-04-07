const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Store = require('../models/store');
const User = require('../models/user');
const config = require('../config/database');

module.exports = function(passport){
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    if(jwt_payload.type==='mod-store'){
      console.log('not here')
      Store.getStoreById(jwt_payload.data._id, (err, store) => {
        if(err){
          return done(err, false);
        }

        if(store){
          return done(null, store);
        } else {
          return done(null, false);
        }
      });
    }
    else{
      console.log('hey there');
      User.getUserById(jwt_payload.data._id, (err, user) => {
        if(err){
          return done(err, false);
        }

        if(user){
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    } 
    
  }));
}
