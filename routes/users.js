var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user.js');

router.get('/register', ensureNotauth, function(req, res){
  res.render('register');
});
router.get('/login', ensureNotauth, function(req, res){
  res.render('login');
});
router.get('/account', ensureauth ,function(req, res){
  res.render('account');

});
router.get('/createLobby', ensureauth ,function(req, res){
  res.render('createLobby');
});



function ensureNotauth(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}
function ensureauth(req, res, next){
if(req.isAuthenticated()){
  return next();
}
else{
  //req.flash('error_msg', 'You are not logged in');
  res.redirect('/login');
  }
}

router.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //validation
    req.checkBody('name', 'Name is required').notEmpty();
    //req.checkBody('username', 'Username exist').usernameNotExist();

    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'passwords do not match').equals(req.body.password);


    var errors = req.validationErrors();
    //check through database aswell

    if(errors){
      res.render('register', {errors:errors});
    }
    else{

      User.getUserByUserName(username, (err, user) =>{
        if(err) throw err;
        if(user){
          res.render('register', {errors: [{param: 'username', msg: 'Username is already taken', value: '' }]});
        }
        else{
          User.getUserByEmail(email, (err, user) =>{
            if(err) throw err;
            if(user){
              res.render('register', {errors: [{param: 'email', msg: 'Email is already taken', value: '' }]});
            }
              else {
                var newUser = new User({
                  name: name,
                  email: email,
                  username: username,
                  password: password
                });

                User.createUser(newUser, (err, user) => {
                  if(err) throw err;
                  console.log(err);
                });
                req.flash('success_msg', 'you are registerd');
                console.log("user registerd");
                res.redirect('/login');
              }
          });
        }
      });
    }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUserName(username, (err, user) =>{
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'unknown User'});
      }
      User.comparePassword(password, user.password, (err, isMatch) =>{
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }
        else {
          return done(null, false, {message: 'Invalid password'});
        }
      });
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login', failureFlash: true}),
  (req, res) => {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'you are logged out');
  res.redirect('/');
});

module.exports = router;
