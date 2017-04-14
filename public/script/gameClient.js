//----- Variables -----//
var socket = io();
var boardNumber = -1;
var speed = 1000; // speed in milliseconds
var context = document.getElementById("game").getContext("2d");
var boards = [];
var board = [];
var intervalMove;
var canMove = true;
var boardName = "";
var blockSizePlayer = 0;
var blockSizeOpponent = 0;
var distanceToOpponent = 0;
var playerBoardX = 0;
var playerBoardY = 0;
var opponentBoardY = 0;
var distanceBetweenOpponents = 0;
var readyButtonAdress = '../images/readyButton.png';
var notReadyButtonAdress = '../images/waitForReadyButton.png';

//----- Draw Functions -----//
drawBlock = function(block, x, y, blockSize){
	var adress = '../images/small_blocks/block_'+block.color+'.jpg';
	drawPicture(adress, x, y, blockSize, blockSize);
}

drawUsername = function(username, x, y, px){
	context.font = px+"px Comic Sans MS";
	context.fillStyle = "#bbb0c3";
	context.fillText(username, x, y);
}

drawPicture = function(adress, x, y, width, height){
	var picture = new Image();
	picture.src = adress;
	if(picture.complete){
		context.drawImage(picture, x, y, width, height);
	}
	else{
		picture.onload = function(){
			context.drawImage(picture, x, y, width, height);
		}
	}
}

drawButton = function(place, buttonAdress, playerPosition){
	if (place == board.place) {
		var x = playerBoardX;
		var y = playerBoardY;
		var blockSize = blockSizePlayer;
		drawPicture(buttonAdress, x, y+blockSize*21, blockSize*10, blockSize*4);
	}else{
		data = getDataForOpponent(place, playerPosition);
		var x = data[0];
		var y = data[1];
		var blockSize = data[2];
		drawPicture(buttonAdress, x, y+blockSize*21, blockSize*10, blockSize*4);
	}
}

drawWinnerButton = function(place, buttonAdress, playerPosition){
	if (place == board.place) {
		var x = playerBoardX;
		var y = playerBoardY;
		var blockSize = blockSizePlayer;
		drawPicture(buttonAdress, x, y - blockSize*7 - blockSize, blockSize*10, blockSize*4);
	}else{
		data = getDataForOpponent(place, playerPosition);
		var x = data[0];
		var y = data[1];
		var blockSize = data[2];
		drawPicture(buttonAdress, x, y - blockSize*8, blockSize*10, blockSize*4);
	}
}

drawBlackBoard = function(x, y, blockSize){
		context.fillStyle = 'black';
		context.strokeRect(x-1, y-1, blockSize*10+2, blockSize*20+2);
		context.fillStyle = board.bgColor;
		context.fillRect(x, y, blockSize*10, blockSize*20);
}

drawBoardAndButton = function(isReady, username, x, y, blockSize, px){
	drawBlackBoard(x, y, blockSize);
	drawUsername(username, x, y - blockSize*1.5, px);

	var buttonAdress = "";
	if(isReady == true){
		buttonAdress = readyButtonAdress;
	}else{
		buttonAdress = notReadyButtonAdress;
	}
	drawPicture(buttonAdress, x, y+blockSize*21, blockSize*10, blockSize*4);
}

drawBoardsAndButtons = function(isReadys, usernames, playerPosition){
	dataList = getDataForOpponents(playerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var px = 0;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1){
			if(board.place == i){
				x = playerBoardX;
				y = playerBoardY;
				blockSize = blockSizePlayer;
				px = 20;
			}else{
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				px = dataList[0][3];
				dataList.splice(0,1);
			}

			drawBoardAndButton(isReadys[i], usernames[i], x, y, blockSize, px);
		}
	}
}

drawBoardsAndUsernames = function(usernames, playerPosition){
	dataList = getDataForOpponents(playerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var px = 0;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1){
			if(board.place == i){
				x = playerBoardX;
				y = playerBoardY;
				blockSize = blockSizePlayer;
				px = 20;
			}else{
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				px = dataList[0][3];
				dataList.splice(0,1);
			}

			drawBlackBoard(x, y, blockSize);
			drawUsername(usernames[i], x, y - blockSize*1.5, px);
		}
	}
}

