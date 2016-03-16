/**
 * Home page tile animation.
 *
 * Tiles can be either 'auto-play' or normal. If they're autoplay, they will play
 * when they load.
 *
 * This code will only apply to home page tiles with both the .tile and .video
 * class The child video requires the .tile-video class.
 *
 * @author ldetrick
 * @author mwright
 */
define(['jquery', 'PointBreak'], function($, PointBreak) {

    var interval = null, // the single setInterval id
        FRAME_RATE = 24, // animation frame-rate in FPS
        TIME_PER_FRAME = 1000 / FRAME_RATE, // duration of each frame in ms
        FADE_DURATION = 100, // time of the fade in/out animation
        PLAY_MANY = 0,
        PLAY_ONCE = 1,
        PLAYED_ONCE = 2,
        activeAnimations = [], // list of divs that are currently animating.
        pointbreak,
        $body,
        $tiles,
        isTouch = ($('html').hasClass('touch') || $('html').hasClass('mstouch')),
        videoLoadCount = 0,
        tileRefs = {},
        tileRefsByIdx = [],
        transEndEvent = {
            'WebkitTransition': 'webkitTransitionEnd', // Saf 6, Android Browser
            'MozTransition': 'transitionend', // only for FF < 15
            'transition': 'transitionend' // IE10, Opera, Chrome, FF 15+, Saf 7+
        },
        playOnVisibleQueue = [],
        preloadStarted = false,
        testing = false,
        globalPlayStatus = true,
        testCases = [{
            loop: false,
            playStatus: PLAY_ONCE,
            autoPlay: true,
            imgOpt: 'center'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }, {
            loop: true,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'top'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'right'
        }, {
            loop: false,
            playStatus: false,
            autoPlay: false,
            imgOpt: 'center'
        }];

    /**
     * Sets up the animations
     *
     * @method init
     * @private
     */

    function init() {
        $tiles = $('.tile.video');
        if ($tiles.length <= 0) {
            console.log('No video tiles found!');
            return null;
        }
        window.enableVideoTile = enableVideoTile;
        window.disableVideoTile = disableVideoTile;
        transEndEvent = transEndEvent[Modernizr.prefixed('transition')];
        var tileId,
            refObj,
            videoOpts,
            imageOpts;
        $body = $('body');

        $tiles.each(function(index) {
            $tile = $(this);
            tileId = $tile[0].id;
            if (!tileId) {
                $tile.attr('id', 'tile-' + index);
                tileId = 'tile-' + index;
            }
            videoOpts = $tile.attr('data-video-opts');
            imageOpts = $tile.attr('data-image-opts');
            refObj = {
                tile: $tile,
                id: tileId,
                animEl: $tile.find('.tile-video'),
                isPreloading: false,
                loadStart: null,
                loadEnd: null,
                isPlaying: false,
                // video tile animation options
                loop: (videoOpts && videoOpts === 'video_loop'),
                playStatus: videoOpts === 'video_play_one_time' ? PLAY_ONCE : PLAY_MANY,
                autoPlay: ($tile.attr('data-auto-play') === 'true'),
                alwaysOn: $tile.hasClass('always-on')
                // zoom is handled in the css by way of the data-image-opts attr.
            };

            // FOR TESTING ONLY
            if (testing) {
                refObj.loop = testCases[index].loop; // true or false
                refObj.playStatus = testCases[index].playStatus; // 0 or 1
                refObj.autoPlay = testCases[index].autoPlay; // true or false
                $tile.attr('data-image-opts', testCases[index].imgOpt); // false, 'none', 'center', 'top', 'right', 'bottom' or 'left'
            }


            tileRefsByIdx.push(refObj);
            tileRefs[tileId] = refObj;



        });
        enableVideos();
        // console.log('tileRefs: ', tileRefs);
        beResponsive();
        $(window).on("scroll", onScrollVisibleQueue);
        return {
            'startPreloading': startPreloading,
            'enableVideos': enableVideos,
            'disableVideos': disableVideos,
            'resetVideo': resetVideo,
            'stopVideo': stopVideo,
            'restartVideo': restartVideo,
            'startVideo': startVideo
        };
    }

    function beResponsive() {
        pointbreak = new PointBreak();
        pointbreak.registerBreakpoint('tablet1024', 1024);

        pointbreak.addEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, function(event) {
            // console.log(event);
            if (pointbreak.isSmallerOrEqual('tablet1024')) {
                disableVideoTiles();
            } else {
                enableVideoTiles();
            }
        });

        // disable video tiles if current breakpoint is <= 1024
        if (pointbreak.isSmallerOrEqual('tablet1024')) {
            disableVideoTiles();
        }
        // else {
        //     enableVideoTiles();
        // }

    }

    /**
     * Kicks off the preloading process. Each video will load in sequence.
     *
     * @public
     */

    function startPreloading() {
        // console.error('\n\n******** startPreloading: ', window.innerWidth, ' ***********\n\n');
        if (isTouch || videoLoadCount >= tileRefsByIdx.length || window.innerWidth <= pointbreak.getSizeOfBreakpoint('tablet1024')) {
            $('.tile').find('.loading.animation').each(function() {
                LEXUS.loadingAnimation.unregister($(this)[0].id);
            });
            return;
        }
        preloadStarted = true;

        preloadVideo(tileRefsByIdx[videoLoadCount]);
    }


    /**
     * Starts loading the video and tracking the buffer. The ready flag is set to true
     * when enough has been buffered to play through. If autoPlay is true then the video
     * will begin playing.
     *
     * @param tile {object} An object representing a video tile.
     * @private
     */

    function preloadVideo(tile) {
        if (!tile || tile.loadStart || tile.loadEnd || videoLoadCount >= tileRefsByIdx.length) {
            return;
        }
        videoLoadCount++;
        var $animeDiv = tile.animEl,
            attrName,
            attrValue,
            vidHTML = null,
            vidSrc = '',
            webmVideo = $animeDiv.attr('data-webm'),
            mp4Video = $animeDiv.attr('data-mpfour');

        // @note: need to go through the trouble of constructing video tag to
        // support IE9. Simply changing source in existing video tag does
        // not work in IE9.

        // reconstruct the opening video tag.
        vidHTML = '<video ';
        $.each($animeDiv[0].attributes, function(i, attrib) {
            attrName = attrib.name;
            attrValue = attrib.value;
            // console.log(attrName, ':', attrValue);
            vidHTML += attrName + '="' + attrValue + '" ';
        });
        vidHTML += '>';
        // create source tags and close off video
        vidSrc += '<source src="' + webmVideo + '" type="video/webm"></source>';
        vidSrc += '<source src="' + mp4Video + '" type="video/mp4"></source>';
        vidHTML = vidHTML + vidSrc + '</video>';

        // console.log('------------------------');
        // console.log('vidHTML: ', vidHTML);
        // console.log('vidSrc: ', vidSrc);
        // console.log('$animeDiv: ', $animeDiv.length);
        // console.log('using html instead of append');
        // console.log('------------------------');

        // replace existing video tag with our freshie
        $animeDiv.replaceWith(vidHTML);
        // update our references to video so the rest of our code still works
        tile.tile = $('#' + tile.id);
        $animeDiv = tile.animEl = tile.tile.find('.tile-video');
        // $animeDiv = tile.animEl = tile.tile.find('video');
        setTimeout(function() {
            $animeDiv[0].load();
            tile.loadStart = Date.now();
            checkProg(tile);
        }, 0);
    }


    /**
     * Checks current progress of video buffer.
     *
     * @param tile {object} An object representing a video tile.
     * @private
     */

    function checkProg(tile) {
        var $animeDiv, bufLength, duration, bufEnd, perc, loader;
        $animeDiv = tile.animEl;
        duration = $animeDiv[0].duration;
        bufLength = $animeDiv[0].buffered.length;
        // console.log('\n--------------- [' + tile.id + '] -------------------');
        // console.log('duration: ', duration);
        // console.log('bufLength: ', bufLength);
        // if buffer length or duration is 0 then bail
        if (bufLength < 1 || duration > 0 === false) {
            setTimeout(function() {
                checkProg(tile);
            }, 300);
            // console.log('----------------------------------\n');
            return;
        }
        bufEnd = $animeDiv[0].buffered.end(bufLength - 1);
        perc = bufEnd / duration;
        // console.log('bufEnd: ', bufEnd);
        // console.log('perc: ', perc);
        // console.log('----------------------------------\n');

        if (perc >= 0.7) {
            tile.loadEnd = Date.now();
            tile.tile.addClass('video-ready');
            preloadVideo(tileRefsByIdx[videoLoadCount]);

            loader = tile.tile.find('.loading.animation');
            LEXUS.loadingAnimation.unregister(loader[0]);
            loader.remove();
            if (tile.autoPlay === true || tile.tile.hasClass('hover')) {
                if (isTileVisible(tile)) {
                    // Visible tile, play it
                    setTimeout(function() {
                        startVideo(tile);
                    }, 100);
                } else {
                    // Tiles not visible, add it to the queue
                    playOnVisibleQueue.push(tile);
                }
            }
        } else {
            setTimeout(function() {
                checkProg(tile);
            }, 300);
        }
    }

    /**
     * Add event handlers for interaction with video tiles.
     *
     * @public
     */

    function enableVideos() {
        $body.on('mouseenter', '.tile.video:not(.always-on)', function() {
            if (globalPlayStatus === false) {
                return;
            }
            // only react if playStatus is 0 or is PLAY_ONCE (1). It will be 2 if video has already 'PLAYED_ONCE'.
            if (!tileRefs[this.id].playStatus || tileRefs[this.id].playStatus === PLAY_ONCE) {
                // note: this was commented out because we don't want images to scale when a video is played.
                tileRefs[this.id].tile.addClass('hover');
                if (tileRefs[this.id].loadEnd) {
                    startVideo(tileRefs[this.id]);
                }
            }
        }).on('mouseleave', '.tile.video:not(.always-on)', function() {
            tileRefs[this.id].tile.removeClass('hover');
            if (tileRefs[this.id].isPlaying) {
                resetVideo(tileRefs[this.id]);
            }
        });
    }

    /**
     * Remove event handlers for interaction with video tiles.
     *
     * @public
     */

    function disableVideos() {
        $body.off('mouseenter', '.tile.video').off('mouseleave', '.tile.video');
    }

    /**
     * Fades out the image (by adding hover class), starts video and updates the tile status.
     *
     * @param tile {object} An object representing a video tile.
     * @private
     */

    function startVideo(tile) {
        // console.error('startVideo :: tile id: ', tile.id);
        clearReset(tile);
        tile.tile.addClass('hover');
        triggerHover(tile.tile);
        if (tile.isPlaying !== false) {
            return;
        }
        tile.isPlaying = true;

        var $animeDiv = tile.animEl;
        $animeDiv[0].pause();
        $animeDiv[0].currentTime = 0;
        $animeDiv[0].play();

        $animeDiv.one('ended', function() {
            // console.log('animation end');
            // replay the video manually if loop is true and it's not the first autoplay
            if (tile.loop === true && (tile.autoPlay === false || tile.alwaysOn === true)) {
                if (typeof $animeDiv[0].loop === 'boolean' && $animeDiv[0].loop === false) {
                    // set loop attribute if supported and not yet set.
                    $animeDiv[0].loop = true;
                    restartVideo(tile);
                } else {
                    restartVideo(tile);
                }
            } else {
                stopVideo(tile);
                unTriggerHover(tile.tile);
            }
        });

    }


    /**
     * Starts playing the video from the beginning.
     *
     * @param tile {object} An object representing a video tile.
     * @public
     */

    function restartVideo(tile) {
        var $animeDiv = tile.animEl;
        $animeDiv[0].currentTime = 0;
        $animeDiv[0].play();
    }

    /**
     * Pauses the video and updates the tiles status.
     *
     * @param tile {object} An object representing a video tile.
     * @public
     */

    function stopVideo(tile) {
        tile.autoPlay = false;
        clearReset(tile);
        if (tile.isPlaying !== true) {
            return;
        }

        // if playStatus is equal to PLAY_ONCE (1) then
        //  - set it to PLAYED_ONCE (2)
        //  - add event handler for the image fade css animation
        //  - on animationend
        //      - add played-once class to tile so image fade animates using
        //        using the psuedo :hover instead of .hover which cause the
        //        image to fade out as well.
        //      - add img class to tile so tile the image zooms and acts like
        //        an image tile from this point forward.
        if (tile.playStatus === PLAY_ONCE) {
            tile.playStatus = PLAYED_ONCE;
            setTimeout(function() {
                tile.tile.addClass('played-once');
            }, 1100);
            tile.tile.find('.background').one(transEndEvent, function() {
                disableVideoTile(tile);
            });
        }
        tile.isPlaying = false;
        tile.tile.removeClass('hover');
        var $animeDiv = tile.animEl;
        $animeDiv[0].pause();
    }


    function enableVideoTile(tile) {
        tile = tile || tileRefsByIdx[0];
        tile.playStatus = PLAY_MANY;
        tile.tile.removeClass('played-once');
        tile.tile.removeClass('img');
    }

    function disableVideoTile(tile) {
        tile = tile || tileRefsByIdx[0];
        tile.playStatus = PLAYED_ONCE;
        tile.tile.addClass('played-once');
        tile.tile.addClass('img');
    }

    function enableVideoTiles() {
        globalPlayStatus = true;
        for (var i = 0; i < tileRefsByIdx.length; i++) {
            // console.log('enable: tileRefs[' + i + '].tile: ', tileRefsByIdx[i]);
            enableVideoTile(tileRefsByIdx[i]);
        }
        console.log('preloadStarted: ', preloadStarted);
        if (preloadStarted === false) {
            startPreloading();
        }
    }

    function disableVideoTiles() {
        globalPlayStatus = false;
        for (var i = 0; i < tileRefsByIdx.length; i++) {
            // console.log('disable: tileRefs[' + i + '].tile: ', tileRefsByIdx[i]);
            disableVideoTile(tileRefsByIdx[i]);
        }
    }


    /**
     * Pauses and resets animation video after a timeout. The timeout should be a bit longer
     * than the image transition time in home.scss around line 142.
     *
     * @param tile {object} An object representing a video tile.
     * @public
     */

    function resetVideo(tile) {
        tile.autoPlay = false;
        clearReset(tile);
        if (tile.isPlaying !== true) {
            return;
        }
        tile.tile.removeClass('hover');
        var $animeDiv = tile.animEl;
        tile.resetTimeout = setTimeout(function() {
            tile.isPlaying = false;
            tile.resetTimeout = null;
            $animeDiv[0].pause();
            $animeDiv[0].currentTime = 0;
        }, 1100);
    }

    /**
     * Clears the timeout created in resetVideo. This is called in the beginning of any function that modifies the playing of the video.
     *
     * @param tile {object} An object representing a video tile.
     * @private
     */

    function clearReset(tile) {
        if (tile.resetTimeout) {
            clearTimeout(tile.resetTimeout);
            tile.resetTimeout = null;
        }
    }

    function isTileVisible(tile) {
        var $elem = tile.tile;
        var $window = $(window);
        var docViewTop = $window.scrollTop();
        var docViewBottom = docViewTop + $window.height();
        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    function onScrollVisibleQueue() {
        var i;
        for (i = 0; i < playOnVisibleQueue.length; i++) {
            if (isTileVisible(playOnVisibleQueue[i])) {
                startVideo(playOnVisibleQueue[i]);
                playOnVisibleQueue.splice(i, 1);
                i--;
            }
        }
    }

    function triggerHover(tile) {
        if (Modernizr.cssanimations) {
            return;
        }
        var $caption = tile.find('.caption'),
            $captionTitle = $caption.find('h2'),
            $captionText = $caption.find('p'),
            $captionBtn = $caption.find('button');

        $captionTitle.animate({
            'bottom': '18px',
            'duration': 200,
            'opacity': 1
        }, {
            queue: false
        });
        $captionText.css({
            'visibility': 'visible'
        });
        $captionText.animate({
            'bottom': '20px',
            'duration': 300,
            'opacity': 1
        }, {
            queue: false
        });
        $captionText.css('height', 'auto');
        $captionBtn.css({
            'visibility': 'visible'
        });

        $captionBtn.animate({
            'opacity': 1,
            'top': '-15px',
            'height': '37px',
            'duration': 400
        }, {
            queue: false
        });
    }

    function unTriggerHover(tile) {
        if (Modernizr.cssanimations) {
            return;
        }
        var $caption = tile.find('.caption'),
            $captionTitle = $caption.find('h2'),
            $captionText = $caption.find('p'),
            $captionBtn = $caption.find('button');

        $captionTitle.animate({
            'bottom': '-25px',
            'duration': 300
        }, {
            queue: false
        });
        $captionText.css({
            'visibility': 'hidden'
        });
        $captionText.animate({
            'bottom': '0px',
            'duration': 200,
            'opacity': '0',
            'height': '22px'
        }, {
            queue: false
        });
        $captionBtn.css({
            'visibility': 'hidden'
        });
        $captionBtn.animate({
            'opacity': '0',
            'top': '-25px',
            'height': 0,
            'duration': 100
        }, {
            queue: false
        });
    }

    /**
     * We don't want to do any of this on touch devices.
     */

    if (isTouch === false) {
        return init();
    } else {
        return null;
    }
});
