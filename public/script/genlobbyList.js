var exports = module.exports = {};
var joinGen;
  exports.NewLobby = function(name, lobbyId, users, maxusers, hasPassword){
    joinGen.emit('NewLobbyInfo', {name:name, id: lobbyId, users: users, maxusers: maxusers, hasPassword: hasPassword});
  }

  exports.updateLobby = function(lobbyId, users){
    //console.log('user leaved lobby: ' + lobbyId + ' users left in lobby: ' + users);
    joinGen.emit('UpdateLobbyInfo', {id: lobbyId, users:users});
  }
  
  exports.setIo = function(join){
    joinGen = join;
  }