removeButtons = function(playerPosition){
	dataList = getDataForOpponents(playerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1){
			if(board.place == i){
				x = playerBoardX;
				y = playerBoardY;
				blockSize = blockSizePlayer;
			}else{
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				dataList.splice(0,1);
			}
			context.clearRect(x, y+blockSize*21, blockSize*10, blockSize*4);
		}
	}
}

drawButtons = function(playerPosition){
	dataList = getDataForOpponents(playerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1){
			if(board.place == i){
				x = playerBoardX;
				y = playerBoardY;
				blockSize = blockSizePlayer;
			}else{
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				dataList.splice(0,1);
			}
			drawPicture(notReadyButtonAdress, x, y+blockSize*21, blockSize*10, blockSize*4);
		}
	}
}

addPlayer = function(username, place, playerPosition){
	data = getDataForOpponent(place, playerPosition);
	var x = data[0];
	var y = data[1];
	var blockSize = data[2];
	var px = data[3];
	drawBoardAndButton(0, username, x, y, blockSize, px);
}

updateCanvasBoard = function(board, boardX, boardY, blockSize){
	drawBlackBoard(boardX, boardY, blockSize);
	for(var i = 0; i< board.currentBlocks.length; i++){
		var block = board.currentBlocks[i];
		drawBlock(block, boardX+block.x*blockSize, boardY+block.y*blockSize, blockSize);
	}
	for(var i = 0; i< board.allBlocks.length; i++){
		var block = board.allBlocks[i];
		drawBlock(block, boardX+block.x*blockSize, boardY+block.y*blockSize, blockSize);
	}
}

//Used when the server sends all boards
updateCanvasBoards = function(boards, playerPosition){
	var dataList = getDataForOpponents(playerPosition);
	for(var i = 0; i < boards.length; i++){
		if(boards[i].place == board.place){
			updateCanvasBoard(boards[i], playerBoardX, playerBoardY, blockSizePlayer);
		}else{
			var x = dataList[0][0];
			var y = dataList[0][1];
			var blockSize = dataList[0][2];
			updateCanvasBoard(boards[i], x, y, blockSize);
			dataList.splice(0,1);
		}
	}
}


//----- Game -----//
update = function(){
	if(board.isActive == true){
		gameCore.updateBoard(board);
	}
	updateCanvasBoard(board, playerBoardX, playerBoardY, blockSizePlayer);
}

startGame = function(){
	gameCore.startGameBoard(board);
	interval = setInterval(update, speed);
}


getDataForOpponent = function(place, playerPosition){
	var opponent = place;
	if(board.place < opponent){
		opponent -= 1;
	}
	dataList = getDataForOpponents(playerPosition);
	return dataList[opponent];
}

getDataForOpponents = function(playerPosition){
	var dataList = new Array();
	var amountOfPlayers = 0;
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var pix = 0;
	var opponent = 0;
	var startX = 0;
	var distanceBetweenOpponents = 0;

	for(var i = 0; i < playerPosition.length; i++){
		if(playerPosition[i] == 1){
			amountOfPlayers += 1;
		}
	}

	if(amountOfPlayers == 2){ // if there are 2 opponents, not implemented
		blockSize = blockSizePlayer;
		px = 20;
	}
	else if(amountOfPlayers == 3){ //if there are 3 opponents
		blockSize = 11;
		distanceBetweenOpponents = 75;
		px = 18;
	}
	else if(amountOfPlayers == 4){ //if there are 3 opponents
		blockSize = 10;
		distanceBetweenOpponents = 68;
		px = 17;
	}
	else if(amountOfPlayers == 5){ //if there are 3 opponents
		blockSize = 8;
		distanceBetweenOpponents = 40;
		px = 16;
	}
	else if(amountOfPlayers == 6){ //if there are 3 opponents
		blockSize = 7;
		distanceBetweenOpponents = 25;
		px = 15;
	}

	startX = 900 - (amountOfPlayers-1)*blockSize*10 - distanceBetweenOpponents*(amountOfPlayers-2) - playerBoardX;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1 && i != board.place){
			x = startX+opponent*(blockSize*10 + distanceBetweenOpponents);
			y = playerBoardY + (blockSizePlayer*20-blockSize*20)/2;
			dataList.push([x, y, blockSize, px]);
			opponent += 1;
		}
	}
	return dataList;
}

