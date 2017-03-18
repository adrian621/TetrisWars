//----- Variables -----//
var socket = io();
//var widthNext = blockSizePlayer*4;
//var heightNext = blockSizePlayer*4;
var boardNumber = -1;
var speed = 1000; // speed in milliseconds
var context = document.getElementById("game").getContext("2d");
var boards = [];
var board = [];

//Only so the player can get instant respons, the board will be run on server
var interval;
var intervalMove;
var canMove = true;
var boardName;

//----- Draw Functions -----//
drawBlock = function(block){
	var x = block.x;
	var y = block.y;
	var adress = '../images/small_blocks/block_'+block.color+'.jpg';
	drawPicture(adress, x, y);
}

/*
drawNextBlock = function(){
	nextBlockBox.clearRect(0, 0, widthNext, heightNext);
	nextBlockBox.fillStyle='grey';
	nextBlockBox.fillRect(0, 0, widthNext, heightNext);
	for(i = 0; i< nextBlocks.length; i++){
		nextBlockBox.fillStyle= nextBlocks[i].color;
		nextBlockBox.fillRect(((nextBlocks[i].x-blockSize)%(blockSize*3)), nextBlocks[i].y, blockSize, blockSize);
	}
}*/

drawPicture = function(adress, x, y){
	var picture = new Image();
	picture.src = adress;
	if(picture.complete){
		context.drawImage(picture, x, y);
	}
	else{
		picture.onload = function(){
			context.drawImage(picture, x, y);
		}
	}
}

drawReadyButton= function(place, distance, blockSize){
	var x = distance*(place+1) - 110;
	var y = 100 + blockSize*20 + 15;
	console.log("draw readyButton for "+place);
	drawPicture('../images/waitForReadyButton.png', x, y);
}

drawReadyButtonAll= function(data){
	for(var i = 0; i < data.playerPosition.length; i++){
		if(data.playerPosition[i] == 1){
			drawReadyButton(i, data.distance, data.blockSize);
		}
	}
}

//return = {id: allIDs, maxuse}

updateCanvasBoard = function(board){
	context.fillStyle = board.bgColor;
	context.fillRect(board.x, board.y, board.width, board.height);
	for(var i = 0; i< board.currentBlocks.length; i++){
		drawBlock(board.currentBlocks[i]);
	}
	for(var i = 0; i< board.allBlocks.length; i++){
		drawBlock(board.allBlocks[i]);
	}
}

drawBlackBoard = function(place, distance, blockSize){
		context.fillStyle = board.bgColor;
		context.fillRect(distance*(place+1)-100, 100, blockSize*10, blockSize*20);
}

drawBlackBoardsAll = function(data){
	for(i = 0; i < data.playerPosition.length; i++){
		if(data.playerPosition[i] == 1){
			drawBlackBoard(i, data.distance, data.blockSize);
		}
	}
}

//Used when the server sends all boards
updateCanvas = function(boards){
	for(var i=0; i < boards.length; i++){
		updateCanvasBoard(boards[i].place);
	}
}

update = function(){
	if(board.isActive == true){
		gameCore.updateBoard(board);
	}
	updateCanvasBoard(board);
}

startGame = function(){
	gameCore.startGameBoard(board);
	interval = setInterval(update, speed);
}

//----- Events -----//
//TODO: Buttonevent is not completely on button picture
addButtonEvent = function(){
	var canvas = document.getElementById("game");
	canvas.addEventListener("click", function(event){
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		if(x > board.x + (board.width/4) &&
			x < board.x+(board.width/4)+120 &&
			y > board.y+board.height+15 &&
			y < (board.y+board.height+15)+40){
				if(board.isReady == false){
					board.isReady = true;
					socket.emit('lobby', {type:"userIsReady"});
				}else{ //if board.isReady == true
					board.isReady = false
					socket.emit('lobby', {type:"userIsNotReady"});
				}
		}
	}, false);
}

window.onload =function(){
	if(lobbyId){
	lobbyNumber = lobbyId;
	}else{
		lobbyNumber = 0;
	}
	drawPicture('../images/background2.png', 0, 0);
	socket.emit('lobby', {type: "gameSetup"});
}

window.onbeforeunload = function(){
	socket.emit('lobby', {id:lobbyNumber, user:boardNumber, type:"userLeavedLobby"});
}

window.onkeydown = function(e){
	if(canMove && board.isActive){
		canMove = false;
		gameCore.moveBlocksExport(e.keyCode, board);
		updateCanvasBoard(board);
		socket.emit('game', {move: e.keyCode, type:"move", board: board});

		/*intervalMove = setInterval(function(){
			gameCore.moveBlocksExport(e.keyCode, board);
			updateCanvasBoard(board);
			socket.emit('game', {move: e.keyCode, type:"move", board: board});
		}, 300);*/
	}
}

window.onkeyup = function(e){
	clearInterval(intervalMove);
	canMove = true;
}


//----- Socket Communication -----//
socket.on('userLeavedLobby', function(data){
	if(data.active == false){
		drawPicture('../images/background2.png', 0, 0);
		drawReadyButtonAll(data);
		drawBlackBoardsAll(data);
	}
});

socket.on('gameSetupR', function(data){
	boardName = data.username;
	boardNumber = data.place;
	gameCore.addBoard(data, boards);
	board = boards[0];
	drawReadyButtonAll(data);
	drawBlackBoardsAll(data);
	addButtonEvent();
});

socket.on('newPlayer', function(data){
	//gameCore.addBoard(data, boards);
	drawReadyButton(data.place, data.distance, data.blockSize);
	drawBlackBoard(data.place, data.distance, data.blockSize);
});

socket.on('userIsReady', function(data){
	var x = data.distance*(data.place+1) - 110;
	var y = 100 + data.blockSize*20 + 15;
	drawPicture('../images/readyButton.png', x, y);
});

socket.on('userIsNotReady', function(data){
	var x = data.distance*(data.place+1) - 110;
	var y = 100 + data.blockSize*20 + 15;
	drawPicture('../images/waitForReadyButton.png', x, y);
});

socket.on('startGame', function(data){
	drawPicture('../images/background2.png', 0, 0);
	drawBlackBoardsAll(data);
	startGame(board.randomNumbers);
});

socket.on('move', function(data){
	updateCanvasBoard(data.board);
});

socket.on('update', function(data){
	for(i = 0; i < data.boards.length; i++){
		if(data.boards[i].place != board.place){
			updateCanvasBoard(data.boards[i]);
		}
	}
});

socket.on('invalidBoard', function(data){
	console.log("invalid board correction");
	board = data.board;
	updateCanvasBoard(data.board);
});

socket.on('winner', function(data){
	clearInterval(interval);
	drawReadyButtonAll(data);
	var x = boards[data.winner].x - 10;
	var y = boards[data.winner].y - 45;
	drawPicture('../images/winnerButton.png', x, y);
	boards[data.winner].isActive = false;
});
