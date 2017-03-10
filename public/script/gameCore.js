//----- Public Functions -----//
(function(exports){

	exports.startGame = function(boards){
		for(var i = 0; i < boards.length; i++){//need testing
			createTetromino(boards[i].currentBlocks, "current", boards[i]);
			boards[i].isActive = true;
		}
	};

	exports.addBoards = function(data, start, list){
		for(i = start; i < data.users; i++){
			Board((150*(i+1)-100),100, 'black', blockSizePlayer*20, blockSizePlayer*10, blockSizePlayer, data.username, data.randomNumbers, list);
		}
	};

	exports.moveBlocksExport = function(keycode, board){
		moveBlocks(keycode, board);
	}

	exports.updateAllBoards = function(boards){
		var gameOvers = 0;
		for(var i = 0; i < boards.length; i++){
			if(boards[i].isActive == true){
				if(updateBoard(boards[i]) == true){
					boards[i].isActive = false;
					gameOvers++;
				}
			}
		}
		return gameOvers;
	}

}(typeof exports === 'undefined'? this.gameCore = {}: exports));


//----- Variables -----//
var blockSizePlayer = 10;
var blockSizeOpponant = 10;
var lobbyNumber;

//---------- Block Things ----------//
//----- FUNCTIONS -----//
Block = function(x, y, color, blockSize, list){
	var block = {
		x:x,
		y:y,
		color:color,
		size:blockSize,
	};
	list[list.length] = block;
}

createIPiece = function(list, typeOf, board){
	Block(board.x + board.width/2, board.y , 'aqua', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'aqua', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize*2, 'aqua', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize*3, 'aqua', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 'i';
	}else{
		nextBlockType = 'i';
	}
}

changeI = function(form, board){
	if((form % 2) == 1){
		board.currentBlocks[0].x -= board.blockSize*2;
		board.currentBlocks[0].y += board.blockSize*2;
		board.currentBlocks[1].x -= board.blockSize;
		board.currentBlocks[1].y += board.blockSize;
		board.currentBlocks[3].x += board.blockSize;
		board.currentBlocks[3].y -= board.blockSize;

	}else{
		board.currentBlocks[0].x += board.blockSize*2;
		board.currentBlocks[0].y -= board.blockSize*2;
		board.currentBlocks[1].x += board.blockSize;
		board.currentBlocks[1].y -= board.blockSize;
		board.currentBlocks[3].x -= board.blockSize;
		board.currentBlocks[3].y += board.blockSize;
	}
}

createOPiece = function(list, typeOf, board){
	Block(board.x + board.width/2, board.y, 'yellow', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'yellow', board.blockSize, list);
	Block(board.x + board.width/2 + board.blockSize, board.y, 'yellow', board.blockSize, list);
	Block(board.x + board.width/2 + board.blockSize, board.y + board.blockSize, 'yellow', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 'o';
	}else{
		nextBlockType = 'o';
	}
}

createTPiece = function(list, typeOf, board){
	Block(board.x + board.width/2, board.y, 'purple', board.blockSize, list);
	Block(board.x + board.width/2 - board.blockSize, board.y + board.blockSize, 'purple', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'purple', board.blockSize, list);
	Block(board.x + board.width/2 + board.blockSize, board.y + board.blockSize, 'purple', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 't';
	}else{
		nextBlockType = 't';
	}
}

changeT= function(form, board){
	if((form % 4) == 1){
		board.currentBlocks[0].x += board.blockSize;
		board.currentBlocks[0].y += board.blockSize;
		board.currentBlocks[1].x += board.blockSize;
		board.currentBlocks[1].y -= board.blockSize;
		board.currentBlocks[3].x -= board.blockSize;
		board.currentBlocks[3].y += board.blockSize;
	}
	else if((form % 4) == 2){
		board.currentBlocks[0].x -= board.blockSize;
		board.currentBlocks[0].y += board.blockSize;
		board.currentBlocks[1].x += board.blockSize;
		board.currentBlocks[1].y += board.blockSize;
		board.currentBlocks[3].x -= board.blockSize;
		board.currentBlocks[3].y -= board.blockSize;
	}
	else if((form % 4) == 3){
		board.currentBlocks[0].x -= board.blockSize;
		board.currentBlocks[0].y -= board.blockSize;
		board.currentBlocks[1].x -= board.blockSize;
		board.currentBlocks[1].y += board.blockSize;
		board.currentBlocks[3].x += board.blockSize;
		board.currentBlocks[3].y -= board.blockSize;
	}else{
		board.currentBlocks[0].x += board.blockSize;
		board.currentBlocks[0].y -= board.blockSize;
		board.currentBlocks[1].x -= board.blockSize;
		board.currentBlocks[1].y -= board.blockSize;
		board.currentBlocks[3].x += board.blockSize;
		board.currentBlocks[3].y += board.blockSize;
	}
}

