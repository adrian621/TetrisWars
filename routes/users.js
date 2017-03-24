var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user.js');
var Authfunc = require('../models/auth');
var passportConfig = require('../config/passport')(passport);

router.get('/register', Authfunc.ensureNotauth, function(req, res){
  res.render('register');
});
router.get('/login', Authfunc.ensureNotauth, function(req, res){
  res.render('login');
});
router.get('/account', Authfunc.ensureauth, function(req, res){
  res.render('account');
});
router.get('/logout', Authfunc.ensureauth, function(req, res){
  req.logout();
  req.flash('success_msg', 'Logout successful');
  res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']})); //scope läggs till för att få ut email av facebook

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

router.get('/toplist', function(req, res){
  User.getToplist(function(err, toplist){
    var usernames = [];
    var score = [];
    for(var i = 0; i < toplist.length; i++){
      usernames[i] = toplist[i].username;
      score[i] = toplist[i].rank;
    }
    res.render('toplist', {usernames, usernames, score: score});
  });
});


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
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


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

                var newUser = new User();
                newUser.username = name;
                newUser.email = email;
                newUser.username = username;
                newUser.password = password;
                newUser.rank = 0;
                User.createUser(newUser, (err, user) => {
                  if(err) throw err;
                  console.log(err);
                });
                req.flash('success_msg', 'you are registerd');
                res.redirect('/login');
              }
          });
        }
      });
    }
});

//passport stuff
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUserName(username, (err, user) =>{
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Username does not exist'});
      }
      User.comparePassword(password, user.password, (err, isMatch) =>{
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }
        else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
}));


//serialize user when sent to cookie
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

//deserializ user when sent to cookie
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true}),
  (req, res) => {
    res.redirect('/');
  });

module.exports = router;
