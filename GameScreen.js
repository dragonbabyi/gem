/*
 * The game screen is a singleton view that consists of
 * a scoreboard and a collection of molehills.
 */

import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import ui.TextView as TextView;
import ui.ViewPool as ViewPool;
import event.input.InputEvent as InputEvent;
import src.soundcontroller as soundcontroller;

/* Some game constants.
 */
var purpleGem = new Image({url: "resources/images/gems/gem_01.png"}),
    orangeGem = new Image({url: "resources/images/gems/gem_02.png"}),
	blueGem   = new Image({url: "resources/images/gems/gem_03.png"}),
	redGem    = new Image({url: "resources/images/gems/gem_04.png"}),
	greenGem  = new Image({url: "resources/images/gems/gem_05.png"}),
	gemImg = [purpleGem, orangeGem, blueGem, redGem, greenGem];

var IMG_SIZE = 96;
var matrix = [];
var dimH = 6,
	dimW = 6;
for (var i = 0; i < dimH; i++) {
	var line = [];
	matrix.push(line);
};
var tickflag1 = true,
	tickflag2 = true;
var iteration = -1;
var x_offset = 0,
	y_offset = 290;
var flag = false,   // no selection
	moveonceflag = false;

var score = 0,
	high_score = 1,
	game_on = false,
	moveCountdown = 2,
	lang = 'en';

/* The GameScreen view is a child of the main application.
 * By adding the scoreboard and the molehills as it's children,
 * everything is visible in the scene graph.
 */
exports = Class(View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			width: 576,
			height: 1024
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	/*
	 * Layout the scoreboard and molehills.
	 */
	this.build = function () {
		/* The start event is emitted from the start button via the main application.
		 */
		this.on('app:start', start_game_flow.bind(this));

		this.backgroundView = new ImageView({
			superview: this,
			x: 0,
			y: 0,
			width: this.style.width,
			height: this.style.height,
			image: "resources/images/ui/background.png",
			canHandleEvents: false
		});

		/* The scoreboard displays the "ready, set, go" message,
		 * the current score, and the end game message. We'll set
		 * it as a hidden property on our class since we'll use it
		 * throughout the game.
		 */
		this._scoreboard = new TextView({
			superview: this,
			x: 0,
			y: 0,
			width: 576,
			height: 150,
			autoSize: false,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			canHandleEvents: false
		});

		this.style.width = 576;
		this.style.height = 1024;

		// sound
		this.sound = soundcontroller.getSound();

		// ViewPool
		this.gemViewPool = new ViewPool({
			ctor: ImageView,
			initCount: dimH * dimW,
			initOpts: {
				// parent: this,
				parent: this.backgroundView,
				x: 0,
				y: 0,
				width: IMG_SIZE,
				height: IMG_SIZE,
				image: gemImg[Math.round(Math.random() * 4.0)]
			}
		});

		var that = this;
		// create random gems
		for (var h = 0; h < dimH; h++) {
			for (var i = 0; i < dimW; i++) {
				var gem = this.gemViewPool.obtainView();
				var index = Math.round(Math.random() * 4.0);
				var tagx = index.toString();
				matrix[h].push(gem);
				var animator = animate(gem).now({y: 0}, 0, animate.easeIn).then({y: y_offset + h * IMG_SIZE}, 500, animate.easeIn);
				gem.updateOpts({
					superview: this.backgroundView,
					x: x_offset + i * IMG_SIZE,
					y: y_offset + h * IMG_SIZE,
					tag: tagx,
					width: IMG_SIZE,
					height: IMG_SIZE,
					image: gemImg[index]
				});
				// input select
				gem.on("InputStart", function (event, pt) {
					// only select new if last select ended
					if (!flag) {
						flag = true;
					}
					// console.log(this.getTag() + "   selectedddd");
				});
				gem.on("InputMove", function (event, pt) {
					var pos = {x: this.style.x, y: this.style.y};
					// compute the matrix index from pos
					var col = Math.round((pos.x - x_offset) / IMG_SIZE);
					var row = Math.round((pos.y - y_offset) / IMG_SIZE);
					if (flag && !moveonceflag) {
						var dx = pt.x - IMG_SIZE / 2;
						var dy = pt.y - IMG_SIZE / 2;
						if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
							///// swap /////
							swapGems.call(that, dx, dy, row, col);
							moveonceflag = true;
						}
					}
				});
				gem.on("InputSelect", function (event, pt){
					// console.log("unselect");
					flag = false;
					moveonceflag = false;
				});
			}
		}

		//Set up move countdown
		this._countdown = new TextView({
			superview: this.backgroundView,
			visible: true,
			x: 0,
			y: 866,
			width: 576,
			height: 150,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
		});

		this._endscreen = new ImageView({
			superview: this.backgroundView,
			visible: false,
			x: 125,
			y: 0,   // animate start point
			width: 350,
			height: 233,
			image: "resources/images/ui/header.png",
			canHandleEvents: false
		});
	};
});