//----- Events -----//
addButtonEvent = function(){
	var canvas = document.getElementById("game");
	canvas.addEventListener("click", function(event){
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		if(x > playerBoardX &&
			x < playerBoardX + board.width*blockSizePlayer &&
			y > playerBoardY + board.height*blockSizePlayer+blockSizePlayer &&
			y < (playerBoardY+board.height*blockSizePlayer+blockSizePlayer)+blockSizePlayer*4){
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
	socket.emit('lobby', {type:"userLeavedLobby"});
}

window.onkeydown = function(e){
	if(canMove && board.isActive){
		canMove = false;
		gameCore.moveBlocksExport(e.keyCode, board);
		updateCanvasBoard(board, playerBoardX, playerBoardY, blockSizePlayer);
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
socket.on('gameSetupR', function(data){
	boardName = data.username;
	boardNumber = data.place;
	blockSizePlayer = data.blockSizePlayer;
	blockSizeOpponent = data.blockSizeOpponent;
	playerBoardX = data.playerBoardX;
	playerBoardY = data.playerBoardY;
	opponentBoardY = data.opponentBoardY;
	distanceToOpponent = data.distanceToOpponent;
	distanceBetweenOpponents = data.distanceBetweenOpponents;
	gameCore.addBoard(data, boards);
	board = boards[0];
	drawBoardsAndButtons(data.isReadys, data.usernames, data.playerPosition);
	addButtonEvent();

	document.getElementById("lobbyname_text").innerHTML = data.lobbyname;
	document.getElementById("maxplayers_text").innerHTML = "Maxplayers: "+data.maxplayers.toString();
});

socket.on('newPlayer', function(data){
	context.clearRect(0, 0, 900, 500);
	drawBoardsAndButtons(data.isReadys, data.usernames, data.playerPosition);
});

socket.on('userIsReady', function(data){
	drawButton(data.place, readyButtonAdress, data.playerPosition);
});

socket.on('userIsNotReady', function(data){
	drawButton(data.place, notReadyButtonAdress, data.playerPosition);
});

socket.on('userLeavedLobby', function(data){
	context.clearRect(0, 0, 800, 800);
	if(data.active == false){
		drawBoardsAndButtons(data);
	}
});

socket.on('startGame', function(data){
	board.allBlocks = [];
	board.currentBlocks = [];
	board.randomNumbers = data.randomNumbers;
	board.randomNumbersCounter = 0;
	board.playerPosition = data.playerPosition;
	board.time = 0;

	context.clearRect(0, 0, 900, 500);
	drawBoardsAndUsernames(data.usernames, data.playerPosition);
	gameCore.startGameBoard(board);
});

socket.on('getStartBoards', function(data){
	updateCanvasBoards(data.boards, data.playerPosition);
});

socket.on('update', function(data){
	update();
	updateCanvasBoards(data.boards, data.playerPosition);
});

socket.on('move', function(data){
	var dataPos = getDataForOpponent(data.place, data.playerPosition);
	var x = dataPos[0];
	var y = dataPos[1];
	var blockSize = dataPos[2];
	updateCanvasBoard(data.board, x, y, blockSize);
});

socket.on('invalidBoard', function(data){
	board = data.board;
	updateCanvasBoard(board, playerBoardX, playerBoardY, blockSizePlayer);
});

socket.on('winner', function(data){
	drawButtons(data.playerPosition);
	drawWinnerButton(data.winnerPlace, '../images/winnerButton.png', data.playerPosition);
	board.isActive = false;
	board.isReady = false;
});
