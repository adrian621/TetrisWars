var game_server = module.exports = {};
var game_core = require('./gameCore');
var interval;

//----- Variables -----//
//store this in lobby
	
game_server.move = function(io, data, lobby){
	game_core.moveBlocksExport(data.move, lobby.boards[data.user-1]);
	game_server.emitToLobby(lobby, {type: 'move', id:data.id, user:data.user, board: lobby.boards[data.user-1]});	
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

checkValidity = function(data, lobby){
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
		//console.log("last state = "+lobby.lobbyUsers[i].lastStateCurrentBlocks);
	}
	
	var gameOvers = game_core.updateAllBoards(lobby.boards);
	
	if (gameOvers >= lobby.lobbyUsers.length-1){
		var winner = 0;
		for(var i = 0; i < lobby.lobbyUsers.length; i++){
			lobby.lobbyUsers[i].isReady = false;
			if(lobby.boards[i].isActive){
				winner = i+1;
				lobby.boards[i].isActive = false;
			}
		}
		clearInterval(interval);
		game_server.emitToLobby(lobby, {type: 'winner', winner: winner});
		lobby.isActive = false;
	}
	for(var i = 0; i < lobby.boards.length; i++){
		
		game_server.emitToLobby(lobby, {type: 'move', user:i+1, board: lobby.boards[i]});
	}
}

game_server.startGame = function(lobby){
	lobby.boards = [];
	game_core.addBoards({randomNumbers: lobby.randomNumbers, users: lobby.lobbyUsers.length}, 0, lobby.boards);
	game_core.startGame(lobby.boards);
	interval = setInterval(function(){update(lobby);}, 1000);
}