/*
 * Game play
 */

/* Manages the intro animation sequence before starting game.
 */
function start_game_flow () {

	var that = this;

	animate(that._scoreboard).wait(1000)
		.then(function () {
			that._scoreboard.setText(text.READY);
		}).wait(500).then(function () {
			that._scoreboard.setText(text.SET);
		}).wait(500).then(function () {
			that._scoreboard.setText(text.GO);
		}).wait(100).then(function () {
			//start game ...
			game_on = true;
			console.log("play game...\n");
			play_game.call(that);
		});
}

/*
 * start the game
 */

function keepTicking () {
	var that = this;
	var nIntervId = setInterval(function () {
		tick.call(that);
		console.log(tickflag1, tickflag2);
		if (!tickflag1 && !tickflag2) {
			clearInterval(nIntervId);
		}
	}, 750);

}

function play_game () {
	var that = this;
	var i = setInterval(update_score.bind(this), 100),
		j = setInterval(update_countdown.bind(this), 100);

	keepTicking.call(that);

	var gameInterval = setInterval(function () {
		if (moveCountdown == 0) { // end of game
			game_on = false;
			end_game_flow.call(that);
			clearInterval(i);
			clearInterval(j);
			clearInterval(gameInterval);
		}
	}, 100);
}

function update_countdown () {
	this._countdown.setText("Moves left: " + moveCountdown.toString());
}

function update_score () {
	this._scoreboard.setText("Score: " + score.toString());
}

/*
 * Check if there is valid match after a swap
 */
function isValidSwap (row, col) {
	// gem type
	var gemType = matrix[row][col].tag;
	// at most 6 checks
	if (row - 2 >= 0 && matrix[row - 2][col].tag == gemType && matrix[row - 1][col].tag == gemType) {
		return true;
	}
	if (row - 1 >= 0 && row + 1 < dimH && matrix[row - 1][col].tag == gemType && matrix[row + 1][col].tag == gemType) {
		return true;
	}
	if (row + 2 < dimH && matrix[row + 1][col].tag == gemType && matrix[row + 2][col].tag == gemType) {
		return true;
	}
	if (col - 2 >= 0 && matrix[row][col - 2].tag == gemType && matrix[row][col - 1].tag == gemType) {
		return true;
	}
	if (col - 1 >= 0 && col + 1 < dimW && matrix[row][col - 1].tag == gemType && matrix[row][col + 1].tag == gemType) {
		return true;
	}
	if (col + 2 < dimW && matrix[row][col + 1].tag == gemType && matrix[row][col + 2].tag == gemType) {
		return true;
	}
	return false;
}

/**
 * Animate the swap of two gems.
 */
