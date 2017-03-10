//----- Variables -----//
var socket = io();
//var widthNext = blockSizePlayer*4;
//var heightNext = blockSizePlayer*4;
var boardNumber = -1;
var speed = 1000; // speed in milliseconds
var context = document.getElementById("game").getContext("2d");
var playersActive = [];
var boards = [];
var interval;
var intervalMove;
var canMove = true;

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

drawReadyButton= function(data, start){
	for(var i = start; i < data.users; i++){
		var x = boards[i].x - 10;
		var y = boards[i].y + boards[i].height+15;
		drawPicture('../images/waitForReadyButton.png', x, y);
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

updateCanvas = function(){
	for(var i=0; i < boards.length; i++){
		updateCanvasBoard(boards[i]);
	}
}
update = function(){
	gameCore.updateAllBoards(boards);
	updateCanvas();
	socket.emit('game' ,{id: lobbyNumber, user: boardNumber, board: boards[boardNumber-1], type:"update"});
}

startGame = function(){
	/*for(var i=0; i < boards.length; i++){
		context.fillStyle = 'white';
		context.fillRect(boards[i].x - 10, boards[i].y + boards[i].height+15, 120, 40);
		context.fillRect((boards[i].x - 10), (boards[i].y - 45), 120, 40);
	};*/
	drawPicture('../images/background2.png', 0, 0);
	gameCore.startGame(boards);
	updateCanvas();
	interval = setInterval(update, speed);
}

//----- Events -----//
addButtonEvent = function(boardNummer){
	var canvas = document.getElementById("game");
	canvas.addEventListener("click", function(event){
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		if(x > boards[boardNummer-1].x+(boards[boardNummer-1].width/4) &&
			x < boards[boardNummer-1].x+(boards[boardNummer-1].width/4)+120 &&
			y > boards[boardNummer-1].y+boards[boardNummer-1].height+15 &&
			y < (boards[boardNummer-1].y+boards[boardNummer-1].height+15)+40){
				if(boards[boardNumber-1].isReady == false){
					boards[boardNumber-1].isReady = true;
					socket.emit('lobby', {id: lobbyNumber, user: boardNumber, type:"userIsReady"});
				}else{
					boards[boardNumber-1].isReady = false
					socket.emit('lobby', {id: lobbyNumber, user: boardNumber, type:"userIsNotReady"});
				}
		}
	}, false);
}

window.onload =function(){
	if(lobbyId){
	lobbyNumber = lobbyId;
	}
	else{
		lobbyNumber = 0;
	}
	drawPicture('../images/background2.png', 0, 0);

	console.log("Innan gamesetup")
	socket.emit('lobby', {type: "gameSetup"});
	console.log('skickat gameSetup');
}
window.onbeforeunload = function(){
	socket.emit('lobby', {id:lobbyNumber, user:boardNumber, type:"userLeavedLobby"});
}

window.onkeydown = function(e){
	if(canMove && boards[boardNumber-1].isActive){
		canMove = false;
		gameCore.moveBlocksExport(e.keyCode, boards[boardNumber-1]);
		updateCanvasBoard(boards[boardNumber-1]);
		socket.emit('game', {move: e.keyCode, id:lobbyNumber, user:boardNumber, type:"move", board: boards[boardNumber-1]});

		intervalMove = setInterval(function(){
			gameCore.moveBlocksExport(e.keyCode, boards[boardNumber-1]);
			updateCanvasBoard(boards[boardNumber-1]);
			socket.emit('game', {move: e.keyCode, id:lobbyNumber, user:boardNumber, type:"move", board: boards[boardNumber-1]});
		}, 100);
	}
}

window.onkeyup = function(e){
	clearInterval(intervalMove);
	canMove = true;
}

//----- Socket Communication -----//
socket.on('userLeavedLobby', function(){


});

socket.on('gameSetupR', function(data){
		console.log("received gamesetupR");
		/*
		boardName = data.username;

		gameCore.addBoards(data, 0, boards, 1);
		drawReadyButton(data, 0);
		addButtonEvent(boardNumber);

	updateCanvas();
	*/
});

socket.on('gameSetupChange', function(data){
	alert('tog emot game setup');
	if(boardNumber == -1){
		boardNumber = (data.users);
		gameCore.addBoards(data, 0, boards);
		drawReadyButton(data, 0);
		addButtonEvent(boardNumber);
	}
	else{
		gameCore.addBoards(data, data.users-1, boards);
		drawReadyButton(data, data.users-1);
	}
	updateCanvas();
});

socket.on('userIsReady', function(data){
	var x = boards[data.user-1].x - 10;
	var y = boards[data.user-1].y + boards[data.user-1].height+15;
	drawPicture('../images/readyButton.png', x, y);
});

socket.on('userIsNotReady', function(data){
	var x = boards[data.user-1].x - 10;
	var y = boards[data.user-1].y + boards[data.user-1].height+15;
	drawPicture('../images/waitForReadyButton.png', x, y);
});

socket.on('startGame', function(data){
	boards = [];
	gameCore.addBoards(data, 0, boards);
	startGame(data.randomNumbers);
});

socket.on('move', function(data){
	if(data.user != boardNumber){
		boards[data.user-1] = data.board;
		updateCanvasBoard(boards[data.user-1]);
	}
});

socket.on('invalidBoard', function(data){
	if(data.user == boardNumber){
		boards[data.user-1] = data.board;
		updateCanvasBoard(boards[data.user-1]);
	}
});

socket.on('winner', function(data){
	clearInterval(interval);
	drawReadyButton({users: boards.length}, 0);
	var x = boards[data.winner-1].x - 10;
	var y = boards[data.winner-1].y - 45;
	drawPicture('../images/winnerButton.png', x, y);
	boards[data.winner-1].isActive = false;
});
