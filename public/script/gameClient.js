//----- Variables -----//
var socket = io();
var boardNumber = -1;
var newPlayer = true;
var canvas = document.getElementById("game");
var context = canvas.getContext("2d");
var boards = [];
var board = [];
var intervalMove;
var canMove = true;
var bgColor = 'gainsboro';
var boardName = "";
var blockSizePlayer = 13;
var playerPx = 24;
var playerBoardX = 80;
var playerBoardY = 125;
var nextBlockX = playerBoardX + blockSizePlayer*13;
var nextBlockY = playerBoardY + blockSizePlayer*3;
var fontRegular = "Lucida Sans Unicode";
var fontUsername = "Comic Sans MS";
var winnerTextColor = '#428a65'; //"#bbb0c3"
var loserTextColor = 'red'; //"#bbb0c3"
var staticTextColor = 'gainsboro'; //"#bbb0c3"
var readyButtonAdress = '../images/readyButton.png';
var notReadyButtonAdress = '../images/waitForReadyButton.png';
var joinButtonSize = [300, 98];
var joinButtonXY = [(450 - joinButtonSize[0]/2), 500];

//----- Draw Functions -----//
drawBlock = function(block, x, y, blockSize){
	var adress = '../images/big_blocks/block_'+block.color+'.jpg';
	drawPicture(adress, x, y, blockSize, blockSize);
}

