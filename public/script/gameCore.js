

//----- Public Functions -----//
(function(exports){

	exports.startGame = function(boards){
		for(i = 0; i < boards.length; i++){
			exports.startGameBoard(boards[i]);
		}
	};

	exports.startGameBoard = function(board){
		createTetromino(board.currentBlocks, "current", board);
		createTetromino(board.nextBlocks, "next", board);
		board.isActive = true;
	};

	exports.addBoards = function(data, list){
		for(i = 0; i < data.playerPosition.length; i++){
			if(data.playerPosition[i] == 1){
				Board(data, list, i);
			}
		}
	};

	exports.addBoard = function(data, list){
		Board(data, list, data.place);
	};

	exports.moveBlocksExport = function(keycode, board){
		moveBlocks(keycode, board);
	}

	exports.updateAllBoards = function(boards){
		var gameOversThisRound = [];
		for(var i = 0; i < boards.length; i++){
			if(boards[i].isActive == true){
				exports.updateBoard(boards[i]);
				if(boards[i].isActive == false){
					gameOversThisRound.push(boards[i].place);
				}
			}
		}
		return gameOversThisRound;
	}

	exports.updateBoard = function(board){
		var newTetro = false;
		board.time = board.time + 1;
		if(collideDown(board)){
			addCurrentToAllBlocks(board);
			fullRowControll(board);
			board.currentBlocks = [];
			board.nextBlocks = [];
			createTetromino(board.currentBlocks, "current", board);
			createTetromino(board.nextBlocks, "next", board);
			newTetro = true;
		}else{
			moveBlocks(40, board);
		}
		if(gameOver(board) == true){
			board.isActive = false;
		}
		return newTetro;
	}

}(typeof exports === 'undefined'? this.gameCore = {}: exports));


//----- FUNCTIONS -----//
Block = function(x, y, color, list){
	var block = {
		x:x, //In steps
		y:y, //In steps
		color: color
	};
	list[list.length] = block;
}

createIPiece = function(list, typeOf, board){
	Block(board.width/2, 0 , 'aqua', list);
	Block(board.width/2, 1, 'aqua', list);
	Block(board.width/2, 2, 'aqua', list);
	Block(board.width/2, 3, 'aqua', list);
	if(typeOf == "current"){
		board.currentBlockType = 'i';
	}else{
		board.nextBlockType = 'i';
	}
}

changeI = function(form, board){
	if((form % 2) == 1){
		board.currentBlocks[0].x -= 2;
		board.currentBlocks[0].y += 2;
		board.currentBlocks[1].x -= 1;
		board.currentBlocks[1].y += 1;
		board.currentBlocks[3].x += 1;
		board.currentBlocks[3].y -= 1;

	}else{
		board.currentBlocks[0].x += 2;
		board.currentBlocks[0].y -= 2;
		board.currentBlocks[1].x += 1;
		board.currentBlocks[1].y -= 1;
		board.currentBlocks[3].x -= 1;
		board.currentBlocks[3].y += 1;
	}
}

createOPiece = function(list, typeOf, board){
	Block(board.width/2-1, 0, 'yellow', list);
	Block(board.width/2-1, 1, 'yellow', list);
	Block(board.width/2, 0, 'yellow', list);
	Block(board.width/2, 1, 'yellow', list);
	if(typeOf == "current"){
		board.currentBlockType = 'o';
	}else{
		board.nextBlockType = 'o';
	}
}

createTPiece = function(list, typeOf, board){
	Block(board.width/2, 0, 'purple', list);
	Block(board.width/2 - 1, 1, 'purple', list);
	Block(board.width/2, 1, 'purple', list);
	Block(board.width/2 + 1, 1, 'purple', list);
	if(typeOf == "current"){
		board.currentBlockType = 't';
	}else{
		board.nextBlockType = 't';
	}
}

