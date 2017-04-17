var exports = module.exports = {};
var joinGen;
  exports.NewLobby = function(name, lobbyId, users, maxusers, hasPassword, isActive){
    joinGen.emit('NewLobbyInfo', {name:name, id: lobbyId, users: users, maxusers: maxusers, hasPassword: hasPassword, isActive:isActive});
  }

  exports.updateLobby = function(lobbyId, users, isActive){
    //console.log('user leaved lobby: ' + lobbyId + ' users left in lobby: ' + users);
    joinGen.emit('UpdateLobbyInfo', {id: lobbyId, users:users, isActive:isActive});
  }

  exports.setIo = function(join){
    joinGen = join;
  }
