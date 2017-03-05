var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

module.exports = mongoose.model('facebookUser', UserSchema);
