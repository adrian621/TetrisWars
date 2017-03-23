var game_server = module.exports = {};
var game_core = require('./gameCore');
var ranking = require('./ranking');
//TODO: need several intervals
var interval;

//----- Variables -----//
//store this in lobby

game_server.move = function(io, data, lobby, indexUser, socket){
	if(checkValidity(data, lobby, indexUser, socket) == false){
		//TODO: correct time?
		socket.emit('invalidBoard', {board: lobby.boards[indexUser]});
	}
}

/*game_server.boardIsUpdated = function(data, lobby, client){
	if(!checkValidity(data, lobby)){
		client.emit('invalidBoard', {board: lobby.boards[data.user-1]});
	}
}*/

game_server.emitToLobby = function(lobby, data){
	for(var i = 0; i < lobby.clients.length; i++){
		lobby.clients[i].emit(data.type, data);
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
			game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.boards[indexUser]});
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
			game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.lastStateBoards[indexUser]});
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

	//TODO: if two users lose on same round, make them get same rank

	lobby.gameOvers = lobby.gameOvers + newGameOvers;

	if (lobby.gameOvers.length >= lobby.boards.length-1){
		endGame(lobby);
	}
	else{ //not game over
		//TODO: get new randomnumbers for next game, get rank
		game_server.emitToLobby(lobby, {type: 'update', boards: lobby.boards});
	}
}

endGame = function(lobby){
	console.log("Winner!!!");
	clearInterval(interval);
	lobby.isActive = false;
	lobby.gameOvers = [];

	for(i=0; i < lobby.lobbyUsers.length; i++){
		lobby.lobbyUsers[i].isReady = false;
	}

	var winner = "";
	var place = 0;
	//TODO: if both last users lost on same intervall
	for(var i = 0; i < lobby.boards.length; i++){
		if(lobby.boards[i].isActive){
			winner = lobby.boards[i].username;
			place = lobby.boards[i].place;
		}
    /* Reset game */
		lobby.boards[i].allBlocks = [];
		lobby.boards[i].currentBlocks = [];
		lobby.boards[i].randomNumbersCounter = 0;
		lobby.boards[i].isActive = false;
		lobby.boards[i].time = 0;
	}
  ranking.updateRank(lobby.lobbyUsers, winner);

		
	game_server.emitToLobby(lobby, {type: 'winner', name: winner, place:place, playerPosition:lobby.slotsTaken, boards:lobby.boards, distance:lobby.distance, blockSize:lobby.blockSize});
}

game_server.startGame = function(lobby, data){
	/*lobby.boards = [];
	game_core.addBoards(data, lobby.boards);*/

	lobby.boards.forEach(function(board) {
		console.log(data.place);
	  board.randomNumbers = data.randomNumbers;
	});

	game_core.startGame(lobby.boards);
	interval = setInterval(function(){update(lobby);}, 1000);
}

getBoardFromPlace = function(lobby, place){
	for(i=0; i < lobby.boards.length; i++){
		if(lobby.boards[i].place == place){
			return boards[i];
		}
	}
}
