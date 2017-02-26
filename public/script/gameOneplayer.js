// ----- THE GAME ----- //


//----- Variables -----//
var socket = io();
var blockSize = 25;
var width = blockSize*10;
var height = blockSize*20;
var widthNext = blockSize*4;
var heightNext = blockSize*4;
var game1 = document.getElementById("game1").getContext("2d");
var nextBlockBox = document.getElementById("nextBlock").getContext("2d");
var currentBlockType;
var currentBlockForm;
var currentBlocks = [];
var nextBlocks = [];
var nextBlockType;
var allBlocks = [];
var speed = 1000; // speed in milliseconds
var speedIncrease = 100;
var level = 1;
var score = 0;
var rowsCleared = 0;
var name = "player";



//----- FUNCTIONS -----//
Block = function(x, y, color, list){
	var block = {
		x:x,
		y:y,
		color:color,
		size:blockSize,
	};
	list[list.length] = block;
}

createIPiece = function(list, typeOf){
	Block(width/2, 0, 'aqua', list);
	Block(width/2, blockSize, 'aqua', list);
	Block(width/2, blockSize*2, 'aqua', list);
	Block(width/2, blockSize*3, 'aqua', list);
	if(typeOf == "current"){
		currentBlockType = 'i';
	}else{
		nextBlockType = 'i';
	}
}

changeI = function(form){
	if((form % 2) == 1){
		currentBlocks[0].x -= blockSize*2;
		currentBlocks[0].y += blockSize*2;
		currentBlocks[1].x -= blockSize;
		currentBlocks[1].y += blockSize;
		currentBlocks[3].x += blockSize;
		currentBlocks[3].y -= blockSize;
		
	}else{
		currentBlocks[0].x += blockSize*2;
		currentBlocks[0].y -= blockSize*2;
		currentBlocks[1].x += blockSize;
		currentBlocks[1].y -= blockSize;
		currentBlocks[3].x -= blockSize;
		currentBlocks[3].y += blockSize;
	}
}

createOPiece = function(list, typeOf){
	Block(width/2, 0, 'yellow', list);
	Block(width/2, blockSize, 'yellow', list);
	Block(width/2 + blockSize, 0, 'yellow', list);
	Block(width/2 + blockSize, blockSize, 'yellow', list);
	if(typeOf == "current"){
		currentBlockType = 'o';
	}else{
		nextBlockType = 'o';
	}
}

createTPiece = function(list, typeOf){
	Block(width/2, 0, 'purple', list);
	Block(width/2 - blockSize, blockSize, 'purple', list);
	Block(width/2, blockSize, 'purple', list);
	Block(width/2 + blockSize, blockSize, 'purple', list);
	if(typeOf == "current"){
		currentBlockType = 't';
	}else{
		nextBlockType = 't';
	}
}

changeT= function(form){
	if((form % 4) == 1){
		currentBlocks[0].x += blockSize;
		currentBlocks[0].y += blockSize;
		currentBlocks[1].x += blockSize;
		currentBlocks[1].y -= blockSize;
		currentBlocks[3].x -= blockSize;
		currentBlocks[3].y += blockSize;
	}
	else if((form % 4) == 2){
		currentBlocks[0].x -= blockSize;
		currentBlocks[0].y += blockSize;
		currentBlocks[1].x += blockSize;
		currentBlocks[1].y += blockSize;
		currentBlocks[3].x -= blockSize;
		currentBlocks[3].y -= blockSize;
	}
	else if((form % 4) == 3){
		currentBlocks[0].x -= blockSize;
		currentBlocks[0].y -= blockSize;
		currentBlocks[1].x -= blockSize;
		currentBlocks[1].y += blockSize;
		currentBlocks[3].x += blockSize;
		currentBlocks[3].y -= blockSize;
	}else{
		currentBlocks[0].x += blockSize;
		currentBlocks[0].y -= blockSize;
		currentBlocks[1].x -= blockSize;
		currentBlocks[1].y -= blockSize;
		currentBlocks[3].x += blockSize;
		currentBlocks[3].y += blockSize;
	}
}

createSPiece = function(list, typeOf){
	Block(width/2, 0, 'lime', list);
	Block(width/2 + blockSize, 0, 'lime', list);
	Block(width/2, blockSize, 'lime', list);
	Block(width/2 - blockSize, blockSize, 'lime', list);
	if(typeOf == "current"){
		currentBlockType = 's';
	}else{
		nextBlockType = 's';
	}
}

