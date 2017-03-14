var game_server = module.exports = {};
var game_core = require('./gameCore');

//TODO: need several intervals
var interval;

//----- Variables -----//
//store this in lobby

game_server.move = function(io, data, lobby, indexUser, socket){
	// TODO: checked moved on the server side
	if(checkValidity(data, lobby, indexUser)){
		game_core.moveBlocksExport(data.move, lobby.boards[indexUser]);
		game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.boards[indexUser]});
	}else{
		socket.emit('invalidBoard', {board: lobby.boards[indexUser]});
	}
}

game_server.boardIsUpdated = function(data, lobby, client){
	if(!checkValidity(data, lobby)){
		client.emit('invalidBoard', {board: lobby.boards[data.user-1]});
	}
}

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

checkValidity = function(data, lobby, indexUser){
	//console.log("data.user: "+data.user);
	var board = data.board;

	//All blocks
	/*if(!blockListEqual(lobby.boards[indexUser].allBlocks, board.allBlocks)){
		if(!blockListEqual(lobby.lobbyUsers[indexUser].lastStateAllBlocks, board.allBlocks)){
			return false;
		}
	}*/

	var tempBoard = lobby.boards[indexUser];
	var tempBoardLastState = lobby.lastStateBoards[indexUser];

	moveBlocks(data.move, tempBoard);
	moveBlocks(data.move, tempBoardLastState);

	//Current blocks
	if(!blockListEqual(tempBoard.currentBlocks, board.currentBlocks)){
		if(!blockListEqual(tempBoardLastState.currentBlocks, board.currentBlocks)){
			return false;
		}
	}
	return true;
}

update = function(lobby){
	for(var i = 0; i < lobby.boards.length; i++){
		lobby.lastStateBoards[i] = lobby.boards[i];
		//lobby.boards[i].lastStateAllBlocks = lobby.boards[i].allBlocks;
		//lobby.boards[i].lastStateCurrentBlocks = lobby.boards[i].currentBlocks;
	}

	var newGameOvers = game_core.updateAllBoards(lobby.boards);

	//TODO: if two users lose on same round, make them get same rank

	lobby.gameOvers = lobby.gameOvers + newGameOvers;

	if (lobby.gameOvers.length >= lobby.boards.length-1){
		clearInterval(interval);

		var winner = "";

		//TODO: if both last users lost at same time
		for(var i = 0; i < lobby.boards.length; i++){
			if(lobby.boards[i].isActive){
				winner = lobby.boards[i].username;
				lobby.boards[i].isActive = false;
			}
		}
		game_server.emitToLobby(lobby, {type: 'winner', winner: winner});
		for(i=0; i < lobby.lobbyUsers.length; i++){
			lobby.lobbyUsers[i].isReady = false;
		}
		lobby.isActive = false;
	}

	//TODO: get new randomnumbers for next game, get rank
	game_server.emitToLobby(lobby, {type: 'update', boards: lobby.boards});
}

game_server.startGame = function(lobby, data){
	lobby.boards = [];
	game_core.addBoards(data, lobby.boards);
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
