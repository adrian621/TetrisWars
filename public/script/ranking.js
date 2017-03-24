var exports = module.exports = {};
var User = require('../../models/user.js');

exports.updateRank = function(losers, winner){
  changeRank(winner, 1);
  //console.log('winner is' + winner);
  //console.log('1st losers is' + losers[0]);
  for(var i = 0; i< losers.length; i++){
    changeRank(losers[i], -1);
  }
}

changeRank = function(username, amount){
    User.getUserById(username, function(err, user){
      if(err) throw err;
      user.rank = user.rank + amount;

      if(user.rank >= 0){
      user.save(function (err) {
        if (err) return handleError(err);
      });
      }
      console.log('rank of user ' + user.username +  'is ' + user.rank);
    });
}
