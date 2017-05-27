//----- Variables -----//
var game_server = module.exports = {};
var game_core = require('./gameCore');
var ranking = require('./ranking');
var genLobbyList = require('./genLobbyList');
var lobby_server = require('./lobbyServer');

//----- Functions -----//
game_server.move = function(io, data, lobby, indexUser, socket){
	if(checkValidity(data, lobby, indexUser, socket) == false){
		socket.emit('invalidBoard', {board: lobby.boards[indexUser]});
	}
}

game_server.emitToLobby = function(lobby, data){
	for(var i = 0; i < lobby.clients.length; i++){
		lobby.clients[i].emit(data.type, data);
	}
}

game_server.emitToWatchers = function(lobby, data){
	for(var i = 0; i < lobby.waitingClients.length; i++){
		lobby.waitingClients[i].emit(data.type, data);
	}
}

game_server.broadcastToLobby = function(lobby, socket, data){
	for(var i = 0; i < lobby.clients.length; i++){
		if(lobby.clients[i] != socket){
			lobby.clients[i].emit(data.type, data);
		}
	}
}

game_server.addBoardToLobby  = function(data, list){
	game_core.addBoard(data, list);
};

blockListEqual = function(blocks_1, blocks_2){
	if(!blocks_2){
		return false;
	}
	if(blocks_1.length != blocks_2.length){
		return false;
	}

	for(var i = 0; i < blocks_1.length; i++){
		if(blocks_1[i].x != blocks_2[i].x){
			return false;
		}
		if(blocks_1[i].y != blocks_2[i].y){
			return false;
		}
	}

	return true;
}

checkValidity = function(data, lobby, indexUser, socket){
	var board = data.board;
	var tempBoard = JSON.parse(JSON.stringify(lobby.boards[indexUser]));
	var tempBoardLastState = JSON.parse(JSON.stringify(lobby.lastStateBoards[indexUser]));

	/* If this state */
	if(board.time == tempBoard.time){
		game_core.moveBlocksExport(data.move, tempBoard);
		if(!blockListEqual(tempBoard.currentBlocks, board.currentBlocks)){
			return false;
		}
		else{//Correct in this state
			game_core.moveBlocksExport(data.move, lobby.boards[indexUser]);
			game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.boards[indexUser], playerPosition:lobby.slotsTaken, place:lobby.boards[indexUser].place});
			game_server.emitToWatchers(lobby, {type: 'watcherMove', board: lobby.boards[indexUser], playerPosition:lobby.slotsTaken, place:lobby.boards[indexUser].place});
		}
	}

	/* If last state */
	else if(board.time == tempBoardLastState.time){
		game_core.moveBlocksExport(data.move, tempBoardLastState);
		if(!blockListEqual(tempBoardLastState.currentBlocks, board.currentBlocks)){
			return false;
		}
		else{//Correct in last state
			game_core.moveBlocksExport(data.move, lobby.lastStateBoards[indexUser]);
			lobby.boards[indexUser] = JSON.parse(JSON.stringify(lobby.lastStateBoards[indexUser]));
			game_core.updateBoard(lobby.boards[indexUser]);
			game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.lastStateBoards[indexUser], playerPosition:lobby.slotsTaken, place:lobby.boards[indexUser].place});
			game_server.emitToWatchers(lobby, {type: 'watcherMove', board: lobby.lastStateBoards[indexUser], playerPosition:lobby.slotsTaken, place:lobby.boards[indexUser].place});
		}
	}

	/* Invalid state (two states ago)*/
	else{
		return false;
	}

	return true;
}

update = function(lobby){
	for(var i = 0; i < lobby.boards.length; i++){
		lobby.lastStateBoards[i] = JSON.parse(JSON.stringify(lobby.boards[i]));
	}

	var newGameOvers = game_core.updateAllBoards(lobby.boards);
	var tempPlace = -1;
	for(var i = 0; i < newGameOvers.length; i++){
		tempPlace = newGameOvers[i];
		game_server.emitToLobby(lobby, {type: 'gameOver', place:tempPlace, playerPosition:lobby.slotsTaken});
		game_server.emitToWatchers(lobby, {type: 'gameOverWatchers', place:tempPlace, playerPosition:lobby.slotsTaken});
	}

	lobby.gameOvers = lobby.gameOvers + newGameOvers;

	if (lobby.gameOvers.length >= lobby.boards.length-1){
		endGame(lobby);
	}
	else{ //not game over
		game_server.emitToLobby(lobby, {type: 'update', boards: lobby.boards, playerPosition:lobby.slotsTaken});
		game_server.emitToWatchers(lobby, {type: 'watcherUpdate', boards: lobby.boards, playerPosition:lobby.slotsTaken});
	}
}