changeS = function(form, typeOf){
	if((form % 2) == 1){
		currentBlocks[1].x -= blockSize*2;
		currentBlocks[3].y -= blockSize*2;
	}else{
		currentBlocks[1].x += blockSize*2;
		currentBlocks[3].y += blockSize*2;
	}
}

createZPiece = function(list, typeOf){
	Block(width/2, 0, 'red', list);
	Block(width/2 - blockSize, 0, 'red', list);
	Block(width/2, blockSize, 'red', list);
	Block(width/2 + blockSize, blockSize, 'red', list);
	if(typeOf == "current"){
		currentBlockType = 'z';
	}else{
		nextBlockType = 'z';
	}
}

changeZ = function(form){
	if((form % 2) == 1){
		currentBlocks[1].x += blockSize*2;
		currentBlocks[3].y -= blockSize*2;
	}else{
		currentBlocks[1].x -= blockSize*2;
		currentBlocks[3].y += blockSize*2;
	}
}

createJPiece = function(list, typeOf){
	Block(width/2, 0, 'orange', list);
	Block(width/2, blockSize, 'orange', list);
	Block(width/2, blockSize*2, 'orange', list);
	Block(width/2 + blockSize, blockSize*2, 'orange', list);
	if(typeOf == "current"){
		currentBlockType = 'j';
	}else{
		nextBlockType = 'j';
	}
}

changeJ = function(form){
	if((form % 4) == 1){
		currentBlocks[0].x += blockSize;
		currentBlocks[0].y += blockSize;
		currentBlocks[2].x -= blockSize;
		currentBlocks[2].y -= blockSize;
		currentBlocks[3].x -= blockSize*2;
		
	}
	else if((form % 4) == 2){
		currentBlocks[0].x -= blockSize;
		currentBlocks[0].y += blockSize;
		currentBlocks[2].x += blockSize;
		currentBlocks[2].y -= blockSize;
		currentBlocks[3].y -= blockSize*2;
	}
	else if((form % 4) == 3){
		currentBlocks[0].x -= blockSize;
		currentBlocks[0].y -= blockSize;
		currentBlocks[2].x += blockSize;
		currentBlocks[2].y += blockSize;
		currentBlocks[3].x += blockSize*2;
	}else{
		currentBlocks[0].x += blockSize;
		currentBlocks[0].y -= blockSize;
		currentBlocks[2].x -= blockSize;
		currentBlocks[2].y += blockSize;
		currentBlocks[3].y += blockSize*2;
	}
}

createLPiece = function(list, typeOf){
	Block(width/2, 0, 'blue', list);
	Block(width/2, blockSize, 'blue', list);
	Block(width/2, blockSize*2, 'blue', list);
	Block(width/2 - blockSize, blockSize*2, 'blue', list);
	if(typeOf == "current"){
		currentBlockType = 'l';
	}else{
		nextBlockType = 'l';
	}
}

changeL= function(form){
	if((form % 4) == 1){
		currentBlocks[0].x += blockSize;
		currentBlocks[0].y += blockSize;
		currentBlocks[2].x -= blockSize;
		currentBlocks[2].y -= blockSize;
		currentBlocks[3].y -= blockSize*2;
		
	}
	else if((form % 4) == 2){
		currentBlocks[0].x -= blockSize;
		currentBlocks[0].y += blockSize;
		currentBlocks[2].x += blockSize;
		currentBlocks[2].y -= blockSize;
		currentBlocks[3].x += blockSize*2;
	}
	else if((form % 4) == 3){
		currentBlocks[0].x -= blockSize;
		currentBlocks[0].y -= blockSize;
		currentBlocks[2].x += blockSize;
		currentBlocks[2].y += blockSize;
		currentBlocks[3].y += blockSize*2;
	}else{
		currentBlocks[0].x += blockSize;
		currentBlocks[0].y -= blockSize;
		currentBlocks[2].x -= blockSize;
		currentBlocks[2].y += blockSize;
		currentBlocks[3].x -= blockSize*2;
	}
}