changeT= function(form, board){
	if((form % 4) == 1){
		board.currentBlocks[0].x += 1;
		board.currentBlocks[0].y += 1;
		board.currentBlocks[1].x += 1;
		board.currentBlocks[1].y -= 1;
		board.currentBlocks[3].x -= 1;
		board.currentBlocks[3].y += 1;
	}
	else if((form % 4) == 2){
		board.currentBlocks[0].x -= 1;
		board.currentBlocks[0].y += 1;
		board.currentBlocks[1].x += 1;
		board.currentBlocks[1].y += 1;
		board.currentBlocks[3].x -= 1;
		board.currentBlocks[3].y -= 1;
	}
	else if((form % 4) == 3){
		board.currentBlocks[0].x -= 1;
		board.currentBlocks[0].y -= 1;
		board.currentBlocks[1].x -= 1;
		board.currentBlocks[1].y += 1;
		board.currentBlocks[3].x += 1;
		board.currentBlocks[3].y -= 1;
	}else{
		board.currentBlocks[0].x += 1;
		board.currentBlocks[0].y -= 1;
		board.currentBlocks[1].x -= 1;
		board.currentBlocks[1].y -= 1;
		board.currentBlocks[3].x += 1;
		board.currentBlocks[3].y += 1;
	}
}

createSPiece = function(list, typeOf, board){
	Block(board.width/2, 0, 'lime', list);
	Block(board.width/2 + 1, 0, 'lime', list);
	Block(board.width/2, 1, 'lime', list);
	Block(board.width/2 - 1, 1, 'lime', list);
	if(typeOf == "current"){
		board.currentBlockType = 's';
	}else{
		board.nextBlockType = 's';
	}
}

changeS = function(form, board){
	//var board = board[0];
	if((form % 2) == 1){
		board.currentBlocks[1].x -= 2;
		board.currentBlocks[3].y -= 2;
	}
	else{
		board.currentBlocks[1].x += 2;
		board.currentBlocks[3].y += 2;
	}
}

createZPiece = function(list, typeOf, board){
	Block(board.width/2, 0, 'red', list);
	Block(0 + board.width/2 - 1, 0, 'red', list);
	Block(0 + board.width/2, 1, 'red', list);
	Block(0 + board.width/2 + 1, 1, 'red', list);
	if(typeOf == "current"){
		board.currentBlockType = 'z';
	}else{
		board.nextBlockType = 'z';
	}
}

changeZ = function(form, board){
	if((form % 2) == 1){
		board.currentBlocks[1].x += 2;
		board.currentBlocks[3].y -= 2;
	}else{
		board.currentBlocks[1].x -= 2;
		board.currentBlocks[3].y += 2;
	}
}

createJPiece = function(list, typeOf, board){
	Block(0 + board.width/2-1, 0, 'orange', list);
	Block(0 + board.width/2-1, 1, 'orange', list);
	Block(0 + board.width/2-1, 2, 'orange', list);
	Block(0 + board.width/2, 2, 'orange', list);
	if(typeOf == "current"){
		board.currentBlockType = 'j';
	}else{
		board.nextBlockType = 'j';
	}
}

changeJ = function(form, board){
	if((form % 4) == 1){
		board.currentBlocks[0].x += 1;
		board.currentBlocks[0].y += 1;
		board.currentBlocks[2].x -= 1;
		board.currentBlocks[2].y -= 1;
		board.currentBlocks[3].x -= 2;

	}
	else if((form % 4) == 2){
		board.currentBlocks[0].x -= 1;
		board.currentBlocks[0].y += 1;
		board.currentBlocks[2].x += 1;
		board.currentBlocks[2].y -= 1;
		board.currentBlocks[3].y -= 2;
	}
	else if((form % 4) == 3){
		board.currentBlocks[0].x -= 1;
		board.currentBlocks[0].y -= 1;
		board.currentBlocks[2].x += 1;
		board.currentBlocks[2].y += 1;
		board.currentBlocks[3].x += 2;
	}else{
		board.currentBlocks[0].x += 1;
		board.currentBlocks[0].y -= 1;
		board.currentBlocks[2].x -= 1;
		board.currentBlocks[2].y += 1;
		board.currentBlocks[3].y += 2;
	}
}

createLPiece = function(list, typeOf, board){
	Block(0 + board.width/2 , 0, 'blue', list);
	Block(0 + board.width/2, 1, 'blue', list);
	Block(0 + board.width/2, 2, 'blue', list);
	Block(0 + board.width/2 - 1, 2, 'blue', list);
	if(typeOf == "current"){
		board.currentBlockType = 'l';
	}else{
		board.nextBlockType = 'l';
	}
}