drawUsername = function(username, x, y, px){
	context.font = px+"px "+fontUsername;
	context.fillStyle = staticTextColor;
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

drawJoinButton = function(){
	var adress = '../images/joinButton.png';
	var width = joinButtonSize[0];
	var height = joinButtonSize[1];
	var x = joinButtonXY[0];
	var y = joinButtonXY[1];
	drawPicture(adress, x, y, width, height);
}

getRankInfo = function(gameOvers, place){
	var amountOfPlayers = gameOvers.length + 1; //+ winner
	console.log("amountOfPlayers: "+amountOfPlayers);
	var rankInt = 0;
	var rankStr = "";
	var pointsInt = 0;
	var pointsStr = "";
	var pointsList = [];
	var color = "";
	var index = gameOvers.indexOf(place);

	if(index == -1){ // Not in there
		rankInt = 1;
	}else if(index >= 0){
		rankInt = amountOfPlayers - index;
	}else{
		return -1;
	}

	switch (amountOfPlayers) {
		case 2: pointsList = [1, -1]; break;
		case 3: pointsList = [1, 0, -1]; break;
		case 4: pointsList = [2, 1, -1, -2]; break;
		case 5: pointsList = [2, 1, 0, -1, -2]; break;
		case 6: pointsList = [3, 2, 1, -1, -2, -3]; break;
	}

	switch (rankInt) {
		case 1: rankStr = "1st"; break;
		case 2: rankStr = "2nd"; break;
		case 3: rankStr = "3rd"; break;
		default: rankStr = rankInt+"th"; break;
	}

	pointsInt = pointsList[rankInt-1];
	if(pointsInt > 0){
		pointsStr = "+"+pointsInt;
		color = winnerTextColor;
	}else if (pointsInt == 0){
		pointsStr = "+"+pointsInt;
		color = "gainsboro";
	}else{
		pointsStr = ""+pointsInt;
		color = loserTextColor;
	}

	return [rankStr, pointsStr, color];
}

drawWinnerAndRankchanges = function(playerPosition, boards, gameOvers, newPlayers, leavedLobby, withLefties){
	var newPlayerPosition = JSON.parse(JSON.stringify(playerPosition));


	if(withLefties == true){ //Those who have left the game
		for(var i = 0; i< leavedLobby.length; i++){
			if(leavedLobby[i] == true){
				newPlayerPosition[i] = 1;
			}
		}
	}

	var dataList = getDataForOpponents(newPlayerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var px = 0;
	var rankChange = "";
	var rankText = "";
	var rankColor = "";

	console.log("Playerposition: "+playerPosition);
	console.log("NewPlayerposition: "+newPlayerPosition);
	console.log("gameOvers: "+gameOvers);
	console.log("leavedLobby: "+leavedLobby);

	for(var i = 0; i< playerPosition.length; i++){
		if(newPlayerPosition[i] == 1){
			if(newPlayers[i] == false){
				if(board.place == i){
					x = playerBoardX;
					y = playerBoardY;
					blockSize = blockSizePlayer;
					px = playerPx;
				}
				else{
					x = dataList[0][0];
					y = dataList[0][1];
					blockSize = dataList[0][2]
					px = dataList[0][3];
					dataList.splice(0,1);
				}

				var rankInfo = getRankInfo(gameOvers, i);
				if(rankInfo != -1){
					rankText = rankInfo[0];
					rankChange = rankInfo[1];
					rankColor = rankInfo[2];

					context.font = (px-6)+"px "+fontRegular;
					context.fillStyle = rankColor;
					context.fillText(rankText+" Place, "+rankChange+" rank", x, y-blockSize*5);
				}
			}else{
				dataList.splice(0,1);
			}
		}
	}
}

drawWinnerAndRankchangesWatcher = function(playerPosition, boards, gameOvers, newPlayers, leavedLobby, withLefties){
	console.log("Is this ever run?");

	var newPlayerPosition = JSON.parse(JSON.stringify(playerPosition));

	if(withLefties == true){ //Those who have left the game
		for(var i = 0; i< leavedLobby.length; i++){
			if(leavedLobby[i] == true){
				newPlayerPosition[i] = 1;
			}
		}
	}

	dataList = getDataForAllWatcher(newPlayerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var px = 0;
	var rankChange = "";
	var rankText = "";
	var rankColor = "";

	for(var i = 0; i< playerPosition.length; i++){
		if(newPlayerPosition[i] == 1){
			if(newPlayers[i] == false){
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				px = dataList[0][3];
				dataList.splice(0,1);
				var rankInfo = getRankInfo(gameOvers, i);
				rankText = rankInfo[0];
				rankChange = rankInfo[1];
				rankColor = rankInfo[2];

				context.font = (px-10)+"px "+fontRegular;
				context.fillStyle = rankColor;
				context.fillText(rankText+" Place, "+rankChange+" rank", x, y-blockSize*5);
			}
		}
	}
}

drawNextBlock = function(){
	clearNextBlockBox();
	var x = 0;
	var y = 0;
	for(var i = 0; i< board.nextBlocks.length; i++){
		var block = board.nextBlocks[i];
		x = nextBlockX+(block.x-3)*blockSizePlayer + 1;
		y = nextBlockY+block.y*blockSizePlayer + 1 + blockSizePlayer;
		drawBlock(block, x, y, blockSizePlayer);
	}
}

drawNextBlockBox = function(){
	var x = nextBlockX;
	var y = nextBlockY;
	context.fillStyle = 'black';
	context.strokeRect(x, y, blockSizePlayer*4+2, blockSizePlayer*4+2);
	context.fillStyle = board.bgColor;
	context.fillRect(x+1, y+1, blockSizePlayer*4, blockSizePlayer*4);
}

clearNextBlockBox = function(){
	context.clearRect(nextBlockX, nextBlockY, blockSizePlayer*4+2, blockSizePlayer*5+2);
}

drawNextBlockText = function(){
	var x = nextBlockX - blockSizePlayer;
	var y = nextBlockY - blockSizePlayer;
	context.font = (playerPx-2)+"px "+fontRegular;
	context.fillStyle = staticTextColor;
	context.fillText("Next Block", x, y);
}

drawAttacksText = function(){
	var x = nextBlockX - blockSizePlayer;
	var y = nextBlockY + blockSizePlayer*8;
	context.font = (playerPx-2)+"px "+fontRegular;
	context.fillStyle = staticTextColor;
	context.fillText("Attacks", x, y);
}

drawPlayerLeavedText = function(place, playerPos){
	var data = getDataForOpponent(place, playerPos);
	var blockSize = data[2];
	var x = data[0];
	var y = data[1] + blockSize*22;
	var px = data[3]-4;
	context.font = px+"px "+fontRegular;
	context.fillStyle = staticTextColor;
	context.fillText("Player Left Lobby", x, y);
}

drawPlayerLeavedTextWatcher = function(place, playerPos){
	var data = getDataForOneWatcher(place, playerPos);
	var blockSize = data[2];
	var x = data[0];
	var y = data[1] + blockSize*22;
	var px = data[3]-4;
	context.font = px+"px "+fontRegular;
	context.fillStyle = staticTextColor;
	context.fillText("Player Left Lobby", x, y);
}

drawGameOverText = function(place, playerPos){
	var blockSize = 0;
	var x = 0;
	var y = 0;
	var px = 0;
	var data;

	if(board.place == place){
		blockSize = blockSizePlayer;
		x = playerBoardX;
		y = playerBoardY + blockSize*22;
		px = playerPx;
	}
	else{
		data = getDataForOpponent(place, playerPos);
		blockSize = data[2];
		x = data[0];
		y = data[1] + blockSize*22;
		px = data[3]-4;
	}

	context.font = px+"px "+fontRegular;
	context.fillStyle = 'red';
	context.fillText("Game Over", x, y);
}

drawGameOverTextWatcher = function(place, playerPos){
	var data = getDataForOneWatcher(place, playerPos);
	var blockSize = data[2];
	var x = data[0];
	var y = data[1] + blockSize*22;
	var px = data[3]-4;
	context.font = px+"px "+fontRegular;
	context.fillStyle = 'red';
	context.fillText("Game Over", x, y);
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

drawBlackBoard = function(x, y, blockSize){
		context.fillStyle = 'black';
		context.strokeRect(x-1, y-1, blockSize*10+2, blockSize*20+2);
		context.fillStyle = bgColor;
		context.fillRect(x, y, blockSize*10, blockSize*20);
}

drawBoardAndButton = function(isReady, username, x, y, blockSize, px, drawButton){
	drawBlackBoard(x, y, blockSize);
	drawUsername(username, x, y - blockSize*1.5, px);

	if(drawButton == true){
		var buttonAdress = "";
		if(isReady == true){
			buttonAdress = readyButtonAdress;
		}else{
			buttonAdress = notReadyButtonAdress;
		}
		drawPicture(buttonAdress, x, y+blockSize*21, blockSize*10, blockSize*4);
	}
}

drawBoardsAndButtons = function(isReadys, usernames, playerPosition, leavedLobby){
	var dataList = getDataForOpponents(playerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var px = 0;
	var drawButton = true;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1){
			console.log("my place is:"+board.place);
			if(board.place == i){
				console.log("My place! ("+i+")");
				x = playerBoardX;
				y = playerBoardY;
				blockSize = blockSizePlayer;
				px = playerPx;
				drawButton = true;
			}else{
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				px = dataList[0][3];
				dataList.splice(0, 1);
			}

			drawBoardAndButton(isReadys[i], usernames[i], x, y, blockSize, px, drawButton);
		}
	}
}

drawBoardsAndUsernames = function(usernames, playerPosition){
	var dataList = getDataForOpponents(playerPosition);
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
				px = playerPx;
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

drawUsernames = function(playerPosition, usernames){
	dataList = getDataForAllWatcher(playerPosition);
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
				px = playerPx;
			}else{
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				px = dataList[0][3];
				dataList.splice(0,1);
			}
			drawUsername(usernames[i], x, y - blockSize*1.5, px);
		}
	}
}

removeButtons = function(playerPosition){
	var dataList = getDataForOpponents(playerPosition);
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

drawButtons = function(playerPosition, leavedLobby){
	var dataList = getDataForOpponents(playerPosition);
	var x = 0;
	var y = 0;
	var blockSize = 0;

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1 && leavedLobby[i] == false){
			if(board.place == i){
				x = playerBoardX;
				y = playerBoardY;
				blockSize = blockSizePlayer;
			}else if(leavedLobby == false){
				x = dataList[0][0];
				y = dataList[0][1];
				blockSize = dataList[0][2]
				dataList.splice(0,1);
			}else{
				dataList.splice(0,1);
			}
			drawPicture(notReadyButtonAdress, x, y+blockSize*21, blockSize*10, blockSize*4);
		}
	}
}