createSPiece = function(list, typeOf, board){
	Block(board.x + board.width/2, board.y, 'lime', board.blockSize, list);
	Block(board.x + board.width/2 + board.blockSize, board.y, 'lime', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'lime', board.blockSize, list);
	Block(board.x + board.width/2- board.blockSize, board.y + board.blockSize, 'lime', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 's';
	}else{
		nextBlockType = 's';
	}
}

changeS = function(form, board){
	//var board = board[0];
	if((form % 2) == 1){
		board.currentBlocks[1].x -= board.blockSize*2; //TODO: Add board.blockSize
		board.currentBlocks[3].y -= board.blockSize*2;
	}
	else{
		board.currentBlocks[1].x += board.blockSize*2;
		board.currentBlocks[3].y += board.blockSize*2;
	}
}

createZPiece = function(list, typeOf, board){
	Block(board.x + board.width/2, board.y, 'red', board.blockSize, list);
	Block(board.x + board.width/2 - board.blockSize, board.y, 'red', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'red', board.blockSize, list);
	Block(board.x + board.width/2 + board.blockSize, board.y + board.blockSize, 'red', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 'z';
	}else{
		nextBlockType = 'z';
	}
}

changeZ = function(form, board){
	if((form % 2) == 1){
		board.currentBlocks[1].x += board.blockSize*2;
		board.currentBlocks[3].y -= board.blockSize*2;
	}else{
		board.currentBlocks[1].x -= board.blockSize*2;
		board.currentBlocks[3].y += board.blockSize*2;
	}
}

createJPiece = function(list, typeOf, board){
	Block(board.x + board.width/2, board.y, 'orange', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'orange', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize*2, 'orange', board.blockSize, list);
	Block(board.x + board.width/2 + board.blockSize, board.y + board.blockSize*2, 'orange', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 'j';
	}else{
		nextBlockType = 'j';
	}
}

changeJ = function(form, board){
	if((form % 4) == 1){
		board.currentBlocks[0].x += board.blockSize;
		board.currentBlocks[0].y += board.blockSize;
		board.currentBlocks[2].x -= board.blockSize;
		board.currentBlocks[2].y -= board.blockSize;
		board.currentBlocks[3].x -= board.blockSize*2;

	}
	else if((form % 4) == 2){
		board.currentBlocks[0].x -= board.blockSize;
		board.currentBlocks[0].y += board.blockSize;
		board.currentBlocks[2].x += board.blockSize;
		board.currentBlocks[2].y -= board.blockSize;
		board.currentBlocks[3].y -= board.blockSize*2;
	}
	else if((form % 4) == 3){
		board.currentBlocks[0].x -= board.blockSize;
		board.currentBlocks[0].y -= board.blockSize;
		board.currentBlocks[2].x += board.blockSize;
		board.currentBlocks[2].y += board.blockSize;
		board.currentBlocks[3].x += board.blockSize*2;
	}else{
		board.currentBlocks[0].x += board.blockSize;
		board.currentBlocks[0].y -= board.blockSize;
		board.currentBlocks[2].x -= board.blockSize;
		board.currentBlocks[2].y += board.blockSize;
		board.currentBlocks[3].y += board.blockSize*2;
	}
}

createLPiece = function(list, typeOf, board){
	Block(board.x + board.width/2 , board.y, 'blue', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize, 'blue', board.blockSize, list);
	Block(board.x + board.width/2, board.y + board.blockSize*2, 'blue', board.blockSize, list);
	Block(board.x + board.width/2 - board.blockSize, board.y + board.blockSize*2, 'blue', board.blockSize, list);
	if(typeOf == "current"){
		board.currentBlockType = 'l';
	}else{
		nextBlockType = 'l';
	}
}

