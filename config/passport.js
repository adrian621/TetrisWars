
var configFacebookAuth = require('./facebookAuth');
var User = require('../models/facebookUser');
const FacebookStrategy = require('passport-facebook').Strategy;
module.exports = function(passport){

passport.use(new FacebookStrategy({
    clientID: configFacebookAuth.facebookAuth.clientID,
    clientSecret: configFacebookAuth.facebookAuth.clientSecret,
    callbackURL: configFacebookAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'emails', 'name']
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function(){
      User.findOne({'facebookId' : profile.id}, function(err, user){
        if(err)
          return cb(err);
        if(user)
          return cb(null, user);
        else{
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;


          newUser.save(function(err){
            if(err) throw err;
            return cb(null, newUser);
          });
        }

      });
    });

    /*
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
    */
  }
));
}
