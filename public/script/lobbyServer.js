var lobby_server = module.exports = {};
var game_server = require('./gameServer');
var genLobbyList = require('./genLobbyList');
var allLobbies = [];
var blockSizePlayer = 13;
var blockSizeOpponent = 8;
var distanceToOpponent = 450;
var playerBoardX = 80;
var playerBoardY = 125;
var opponentBoardY = 140;
var distanceBetweenOpponents = blockSizeOpponent*10 + 25;

//----- Public Functions -----//
lobby_server.lobbyFunctions = function(socket, message, io){
	switch(message.type){
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
			game_server.move(io, message, lobby, indexUser, socket);
			break;
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
}

lobby = function(id, maxusers, name, password){
	var lobby = {
		name: name.repeat(1),
		id: id,
		psw: password,
		randomNumbers: [],
		lobbyUsers: [],
		isActive: false,
		maxUsers: maxusers,
		boards: [],
		lastStateBoards: [],
		clients: [],
		slotsTaken: [0, 0, 0, 0, 0, 0],
		usernames: ["", "", "", "", "", ""],
		isReadys: [false, false, false, false, false, false],
		gameOvers: [],
		interval: null,
		canvasAppearance: []
	};
	allLobbies[allLobbies.length] = lobby;
}

//----- Lobby Functions -----//
lobby_server.createLobby = function(lobbyId, user, maxusers, name, password){
	console.log([name, maxusers])
	addNewLobby(lobbyId, maxusers, name, password);
	addUserToLobby_new(user, lobbyId);
}

addNewLobby = function(lobbyId, maxusers, name, password){
	lobby(lobbyId, maxusers, name, password);
	var tempPsw = "No";
	if(password){
		tempPsw = "Yes";
	}
	genLobbyList.NewLobby(name, lobbyId, 1, maxusers, tempPsw);
}

lobby_server.addUserToLobby_new_export = function(authUser, lobbyId){
	addUserToLobby_new(authUser, lobbyId);
}

//Ensure User not in specific lobby
lobby_server.ensureUserNotInLobby = function(user){
	for(var i = 0; i < allLobbies.length; i++){
		for(var j = 0; j < allLobbies[i].lobbyUsers.length; j++){
			if((allLobbies[i].lobbyUsers[j].authUser.id) == user.id){
				return false;
			}
		}
	}
	return true;
}

addUserToLobby_new = function(authUser, lobbyId){
	var lobbyIndex = getLobbyIndexFromId(lobbyId);
	var lobby = allLobbies[lobbyIndex];
	var place = 0;

	for(var i = 0; i< lobby.slotsTaken.length; i++){
		if(lobby.slotsTaken[i] == 0){
			lobby.slotsTaken[i] = 1;
			lobby.usernames[i] = authUser.username;
			place = i;
			break;
		}
	}


	lobbyUser(lobby.lobbyUsers.length, lobbyIndex, authUser, place);
	genLobbyList.updateLobby(lobbyId, lobby.lobbyUsers.length);

	game_server.addBoardToLobby({place:place, id: authUser.id, username: authUser.username, blockSize: blockSizePlayer, playerPosition:lobby.slotsTaken}, lobby.boards);
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

lobby_server.getLobbyList2 = function(){
//	var allInfo = ;
	var ids = [];
	var maxUsers = [];
	var users = [];
	var passwords = [];
	var name = [];

	for(var i = 0; i < allLobbies.length; i++){
		ids[i] = [allLobbies[i].id];
		maxUsers[i] = [allLobbies[i].maxUsers];
		users[i] = [allLobbies[i].lobbyUsers.length];
		if(allLobbies[i].psw){
			passwords[i] = "Yes";
		}
		else {
			passwords[i] = "No";
		}
		name[i] = [allLobbies[i].name];
	}

	return {ids: ids, maxUsers:maxUsers, users: users, passwords:passwords, name:name};
}



lobby_server.getLobbyFromLobbyID = function(lobbyId){
	lobbyIndex = getLobbyIndexFromId(lobbyId);
	return allLobbies[lobbyIndex];
}

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


// ----- Game Functions -----//
gameSetup = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
	var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	var randomNumbers = getRandomNumbersFromLobby(lobbyId);
	var users = getUsersFromLobby(lobbyId);
	var username = authUser.username;
	var lobbyUser = getUserFromUsername(authUser, lobby);

	if(lobbyId == 0){
		return;
	}

	lobby.clients.push(socket);
	socket.emit('gameSetupR', {randomNumbers: randomNumbers, users: users, username: username, place: lobbyUser.place, playerPosition:lobby.slotsTaken, lobbyname:lobby.name, maxplayers:lobby.maxUsers, usernames:lobby.usernames, isReadys:lobby.isReadys, blockSizePlayer:blockSizePlayer, blockSizeOpponent:blockSizeOpponent, distanceToOpponent:distanceToOpponent, distanceBetweenOpponents:distanceBetweenOpponents, playerBoardX:playerBoardX, playerBoardY:playerBoardY, opponentBoardY:opponentBoardY});
	game_server.broadcastToLobby(lobby, socket, {type: 'newPlayer', playerPosition:lobby.slotsTaken, usernames:lobby.usernames, isReadys:lobby.isReadys});
}


//----- Lobby User Functions -----//
lobby_server.validateId = function(lobbyId){
	for(var i = 0; i < allLobbies.length; i++){
		if(allLobbies[i].id == lobbyId){
		return true;
		}
	}
	return false;
}

userIsReady = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
  var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];

	if(!lobby.isActive){
		var lobbyUser = getUserFromAuthUser(authUser, lobby);
		lobbyUser.isReady = true;
		lobby.isReadys[lobbyUser.place] = true;

		if(allUsersInLobbyReady(lobby) && (lobby.lobbyUsers.length > 1)){
			lobby.isActive = true;
			var randomNum = generateRandomBlocks();
			game_server.emitToLobby(lobby, {type: 'startGame', playerPosition:lobby.slotsTaken, randomNumbers: randomNum, usernames:lobby.usernames});
			game_server.startGame(lobby, {username:lobbyUser.place, place:lobbyUser.place, randomNumbers: randomNum, playerPosition:lobby.slotsTaken});
		}else{
			game_server.emitToLobby(lobby, {type: 'userIsReady', place:lobbyUser.place, playerPosition:lobby.slotsTaken});
		}
	}
}