function swap (thisGem, nextGem, thisX, thisY, nextX, nextY) {
	// make a copy of the positions
	var thisopts = {
		x: thisGem.style.x,
		y: thisGem.style.y
	};
	var nextopts = {
		x: nextGem.style.x,
		y: nextGem.style.y
	};
	// update the matrix
	matrix[thisX][thisY] = nextGem;
	matrix[nextX][nextY] = thisGem;

	// check valid swap
	var checkflag = isValidSwap(thisX, thisY) || isValidSwap(nextX, nextY);

	// if not, swap back
	if (!checkflag) {
		console.log("invalid, swap around...");
		// roll back the changes on matrix
		matrix[thisX][thisY] = thisGem;
		matrix[nextX][nextY] = nextGem;

		// animate swap around
		animate(thisGem).now({x: nextopts.x + IMG_SIZE / 10, y: nextopts.y + IMG_SIZE / 10, scale: 0.8, opacity: 0.8}, 300).then({x: thisopts.x, y: thisopts.y, scale: 1.0, opacity: 1.0}, 300, animate.easeInQuart);
		animate(nextGem).now({x: thisopts.x + IMG_SIZE / 10, y: thisopts.y + IMG_SIZE / 10, scale: 0.8, opacity: 0.8}, 300).then({x: nextopts.x, y: nextopts.y, scale: 1.0, opacity: 1.0}, 300, animate.easeInQuart);
	} else {
		// update moves count down
		moveCountdown--;
		// update the gems
		thisGem.updateOpts(nextopts);
		nextGem.updateOpts(thisopts);

		console.log("swap");
		var animGroup = animate.getGroup('Swap');
		animate(thisGem, 'Swap').now({x: thisopts.x + IMG_SIZE / 10, y: thisopts.y + IMG_SIZE / 10, scale: 0.8, opacity: 0.8}, 300).then({x: nextopts.x, y: nextopts.y, scale: 1.0, opacity: 1.0}, 300, animate.easeInQuart);
		animate(nextGem, 'Swap').now({x: nextopts.x + IMG_SIZE / 10, y: nextopts.y + IMG_SIZE / 10, scale: 0.8, opacity: 0.8}, 300).then({x: thisopts.x, y: thisopts.y, scale: 1.0, opacity: 1.0}, 300, animate.easeInQuart);
	}

	return checkflag;
}

/*
 * Swap gems. Check swap direction.
 */
function swapGems (dx, dy, i, j) {
	var that = this;
	console.log("swapGems...");
	var direction;
	var tanTheta = dy / dx;
	// console.log(dx, dy);
	// check direction
	if (Math.abs(dx) < 0.1 || Math.abs(tanTheta) > 1) {
		if (dy > 0) {
			direction = [1, 0];
		} else {
			direction = [-1, 0];
		}
	}
	else if (dx >= 0.1) {
		direction = [0, 1];
	}
	else {
		direction = [0, -1];
	}
	// console.log(direction);

	var thisGem = matrix[i][j];
	var nextX = direction[0] + i;
	var nextY = direction[1] + j;
	if (nextX >= 0 && nextX < dimW && nextY >= 0 && nextY < dimH) {
		var nextGem = matrix[nextX][nextY];
		if (nextGem == undefined) {
			console.log("Next gem undefined.\n" + thisGem);
		}
		// animate swap
		var checkflag = swap(thisGem, nextGem, i, j, nextX, nextY);

		if (checkflag) {
			tickflag1 = true;
			tickflag2 = true;
			keepTicking.call(that);
		}
	}
}

/*
 * Add new gems after removing the matches.
 */
