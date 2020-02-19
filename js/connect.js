function ConnectFour(width, height) {
	this.width = width;
	this.height = height;
	this.win = this.popOut = false;
	this.grid = [];
	this.columnHeight = [];
	this.numMoves = this.popCount = 0;
	this.position = '';
	for (let i = 0; i < width; i++) {
		this.grid[i] = [];
		for (let j = 0; j < height; j++) {
			this.grid[i][j] = 0;
		}
		this.columnHeight[i] = 0;
	}
	this.drawToConsole();
}

ConnectFour.prototype = {
	play: function(column) {
		for (let i = 0; i < column.length; i++) {
			if (this.playerWon(column[i])) {
				this.win = true;
			}
			this.drop(column[i]);
			if (this.win) {
				break;
			}
		}
	},

	drop: function(column) {
		if (this.canDrop(column) && column <= this.width && column >= 0) {
			this.grid[column - 1][
this.columnHeight[column - 1]++
			] = this.playerTurn();
			this.position += column;
			this.numMoves++;
		}
		this.drawToConsole();
	},

	pop: function(column) {
		if (this.popOut && this.canPop(column) && column <= this.width && column >= 0) {
			for (let d = 1; d < this.height; d++) {
				this.grid[column - 1][d - 1] = this.grid[column - 1][d];
			}
			this.columnHeight[column - 1]--;
			this.grid[column - 1][this.height - 1] = 0;
			this.numMoves++;
			this.popCount++;
		}
		this.drawToConsole();
	},

	canDrop: function(column) {
		return this.columnHeight[column - 1] < this.height;
	},

	canPop: function(column) {
		return this.grid[column - 1][0] == this.playerTurn();
	},
	//Translated from https://github.com/PascalPons/connect4/commit/3efc1644b0d30944470d3d826f24305bcec23e26 in position.hpp
	playerWon: function(column) {
		let playertoWin = this.playerTurn();
		if (this.columnHeight[column - 1] >= 3 &&
			this.grid[column - 1][this.columnHeight[column - 1] - 1] == playertoWin &&
			this.grid[column - 1][this.columnHeight[column - 1] - 2] == playertoWin &&
			this.grid[column - 1][this.columnHeight[column - 1] - 3] == playertoWin
		) {
			return true;
		} else {
			for (let diagonalY = -1; diagonalY <= 1; diagonalY++) {
				let connections = 0;
				for (let diagonalX = -1; diagonalX <= 1; diagonalX += 2) {
					for (let x = column - 1 + diagonalX, y = this.columnHeight[column - 1] + diagonalX * diagonalY;
						x >= 0 && x < this.width && y >= 0 && y < this.height && this.grid[x][y] == playertoWin; connections++) {
						x += diagonalX;
						y += diagonalX * diagonalY;
					}
				}
				if (connections >= 3) {
					return true;
				}
			}
		}
		return false;
	},

	playerWonNew: function() {
		let vertical, horizontal, diagonal0, diagonal1, diagonal2;
		return Infinity;
	},

	playerTurn: function() {
		return 1 + this.numMoves % 2;
	},

	clean: function() {
		this.win = false;
		this.numMoves = this.popCount = 0;
		this.position = '';
		for (let i = 0; i < this.width; i++) {
			this.grid[i] = [0];
			for (let j = 0; j < this.height; j++) {
				this.grid[i][j] = 0;
			}
			this.columnHeight[i] = 0;
		}
		document.getElementById('game').style.backgroundColor = '#000000';
		this.drawToConsole();
	},

	reposition: function(pos) {
		this.clean();
		this.play(pos);
	},

	undoDrop: function() {
		if (this.position.length) {
			this.reposition(this.position.slice(0, -1));
		}
	},

	undoPop: function(column) {
		if (this.popOut && this.popCount) {
			for (let h = this.height; --h; ) {
				this.grid[column - 1][h] = this.grid[column - 1][h - 1];
			}
			this.grid[column - 1][0] = this.numMoves-- & 1 ? 1 : 2;
			this.columnHeight[column - 1]++;
			this.popCount--;
			this.position.slice(0, -1);
		}
	},

	drawToConsole: function() {
		let x, y, tempGrid = [];
		for (x = 0; x < this.height; x++) {
			tempGrid[x] = [0];
			for (y = 0; y < this.width; y++) {
				tempGrid[x][y] = 0;
			}
		}
		console.log('Current game position: ' + this.position + '\n' +
			(this.numMoves == this.width * this.height ? 'Draw!' :
				this.win ? this.numMoves % 2 === 1 ? 'Player 1 wins!' : 'Player 2 wins!':
				this.numMoves % 2 === 0 ? "Player 1's turn\n" : "Player 2's turn\n")
			);
		for (x = 0; x < this.height; x++) {
			for (y = 0; y < this.width; y++) {
				tempGrid[x][y] = this.grid[y][x];
			}
		}
		console.log(tempGrid.reverse());
	},
};