changeL= function(form, board){
	if((form % 4) == 1){
		board.currentBlocks[0].x += board.blockSize;
		board.currentBlocks[0].y += board.blockSize;
		board.currentBlocks[2].x -= board.blockSize;
		board.currentBlocks[2].y -= board.blockSize;
		board.currentBlocks[3].y -= board.blockSize*2;

	}
	else if((form % 4) == 2){
		board.currentBlocks[0].x -= board.blockSize;
		board.currentBlocks[0].y += board.blockSize;
		board.currentBlocks[2].x += board.blockSize;
		board.currentBlocks[2].y -= board.blockSize;
		board.currentBlocks[3].x += board.blockSize*2;
	}
	else if((form % 4) == 3){
		board.currentBlocks[0].x -= board.blockSize;
		board.currentBlocks[0].y -= board.blockSize;
		board.currentBlocks[2].x += board.blockSize;
		board.currentBlocks[2].y += board.blockSize;
		board.currentBlocks[3].y += board.blockSize*2;
	}else{
		board.currentBlocks[0].x += board.blockSize;
		board.currentBlocks[0].y -= board.blockSize;
		board.currentBlocks[2].x -= board.blockSize;
		board.currentBlocks[2].y += board.blockSize;
		board.currentBlocks[3].x -= board.blockSize*2;
	}
}

createTetromino = function(list, typeOf, board){
		//var rand = Math.round(Math.random() * 7);
		var rand = board.randomNumbers[board.randomNumbersCounter];
		board.randomNumbersCounter +=1;
		switch(rand){
			case 1: createIPiece(list, typeOf, board); break;
			case 2: createOPiece(list, typeOf, board); break;
			case 3: createTPiece(list, typeOf, board); break;
			case 4: createSPiece(list, typeOf, board); break;
			case 5: createZPiece(list, typeOf, board); break;
			case 6: createJPiece(list, typeOf, board); break;
			case 7: //Goes to case 0
			case 0: createLPiece(list, typeOf, board); break;
		}
		board.currentBlockForm = 0;
	};

changeCorrectForm = function(form, board){
	switch(board.currentBlockType){
		case 'i': changeI(form, board); break;
		case 'o': break;
		case 't': changeT(form, board); break;
		case 's': changeS(form, board); break;
		case 'z': changeZ(form, board); break;
		case 'j': changeJ(form, board); break;
		case 'l': changeL(form, board); break;
	}
}

addCurrentToAllBlocks = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		board.allBlocks[board.allBlocks.length] = board.currentBlocks[i];
	}
}

//---------- Move Things ----------//
collide = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].y >= board.y + board.height){
			return true;
		}
		else if(board.currentBlocks[i].x >= board.x + board.width || board.currentBlocks[i].x < board.x){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if(board.allBlocks[a].y == board.currentBlocks[i].y
			&& board.allBlocks[a].x == board.currentBlocks[i].x){
				return true;
			}
		}
	}
}

changeCorrectForm = function(form, board){
	switch(board.currentBlockType){
		case 'i': changeI(form, board); break;
		case 'o': break;
		case 't': changeT(form, board); break;
		case 's': changeS(form, board); break;
		case 'z': changeZ(form, board); break;
		case 'j': changeJ(form, board); break;
		case 'l': changeL(form, board); break;
	}
}

changeForm = function(form, board){
	changeCorrectForm(form, board);

	if(collide(board)){
		console.log("collide");
		changeCorrectForm(form+1, board);
		changeCorrectForm(form+2, board);
		changeCorrectForm(form+3, board);
	}else{
		board.currentBlockForm = form;
	}
}

collideDown = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].y == (board.y + board.height - board.blockSize)){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if(board.allBlocks[a].y == (board.currentBlocks[i].y + board.blockSize)
			&& board.allBlocks[a].x == board.currentBlocks[i].x){
				return true;
			}
		}
	}
}