endGame = function(lobby){
	clearInterval(lobby.interval);
	lobby.isActive = false;
	genLobbyList.updateLobby(lobby.id, lobby.lobbyUsers.length, "No");

	var winner = "";
	var winnerPlace = 0;
	var losers = [];
	//TODO: if both last users lost on same intervall
	for(var i = 0; i < lobby.boards.length; i++){
		if(lobby.boards[i].isActive){
			winner = lobby.boards[i].player;
			winnerId = lobby.boards[i].id;
			winnerPlace = lobby.boards[i].place;
			lobby.boards[i].winner = true;
		}
		else{
			losers.push(lobby.boards[i].id);
		}
	}

  ranking.updateRank(losers, winnerId);
	game_server.emitToLobby(lobby, {type: 'winner', gameOvers: lobby.gameOvers, playerPosition:lobby.slotsTaken, boards:lobby.boards, newPlayers:lobby.newPlayers, leavedLobby:lobby.leavedLobby});
	game_server.emitToWatchers(lobby, {type: 'watcherWinner', gameOvers: lobby.gameOvers, playerPosition:lobby.slotsTaken, boards:lobby.boards, newPlayers:lobby.newPlayers, leavedLobby:lobby.leavedLobby});

	for(var i = lobby.boards.length-1; i >= 0; i--){
		if(lobby.boards[i].leaved){
			lobby.slotsTaken[lobby.boards[i].place] = 0;
			lobby.boards.splice(i, 1);
		}
	}

	for(i=0; i < lobby.slotsTaken.length; i++){
		if(lobby.slotsTaken[i] == 1){
			lobby.newPlayers[i] = false;
			lobby.isReadys[i] = false;
		}
	}

	for(i=0; i < lobby.lobbyUsers.length; i++){
		lobby.lobbyUsers[i].isReady = false;
	}

	var authUser = null;
	var lobbyId = null;
	var socket = null;
	for(var i = 0; i < lobby.waitingLine.length; i++){
		authUser = lobby.waitingLine[0][1];
		lobbyId = lobby.waitingLine[0][0];
		socket = lobby.waitingClients[0];
		lobby_server.addUserToLobby_new_export(authUser, lobbyId);
		lobby.clients.push(socket);
		lobby.waitingLine.splice(0,1);
		lobby.waitingClients.splice(0,1);
		socket.emit('joinGame', {playerPosition:lobby.slotsTaken, usernames:lobby.usernames, isReadys:lobby.isReadys, gameOvers: lobby.gameOvers, boards:lobby.boards, leavedLobby:lobby.leavedLobby, newPlayers:lobby.newPlayers});
	}
	game_server.emitToLobby(lobby, {type: 'newPlayer', playerPosition:lobby.slotsTaken, usernames:lobby.usernames, isReadys:lobby.isReadys, gameOvers: lobby.gameOvers, boards:lobby.boards, leavedLobby:lobby.leavedLobby, newPlayers:lobby.newPlayers});
}

game_server.startGame = function(lobby, data){
	for(var i = 0; i < lobby.boards.length; i++){
		/* Reset game */
		lobby.boards[i].allBlocks = [];
		lobby.boards[i].currentBlocks = [];
		lobby.boards[i].randomNumbersCounter = 0;
		lobby.boards[i].isActive = false;
		lobby.boards[i].time = 0;
	}

	lobby.boards.forEach(function(board) {
		board.randomNumbers = data.randomNumbers;
	});

	game_core.startGame(lobby.boards);
	lobby.interval = setInterval(function(){update(lobby);}, 1000);
	lobby.gameOvers = [];

	for(var i = 0; i < lobby.boards.length; i++){
		lobby.lastStateBoards[i] = JSON.parse(JSON.stringify(lobby.boards[i]));
	}

	game_server.emitToLobby(lobby, {type: 'getStartBoards', boards: lobby.boards, playerPosition:lobby.slotsTaken, usernames:lobby.usernames});
}

getBoardFromPlace = function(lobby, place){
	for(i=0; i < lobby.boards.length; i++){
		if(lobby.boards[i].place == place){
			return boards[i];
		}
	}
}