function UserInterface(width = 7, height = 6) {
	this.game = new ConnectFour(
		retrieveCookie('width') ? retrieveCookie('width') : width,
		retrieveCookie('height') ? retrieveCookie('height') : height
	);
	this.autoPlaySpeed = retrieveCookie('autoplay') ? retrieveCookie('autoplay') : 4;
	this.board = document.getElementById('game');
	this.draw = this.board.getContext('2d');
}

UserInterface.prototype = {
	update: function(updateSize) {
		document.getElementById('game').width = this.game.width * updateSize * updateSize * 2;
		document.getElementById('game').height = this.game.height * updateSize * updateSize * 2 + updateSize * updateSize * 2;
		document.getElementById('position').innerHTML = this.game.position;
		document.getElementById('gameSolver').href = 'http://connect4.gamesolver.org/?pos=' + this.game.position;
		document.getElementById('message').innerHTML = this.game.win ? this.winMessage() : this.status();
	},

	winMessage: function() {
		return this.game.playerTurn() == 2 ? 'Yellow wins!' : 'Red wins!';
	},

	status: function() {
		return this.game.numMoves == this.game.width * this.game.height ? 'Draw!' : this.game.playerTurn() == 1 ? "Yellow's turn" : "Red's turn";
	},

	drawGrid: function(size) {
		let background = this.draw.createLinearGradient(0, size * size * 2, 0, this.game.height * size * size * 2);
		background.addColorStop(0, '#4090f0');
		background.addColorStop(1, '#3060c0');
		this.draw.fillStyle = background;
		this.draw.lineWidth = 1;
		this.draw.fillRect(0, size * size * 2, this.game.width * size * size * 2, this.game.height * size * size * 2);
		this.draw.strokeRect(0, size * size * 2, this.game.width * size * size * 2, this.game.height * size * size * 2);
		for (let i = 0; i < this.game.width * 2; i += 2) {
			for (let j = 0; j < this.game.height * 2; j += 2) {
				this.drawEmptyDisc(i * size * size + size * size, j * size * size + size * size * 3, size);
			}
		}
		if (this.game.numMoves == this.game.width * this.game.height) {
			document.getElementById('game').style.backgroundColor = '#ff8000';
		}
	},

	drawEmptyDisc: function(x, y, r) {
		this.draw.fillStyle = '#1040a0';
		this.draw.beginPath();
		this.draw.arc(x, y, r * r, 0, 2 * Math.PI);
		this.draw.fill();
		this.draw.stroke();
		this.draw.closePath();
	},

	drawYellowDisc: function(x, y, r) {
		let yellow = this.draw.createRadialGradient(x, y, 0, x, y, r * r);
		yellow.addColorStop(0, '#fff080');
		yellow.addColorStop(2 / 3, '#fff000');
		yellow.addColorStop(1, '#808000');
		this.draw.fillStyle = yellow;
		this.draw.beginPath();
		this.draw.arc(x, y, r * r, 0, 2 * Math.PI);
		this.draw.fill();
		this.draw.stroke();
		this.draw.closePath();
	},

	drawRedDisc: function(x, y, r) {
		let red = this.draw.createRadialGradient(x, y, 0, x, y, r * r);
		red.addColorStop(0, '#ff8080');
		red.addColorStop(2 / 3, '#ff0000');
		red.addColorStop(1, '#800000');
		this.draw.fillStyle = red;
		this.draw.beginPath();
		this.draw.arc(x, y, r * r, 0, 2 * Math.PI);
		this.draw.fill();
		this.draw.stroke();
		this.draw.closePath();
	},

	toggleAutoplay: function() {
		for (let i = 0; i < document.getElementsByClassName('disabler').length; i++) {
			document.getElementsByClassName('disabler')[i].disabled = !document.getElementById('autoplayMode').checked;
		}
		if (!document.getElementById('autoplayMode').checked) {
			document.getElementsByClassName('settings')[0].style.display = 'none';
			document.getElementsByClassName('settingsButtons')[0].style.display = 'none';
		}
	},

	showAndHideSettings: function() {
		document.getElementsByClassName('settings')[0].style.display = document.getElementsByClassName('settings')[0].style.display == 'none' ? 'flex' : 'none';
		document.getElementsByClassName('settingsButtons')[0].style.display = document.getElementsByClassName('settingsButtons')[0].style.display == 'none' ? 'inline' : 'none';
		this.resetPrevious();
	},

	save: function() {
		this.autoPlaySpeed = document.getElementById('speed').value;
		this.game.width = document.getElementById('width').value;
		this.game.height = document.getElementById('height').value;
		document.getElementsByClassName('disabler')[0].maxLength = this.game.width * this.game.height;
		document.getElementsByClassName('settings')[0].style.display = 'none';
		document.getElementsByClassName('settingsButtons')[0].style.display = 'none';
		disc.radius = document.getElementById('size').value;
		disc.position = disc.radius * disc.radius;
		playColumn[1] = disc.radius * disc.radius * (playColumn[0] * 2 - 1);
		this.game.clean();
		initializeGrid();
		setCookies();
	},

	resetPrevious: function() {
		document.getElementById('speed').value = this.autoPlaySpeed;
		document.getElementById('width').value = this.game.width;
		document.getElementById('height').value = this.game.height;
		document.getElementById('size').value = disc.radius;
		disc.position = disc.radius * disc.radius;
		playColumn[1] = disc.radius * disc.radius * (playColumn[0] * 2 - 1);
		setCookies();
	},
};

