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
import src.gameplay as Gameplay;
// import ui.GestureView as GestureView;
import event.input.drag as Drag;

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
var dimH = 7;
var dimW = 6;
for (var i = 0; i < dimH; i++) {
	var line = [];
	matrix.push(line);
};
var x_offset = 0;
var y_offset = 290;

var score = 0,
		high_score = 1,
		hit_value = 1,
		game_on = false,
		game_length = 20000, //20 secs
		countdown_secs = game_length / 1000,
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
			image: "resources/images/ui/background.png"
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
			// image: "resources/images/ui/header.png",
			autoSize: false,
			size: 38,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			// color: '#FFFFFF'
		});

		this.style.width = 576;
		this.style.height = 1024;

		// // // ViewPool
		this.gemViewPool = new ViewPool({
			ctor: ImageView,
			initCount: dimH * dimW,
			initOpts: {
				parent: this,
				x: 0,
				y: 0,
				width: IMG_SIZE,
				height: IMG_SIZE,
				image: gemImg[Math.round(Math.random() * 4.0)]
			}
		});

		// create random gems
		for (var j = 0; j < dimH; j++) {
			for (var i = 0; i < dimW; i++) {
				var gem = this.gemViewPool.obtainView();
				var index = Math.round(Math.random() * 4.0);
				var tagx = index.toString();
				matrix[j].push(gem);
				gem.updateOpts({
					superview: this.backgroundView,
					x: x_offset + i * IMG_SIZE,
					y: y_offset + j * IMG_SIZE,
					tag: tagx,
					width: IMG_SIZE,
					height: IMG_SIZE,
					image: gemImg[index]
				});
				var animator = animate(gem).now({y: 0}, 0, animate.easeIn).then({y: y_offset + j * IMG_SIZE}, 500, animate.easeIn);
				console.log("animate 1111...\n");
			}
		}
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
 */

function play_game () {
	var that = this;
	this._scoreboard.setText(score.toString());
	tick.call(that);

}

function addNewGems (i, j, count, dir) {
	console.log("add new gem...\n");
	if (dir === "horizontal") {
		// generate new gems at (0, j - count + 1) ~ (0, j)
		for (var m = j - count + 1; m <= j; m++) {
			var newgem;
			try{
				newgem = this.gemViewPool.obtainView();
			} catch(err) {
				console.log(this);
			}
			// var newgem = this.gemViewPool.obtainView();
			var index = Math.round(Math.random() * 4.0);
			var tagx = index.toString();
			matrix[0][m] = newgem;
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
			var animator = animate(newgem).now({y: 0}, 0).then({y: y_offset}, 900, animate.easeIn);
		};
	}
	if (dir === "vertical") {
		// generate new gems at (0, j) ~ (count - 1, j)
		for (var m = count - 1; m >= 0; m--) {
			var newgem = this.gemViewPool.obtainView();
			var index = Math.round(Math.random() * 4.0);
			var tagx = index.toString();
			matrix[m][j] = newgem;
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
			var animator = animate(newgem).now({y: 0}, 0).then({y: y_offset + m * IMG_SIZE}, 900, animate.easeIn);
		}
	}
}

/*
 * gems fall to fill any gaps
 * add new gems at the top
 */
function fillHole (i, j, count, dir) {
	// var that = this;
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
				theGem.updateOpts({
					y: gemy + IMG_SIZE
				});
				animator = animate(theGem).now({y: gemy}, 0, animate.easeIn).then({y: theGem.style.y}, 750, animate.easeIn).wait(500);
				matrix[row + 1][col] = theGem;
			}
		}
	}
	if (dir === "vertical") {
		// update (0, j) ~ (i - count, j)
		for (var row = i - count; row >= 0; row--) {
			var theGem = matrix[row][j];
			var gemy = theGem.style.y;
			theGem.updateOpts({
				y: gemy + IMG_SIZE * count
			});
			animator = animate(theGem).now({y: gemy}, 0, animate.easeIn)
			.then({y: theGem.style.y}, 750, animate.easeIn).wait(500);
		}
	}
	addNewGems.call(this, i, j, count, dir);
}

/*
 * check vertical connected gems and remove
 * add new gems and fill the holes
 * check horizontal connected gems and remove
 * add new gems and fill the holes
 * keep check connected gems until no match exist
 */

