var lobby_server = module.exports = {};
var game_server = require('./gameServer');
var allLobbies = [];

//----- Public Functions -----//
lobby_server.lobbyFunctions = function(client, message, io){
	switch(message.type){
		//case "newLobby": newLobby(client, message); break;
		//case "getLobbyList": getLobbyList(client); break;
		case "gameSetup": gameSetup_new(io, client, message);  break;
		//case "userIsReady": userIsReady(io, message); break;
		//case "userIsNotReady": userIsNotReady(io, message); break;
		//case "userLeavedLobby": userLeavedLobby(client, message); break;

		//case "gameOver": gameOverServer(io, message); break;
	}
};

//----- Game Functions -----//
lobby_server.gameFunctions = function(io, message, client){
	var lobby = allLobbies[getLobbyIndexFromId(message.id)];
	switch(message.type){
		case "move": game_server.move(io, message, lobby); break;
		case "update": game_server.boardIsUpdated(message, lobby, client); break;
	}
};


//----- Structs -----//
lobbyUser = function(id, i, authUser){
	var lobbyUser = {
		id:id,
		isReady: false,
		lastStateValid: true,
		lastStateAllBlocks: [],
		lastStateCurrentBlocks: [],
		authUser: authUser
	};
	allLobbies[i].lobbyUsers[allLobbies[i].lobbyUsers.length] = lobbyUser;
	//console.log("User added in lobby: %s  on spot number %s. Lobby id = %s is is: %s", i, allLobbies[i].lobbyUsers.length-1, allLobbies[i].id, lobbyUser.id);
}

lobby = function(id, randomNumbers){
	var lobby = {
		id: id,
		randomNumbers: randomNumbers,
		lobbyUsers: [],
		isActive: false,
		maxUsers: 5,
		boards: [],
		clients: [],
	};
	allLobbies[allLobbies.length] = lobby;
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
	for(var i = 0; i < allLobbies.length; i++){
		if(allLobbies[i].id == lobbyId){
		return true;
		}
	}
	return false;
}
addUserToLobby_new = function(authUser, lobbyId){
	var index = getLobbyIndexFromId(lobbyId);
	lobbyUser(allLobbies[index].lobbyUsers.length, index, authUser);
}
addNewLobby_new = function(lobbyId){
	var randomNumbers = generateRandomBlocks();
	lobby(lobbyId, randomNumbers);
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
getLobbyIdFromSocket = function(user){
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
gameSetup_new = function(io, socket, data){
	console.log(data.type);

	//let socket join group of sockets

	var lobbyId = getLobbyIdFromSocket(socket.request.user);
	if(lobbyId == 0){
		console.log('no lobby found');
	}
	else{
		console.log('user belong to lobby with id' + lobbyId);
	}

	//var randomNumbers = getRandomNumbersFromLobby(client.u);
	/*
	var randomNumbers = getRandomNumbersFromLobby(data);
	var users = getUsersFromLobby(data);
	gameServer.emitToLobby(lobby, {type: 'gameSetupR', randomNumbers: randomNumbers, users: users});
	*/
}
gameSetup = function(io, client, data){
	console.log('asdasd');
	var lobby = allLobbies[getLobbyIndexFromId(data.id)];
	addUserToLobby(client, data);
	game_server.emitToLobby(lobby, {type: 'gameSetupR', randomNumbers:getRandomNumbersFromLobby(data), users:getUsersFromLobby(data), id:data.id});
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

removeLobby = function(data){
	var removed = false;

	for(var i = 0; i < allLobbies.length; i++){
		if(removed){
			allLobbies[i-1] = allLobbies[i];
		}
		if(data.id == allLobbies[i].id){
			removed = true;
		}
	}
	allLobbies.pop();
}

//----- Lobby User Functions -----//
userIsReady = function(io, data){
	var lobby = allLobbies[getLobbyIndexFromId(data.id)];
	if(!lobby.isActive){
		userInLobbyIsReady(data);
		if(allUsersInLobbyReady(data)){
			lobby.randomNumbers = generateRandomBlocks();
			game_server.emitToLobby(lobby, {type: 'startGame', users:getUsersFromLobby(data), id:data.id, randomNumbers: lobby.randomNumbers});
			game_server.startGame(lobby);
			console.log("Game started in lobby with ID %s.", data.id);
		}else{
			game_server.emitToLobby(lobby, {type: 'userIsReady', user: data.user, id: data.id});
		}
	}
}

userIsNotReady = function(io, data){
	var lobby = allLobbies[getLobbyIndexFromId(data.id)];
	if(!lobby.isActive){
		userInLobbyIsNotReady(data);
		game_server.emitToLobby(lobby, {type: 'userIsNotReady', user: data.user, id: data.id});
	}
}

userLeavedLobby = function(client, data){
	removeUserFromLobby(data);
	if(lobbyIsEmpty(data)){
		removeLobby(data);
		console.log("Removed empty lobby with ID %s.", data.id);
		return;
	}
	client.emit('gameSetupR',{randomNumbers:getRandomNumbersFromLobby(data), users:getUsersFromLobby(data), id:data.id});
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

removeUserFromLobby = function(data){
	var indexLobby = getLobbyIndexFromId(data.id);
	var indexUser = allLobbies[indexLobby].lobbyUsers.indexOf(data.user);
	allLobbies[indexLobby].lobbyUsers.splice(indexUser, 1);
}

getUsersFromLobby = function(data){
	var index = getLobbyIndexFromId(data.id);
	return allLobbies[index].lobbyUsers.length;
}

//----- Lobby Ready Functions -----//
userInLobbyIsReady = function(data){
	var indexLobby = getLobbyIndexFromId(data.id);
	var indexUser = getUserFromId(data.user, indexLobby);
	allLobbies[indexLobby].lobbyUsers[indexUser].isReady = true;
}

userInLobbyIsNotReady = function(data){
	var indexLobby = getLobbyIndexFromId(data.id);
	var indexUser = getUserFromId(data.user, indexLobby);
	allLobbies[indexLobby].lobbyUsers[indexUser].isReady = false;
}

allUsersInLobbyReady = function(data){
	var indexLobby = getLobbyIndexFromId(data.id);

	for(var i = 0; i < allLobbies[indexLobby].lobbyUsers.length; i++){
		if (allLobbies[indexLobby].lobbyUsers[i].isReady == false){
			return false;
		}
	}
	allLobbies[indexLobby].isActive = true;
	return true;
}

//----- Lobby Random Numbers Functions-----//
getRandomNumbersFromLobby = function(data){
	var index = getLobbyIndexFromId(data.id);
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
