import animate;
import ui.View;
import ui.ImageView;


exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, {
			width: 96,
			height: 96
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.drawNewLevel = function () {

	};

	this.checkLines = function () {
		// body...
	}

	this.checkGemNeighbors = function (gemType, position) {

	};

	this.swapGems = function (a, aID, b, bID) {
		// search all the neighbors
		// if can match, swap and remove gems


		// otherwise swap twice

	};

	this.animateRemoveGems = function (position) {
		// body...
	};

	// if no gem left, move to next level
	this.cleartoNextLevel = function (gemToRemove) {
		// body...
	};


	/*
	 *
	 */
	this.build = function () {
	};


})