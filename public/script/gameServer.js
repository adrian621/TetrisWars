var game_server = module.exports = {};
var game_core = require('./gameCore');
var interval;

//----- Variables -----//
//store this in lobby

game_server.move = function(io, data, lobby, indexUser){
	// TODO: move this or previous state is not checked !!
	game_core.moveBlocksExport(data.move, boards[indexUser]);
	game_server.emitToLobby(lobby, {type: 'move', user:data.user, board: lobby.boards[indexUser]});
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

checkValidity = function(data, lobby, place){
	//console.log("data.user: "+data.user);

	//All blocks
	if(!blockListEqual(lobby.boards[data.user-1].allBlocks, data.board.allBlocks)){
		if(!blockListEqual(lobby.lobbyUsers[data.user-1].lastStateAllBlocks, data.board.allBlocks)){
			return false;
		}
	}

	//Current blocks
	if(!blockListEqual(lobby.boards[data.user-1].currentBlocks, data.board.currentBlocks)){
		if(!blockListEqual(lobby.lobbyUsers[data.user-1].lastStateCurrentBlocks, data.board.currentBlocks)){
			return false;
		}
	}

	return true;
}

update = function(lobby){
	for(var i = 0; i < lobby.boards.length; i++){
		lobby.lobbyUsers[i].lastStateAllBlocks = lobby.boards[i].allBlocks;
		lobby.lobbyUsers[i].lastStateCurrentBlocks = lobby.boards[i].currentBlocks;
	}

	var gameOvers = game_core.updateAllBoards(lobby.boards);

	if (gameOvers >= lobby.lobbyUsers.length-1){
		var winner = 0;
		for(var i = 0; i < lobby.lobbyUsers.length; i++){
			lobby.lobbyUsers[i].isReady = false;
			if(lobby.boards[i].isActive){
				winner = i;
				lobby.boards[i].isActive = false;
			}
		}
		clearInterval(interval);
		//TODO: find correct winner
		game_server.emitToLobby(lobby, {type: 'winner', winner: winner});
		lobby.isActive = false;
	}
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
		console.log("Board not found");
	}
}
