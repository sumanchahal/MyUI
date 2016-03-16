/**
 * Home page tile animation.
 *
 * Tiles can be either 'auto-play' or normal. If they're autoplay, they will play once
 * automatically when they load.
 *
 * All the animations are triggered by a single interval. See #onTick(). When a div is added to the
 * animation queue (activeAnimations) it is updated by onTick() and advanceToNextFrame is called.
 * When the animation has reached its end, it is removed from the queue.
 *
 * @author ldetrick
 * @author mwright
 */
define(["jquery", "PointBreak"], function($, PointBreak) {

    var interval = null, // the single setInterval id
        FRAME_RATE = 24, // animation frame-rate in FPS
        TIME_PER_FRAME = 1000 / FRAME_RATE, // duration of each frame in ms
        FADE_DURATION = 100, // time of the fade in/out animation
        activeAnimations = [], // list of divs that are currently animating.
        pointbreak,
        $animeDiv;

    /**
     * Sets up the animations
     *
     * @method init
     * @private
     */

    function init() {
        pointbreak = new PointBreak();

        // Set interval to move image position
        interval = setInterval(onTick, TIME_PER_FRAME);

        var $tiles = $('.tile'),
            $animationTilesAutoPlay = $tiles.find('.tile-animation.auto-play');

        // Start animation on load if auto play is on
        $animationTilesAutoPlay.each(function() {
            $animeDiv = $(this);
            if ($animeDiv.hasClass("tile-video")) {
                return;
            }
            startAnimation($animeDiv);
        });

        // Set the total number of frames for each tile
        $tiles.find('.tile-animation').each(setTotalFrames);

        // start animation on mouse enter and stop on mouse leave.
        $("body").on('mouseenter', ".tile.animated", function() {
            $animeDiv = $(this).find('.tile-animation');
            startAnimation($animeDiv);

        }).on('mouseleave', ".tile.animated", function() {
            $animeDiv = $(this).find('.tile-animation');
            stopAnimation($animeDiv);
        });
    }

    /**
     * Returns true if animations should be played.
     * (they only play on large viewport and when touch is disabled)
     * @private
     */

    function animationsAreActive() {
        return ((pointbreak.getWidth() > PointBreak.MED_MAX) && ($('.touch').length <= 0));
    }

    /**
     * Calculates and sets the total number of frames for an animation.
     * @param index {int} Index of the item (set by each())
     * @param animeDiv {HTMLElement} div element (set by each())
     * @private
     */

    function setTotalFrames(index, animeDiv) {
        var $animeDiv = $(animeDiv),
            $animeImg = $animeDiv.find("img"),
            imgHeight = $animeImg.height(),
            frameHeight = $animeDiv.height();

        // count the number of frames that would fit inside the image height.
        $animeDiv.data("totalFrames", Math.round(imgHeight / frameHeight));
        // by default, currentFrame should be 0.
        $animeDiv.data("currentFrame", 0);
    }

    /**
     * Returns true if the div is currently animating.
     *
     * @param $animeDiv {jQuery} The div to check.
     * @returns {boolean} true if it's already animating.
     * @private
     */

    function isDivCurrentlyAnimating($animeDiv) {
        return activeAnimations.indexOf($animeDiv[0]) >= 0;
    }


    /**
     * Adds the div to the animation queue. Makes it an actively animating div.
     *
     * @param $animeDiv {jQuery} The div to animate.
     * @private
     */

    function addToAnimationQueue($animeDiv) {
        if (isDivCurrentlyAnimating($animeDiv) === false) {
            var div = $animeDiv[0];
            activeAnimations.push(div);
        }
    }

    /**
     * Removes div from the animation queue.
     *
     * @param $animeDiv {jQuery} The div to stop animating.
     * @private
     */

    function removeFromAnimationQueue($animeDiv) {
        var div = $animeDiv[0],
            index = activeAnimations.indexOf(div);
        if (index >= 0) {
            activeAnimations.splice(index, 1);
        }
    }

    /**
     * Fades in the image and starts animating it.
     *
     * @param $animeDiv {jQuery} The div to start animating.
     * @private
     */

    function startAnimation($animeDiv) {
        // If the div is currently animating, let it continue.
        if (animationsAreActive() && isDivCurrentlyAnimating($animeDiv) === false) {
            // otherwise, reset it to the start of the animation...
            resetAnimation($animeDiv);
            // fade up the opacity...
            fadeInAnimation($animeDiv);
            // and add it to the animation queue.
            addToAnimationQueue($animeDiv);
        }
    }

    /**
     * Stops an animation and fades it out.
     *
     * @param $animeDiv {jQuery} The div to stop animating.
     * @private
     */

    function stopAnimation($animeDiv) {
        removeFromAnimationQueue($animeDiv);
        fadeOutAnimation($animeDiv);
    }

    /**
     * Calls #stopAnimation() on every div that is currently active.
     * @private
     */

    function stopAllAnimations() {
        var i = 0,
            l = activeAnimations.length,
            $div;
        for (; i < l; i += 1) {
            $div = activeAnimations[0];
            stopAnimation($div);
        }
    }

    /**
     * Does an opacity fade to show a hidden animation.
     * Note: if the animation is already visible, nothing will happen.
     *
     * @param $animeDiv
     * @private
     */

    function fadeInAnimation($animeDiv) {
        var opacity = $animeDiv.css("opacity"),
            duration = FADE_DURATION * (1 - opacity);

        $animeDiv.animate({
            opacity: 1,
            duraton: duration
        });
    }

    /**
     * Does an opacity fade to hide a visible animation.
     * Note: if the animation is already invisible, nothing will happen.
     *
     * @param $animeDiv
     * @private
     */

    function fadeOutAnimation($animeDiv) {
        var opacity = $animeDiv.css("opacity"),
            duration = FADE_DURATION * opacity;

        $animeDiv.animate({
            opacity: 0,
            duraton: duration
        });
    }


    /**
     * Shows the next animation frame of a filmstrip asset.
     *
     * @param $animeDiv {jQuery} The div to animate.
     * @private
     */

    function advanceToNextFrame($animeDiv) {
        var currentFrame = $animeDiv.data("currentFrame");
        var totalFrames = $animeDiv.data("totalFrames");

        // advance by 1 frame and update the value set in the div
        currentFrame++;
        $animeDiv.data("currentFrame", currentFrame);

        var $animeImg = $animeDiv.find('img');
        var offsetPercentage = currentFrame * -100;

        // Offset the image by a percentage.
        // Every frame is 100% higher up since it uses the height of the div to
        // determine the offset.
        $animeImg.css({
            'top': offsetPercentage + '%'
        });
    }

    /**
     * Checks to see if the animation has finished.
     * Note: it stops on the last frame so it's visible during the fade-out.
     *
     * @param $animeDiv {jQuery}
     * @returns {boolean} True if the animation is done.
     * @private
     */

    function isAnimationComplete($animeDiv) {
        return ($animeDiv.data("currentFrame") >= $animeDiv.data("totalFrames") - 1);
    }

    /**
     * Sets the animation back to the first frame.
     * @param $animeDiv {jQuery}
     * @private
     */

    function resetAnimation($animeDiv) {
        var $animeImg = $animeDiv.find('img');
        $animeDiv.data("currentFrame", 0);

        // Reset animation to the beginning
        $animeImg.css({
            'top': 0
        });
    }

    /**
     * Called by setInterval() once per frame.
     * Loops through all active animations and updates them.
     *
     * @private
     */

    function onTick() {
        // stop all animations if they're not supposed to be running.
        if (!animationsAreActive()) {
            stopAllAnimations();
        } else {
            // for each animating image...
            var i = 0,
                l = activeAnimations.length,
                $div;
            for (; i < l; i += 1) {
                $div = $(activeAnimations[i]);

                // update animations
                advanceToNextFrame($div);

                if (isAnimationComplete($div)) {
                    // stop it
                    stopAnimation($div);
                    //remove auto-play so it won't try to auto-play a second time.
                    $div.removeClass('auto-play');
                }
            }
        }
    }

    init();
});