var disc = {
	radius: undefined,
	position: undefined,
	width: [],
	height: [],
	xy: [],
};

var flag = {
	dropping: false,
	popping: false,
	autoplaying: false,
};

disc.radius = retrieveCookie('size') ? retrieveCookie('size') : 5;
disc.position = disc.radius * disc.radius;
var playColumn = [1, disc.position];
var ui = new UserInterface();
var c4 = ui.game;
setCookies();
document.getElementsByClassName('disabler')[0].maxLength = c4.width * c4.height;
document.getElementsByClassName('settings')[0].style.display = 'none';
document.getElementsByClassName('settingsButtons')[0].style.display = 'none';
ui.board.addEventListener('mousemove', moveDisc, false);
ui.toggleAutoplay();
initializeGrid();
setInterval(runUI, 1000 / 60);

function runUI() {
	ui.update(disc.radius);
	ui.drawGrid(disc.radius);
	if (c4.win) {
		document.getElementById('game').style.backgroundColor = c4.playerTurn() == 2 ? '#ffff00' : '#ff0000';
	}
	for (let p = 0; p < c4.numMoves; p++) {
		if (!(p % 2)) {
			ui.drawYellowDisc(disc.xy[p][0], disc.xy[p][1], disc.radius);
		}
		else {
			ui.drawRedDisc(disc.xy[p][0], disc.xy[p][1], disc.radius);
		}
	}
	if (c4.numMoves) {
		ui.draw.font = disc.radius * disc.radius + 'px Arial';
		ui.draw.fillStyle = '#000000';
		ui.draw.textAlign = 'center';
		ui.draw.fillText('x', disc.xy[c4.numMoves - 1][0], disc.xy[c4.numMoves - 1][1] + disc.radius * 2);
	}
	if (!c4.win && c4.numMoves != c4.width * c4.height) {
		if (c4.playerTurn() == 1) {
			ui.drawYellowDisc(disc.radius * disc.radius * (playColumn[0] * 2 - 1), disc.position, disc.radius);
		}
		else {
			ui.drawRedDisc(disc.radius * disc.radius * (playColumn[0] * 2 - 1), disc.position, disc.radius);
		}
	}
}

function initializeGrid() {
	for (let i = 0, j = c4.height * 2 + 1; j > 1; j -= 2) {
		disc.height[i++] = disc.radius * disc.radius * j;
	}

	for (let i = 0, j = 1; j <= c4.width * 2 - 1; j += 2) {
		disc.width[i++] = disc.radius * disc.radius * j;
	}

	for (let x = 0; x < c4.width * c4.height; x++) {
		disc.xy[x] = [disc.width[0], disc.height[0]];
	}
}