updateCanvasBoard = function(board, boardX, boardY, blockSize){
	drawBlackBoard(boardX, boardY, blockSize);
	for(var i = 0; i< board.allBlocks.length; i++){
		var block = board.allBlocks[i];
		drawBlock(block, boardX+block.x*blockSize, boardY+block.y*blockSize, blockSize);
	}
	for(var i = 0; i< board.currentBlocks.length; i++){
		var block = board.currentBlocks[i];
		drawBlock(block, boardX+block.x*blockSize, boardY+block.y*blockSize, blockSize);
	}
}

//Used when the server sends all boards
updateCanvasBoards = function(boards, playerPosition, includeSelf){
	console.log("Boards:");
	console.log(boards);
	for(var i = 0; i < boards.length; i++){
		if(boards[i].place == board.place){
			if(includeSelf == true){
				updateCanvasBoard(boards[i], playerBoardX, playerBoardY, blockSizePlayer);
			}
		}else{
			var data = getDataForOpponent(boards[i].place, playerPosition);
			var x = data[0];
			var y = data[1];
			var blockSize = data[2];
			updateCanvasBoard(boards[i], x, y, blockSize);
		}
	}
}

updateCanvasBoardsWatcher = function(boards, playerPosition){
	var dataList = getDataForAllWatcher(playerPosition);
	for(var i = 0; i < boards.length; i++){
		var x = dataList[0][0];
		var y = dataList[0][1];
		var blockSize = dataList[0][2];
		updateCanvasBoard(boards[i], x, y, blockSize);
		dataList.splice(0,1);
	}
}


