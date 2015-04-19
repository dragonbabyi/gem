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

/* Some game constants.
 */

var purpleGem = new Image({url: "resources/images/gems/gem_01.png"}),
    orangeGem = new Image({url: "resources/images/gems/gem_02.png"}),
	blueGem   = new Image({url: "resources/images/gems/gem_03.png"}),
	redGem    = new Image({url: "resources/images/gems/gem_04.png"}),
	greenGem  = new Image({url: "resources/images/gems/gem_05.png"}),
	gemImg = [purpleGem, orangeGem, blueGem, redGem, greenGem];

var IMG_SIZE = 96;

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

		// // ViewPool
		this.gemViewPool = new ViewPool({
			ctor: ImageView,
			initCount: 36,
			initOpts: {
				parent: this,
				x: 0,
				y: 0,
				width: IMG_SIZE,
				height: IMG_SIZE,
				image: gemImg[Math.round(Math.random() * 4.0)]
			}
		});

		var x_offset = 0;
		var y_offset = 290;

		// create random gems
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 6; j++) {
				var gem = this.gemViewPool.obtainView();
				gem.updateOpts({
					superview: this.backgroundView,
					x: x_offset + i * IMG_SIZE,
					y: y_offset + j * IMG_SIZE,
					width: IMG_SIZE,
					height: IMG_SIZE,
					image: gemImg[Math.round(Math.random() * 4.0)]
				});
			}
		}
		// animate(gem).now().then(bind(this, function() {
		// 	// 
		// 	// this.imageViewPool.releaseView(view);
		// }));
	};
});

/*
 * Game play
 */

/* Manages the intro animation sequence before starting game.
 */
function start_game_flow () {
	var that = this;

	// animate(that._scoreboard).wait(1000)
	// 	.then(function () {
	// 		that._scoreboard.setText(text.READY);
	// 	}).wait(1500).then(function () {
	// 		that._scoreboard.setText(text.SET);
	// 	}).wait(1500).then(function () {
	// 		that._scoreboard.setText(text.GO);
	// 		//start game ...
	// 		game_on = true;
	// 		play_game.call(that);
	// 		console.log("play game...\n");
	// 	});

		// //start game ...
		// game_on = true;
		// play_game.call(that);
		// console.log("play game...\n");
}

/* With everything in place, the actual game play is quite simple.
 * Summon a non-active mole every n seconds. If it's hit, an event
 * handler on the molehill updates the score. After a set timeout,
 * stop calling the moles and proceed to the end game.
 */

// function play_game () {

// }

/* Check for high-score and play the ending animation.
 * Add a click-handler to the screen to return to the title
 * screen so we may play again.
 */
// function end_game_flow () {
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
	// setTimeout(emit_endgame_event.bind(this), 2000);
	// console.log('end game flow.. \n');
// }

/* Tell the main app to switch back to the title screen.
 */
// function emit_endgame_event () {
// 	this.once('InputSelect', function () {
// 		this.emit('gamescreen:end');
// 		// reset_game.call(this);
// 	});
// }

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

// var localized_strings = {
// 	en: {
// 		READY: "Ready ...",
// 		SET: "Set ...",
// 		GO: "GO!",
// 		END_MSG_START: "You whacked",
// 		END_MSG_END: "Tap to play again",
// 		HIGH_SCORE: "That's a new high score!"
// 	}
// };

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
// var text = localized_strings[lang.toLowerCase()];
