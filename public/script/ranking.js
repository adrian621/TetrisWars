var exports = module.exports = {};
var User = require('../../models/user.js');


exports.updateRank = function(boards, winner){

  console.log('winner is' + winner);
    for(var i = 0; i< boards.length; i++){
      console.log('loser is' + boards[i].username);
      //changeRank(boards[i].username, -1);
    }

//changeRank(winner, 1);
}

changeRank = function(username, amount){
    User.getUserByUserName(username, function(err, user){
      if(err) throw err;
      user.rank = user.rank + amount;

      user.save(function (err) {
        if (err) return handleError(err);
      });
      console.log('user is: ' + user);
      console.log('rank of user is ' + user.rank);

    });
}