//----- Game -----//
update = function(){
	if(board.isActive == true){
		var newTetro = gameCore.updateBoard(board);
		updateCanvasBoard(board, playerBoardX, playerBoardY, blockSizePlayer);
		if(newTetro == true){
			drawNextBlock();
		}
	}
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

	if(amountOfPlayers == 2){ // if there are 2 opponents
		blockSize = blockSizePlayer;
		px = playerPx;
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

getDataForOneWatcher = function(place, playerPosition){
	dataList = getDataForAllWatcher(playerPosition);
	return dataList[place];
}

getDataForAllWatcher = function(playerPosition){
	var dataList = new Array();
	var amountOfPlayers = 0;
	var x = 0;
	var y = 0;
	var blockSize = 0;
	var pix = 0;
	var opponent = 0;
	var startX = playerBoardX;
	var distanceBetweenOpponents = 0;

	for(var i = 0; i < playerPosition.length; i++){
		if(playerPosition[i] == 1){
			amountOfPlayers += 1;
		}
	}
		console.log("amountOfPlayers: "+amountOfPlayers);

	blockSize = blockSizePlayer + 2 - amountOfPlayers;
	px = playerPx + 2 - amountOfPlayers;
	distanceBetweenOpponents = (canvas.width - playerBoardX*2 - amountOfPlayers*(blockSize*10))/(amountOfPlayers-1);

	for(var i = 0; i< playerPosition.length; i++){
		if(playerPosition[i] == 1){
			x = startX+opponent*(blockSize*10 + distanceBetweenOpponents);
			y = playerBoardY + (blockSizePlayer*20-blockSize*20)/2;
			dataList.push([x, y, blockSize, px]);
			opponent += 1;
		}
	}
	return dataList;
}

resetCanvasBeforeGame = function(isReadys, usernames, playerPosition, boards, gameOvers, leavedLobby, newPlayers){
	context.clearRect(0, 0, 900, 500);
	drawBoardsAndButtons(isReadys, usernames, playerPosition, leavedLobby);
	drawNextBlockText();
	drawAttacksText();
	if(newPlayer == false){
		updateCanvasBoards(boards, playerPosition, true);
		drawWinnerAndRankchanges(playerPosition, boards, gameOvers, newPlayers, leavedLobby, false);
	}
}

resetCanvasInGame = function(usernames, playerPosition){
	context.clearRect(0, 0, 900, 500);
	drawBoardsAndUsernames(usernames, playerPosition);
	drawNextBlockText();
	drawNextBlock();
	drawAttacksText();
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

createJoinListenerEvent = function(){
	var canvas = document.getElementById("game");
	canvas.addEventListener("click", function(event){
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		if(x > joinButtonXY[0] && x < (joinButtonXY[0] + joinButtonSize[0]) &&
			 y > joinButtonXY[1] && y < (joinButtonXY[1]+joinButtonSize[1])){

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
	if (board == undefined || board == []){
		return;
	}
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
	//clearInterval(intervalMove);
	canMove = true;
}


//----- Socket Communication -----//
socket.on('gameSetupR', function(data){
	boardName = data.username;
	gameCore.addBoard(data, boards);
	board = boards[0];
	drawBoardsAndButtons(data.isReadys, data.usernames, data.playerPosition, data.leavedLobby);
	drawNextBlockText();
	drawAttacksText();
	addButtonEvent();

	document.getElementById("lobbyname_text").innerHTML = data.lobbyname;
	document.getElementById("maxplayers_text").innerHTML = "Maxplayers: "+data.maxplayers.toString();
});

socket.on('joinGame', function(data){
	console.log(data);
	boardName = data.username;
	//gameCore.addBoard(data, boards);
	board = data.boards[data.boards.length-1];
	console.log(board);
	addButtonEvent();
});

socket.on('watch', function(data){
	drawUsernames(data.playerPosition, data.usernames);
	updateCanvasBoardsWatcher(data.boards, data.playerPosition);
	document.getElementById("lobbyname_text").innerHTML = data.lobbyname;
	document.getElementById("maxplayers_text").innerHTML = "Maxplayers: "+data.maxplayers.toString();
});

socket.on('newPlayer', function(data){
	console.log("New player");
	resetCanvasBeforeGame(data.isReadys, data.usernames, data.playerPosition, data.boards, data.gameOvers, data.leavedLobby, data.newPlayers);
});

socket.on('userIsReady', function(data){
	drawButton(data.place, readyButtonAdress, data.playerPosition);
});

socket.on('userIsNotReady', function(data){
	drawButton(data.place, notReadyButtonAdress, data.playerPosition);
});

socket.on('userLeavedLobby', function(data){
	if(data.active == false){
		resetCanvasBeforeGame(data.isReadys, data.usernames, data.playerPosition, data.boards, data.gameOvers, data.leavedLobby, data.newPlayers);
	}else {
		drawPlayerLeavedText(data.place, data.playerPosition);
	}
});

socket.on('watcherUserLeavedLobby', function(data){
	drawPlayerLeavedTextWatcher(data.place, data.playerPosition);
});

socket.on('startGame', function(data){
	board.allBlocks = [];
	board.currentBlocks = [];
	board.nextBlocks = [];
	board.randomNumbers = data.randomNumbers;
	board.randomNumbersCounter = 0;
	board.playerPosition = data.playerPosition;
	board.time = 0;
	newPlayer = false;
	gameCore.startGameBoard(board);
});

socket.on('getStartBoards', function(data){
	resetCanvasInGame(data.usernames, data.playerPosition);
	updateCanvasBoards(data.boards, data.playerPosition, true);
});

socket.on('update', function(data){
	update();
	updateCanvasBoards(data.boards, data.playerPosition, false);
});

socket.on('watcherUpdate', function(data){
	updateCanvasBoardsWatcher(data.boards, data.playerPosition);
});

socket.on('move', function(data){
	var dataPos = getDataForOpponent(data.place, data.playerPosition);
	var x = dataPos[0];
	var y = dataPos[1];
	var blockSize = dataPos[2];
	updateCanvasBoard(data.board, x, y, blockSize);
});

socket.on('watcherMove', function(data){
	var dataPos = getDataForOneWatcher(data.place, data.playerPosition);
	var x = dataPos[0];
	var y = dataPos[1];
	var blockSize = dataPos[2];
	updateCanvasBoard(data.board, x, y, blockSize);
});

socket.on('invalidBoard', function(data){
	console.log("Invalid move");
	board = data.board;
	updateCanvasBoard(board, playerBoardX, playerBoardY, blockSizePlayer);
});

socket.on('gameOver', function(data){
	console.log("Game Over for "+data.place);
	drawGameOverText(data.place, data.playerPosition);
});

socket.on('gameOverWatchers', function(data){
	drawGameOverTextWatcher(data.place, data.playerPosition);
});

socket.on('winner', function(data){
	drawButtons(data.playerPosition, data.leavedLobby);
	drawWinnerAndRankchanges(data.playerPosition, data.boards, data.gameOvers, data.newPlayers, data.leavedLobby, true);
	board.isActive = false;
	board.isReady = false;
});

socket.on('watcherWinner', function(data){
	drawJoinButton();
	createJoinListenerEvent();
	drawWinnerAndRankchangesWatcher(data.playerPosition, data.boards, data.gameOvers, data.newPlayers, data.leavedLobby, true);
});
