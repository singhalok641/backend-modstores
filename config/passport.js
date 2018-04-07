const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Store = require('../models/store');
const config = require('../config/database');

module.exports = function(passport){
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
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
  }));
}
