var lobby_server = module.exports = {};
var game_server = require('./gameServer');
var allLobbies = [];
var distance = 150;
var blockSize = 10;

//----- Public Functions -----//
lobby_server.lobbyFunctions = function(socket, message, io){
	switch(message.type){
		//case "newLobby": newLobby(client, message); break;
		//case "getLobbyList": getLobbyList(client); break;

		case "gameSetup": gameSetup(io, socket, message);  break;
		case "userIsReady": userIsReady(io, socket, message); break;
		case "userIsNotReady": userIsNotReady(io, socket, message); break;
		case "userLeavedLobby": userLeavedLobby(io, socket, message); break;
		case "gameOver": gameOverServer(io, message); break;
	}
};

//----- Game Functions -----//
lobby_server.gameFunctions = function(socket, message, io){
	switch(message.type){
		case "move":
			var authUser = socket.request.user;
			var lobbyId = getLobbyIdFromAuth(authUser);
			var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
			var lobbyUser = getUserFromUsername(authUser, lobby);
			var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);
			game_server.move(io, message, lobby, indexUser);
			break;
		//case "update": game_server.boardIsUpdated(message, lobby, client); break;
	}
};


//----- Structs -----//
lobbyUser = function(id, index, authUser, place){
	var lobbyUser = {
		id:id,
		isReady: false,
		lastStateValid: true,
		lastStateAllBlocks: [],
		lastStateCurrentBlocks: [],
		authUser: authUser,
		place: place
	};
	var lobby = allLobbies[index];
	lobby.lobbyUsers[lobby.lobbyUsers.length] = lobbyUser;

	//console.log("User added in lobby: %s  on spot number %s. Lobby id = %s is is: %s", i, allLobbies[i].lobbyUsers.length-1, allLobbies[i].id, lobbyUser.id);
}

lobby = function(id, randomNumbers, maxusers){
	var lobby = {
		id: id,
		randomNumbers: randomNumbers,
		lobbyUsers: [],
		isActive: false,
		maxUsers: maxusers,
		boards: [],
		clients: [],
		slotsTaken: [0, 0, 0, 0, 0]
	};
	allLobbies[allLobbies.length] = lobby;
	console.log(lobby.slotsTaken);
}

//----- Lobby Functions -----//

//This is no longer used
newLobby = function(client, data){
	var id = addNewLobby();
	console.log("New lobby with ID %s created.", id);
	client.emit('newLobby', {lobbyNumber:id,response:true});
}

////////////////***********____NYTT__________________________________!!
lobby_server.createLobby = function(lobbyId, user, maxusers){
	addNewLobby_new(lobbyId);
	addUserToLobby_new(user, lobbyId);
}

lobby_server.addUserToLobby_new_export = function(authUser, lobbyId){
	addUserToLobby_new(authUser, lobbyId);
}

lobby_server.validateId = function(lobbyId){
	console.log('user tryd to join lobby with id'+ lobbyId);
	for(var i = 0; i < allLobbies.length; i++){
		if(allLobbies[i].id == lobbyId){
		return true;
		}
	}
	return false;
}

addUserToLobby_new = function(authUser, lobbyId){
	var lobbyIndex = getLobbyIndexFromId(lobbyId);
	var lobby = allLobbies[lobbyIndex];
	var place = 0;

	for(var i = 0; i< lobby.slotsTaken.length; i++){
		if(lobby.slotsTaken[i] == 0){
			lobby.slotsTaken[i] = 1;
			place = i;
			break;
		}
	}

	lobbyUser(lobby.lobbyUsers.length, lobbyIndex, authUser, place);
	//console.log("slotsTaken: "+lobby.slotsTaken);
}
addNewLobby_new = function(lobbyId, maxusers){
	var randomNumbers = generateRandomBlocks();
	lobby(lobbyId, randomNumbers, maxusers);
}

authUserInLobby= function(lobbyId, socket){
	var index = getLobbyIndexFromId(lobbyId);
	users = (allLobbies[index].users);
	for(var i = 0; i < users.length; i++){
		if(user[i] == socket.request.user){
			return true;
		}
	}
	return false;
}
////////////////***********______________________________________!!

removeClients = function(lobbies){
		for(var i = 0; i < lobbies.length; i ++){
			lobbies[i].clients = [];
	}
}

getLobbyList = function(client){
	var lobbyListNoClients = allLobbies;
	removeClients(lobbyListNoClients);
	console.log('skickar lobbyList' + allLobbies[0].id);
	client.emit('lobbyList',{lobbyList: lobbyListNoClients});
}


//nytt
getLobbyIdFromAuth = function(user){
	for(var i = 0; i < allLobbies.length; i++){
		for(var j = 0; j < allLobbies[i].lobbyUsers.length; j++){
			if(user.id === (allLobbies[i].lobbyUsers[j].authUser.id)){
				return allLobbies[i].id;
			}
		}
	}
return 0;
}

