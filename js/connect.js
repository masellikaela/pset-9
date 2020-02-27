///////////////////// CONSTANTS /////////////////////////////////////
const winningConditions = [
  [0, 1, 2, 3],
  [3, 4, 5, 6],
	[7, 8, 9, 10],
	[10, 11, 12, 13],
	[14, 15, 16, 17],
	[17, 18, 19, 20],
	[21,22,23,24],
	[24,25,26,27],
	[28,29,30,31],
	[31,32,33,34],
	[35,36,37,38],
	[38,39,40,41],
	[0, 7, 14, 21],
	[],
	[],
	[],
	[],
	[],
	[],

]
///////////////////// APP STATE (VARIABLES) /////////////////////////
let board;
let turn;
let win;
let keepScoreYellow = 0;
let keepScoreRed = 0;

///////////////////// CACHED ELEMENT REFERENCES /////////////////////
const squares = Array.from(document.querySelectorAll("#board div"));
const message = document.querySelector("h2");

///////////////////// EVENT LISTENERS ///////////////////////////////
window.onload = init;
document.getElementById("board").onclick = takeTurn;
document.getElementById("reset-button").onclick = init;
document.getElementById('ButtonX').onclick = firstYellow;
document.getElementById('ButtonO').onclick = firstRed;

///////////////////// FUNCTIONS /////////////////////////////////////
function init() {
  board = [
    "R", "Y", "", "", "", "", "",
    "", "", "", "", "", "", "",
    "", "", "", "", "", "", "",
		"", "", "", "", "", "", "",
    "", "", "", "", "", "", "",
		"", "", "", "", "", "", "Y"
  ];
  turn = "Yellow";
  win = null;

  render();
}

function firstYellow() {
  document.getElementById('turnButton').innerHTML = "Turn: Yellow";
  turn = "Yellow";
}

function firstRed() {
  document.getElementById('turnButton').innerHTML = "Turn: Red";
  turn = "Red";
}

function render() {
  board.forEach(function(color, index) {
		let c;
		if (color === "R") {
			c = "red";
		} else if (color == "Y") {
			c = "yellow";
		};

		if (c) squares[index].classList.add(c);
  });

  message.textContent =
    win === "T" ? "It's a tie!" : win ? `${win} wins!` : `Turn: ${turn}`;
}

function takeTurn(e) {
  if (!win) {
    let index = squares.findIndex(function(square) {
      return square === e.target;
    });

    if (board[index] === "") {
      board[index] = turn;
      turn = turn === "Yellow" ? "Red" : "Yellow";
      win = getWinner();

      render();
    }
  }
}

function getWinner() {
  let winner = null;

  winningConditions.forEach(function(condition, index) {
    if (
      board[condition[0]] &&
      board[condition[0]] === board[condition[1]] &&
      board[condition[1]] === board[condition[2]] &&
			board[condition[2]] === board[condition[3]]
    ) {
      winner = board[condition[0]];
    }
  });

  if (winner === "Yellow") {
    keepScoreYellow++;
    document.getElementById('ScoreX').innerHTML = keepScoreYellow;
  } else if (winner === "Red") {
    keepScoreRed++;
    document.getElementById('ScoreRed').innerHTML = keepScoreRed;
  }

  return winner ? winner : board.includes("") ? null : "T";
}
