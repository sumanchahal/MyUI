var LEXUS = LEXUS || {};

/**
 * Controls all the loading animations for the page.
 * These animations are loaded as png sprites and animated using js.
 * The animation timer runs for all animations automatically so they can be
 * treated more or less like animated gifs.
 */
if (typeof LEXUS.loadingAnimation !== "function") {
    LEXUS.loadingAnimation = (function() {
        /** Width of each animation frame (assumes the frames are all in one row) */
        var SPRITE_WIDTH = 50,

            /** Number of frames per second **/
            FRAMERATE = 20,

            /** total frames in the animation **/
            FRAMES = 22,

            LOOP = FRAMES * SPRITE_WIDTH,
            FRAME_LENGTH = 1 / FRAMERATE * 1000,
            animations = [],
            interval,
            currentFrame = 0;

        /**
            Called each frame to update the animations.
            Does nothing if no animations are registered.
        */

        function update() {
            if (animations.length < 1) {
                return;
            }
            currentFrame = (currentFrame + 1) % FRAMES;
            var x = (currentFrame * SPRITE_WIDTH * -1) + "px";

            var i = animations.length - 1,
                animation;
            for (; i >= 0; i -= 1) {
                animation = animations[i];
                if (animation && animation.style) {
                    animation.style.backgroundPosition = x + ' 0px';
                }
            }
        }

        /**
         * Stop all animations.
         */

        function stop() {
            clearInterval(interval);
        }

        /**
         * Start all animations.
         * Cancels previous animation if one was already started.
         */

        function start() {
            if (interval) {
                stop();
            }
            interval = setInterval(function() {
                update();
            }, FRAME_LENGTH);
        }

        /**
         * Register an animation sprite to be handled by js.
         * Also starts all the animations.
         * @param id {String} id of the animation dom element
         */

        function register(id) {
            animations[animations.length] = id;
            start();
        }

        /**
         * Unregister an animation sprite. It will no longer animate.
         * @param id {String} id of the animation dom element
         */

        function unregister(id) {
            var i = animations.indexOf(id);
            if (i >= 0) {
                animations.splice(i, 1);
            }
        }

        // public methods to return
        return {
            start: start,
            stop: stop,
            register: register,
            unregister: unregister
        };
    })();
} else {
    console.warn('Only one instance of LEXUS.loadingAnimation should be instantiated!');
}