collide = function(){
	for(i = 0; i < currentBlocks.length; i++){
		if(currentBlocks[i].y >= height){
			return true;
		}
		else if(currentBlocks[i].x >= width || currentBlocks[i].x < 0){
			return true;
		}
		for(a = 0; a < allBlocks.length; a++){
			if(allBlocks[a].y == currentBlocks[i].y 
			&& allBlocks[a].x == currentBlocks[i].x){
				return true;
			}
		}
	}
}

changeCorrectForm = function(form){
	switch(currentBlockType){
		case 'i': changeI(form); break;
		case 'o': break;
		case 't': changeT(form); break;
		case 's': changeS(form); break;
		case 'z': changeZ(form); break;
		case 'j': changeJ(form); break;
		case 'l': changeL(form); break;
	}
}

changeForm = function(form){
	changeCorrectForm(form);
	
	if(collide()){
		changeCorrectForm(form+1);
		changeCorrectForm(form+2);
		changeCorrectForm(form+3);
	}else{
		currentBlockForm = form;
	}
}

drawBlock = function(block){
	var size = block.size;
	game1.clearRect(block.x, block.y, size, size);
	game1.fillStyle= block.color;
	game1.fillRect(block.x, block.y, size, size);
}

drawNextBlock = function(){
	nextBlockBox.clearRect(0, 0, widthNext, heightNext);
	nextBlockBox.fillStyle='grey';
	nextBlockBox.fillRect(0, 0, widthNext, heightNext);
	for(i = 0; i< nextBlocks.length; i++){
		nextBlockBox.fillStyle= nextBlocks[i].color;
		nextBlockBox.fillRect(((nextBlocks[i].x-blockSize)%(blockSize*3)), nextBlocks[i].y, blockSize, blockSize);
	}
}

updateCanvas = function(){
	game1.clearRect(0, 0, width, height);
	game1.fillStyle='black';
	game1.fillRect(0, 0, width, height);
	
	for(i = 0; i< currentBlocks.length; i++){
		drawBlock(currentBlocks[i]);
	}
	
	drawNextBlock();
	
	for(i = 0; i< allBlocks.length; i++){
		drawBlock(allBlocks[i]);
	}
}

collideDown = function(){
	for(i = 0; i < currentBlocks.length; i++){
		if(currentBlocks[i].y == (height - blockSize)){
			return true;
		}
		for(a = 0; a < allBlocks.length; a++){
			if(allBlocks[a].y == (currentBlocks[i].y + blockSize) 
			&& allBlocks[a].x == currentBlocks[i].x){
				return true;
			}
		}
	}
}

collideRight = function(){
	for(i = 0; i < currentBlocks.length; i++){
		if(currentBlocks[i].x == (width - blockSize)){
			return true;
		}
		for(a = 0; a < allBlocks.length; a++){
			if(allBlocks[a].x == (currentBlocks[i].x + blockSize) 
			&& allBlocks[a].y == currentBlocks[i].y){
				return true;
			}
		}
	}
}

collideLeft = function(){
	for(i = 0; i < currentBlocks.length; i++){
		if(currentBlocks[i].x == 0){
			return true;
		}
		for(a = 0; a < allBlocks.length; a++){
			if(allBlocks[a].x == (currentBlocks[i].x - blockSize) 
			&& allBlocks[a].y == currentBlocks[i].y){
				return true;
			}
		}
	}
}

moveLeft = function(){
	for(i = 0; i < currentBlocks.length; i++){
		if(collideLeft()){
			return;
		}
	}
	for(i = 0; i < currentBlocks.length; i++){
		currentBlocks[i].x -= currentBlocks[i].size;
	}
	updateCanvas();
}

moveRight = function(){
	for(i = 0; i < currentBlocks.length; i++){
		if(collideRight()){
			return;
		}
	}
	for(i = 0; i < currentBlocks.length; i++){
		currentBlocks[i].x += currentBlocks[i].size;
	}
	updateCanvas();
}

moveDown = function(user){
	for(i = 0; i < currentBlocks.length; i++){
		if(collideDown()){
			return;
		}
	}
	for(i = 0; i < currentBlocks.length; i++){
		currentBlocks[i].y += currentBlocks[i].size;
	}
	updateCanvas();
	if(user){
		score = score+5;
		if((score % 1000) == 0){
			level++;
			document.getElementById("level").innerHTML = "Level: "+level;
			speed = speed -speedIncrease;
		}
	} 
}