function addNewGems (i, j, count, dir) {
	console.log("add new gem...\n");
	var that = this;
	var animator;
	if (dir === "horizontal") {
		// generate new gems at (0, j - count + 1) ~ (0, j)
		for (var m = j - count + 1; m <= j; m++) {
			var newgem = this.gemViewPool.obtainView();
			var index = Math.round(Math.random() * 4.0);
			var tagx = index.toString();
			matrix[0][m] = newgem;

			setTimeout((function () {
				newgem.updateOpts({
					superview: this.backgroundView,
					x: x_offset + m * IMG_SIZE,
					y: y_offset,
					opacity: 1.0,
					scale: 1.0,
					tag: tagx,
					width: IMG_SIZE,
					height: IMG_SIZE,
					image: gemImg[index]
				});
			}).call(that), 350);

			animator = animate(newgem).now({y: y_offset - IMG_SIZE}, 0).then({y: y_offset}, 350, animate.easeIn);
		};
	}
	if (dir === "vertical") {
		// generate new gems at (0, j) ~ (count - 1, j)
		for (var m = count - 1; m >= 0; m--) {
			var newgem = this.gemViewPool.obtainView();
			var index = Math.round(Math.random() * 4.0);
			var tagx = index.toString();
			matrix[m][j] = newgem;

			setTimeout((function () {
				newgem.updateOpts({
					superview: this.backgroundView,
					x: x_offset + j * IMG_SIZE,
					y: y_offset + m * IMG_SIZE,
					opacity: 1.0,
					scale: 1.0,
					tag: tagx,
					width: IMG_SIZE,
					height: IMG_SIZE,
					image: gemImg[index]
				});
			}).call(that), 350);

			animator = animate(newgem).now({y: y_offset - IMG_SIZE}, 0).then({y: y_offset + m * IMG_SIZE}, 350, animate.easeIn);
		}
	}
}

/*
 * gems fall to fill any gaps
 * add new gems at the top
 */
function fillHole (i, j, count, dir) {
	var that = this;
	console.log("Fill holes...\n");
	var animator;
	// update the matrix and gems
	if (dir === "horizontal") {
		// update (0~i, j - count + 1) ~ (0~i, j), move down one step
		for (var row = i - 1; row >= 0; row--) {
			for (var col = j; col >= j - count + 1; col--) {
				var theGem = matrix[row][col];
				// update the gem
				var gemy = theGem.style.y;

				setTimeout((function () {
					theGem.updateOpts({
						y: gemy + IMG_SIZE
					});
				}).call(that), 350);

				animator = animate(theGem).now({y: gemy}, 0, animate.easeIn).then({y: theGem.style.y}, 350, animate.easeIn);
				matrix[row + 1][col] = theGem;
			}
		}
	}
	if (dir === "vertical") {
		// update (0, j) ~ (i - count, j)
		for (var row = i - count; row >= 0; row--) {
			var theGem = matrix[row][j];
			var gemy = theGem.style.y;

			setTimeout((function () {
				theGem.updateOpts({
					y: gemy + IMG_SIZE * count
				});
			}).call(that), 450);

			animator = animate(theGem).now({y: gemy}, 0, animate.easeIn).then({y: theGem.style.y}, 450, animate.easeIn);
			matrix[row + count][j] = theGem;
		}
	}

	addNewGems.call(this, i, j, count, dir);
}

/*
 * Tick every time need to update
 * check vertical or horizontal  connected gems and remove
 * add new gems and fill the holes
 */
