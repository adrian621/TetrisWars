var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//set up schema for User

var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password:{
    type:String

  },
  email: {
    type: String
  },
  name: {
    type: String
}
});

/*
var UserSchema = mongoose.Schema({
local: {
    username: {
      type: String,
      index: true
    },
    password:{
      type:String
    },
    email: {
      type: String
    },
    name: {
      type: String
    }
},
facebook: {
  id: String,
  token: String,
  email: String,
  name: String
}
});
*/

//create a model of the user schema
var User = module.exports = mongoose.model('User', UserSchema);


//create new user
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
});
}
module.exports.getUserByUserName = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){
  var query = {email: email};
  User.findOne(query, callback);
}

module.exports.getUserById= function(id, callback){
  User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
bcrypt.compare(candidatePassword, hash, function(err, res){
  if(err) throw err;
  console.log(candidatePassword);
  callback(null, res);
});
}