//nytt
gameSetup = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
	var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	var randomNumbers = getRandomNumbersFromLobby(lobbyId);
	var users = getUsersFromLobby(lobbyId);
	var username = authUser.username;
	var lobbyUser = getUserFromUsername(authUser, lobby);

	if(lobbyId == 0){
		console.log('no lobby found');
	}
	else{
		console.log('user belong to lobby with id (2): ' + lobbyId);
	}

	lobby.clients.push(socket);

	console.log("slotstaken: "+lobby.slotsTaken);
	socket.emit('gameSetupR', {distance: distance, blockSize: blockSize, randomNumbers: randomNumbers, users: users, username: username, place: lobbyUser.place, playerPosition:lobby.slotsTaken});
	game_server.broadcastToLobby(lobby, socket, {type: 'newPlayer', distance: distance, blockSize: blockSize, playerPosition:lobby.slotsTaken, users: users, randomNumbers: randomNumbers, username: username, place: lobbyUser.place});
}

getUserFromUsername = function(authUser, lobby){
		for(var j = 0; j < lobby.lobbyUsers.length; j++){
			if(authUser.id === (lobby.lobbyUsers[j].authUser.id)){
				return lobby.lobbyUsers[j];
			}
		}
}

addNewLobby = function(){
	var id = (Math.random() * 700 ).toFixed();
	var randomNumbers = generateRandomBlocks();
	lobby(id, randomNumbers);
	return id;
}

getLobbyIndexFromId = function(id){
	for(var i = 0; i < allLobbies.length; i++){
		if(allLobbies[i].id == id){
			return i;
		}
	}
}

lobbyIsEmpty = function(data){
	var index = getLobbyIndexFromId(data.id);

	if (allLobbies[index].lobbyUsers.length == 0){
		return true;
	}else{
		return false;
	}
}

removeLobby = function(lobby){
	indexLobby = allLobbies.indexOf(lobby);
	allLobbies.splice(indexLobby, 1);
}

//----- Lobby User Functions -----//
userIsReady = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
  var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];


	if(!lobby.isActive){
		var lobbyUser = getUserFromAuthUser(authUser, lobby);
		lobbyUser.isReady = true;

		if(allUsersInLobbyReady(lobby) && (lobby.lobbyUsers.length > 1)){
			lobby.randomNumbers = generateRandomBlocks();
			game_server.emitToLobby(lobby, {type: 'startGame', users: lobby.users, randomNumbers: lobby.randomNumbers});
			game_server.startGame(lobby, {place:lobbyUser.place, distance: distance, blockSize: blockSize, randomNumbers: lobby.randomNumbers, playerPosition:lobby.slotsTaken});
			console.log("Game started in lobby with ID %s.", data.id);
		}else{
			game_server.emitToLobby(lobby, {type: 'userIsReady', place:lobbyUser.place, distance:distance, blockSize:blockSize});
		}
	}
}

getUserFromAuthUser = function(user, lobby){
	for(var j = 0; j < lobby.lobbyUsers.length; j++){
		if(user.id === (lobby.lobbyUsers[j].authUser.id)){
			return lobby.lobbyUsers[j];
		}
	}
}

userIsNotReady = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
  var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	if(!lobby.isActive){
		var lobbyUser = getUserFromAuthUser(authUser, lobby);
		lobbyUser.isReady = false;

		game_server.emitToLobby(lobby, {type: 'userIsNotReady', place:lobbyUser.place, distance:distance, blockSize:blockSize});
	}
}

userLeavedLobby = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
	var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	var lobbyUser = getUserFromAuthUser(authUser, lobby);

	lobby.slotsTaken[lobbyUser.place] = 0;
	game_server.emitToLobby(lobby, {type: 'userLeavedLobby', active: lobby.isActive, distance: distance, blockSize: blockSize, playerPosition:lobby.slotsTaken});

	removeUserFromLobby(lobby, lobbyUser);

	if(lobby.lobbyUsers.length == 0){
		removeLobby(lobby);
	}
}

getUserFromId = function(id, indexLobby){
	for(var i = 0; i < allLobbies[indexLobby].lobbyUsers.length; i++){
		if(allLobbies[indexLobby].lobbyUsers[i].id == id-1){
			return i;
		}
	}
}

addUserToLobby = function(client, data){
	var index = getLobbyIndexFromId(data.id);
	lobbyUser(allLobbies[index].lobbyUsers.length, index);
	allLobbies[index].clients.push(client);
}

removeUserFromLobby = function(lobby, lobbyUser){
	var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);
	lobby.lobbyUsers.splice(indexUser, 1);
}

getUsersFromLobby = function(id){
	var index = getLobbyIndexFromId(id);
	return allLobbies[index].lobbyUsers.length;
}

//----- Lobby Ready Functions -----//
allUsersInLobbyReady = function(lobby){

	for(var i = 0; i < lobby.lobbyUsers.length; i++){
		if (lobby.lobbyUsers[i].isReady == false){
			return false;
		}
	}
	lobby.isActive = true;
	return true;
}

//----- Lobby Random Numbers Functions-----//
getRandomNumbersFromLobby = function(id){
	var index = getLobbyIndexFromId(id);
	return allLobbies[index].randomNumbers;
}

getRandomNumbersFromLobby_new = function(id){
	var index = getLobbyIndexFromId(id);
	return allLobbies[index].randomNumbers;
}

generateRandomBlocks = function(){
	var randomNumbers = [];
	for(i = 0; i < 10000; i++){
		randomNumbers[i] = Math.round(Math.random() * 7);
	}
	return randomNumbers;
}