function tick () {
	var that = this;
	// parent scope iteration
	iteration = (iteration + 1) % 2;

	var count = 1;
	var tempArray = [];
	console.log("Tick...");

	var viewpool = this.gemViewPool;
	var animator;
	// scan the matrix
	if (Math.round(iteration % 2) == 0) {
		// horizontal
		console.log("horizontal");
		tickflag1 = true;
		for (var i = 0; i < dimH; i++) {
			var currGem = matrix[i][0];
			count = 1;
			tempArray = [];
			tempArray.push(currGem);
			for (var j = 1; j < dimW; j++) {
				if (currGem.tag === matrix[i][j].tag) {
					count++;
					tempArray.push(matrix[i][j]);
				}
				if (currGem.tag !== matrix[i][j].tag || j == dimW - 1) {
					if (count >= 3) {
						// update score
						score += count * 10;
						this.sound.play('effect');

						tempArray.forEach(function (view) {
							animator = animate(view).wait(50).then({x: view.style.x + IMG_SIZE/2, y: view.style.y + IMG_SIZE/2, opacity: 0.1, scale: 0.2}, 300)
							.then(function () {
								viewpool.releaseView(view);
							});
						});

						//fill the holes
						if (currGem.tag !== matrix[i][j].tag) {
							fillHole.call(this, i, j - 1, count, "horizontal");
						} else {
							fillHole.call(this, i, j, count, "horizontal");
						}
						return;
					}
					// set the currGem to the new gem
					currGem = matrix[i][j];
					count = 1;
					// reset the temp array and push the new gem
					tempArray = [];
					tempArray.push(currGem);
				}
			}
		}

		tickflag1 = false;
	}
	else {
		// vertical
		console.log("vertical");
		tickflag2 = true;
		for (var j = 0; j < dimW; j++) {
			var currGem = matrix[0][j];
			count = 1;
			tempArray = [];
			tempArray.push(currGem);
			for (var i = 1; i < dimH; i++) {
				if (currGem.tag === matrix[i][j].tag) {
					count++;
					tempArray.push(matrix[i][j]);
				}
				if (currGem.tag !== matrix[i][j].tag || i == dimH - 1) {
					if (count >= 3) {
						// update score
						score += count * 10;
						this.sound.play('effect');

						tempArray.forEach(function (view) {
							animate(view).wait(50).then({x: view.style.x + IMG_SIZE/2, y: view.style.y + IMG_SIZE/2, opacity: 0.1, scale: 0.2}, 300)
							.then(bind(this, function() {
								viewpool.releaseView(view);
							}));
						});

						// fill the holes
						if (currGem.tag !== matrix[i][j].tag) {
							fillHole.call(this, i - 1, j, count, "vertical");
						} else {
							fillHole.call(this, i, j, count, "vertical");
						}
						return;
					}
					currGem = matrix[i][j];
					count = 1;
					tempArray = [];
					tempArray.push(currGem);
				}
			}
		}

		tickflag2 = false;
	}
}

/* Check for high-score and play the ending animation.
 * Add a click-handler to the screen to return to the title
 * screen so we may play again.
 */
function end_game_flow () {
	console.log("end...");
	// block all the event to gems
	this.backgroundView.updateOpts({
		blockEvents: true
	});
	// disable scoreboard
	this._scoreboard.updateOpts({
		visible: false
	});
	// show end screen
	this._endscreen.updateOpts({
		visible: true,
		canHandleEvents: true
	});
	var animator = animate(this._endscreen).wait(800).then({y: 0}, 100, animate.easeIn).then({y: 35}, 1000, animate.easeIn);

	// show score
	var scoreText = new TextView({
		superview: this._endscreen,
		x: 0,
		y: 35,   // endscreen animate end point
		width: 350,
		height: 233,
		autoSize: true,
		text: "You achieved " + score.toString(),
		size: 38,
		verticalAlign: 'middle',
		horizontalAlign: 'center',
		canHandleEvents: false
	});
	// //slight delay before allowing a tap reset
	setTimeout(emit_endgame_event.bind(this), 2000);
	console.log('end game flow.. \n');
}

/* Tell the main app to switch back to the title screen.
 */
function emit_endgame_event () {
	this.once('InputSelect', function () {
		this.emit('gamescreen:end');
		reset_game.call(this);
	});
}

/* Reset game counters and assets.
 */
function reset_game () {
	score = 0;
	moveCountdown = 5;

	this._scoreboard.updateOpts({
		visible: true,
		text: ""
	});
	this._countdown.updateOpts({
		visible: false,
	});
	this._endscreen.updateOpts({
		x: 125,
		y: 0,
		visible: false,
		canHandleEvents: false
	});
}

var localized_strings = {
	en: {
		READY: "Ready ...",
		SET: "Set ...",
		GO: "GO!",
		HIGH_SCORE: "That's a new high score!"
	}
};

// //object of strings used in game
var text = localized_strings[lang.toLowerCase()];