quickDown = function(){
	while(!collideDown()){
		moveDown(true);
	}
	document.getElementById("score").innerHTML = "Score: " + score;
}

moveBlocks = function(keycode){
	switch(keycode){
		case 32: quickDown(); break; //Space
		case 37: moveLeft(); break;
		case 38: changeForm(currentBlockForm+1); break; //UppArrow
		case 39: moveRight(); break;
		case 40: 
			moveDown(true); 
			document.getElementById("score").innerHTML = "Score: " + score;
			break;
	}
}

createTetromino = function(list, typeOf){
	var rand = Math.round(Math.random() * 7);
	switch(rand){
		case 1: createIPiece(list, typeOf); break;
		case 2: createOPiece(list, typeOf); break;
		case 3: createTPiece(list, typeOf); break;
		case 4: createSPiece(list, typeOf); break;
		case 5: createZPiece(list, typeOf); break;
		case 6: createJPiece(list, typeOf); break;
		case 7: //Goes to case 0
		case 0: createLPiece(list, typeOf); break;
	}
	currentBlockForm = 0;
}

addCurrentToAllBlocks = function(){
	for(i = 0; i < currentBlocks.length; i++){
		allBlocks[allBlocks.length] = currentBlocks[i];
	}
}

gameOver = function(){
	for(i = 0; i < allBlocks.length; i++){
		if(allBlocks[i].y == 0){
			return true;
		}
	}
}

moveDownAboveOrDelete = function(higherThan){
	var index;
	
	//console.log('splicing begins');
	
	for(i = allBlocks.length - 1; i >= 0 ; i--){
		if(allBlocks[i].y == higherThan){
			index = allBlocks.indexOf(allBlocks[i]);
			allBlocks.splice(index, 1);
		}
	}
	
	//console.log('moving begins');
	
	for(i = 0; i < allBlocks.length; i++){
		if(allBlocks[i].y < higherThan){
		allBlocks[i].y += blockSize;
		}
	}
	
	//console.log('all done');
}

fullRowControll = function(){
	var counter = [];
	var rowWasCleared = false;
	
	for(i = 0; i < height/blockSize; i++){
		counter[i] = 0;
	}
	
	//Counts all blocks per row
	for(a = 0; a < allBlocks.length; a++){
		counter[(allBlocks[a].y/blockSize)] += 1;
	}
	
	//go through all elements in counter
	for(r = 0; r < counter.length; r++){
		//Checks if row is full
		if(counter[r] == (width/blockSize)){
			//Row is full
			moveDownAboveOrDelete(r*blockSize);
			rowsCleared++;
			score = score + 200;
			rowWasCleared = true;
		}
	}
	
	if(rowWasCleared){
		level = Math.floor(score/1000)+1;
		document.getElementById("level").innerHTML = "Level: "+level;
		speed = 1000 - speedIncrease*(level-1);
		document.getElementById("score").innerHTML = "Score: " + score;
		document.getElementById("rows").innerHTML = "Rows cleared: "+rowsCleared;
	}
}

update = function(){
	if(collideDown()){
		addCurrentToAllBlocks();
		if(gameOver()){
			allBlocks = [];
			level = 1;
			score = 0;
			rowWasCleared = 0;
			document.getElementById("level").innerHTML = "Level: 1";
			document.getElementById("score").innerHTML = "Score: 0";
			document.getElementById("rows").innerHTML = "Rows cleared: 0";
		}
		fullRowControll();
		currentBlocks = [];
		for(i = 0; i < nextBlocks.length; i++){
			currentBlocks[currentBlocks.length] = nextBlocks[i];
		}
		console
		currentBlockType = nextBlockType;
		nextBlocks = [];
		createTetromino(nextBlocks, "next");
	}else{
		moveDown(false);
	}
	updateCanvas();
}


//----- EVENTS HAPPENING -----//
window.onload =function(){
	createTetromino(currentBlocks, "current");
	createTetromino(nextBlocks, "next");
	updateCanvas();
	document.getElementById("level").innerHTML = "Level: 1";
	document.getElementById("score").innerHTML = "Score: 0";
	document.getElementById("rows").innerHTML = "Rows cleared: 0";
}

setInterval(update, speed);

window.onkeydown = function(e){
	moveBlocks(e.keyCode);
	updateCanvas();
}