function tick () {
	var that = this;
	var count = 1;
	var tempArray = [];
	console.log("Tick...\n");
	var checkflag = false;
	var viewpool = this.gemViewPool;
	var animator;
	// scan the matrix
	// horizontal
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
					tempArray.forEach(function (view) {
						animator = animate(view).now({x: view.style.x + IMG_SIZE/2, y: view.style.y + IMG_SIZE/2, opacity: 0.1, scale: 0.2}, 550)
						.then(bind(this, function() {
							viewpool.releaseView(view);
						}));
					});
					checkflag = true;
					//fill the holes
					if (currGem.tag !== matrix[i][j].tag) {
						fillHole.call(this, i, j - 1, count, "horizontal");
					} else {
						fillHole.call(this, i, j, count, "horizontal");
					}
					// break;
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

	// vertical
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
					tempArray.forEach(function (view) {
						animate(view).now({x: view.style.x + IMG_SIZE/2, y: view.style.y + IMG_SIZE/2, opacity: 0.1, scale: 0.2}, 550)
						.then(bind(this, function() {
							viewpool.releaseView(view);
						}));
					});
					checkflag = true;
					// fill the holes
					if (currGem.tag !== matrix[i][j].tag) {
						fillHole.call(this, i - 1, j, count, "vertical");
					} else {
						fillHole.call(this, i, j, count, "vertical");
					}
					// break;
				}
				currGem = matrix[i][j];
				count = 1;
				tempArray = [];
				tempArray.push(currGem);
			}
		}
	}

	if (checkflag) {
		setTimeout(function(){
			console.log("tick again...");
				tick.call(that);
			}, 10000);
	}
}

/* Check for high-score and play the ending animation.
 * Add a click-handler to the screen to return to the title
 * screen so we may play again.
 */
function end_game_flow () {
	// var isHighScore = (score > high_score),
	// 		end_msg = get_end_message(score, isHighScore);

	// this._countdown.setText(''); //clear countdown text
	// //resize scoreboard text to fit everything
	// this._scoreboard.updateOpts({
	// 	text: '',
	// 	x: 10,
	// 	fontSize: 17,
	// 	verticalAlign: 'top',
	// 	textAlign: 'left',
	// 	multiline: true
	// });

	//check for high-score and do appropriate animation
	// if (isHighScore) {
	// 	high_score = score;
	// 	this._molehills.forEach(function (molehill) {
	// 		molehill.endAnimation();
	// 	});
	// } else {
	// 	var i = (this._molehills.length-1) / 2 | 0; //just center mole
	// 	this._molehills[i].endAnimation(true);
	// }

	// this._scoreboard.setText(end_msg);

	// //slight delay before allowing a tap reset
	setTimeout(emit_endgame_event.bind(this), 2000);
	// console.log('end game flow.. \n');
}

/* Tell the main app to switch back to the title screen.
 */
function emit_endgame_event () {
	this.once('InputSelect', function () {
		this.emit('gamescreen:end');
		// reset_game.call(this);
	});
}

/* Reset game counters and assets.
 */
// function reset_game () {
// 	score = 0;
// 	countdown_secs = game_length / 1000;
// 	this._scoreboard.setText('');
// 	this._molehills.forEach(function (molehill) {
// 		molehill.resetMole();
// 	});
// 	this._scoreboard.updateOpts({
// 		x: 0,
// 		fontSize: 38,
// 		verticalAlign: 'middle',
// 		textAlign: 'center',
// 		multiline: false
// 	});
// 	this._countdown.updateOpts({
// 		visible: false,
// 		color: '#fff'
// 	});
// }

/*
 * Strings
 */

// function get_end_message (score, isHighScore) {
// 	var moles = (score === 1) ? text.MOLE : text.MOLES,
// 			end_msg = text.END_MSG_START + ' ' + score + ' ' + moles + '.\n';

// 	if (isHighScore) {
// 		end_msg += text.HIGH_SCORE + '\n';
// 	} else {
// 		//random taunt
// 		var i = (Math.random() * text.taunts.length) | 0;
// 		end_msg += text.taunts[i] + '\n';
// 	}
// 	return (end_msg += text.END_MSG_END);
// }

var localized_strings = {
	en: {
		READY: "Ready ...",
		SET: "Set ...",
		GO: "GO!",
		END_MSG_START: "You whacked",
		END_MSG_END: "Tap to play again",
		HIGH_SCORE: "That's a new high score!"
	}
};

// localized_strings['en'].taunts = [
// 	"Welcome to Loserville, population: you.", //max length
// 	"You're an embarrassment!",
// 	"You'll never catch me!",
// 	"Your days are numbered, human.",
// 	"Don't quit your day job.",
// 	"Just press the screen, it's not hard.",
// 	"You might be the worst I've seen.",
// 	"You're just wasting my time.",
// 	"Don't hate the playa, hate the game.",
// 	"Make like a tree, and get out of here!"
// ];

// //object of strings used in game
var text = localized_strings[lang.toLowerCase()];