changeL= function(form, board){
	if((form % 4) == 1){
		board.currentBlocks[0].x += 1;
		board.currentBlocks[0].y += 1;
		board.currentBlocks[2].x -= 1;
		board.currentBlocks[2].y -= 1;
		board.currentBlocks[3].y -= 2;

	}
	else if((form % 4) == 2){
		board.currentBlocks[0].x -= 1;
		board.currentBlocks[0].y += 1;
		board.currentBlocks[2].x += 1;
		board.currentBlocks[2].y -= 1;
		board.currentBlocks[3].x += 2;
	}
	else if((form % 4) == 3){
		board.currentBlocks[0].x -= 1;
		board.currentBlocks[0].y -= 1;
		board.currentBlocks[2].x += 1;
		board.currentBlocks[2].y += 1;
		board.currentBlocks[3].y += 2;
	}else{
		board.currentBlocks[0].x += 1;
		board.currentBlocks[0].y -= 1;
		board.currentBlocks[2].x -= 1;
		board.currentBlocks[2].y += 1;
		board.currentBlocks[3].x -= 2;
	}
}

createTetromino = function(list, typeOf, board){
	var rand = 0;
	if (typeOf === "current") {
		rand = board.randomNumbers[board.randomNumbersCounter];
		board.randomNumbersCounter +=1;
		board.currentBlockForm = 0;
	}else{
		rand = board.randomNumbers[board.randomNumbersCounter];
	}
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
		if(board.currentBlocks[i].y >= board.height || board.currentBlocks[i].y < 0){
			return true;
		}
		else if(board.currentBlocks[i].x >= board.width || board.currentBlocks[i].x < 0){
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
		changeCorrectForm(form+1, board);
		changeCorrectForm(form+2, board);
		changeCorrectForm(form+3, board);
	}else{
		board.currentBlockForm = form;
	}
}

collideDown = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].y == (board.height - 1)){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if((board.allBlocks[a].y - 1) == board.currentBlocks[i].y
			&& board.allBlocks[a].x == board.currentBlocks[i].x){
				return true;
			}
		}
	}
}

collideRight = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].x == board.width - 1){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if((board.allBlocks[a].x - 1) == board.currentBlocks[i].x
			&& board.allBlocks[a].y == board.currentBlocks[i].y){
				return true;
			}
		}
	}
}

collideLeft = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(board.currentBlocks[i].x == 0){
			return true;
		}
		for(a = 0; a < board.allBlocks.length; a++){
			if(board.allBlocks[a].x == (board.currentBlocks[i].x - 1)
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
		board.currentBlocks[i].x -= 1;
	}
}

moveRight = function(board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(collideRight(board)){
			return;
		}
	}
	for(i = 0; i < board.currentBlocks.length; i++){
		board.currentBlocks[i].x += 1;
	}
}

moveDown = function(user, board){
	for(i = 0; i < board.currentBlocks.length; i++){
		if(collideDown(board)){
			return;
		}
	}
	for(i = 0; i < board.currentBlocks.length; i++){
		board.currentBlocks[i].y += 1;
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
Board = function(data, boards, place){
	var board = {
		x: data.playerBoardX, //steps
		y: data.playerBoardY, //steps
		bgColor: 'gainsboro', //bgColor
		height: 20, //how many blocks
		width: 10,  //how many blocks
		player: data.username,
		allBlocks: [],
		nextBlocks: [],
		currentBlocks: [],
		currentBlockType: 'a',
		currentBlockForm: 0,
		nextBlocks: [],
		nextBlockType: 'a',
		randomNumbers: data.randomNumbers,
		randomNumbersCounter: 0,
		isActive: false,
		isReady: false,
		place: place,
		playerPosition: data.playerPosition,
		time: 0,
		id: data.id,
		leaved: false,
		winner: false
	};
	boards[boards.length] = board;
}

//----- Game Logic Functions -----//
gameOver = function(board){
	for(i = 0; i < board.allBlocks.length; i++){
		if(board.allBlocks[i].y == 0){
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
		board.allBlocks[i].y += 1;
		}
	}
}

fullRowControll = function(board){
	var counter = [];
	var rowWasCleared = false;

	//Creates zeros in the list counter on all spots
	for(var i = 0; i < board.height; i++){
		counter[i] = 0;
	}

	//Counts all blocks per row
	for(var a = 0; a < board.allBlocks.length; a++){
		counter[board.allBlocks[a].y] += 1;
	}

	//go through all elements in counter
	for(var r = 0; r < counter.length; r++){
		//Checks if row is full
		if(counter[r] == (board.width)){
			//Row is full
			moveDownAboveOrDelete(r, board);
			rowWasCleared = true;
		}
	}
}
