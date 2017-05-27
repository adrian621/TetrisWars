var lobby_server = module.exports = {};
var game_server = require('./gameServer');
var genLobbyList = require('./genLobbyList');
var allLobbies = [];

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
			if(lobbyId == 0){
				return;
			}
			var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
			var lobbyUser = getUserFromUsername(authUser, lobby);
			var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);
			game_server.move(io, message, lobby, indexUser, socket);
			break;
	}
};


//----- Structs -----//
lobbyUser = function(id, lobby, authUser, place){
	var lobbyUser = {
		id:id,
		isReady: false,
		lastStateValid: true,
		lastStateAllBlocks: [],
		lastStateCurrentBlocks: [],
		authUser: authUser,
		place: place
	};
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
		newPlayers: [true, true, true, true, true, true],
		leavedLobby: [false, false, false, false, false, false],
		waitingLine: new Array(),
		waitingClients : []
	};
	allLobbies[allLobbies.length] = lobby;
}

//----- Lobby Functions -----//
lobby_server.createLobby = function(lobbyId, user, maxusers, name, password){
	addNewLobby(lobbyId, maxusers, name, password);
	addUserToLobby_new(user, lobbyId);
}

addNewLobby = function(lobbyId, maxusers, name, password){
	lobby(lobbyId, maxusers, name, password);
	var tempPsw = "No";
	if(password){
		tempPsw = "Yes";
	}
	genLobbyList.NewLobby(name, lobbyId, 1, maxusers, tempPsw, "No");
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

createLobbyUser = function(lobby, authUser){
	var place = 0;

	for(var i = 0; i< lobby.slotsTaken.length; i++){
		if(lobby.slotsTaken[i] == 0){
			place = i;
			break;
		}
	}

	lobby.usernames[place] = authUser.username;
	lobby.slotsTaken[place] = 1;
	lobby.leavedLobby[place] = false;
	lobby.newPlayers[place] = true;
	lobby.isReadys[place] = false;
	var tempActive = "No";
	if(lobby.isActive == true){
		tempActive = "Yes";
	}

	lobbyUser(lobby.lobbyUsers.length, lobby, authUser, place);
	genLobbyList.updateLobby(lobby.id, lobby.lobbyUsers.length, tempActive);
	game_server.addBoardToLobby({place:place, id: authUser.id, username: authUser.username, playerPosition:lobby.slotsTaken}, lobby.boards);
}

addUserToLobby_new = function(authUser, lobbyId){
	var lobbyIndex = getLobbyIndexFromId(lobbyId);
	var lobby = allLobbies[lobbyIndex];

	if(lobby.isActive == true){
		lobby.waitingLine.push([lobbyId, authUser]);
		return;
	}
	//If lobby is not active
	createLobbyUser(lobby, authUser);
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
	var actives = [];

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
		if(allLobbies[i].isActive == true){
			actives[i] = "Yes";
		}
		else {
			actives[i] = "No";
		}
		name[i] = [allLobbies[i].name];
	}

	return {ids: ids, maxUsers:maxUsers, users: users, passwords:passwords, name:name, actives:actives};
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

getLobbyIdFromAuthWatcher = function(user){
	for(var i = 0; i < allLobbies.length; i++){
		for(var j = 0; j < allLobbies[i].waitingLine.length; j++){
			if(user.id === (allLobbies[i].waitingLine[j][1].id)){
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
	if(lobbyId == null || lobbyId == 0){
		lobbyId = getLobbyIdFromAuthWatcher(authUser);
	}
	var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];

	if(lobby.isActive == true){
		lobby.waitingClients.push(socket);
		socket.emit('watch', {users: users, playerPosition:lobby.slotsTaken, lobbyname:lobby.name, maxplayers:lobby.maxUsers, usernames:lobby.usernames, leavedLobby:lobby.leavedLobby, boards:lobby.boards});
	}else{
		var randomNumbers = getRandomNumbersFromLobby(lobbyId);
		var users = getUsersFromLobby(lobbyId);
		var username = authUser.username;
		var lobbyUser = getUserFromUsername(authUser, lobby);
		lobby.clients.push(socket);

		socket.emit('gameSetupR', {randomNumbers: randomNumbers, users: users, username: username, place: lobbyUser.place, playerPosition:lobby.slotsTaken, lobbyname:lobby.name, maxplayers:lobby.maxUsers, usernames:lobby.usernames, isReadys:lobby.isReadys, leavedLobby:lobby.leavedLobby});
		game_server.broadcastToLobby(lobby, socket, {type: 'newPlayer', playerPosition:lobby.slotsTaken, usernames:lobby.usernames, isReadys:lobby.isReadys, gameOvers: lobby.gameOvers, boards:lobby.boards, leavedLobby:lobby.leavedLobby, newPlayers:lobby.newPlayers});
	}
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
	if(lobby == null){ //if lobby is undefined or null
		return;
	}

	if(!lobby.isActive){
		var lobbyUser = getUserFromAuthUser(authUser, lobby);
		lobbyUser.isReady = true;
		lobby.isReadys[lobbyUser.place] = true;

		if(allUsersInLobbyReady(lobby) && (lobby.lobbyUsers.length > 1)){
			lobby.isActive = true;
			genLobbyList.updateLobby(lobby.id, lobby.lobbyUsers.length, "Yes");
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
	if(lobby == null){ //if lobby is undefined or null
		return;
	}
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
	var watch = false;
	if(allLobbies == []){
		return;
	}
	var authUser = socket.request.user;
	var lobbyId = getLobbyIdFromAuth(authUser);
	if (lobbyId == 0) {
		lobbyId = getLobbyIdFromAuthWatcher(authUser);
		watch = true;
	}
	var lobby = allLobbies[getLobbyIndexFromId(lobbyId)];
	if(lobby == null){ //if lobby is undefined or null
		return;
	}
	if (watch == true) {
		var index = lobby.waitingLine.indexOf([lobbyId, authUser]);
		lobby.waitingLine.splice(index, 1);
		lobby.waitingClients.splice(index, 1);
		return;
	}
	var lobbyUser = getUserFromAuthUser(authUser, lobby);
	var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);

	var place = lobby.boards[indexUser].place;
	lobby.leavedLobby[place] = true;

	if(lobby.isActive == true){
		lobby.boards[indexUser].isActive = false;
		lobby.boards[indexUser].leaved = true;
		lobby.gameOvers = lobby.gameOvers + place;
		var index = lobby.gameOvers.indexOf(place);
		lobby.gameOvers[index] = -4;
		game_server.emitToLobby(lobby, {type: 'userLeavedLobby', active: lobby.isActive, playerPosition:lobby.slotsTaken, place:lobby.boards[indexUser].place, newPlayers:lobby.newPlayers});
		game_server.emitToWatchers(lobby, {type: 'watcherUserLeavedLobby', active: lobby.isActive, playerPosition:lobby.slotsTaken, place:lobby.boards[indexUser].place, newPlayers:lobby.newPlayers});
	}else{
		lobby.boards.splice(indexUser, 1);
		lobby.slotsTaken[place] = 0;
		game_server.emitToLobby(lobby, {type: 'userLeavedLobby', active: lobby.isActive, playerPosition:lobby.slotsTaken, usernames:lobby.usernames, isReadys:lobby.isReadys, gameOvers: lobby.gameOvers, boards:lobby.boards, leavedLobby:lobby.leavedLobby, newPlayers:lobby.newPlayers});
	}

	lobby.usernames[place] = "";
	lobby.isReadys[place] = false;
	removeUserFromLobby(lobby, lobbyUser);

	if(lobby.lobbyUsers.length == 0){
		removeLobby(lobby);
	}
}

removeClients = function(lobbies){
		for(var i = 0; i < lobbies.length; i ++){
			lobbies[i].clients = [];
	}
}

removeUserFromLobby = function(lobby, lobbyUser){
	var indexUser = lobby.lobbyUsers.indexOf(lobbyUser);
	lobby.lobbyUsers.splice(indexUser, 1);
	tempActive = "No";
	if(lobby.isActive == true){
		tempActive = "Yes";
	}
	genLobbyList.updateLobby(lobby.id, lobby.lobbyUsers.length, tempActive);
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
