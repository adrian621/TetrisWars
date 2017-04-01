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
//var tetrisBackground = '../images/tetris_bg.jpg';

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

drawUsername = function(username, distance, place){
	x = distance*(place+1)-100;
	y = 85;
	context.font = "20px Comic Sans MS";
	context.fillStyle = "#bbb0c3";
	context.fillText(username, x, y);
}

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

drawButton = function(adress, place, distance, blockSize){
	var x = distance*(place+1) - 100;
	var y = 100 + blockSize*20 + 15;
	var picture = new Image();
	picture.src = adress;
	if(picture.complete){
		context.drawImage(picture, x, y, 100, 33);
	}
	else{
		picture.onload = function(){
			context.drawImage(picture, x, y, 100, 33);
		}
	}
}

drawBoardsAndButtons = function(data){
	for(var i = 0; i < data.playerPosition.length; i++){
		if(data.playerPosition[i] == 1){
			drawUsername(data.usernames[i], data.distance, i);
			drawBlackBoard(i, data.distance, data.blockSize);
			if(data.isReadys[i] == true){
				drawButton('../images/readyButton.png', i, data.distance, data.blockSize);
			}else{
				drawButton('../images/waitForReadyButton.png', i, data.distance, data.blockSize);
			}
		}
	}
}

drawButtons = function(data){
	for(var i = 0; i < data.playerPosition.length; i++){
		if(data.playerPosition[i] == 1){
			drawButton('../images/waitForReadyButton.png', i, data.distance, data.blockSize);
		}
	}
}

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
		if(x > board.x &&
			x < board.x+ board.width &&
			y > board.y+board.height+15 &&
			y < (board.y+board.height+15)+33){
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
	}
}

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

window.onkeyup = function(e){
	clearInterval(intervalMove);
	canMove = true;
}


//----- Socket Communication -----//
socket.on('userLeavedLobby', function(data){
	if(data.active == false){
		drawBoardsAndButtons(data);
	}
});

socket.on('gameSetupR', function(data){
	boardName = data.username;
	boardNumber = data.place;
	gameCore.addBoard(data, boards);
	board = boards[0];
	drawBoardsAndButtons(data);
	addButtonEvent();

	document.getElementById("lobbyname_text").innerHTML = data.lobbyname;
	document.getElementById("maxplayers_text").innerHTML = "Maxplayers: "+data.maxplayers.toString();
});

socket.on('newPlayer', function(data){
	//gameCore.addBoard(data, boards);
	drawUsername(data.username, data.distance, data.place);
	drawButton('../images/waitForReadyButton.png', data.place, data.distance, data.blockSize);
	drawBlackBoard(data.place, data.distance, data.blockSize);
});

socket.on('userIsReady', function(data){
	drawButton('../images/readyButton.png', data.place, data.distance, data.blockSize);
});

socket.on('userIsNotReady', function(data){
	drawButton('../images/waitForReadyButton.png', data.place, data.distance, data.blockSize);
});

socket.on('startGame', function(data){
	board.allBlocks = [];
	board.currentBlocks = [];
	board.randomNumbers = data.randomNumbers;
	board.randomNumbersCounter = 0;
	board.playerPosition = data.playerPosition;
	board.time = 0;

	gameCore.startGameBoard(board);
	updateCanvasBoard(board);

	var x = 0;
	var y = 100 + data.blockSize*20 + 15;
	context.clearRect(x, y, 800, data.blockSize*10);
	context.clearRect(0, 0, 800, 100);
});

socket.on('move', function(data){
	updateCanvasBoard(data.board);
});

socket.on('update', function(data){
	update();

	for(i = 0; i < data.boards.length; i++){
		if(data.boards[i].place != board.place){
			updateCanvasBoard(data.boards[i]);
		}
	}
});

socket.on('getStartBoards', function(data){
	for(i = 0; i < data.boards.length; i++){
		if(data.boards[i].place != board.place){
			updateCanvasBoard(data.boards[i]);
		}
	}
});

socket.on('invalidBoard', function(data){
	board = data.board;
	updateCanvasBoard(data.board);
});

socket.on('winner', function(data){
	drawButtons(data);
	drawButton('../images/winnerButton.png', data.place, data.distance, data.blockSize);
	board.isActive = false;
	board.isReady = false;
});
