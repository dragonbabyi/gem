/*
 * The title screen consists of a background image and a
 * start button. When this button is pressed, and event is
 * emitted to itself, which is listened for in the top-level
 * application. When that happens, the title screen is removed,
 * and the game screen shown.
 */

import ui.View as View;
import ui.ImageView as ImageView;

/* The title screen is added to the scene graph when it becomes
 * a child of the main application. When this class is instantiated,
 * it adds the start button as a child.
 */
exports = Class(ImageView, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			image: "resources/images/ui/title_screen.png"
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.build = function() {
		/* Since the start button is a part the background image,
		 * we just need to create and position an overlay view that
		 * will register input events and act as button.
		 */
		var startbutton = new View({
			superview: this,
			x: 125,
			y: 675,
			width: 350,
			height: 180
		});

		/* Listening for a touch or click event, and will dispatch a
		 * custom event to the title screen, which is listened for in
		 * the top-level application file.
		 */
		startbutton.on('InputSelect', bind(this, function () {
			this.emit('titlescreen:start');
		}));
	};
});
