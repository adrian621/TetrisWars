console.log('test1');

var socket = io();

socket.emit('lobby', {lobbyName:"username", type:"newLobby"});
