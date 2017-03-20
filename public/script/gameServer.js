var game_server = module.exports = {};
var game_core = require('./gameCore');

//TODO: need several intervals
var interval;

//----- Variables -----//
//store this in lobby

game_server.move = function(io, data, lobby, indexUser, socket){
	if(checkValidity(data, lobby, indexUser, socket) == false){
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

	if(board.time == tempBoard.time){ //this state
		console.log("Current state");
		game_core.moveBlocksExport(data.move, tempBoard);
		if(!blockListEqual(tempBoard.currentBlocks, board.currentBlocks)){
			console.log("Different blocks");
			return false;
		}else{//Correct in this state
			console.log("Correct blocks");
			if(lobby.boards[indexUser].time == tempBoard.time){
				console.log("State is not updated");
				game_core.moveBlocksExport(data.move, lobby.boards[indexUser]);
				game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.boards[indexUser]});
			}else{//*this* state is now last state
				console.log("State has updated");
				game_core.moveBlocksExport(data.move, lobby.lastStateBoards[indexUser]);
				lobby.boards[indexUser] = JSON.parse(JSON.stringify(lobby.lastStateBoards[indexUser]));
				game_core.updateBoard(lobby.boards[indexUser]);
				game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.lastStateBoards[indexUser]});
			}
		}
	}else if(board.time == tempBoardLastState.time){ //last state
		console.log("Last state");
		game_core.moveBlocksExport(data.move, tempBoardLastState);
		if(!blockListEqual(tempBoardLastState.currentBlocks, board.currentBlocks)){
			console.log("Different blocks");
			return false;
		}else{//Correct in last state
			if(lobby.boards[indexUser].time == tempBoardLastState.time){
				console.log("State is not updated");
				game_core.moveBlocksExport(data.move, lobby.lastStateBoards[indexUser]);
				game_server.broadcastToLobby(lobby, socket, {type: 'move', board: lobby.lastStateBoards[indexUser]});
			}else{//*last* state is now last state
				console.log("State has updated. Superslow internet. Can this even happen?");
				return false;
			}
		}
	}else{//if invalid time
		console.log("Invalid time: "+board.time+" (your), "+tempBoard.time+" (current)");
		return false;
	}

	console.log("Valid state!");
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
		clearInterval(interval);

		var winner = "";

		//TODO: if both last users lost at same time
		for(var i = 0; i < lobby.boards.length; i++){
			if(lobby.boards[i].isActive){
				var winner = lobby.boards[i].username;
				var place = lobby.boards[i].place;
				lobby.boards[i].isActive = false;
			}
		}
		game_server.emitToLobby(lobby, {type: 'winner', name: winner, place:place, playerPosition:lobby.slotsTaken});
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