allUsersInLobbyReady = function(lobby){
	for(var i = 0; i < lobby.lobbyUsers.length; i++){
		if (lobby.lobbyUsers[i].isReady == false){
			return false;
		}
	}
	return true;
}

userIsNotReady = function(io, socket, data){
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
  var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	if(!lobby.isActive){
		var lobbyUser = getUserFromAuthUser(authUser, lobby);
		lobbyUser.isReady = false;
		game_server.emitToLobby(lobby, {type: 'userIsNotReady', place:lobbyUser.place, playerPosition:lobby.slotsTaken});
	}
}

getUserFromUsername = function(authUser, lobby){
		for(var j = 0; j < lobby.lobbyUsers.length; j++){
			if(authUser.id === (lobby.lobbyUsers[j].authUser.id)){
				return lobby.lobbyUsers[j];
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

getUserFromId = function(id, indexLobby){
	for(var i = 0; i < allLobbies[indexLobby].lobbyUsers.length; i++){
		if(allLobbies[indexLobby].lobbyUsers[i].id == id-1){
			return i;
		}
	}
}

getUsersFromLobby = function(id){
	var index = getLobbyIndexFromId(id);
	return allLobbies[index].lobbyUsers.length;
}

userLeavedLobby = function(io, socket, data){
	if(allLobbies == []){
		return;
	}
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
	var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	var lobbyUser = getUserFromAuthUser(authUser, lobby);
	var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);

	lobby.boards[indexUser] = [];
	lobby.slotsTaken[lobbyUser.place] = 0;
	lobby.usernames[lobbyUser.place] = "";
	lobby.isReadys[lobbyUser.place] = false;
	game_server.emitToLobby(lobby, {type: 'userLeavedLobby', active: lobby.isActive, playerPosition:lobby.slotsTaken});

	removeUserFromLobby(lobby, lobbyUser);

	if(lobby.lobbyUsers.length == 0){
		removeLobby(lobby);
	}
}

addUserToLobby = function(client, data){
	var index = getLobbyIndexFromId(data.id);
	lobbyUser(allLobbies[index].lobbyUsers.length, index);
	allLobbies[index].clients.push(client);
}

removeClients = function(lobbies){
		for(var i = 0; i < lobbies.length; i ++){
			lobbies[i].clients = [];
	}
}

removeUserFromLobby = function(lobby, lobbyUser){
	var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);
	lobby.lobbyUsers.splice(indexUser, 1);
	genLobbyList.updateLobby(lobby.id, lobby.lobbyUsers.length);
}

//----- Lobby Random Numbers Functions-----//
getRandomNumbersFromLobby = function(id){
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