function moveDisc(event) {
	if (!flag.dropping && !flag.autoplaying) {
		playColumn = [
			Math.ceil(event.clientX / (disc.radius * disc.radius * 2)),
			disc.radius * disc.radius * (playColumn[0] * 2 - 1),
		];
	}
}

function dropDisc() {
	if (!(c4.win || !c4.canDrop(playColumn[0]))) {
		let dropRAF;
		flag.dropping = true;
		if (disc.position <	disc.height[c4.columnHeight[playColumn[0] - 1]] - disc.radius * disc.radius) {
			if (flag.dropping) {
				dropRAF = setTimeout(dropDisc, 1000 / 60);
				disc.position *= flag.autoplaying ? 1.4 : 1.2;
			}
		}
		else {
			clearTimeout(dropRAF);
			flag.dropping = false;
			c4.play(playColumn[0].toString());
			disc.position = disc.radius * disc.radius;
			disc.xy[c4.numMoves - 1] = [playColumn[1], disc.height[c4.columnHeight[playColumn[0] - 1] - 1]];
		}
	}
	else {
		flag.dropping = false;
		c4.drawToConsole();
	}
}

function popDisc() {
	if (!(c4.win || !c4.canDrop(playColumn[0]))) {
		// TODO: Finish the rest of the code
		let popRAF;
		flag.popping = true;
	}
	else {
		flag.popping = false;
		c4.drawToConsole();
	}
}

function playSequence(sequence) {
	let autoInterval;
	if (sequence.length) {
		flag.autoplaying = true;
		let move = 0;
		if (sequence[move] > '0' && sequence[move] <= c4.width) {
			document.getElementById('autoplayMessage').innerHTML = 'Autoplaying move sequence...';
			document.getElementsByClassName('disabler')[1].disabled = true;
			c4.clean();
			document.getElementById('game').style.backgroundColor = '#000000';
			autoInterval = setInterval(function() {
				if (move < sequence.length && sequence[move] <= c4.width && !c4.win) {
					playColumn[0] = parseInt(sequence[move++]);
					playColumn[1] = disc.radius * disc.radius * (playColumn[0] * 2 - 1);
					dropDisc();
				}
				else {
					document.getElementById('autoplayMessage').innerHTML = 'Autoplay finished.';
					document.getElementsByClassName('disabler')[1].disabled = false;
					flag.autoplaying = false;
					clearInterval(autoInterval);
				}
			}, 1000 / ui.autoPlaySpeed);
		}
		else {
			document.getElementById('autoplayMessage').innerHTML = 'Column index is out of range.';
			flag.autoplaying = false;
		}
	} else {
		document.getElementById('autoplayMessage').innerHTML = 'Cannot play an empty move sequence.';
		flag.autoplaying = false;
	}
}

function mouseClick(event) {
	if (!flag.autoplaying) {
		playColumn = [
			Math.ceil(event.clientX / (disc.radius * disc.radius * 2)),
			disc.radius * disc.radius * (Math.ceil(event.clientX / (disc.radius * disc.radius * 2)) * 2 - 1)
		];
	}
	switch (event.button) {
		case 0:
			if (c4.win || c4.numMoves == c4.width * c4.height) {
				c4.clean();
				document.getElementById('game').style.backgroundColor = '#000000';
			}
			else {
				if (!flag.dropping && !flag.autoplaying) {
					dropDisc();
				}
			}
			break;
		case 1:
			if (!flag.dropping && !flag.autoplaying) {
				c4.clean();
				document.getElementById('game').style.backgroundColor = '#000000';
			}
			break;
		case 2:
			if (!flag.dropping && !flag.autoplaying) {
				c4.undoDrop();
				document.getElementById('game').style.backgroundColor = '#000000';
			}
	}
}

function setCookies() {
	document.cookie = 'autoplay=' + ui.autoPlaySpeed;
	document.cookie = 'width=' + c4.width;
	document.cookie = 'height=' + c4.height;
	document.cookie = 'size=' + disc.radius;
}

function retrieveCookie(name) {
	let pairs = document.cookie.split('; '), key, value;
	for (let i = 0; i < pairs.length; i++) {
		key = pairs[i].split('=')[0];
		value = pairs[i].split('=')[1];
		if (key == name) {
			return parseInt(value);
		}
	}
}