collideRight = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].x == (board.x + board.width - board.blockSize)){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if(board.allBlocks[a].x == (board.currentBlocks[i].x + board.blockSize)
			&& board.allBlocks[a].y == board.currentBlocks[i].y){
				return true;
			}
		}
	}
}

collideLeft = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].x == board.x){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if(board.allBlocks[a].x == (board.currentBlocks[i].x - board.blockSize)
			&& board.allBlocks[a].y == board.currentBlocks[i].y){
				return true;
			}
		}
	}
}

moveLeft = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(collideLeft(board)){
			return;
		}
	}
	for(i = 0; i < board.currentBlocks.length; i++){
		board.currentBlocks[i].x -= board.currentBlocks[i].size;
	}
}

moveRight = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(collideRight(board)){
			return;
		}
	}
	for(i = 0; i < board.currentBlocks.length; i++){
		board.currentBlocks[i].x += board.currentBlocks[i].size;
	}
}

moveDown = function(user, board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(collideDown(board)){
			return;
		}
	}
	for(i = 0; i < board.currentBlocks.length; i++){
		board.currentBlocks[i].y += board.currentBlocks[i].size;
	}
}

quickDown = function(board){
	while(!collideDown(board)){
		moveDown(true, board);
	}
}

moveBlocks = function(keycode, board){
	switch(keycode){
		case 32: quickDown(board); break; //Space
		case 37: moveLeft(board); break;
		case 38: changeForm(board.currentBlockForm+1, board); break; //UppArrow
		case 39: moveRight(board); break;
		case 40: moveDown(true, board); break;
	}
}

//---------- Generall Things ----------//
//----- Structs -----//
Board = function(x, y, bgColor, height, width, blockSize, player, randomNumbers, boards){
	var board = {
		x:x,
		y:y,
		bgColor:bgColor,
		height:height,
		width:width,
		blockSize:blockSize,
		player: player,
		allBlocks: [],
		nextBlocks: [],
		currentBlocks: [],
		currentBlockType: 'a',
		currentBlockForm: 0,
		nextBlockType: 'a',
		randomNumbers:randomNumbers,
		randomNumbersCounter: 0,
		isActive: false,
		isReady: false,
	};
	boards[boards.length] = board;
}


//----- Game Logic Functions -----//
gameOver = function(board){
	for(i = 0; i < board.allBlocks.length; i++){
		if(board.allBlocks[i].y == board.y){
			return true;
		}
	}
	return false;
}

moveDownAboveOrDelete = function(higherThan, board){
	var index;

	for(var i = board.allBlocks.length - 1; i >= 0 ; i--){
		if(board.allBlocks[i].y == higherThan){
			index = board.allBlocks.indexOf(board.allBlocks[i]);
			board.allBlocks.splice(index, 1);
		}
	}

	for(var i = 0; i < board.allBlocks.length; i++){
		if(board.allBlocks[i].y < higherThan){
		board.allBlocks[i].y += board.blockSize;
		}
	}
}

fullRowControll = function(board){
	var counter = [];
	var rowWasCleared = false;

	//Creates zeros in the list counter on all spots
	for(var i = 0; i < board.height/board.blockSize; i++){
		counter[i] = 0;
	}

	//Counts all blocks per row
	for(var a = 0; a < board.allBlocks.length; a++){
		counter[((board.allBlocks[a].y-board.y)/board.blockSize)] += 1;
	}

	//go through all elements in counter
	for(var r = 0; r < counter.length; r++){
		//Checks if row is full
		if(counter[r] == (board.width/board.blockSize)){
			//Row is full
			//console.log("row full");
			moveDownAboveOrDelete((r*(board.blockSize) + board.y), board);
			rowWasCleared = true;
		}
	}
}

//----- Update Functions -----//
updateBoard = function(board){
	if(collideDown(board)){
		addCurrentToAllBlocks(board);
		fullRowControll(board);
		board.currentBlocks = [];
		/*for(i = 0; i < nextBlocks.length; i++){
			currentBlocks[currentBlocks.length] = nextBlocks[i];
		}
		board.currentBlockType = nextBlockType;
		nextBlocks = [];
		createTetromino(nextBlocks, "next", board);*/
		createTetromino(board.currentBlocks, "current", board);

	}else{
		moveBlocks(40, board);
	}
	return gameOver(board);
}
