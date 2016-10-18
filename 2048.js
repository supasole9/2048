var score = 0
var bestScore = 0
var size = 4
var board = {
	/*"tile0-0":undefined,
	"tile0-1":2,
	"tile0-2":4,
	"tile0-3":8,
	"tile1-0":16,
	"tile1-1":32,
	"tile1-2":64,
	"tile1-3":128,
	"tile2-0":256,
	"tile2-1":512,
	"tile2-2":1024,
	"tile2-3":2048,
	"tile3-0":4096,*/

};



var tileKey = function(col, row) {					
	return "tile" + col + "-" + row;
};


var createBoard = function (){
	var $board = $("#board");
	for (var y = 0;y < size; y++){
		var $row = $("<div></div>").addClass("row");
		$board.append($row);
		for (var x = 0; x < size; x++){
			var $tile = $("<div></div>").addClass("tile");
			$tile.attr("id", tileKey(x, y));
			$row.append($tile);
		}
	}
};

var refreshBoard = function(){
	for (var y = 0; y < size; y++) {
		for (var x = 0; x < size; x++){
			var key = tileKey(x, y);
			var num = board[key];
			var $tile = $("#" + key);
			$tile.text("").removeClass().addClass("tile");
			$tile.text(num).addClass("tile-" + num);
		}
	}
	$("#score").text(score);
	$("#bestScore").text(bestScore);

};

var getEmptyTile = function(){
	var empty = [];
	for (var y = 0; y < size; y++) {
		for (var x = 0; x < size; x++){
			var key = tileKey(x, y);
			var num = board[key];
			var $tile = $("#" + key);
			if (num === undefined){
				empty.push(key);
			}
		}
	}
	return empty;
};

var addRandomTile = function (){
	var emptyTiles = getEmptyTile();
	var randomIndex = Math.floor(Math.random() * emptyTiles.length);
	var randomEmptyTile = emptyTiles[randomIndex];
	var row = Math.floor(Math.random() * size);
	var col = Math.floor(Math.random() * size);
	var key = tileKey(row, col);
	if (Math.random() > .9) {
		board[randomEmptyTile] = 4;
	} else{ board[randomEmptyTile] = 2;
	}
};

var combineNumbers = function(numbers){
	var newNumbers = [];

	while (numbers.length > 0){
		if (numbers[0] === numbers[1]){
			var sum = numbers[0] + numbers [1];
			updateScore(sum);
			newNumbers.push(sum);
			numbers.shift();
			numbers.shift();
		} else { 
			newNumbers.push(numbers[0]);
			numbers.shift();
		}
	}
	while (newNumbers.length < size) {
		newNumbers.push(undefined);
	}
	return newNumbers;
};


//moving and setting numbers in rows
var getNumbersInRow = function (row) {
	var numbers = [];
	for (var col = 0; col < size; col++) {
		var key = tileKey(col, row);
		var val = board[key];
		if (val) {
			numbers.push(val);
		}
	}
	return numbers;
};

var setNumbersInRow = function(row, newNumbers) {
	for (var col = 0; col < size; col++) {
		var key = tileKey(col, row);
		board[key] = newNumbers[col];
	}
};

//moving and setting numbers in columns
var getNumbersInCol = function (col) {
	var numbers = [];
	for (var row = 0; row < size; row++) {
		var key = tileKey(col, row);
		var val = board[key];
		if (val) {
			numbers.push(val);
		}
	}
	return numbers;
};

var setNumbersInCol = function(col, newNumbers) {
	for (var row = 0; row < size; row++) {
		var key = tileKey(col, row);
		board[key] = newNumbers[row];
	}
};

//adding numbers
var combineNumbersLeft = function(row) {
	var oldNumbers = getNumbersInRow(row);
	var newNumbers = combineNumbers(oldNumbers);
	setNumbersInRow(row, newNumbers);
};

var combineNumbersRight = function(row) {
	var oldNumbers = getNumbersInRow(row);
	var newNumbers = combineNumbers(oldNumbers.reverse());
	setNumbersInRow(row, newNumbers.reverse());
};

var combineNumbersUp = function(col) {
	var oldNumbers = getNumbersInCol(col);
	var newNumbers = combineNumbers(oldNumbers);
	setNumbersInCol(col, newNumbers);
};

var combineNumbersDown = function(col) {
	var oldNumbers = getNumbersInCol(col);
	var newNumbers = combineNumbers(oldNumbers.reverse());
	setNumbersInCol(col, newNumbers.reverse());
};


var didBoardChange = function(oldBoard) {
	for (var y = 0; y < size; y++) {
		for (var x = 0; x < size; x++){
			var key = tileKey(x,y);
			if (board[key] !== oldBoard[key]){
				return true;
			}
		}
	}
	return false;
};

var updateScore = function (increment){
	score += increment;

	if (score > bestScore){
		bestScore = score;
	}
};

var endGame = function(row, col) {
	if (getEmptyTile().length == 0) {
		for (i = 0; i < size; i++){
		var row = getNumbersInRow(i);
		var col = getNumbersInCol(i);
		for (index = 0; index < size; index++)
		if (col[index] === col[index+1] || row[index] === row[index+1]){
				return false
			} 
		} return true
	} 
};



//keyboard events
var keyPressed = function (direction) {
	var oldBoard = $.extend({}, board);
	for (var n = 0; n < size; n++) {
		if (direction == "left") {
			combineNumbersLeft(n);
		} else if (direction == "right") {
			combineNumbersRight(n);
		} else if (direction == "up"){
			combineNumbersUp(n);
		} else if (direction == "down"){
			combineNumbersDown(n);
		}
	}
	if (didBoardChange(oldBoard)){
		addRandomTile();
		refreshBoard();
		saveData();
		if (endGame() == true) {
			$("<div></div>").appendTo("board")
							.attr("id", "game-over")
							.text("Game Over!")
							.hide()
							.fadeIn();
		}
	}
};

var startNewGame = function() {
	board = {};
	score = 0;
	addRandomTile();
	addRandomTile();
	refreshBoard();
	saveData();
	$("game-over").remove();
};

var saveData = function(){
	localStorage.setItem("board", JSON.stringify(board));
	localStorage.setItem("score", JSON.stringify(score));
	localStorage.setItem("bestScore", JSON.stringify(bestScore));
};

var loadData = function(){
	
	var savedScore = localStorage.getItem("score");
	if (savedScore) {
		score = JSON.parse(savedScore);
	}
	
	var savedHighScore = localStorage.getItem("bestScore");
	if (savedHighScore) {
		bestScore = bestScore = JSON.parse(savedHighScore);
	}

	var savedBoard = localStorage.getItem("board");
	if (savedBoard) {
		board = JSON.parse(savedBoard);
		if (endGame()){
			startNewGame();
		} else {
			refreshBoard();
		}
	} else {
		startNewGame();
	}
};

createBoard();
loadData();

$("#new-game").click(function() {
	startNewGame();
});



//keyboard keys and variable setting
$(document).keydown(function(event) {
	console.log("key pressed", event.which);
	switch(event.which){
		case 65: //a
		case 37: //left arrow
			//console.log("left pressed")
			keyPressed("left");
			break;
		case 87: //w
		case 38: //up arrow
			//console.log("up pressed")
			keyPressed("up");
			break;
		case 68: // d
		case 39: //right arrow
			//console.log("right pressed")
			keyPressed("right");
			break;
		case 83: //s
		case 40: //down arrow
			//console.log("down pressed")
			keyPressed("down");
			break;
	}
});



