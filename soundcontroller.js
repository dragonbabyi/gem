import AudioManager;

exports.sound = null;

/* Initialize the audio files if they haven't been already.
 */
exports.getSound = function () {
  if (!exports.sound) {
    exports.sound = new AudioManager({
      path: 'resources/audio',
      files: {
        levelmusic: {
          volume: 0.5,
          background: true,
          loop: true
        },
        effect: {
          background: false
        }
      }
    });
  }
  return exports.sound;
};
