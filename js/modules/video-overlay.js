/**
 * R4 Video Overlay
 *
 *
 * @author wschoenberger
 */
define(["jquery", "colorbox"], function($, colorbox) {

    var $window,
        // analytic
        action,
        tagId = '2573.1',
        isActivated = false,
        // public method
        openOverlay,
        // private methods
        init,
        activate,
        deactivate,
        addPlayer,
        loadVideo,
        initBrightcove,
        // handlers
        trackBailout,
        onPlayerLoad,
        // other
        brightcove, // reference to the brightcove js module
        $brightcovePlaceholder, // reference to the parent div for the player
        brightCovePlayer, // reference to the initialize player
        currentVideo, // reference to the video data object
        _curId, // reference to the current video id
        // configuration
        colorboxConfig = {
            href: "#overlay-container",
            inline: true,
            transition: 'none',
            closeButton: false,
            escKey: false,
            fixed: true,
            scrolling: false,
            overlayClose: false,
            onLoad: onColorboxLoad,
            onComplete: onColorboxLoadComplete,
            onClosed: onColorboxClose
        },
        playerData = {
            'accountId': '1678873422001',
            'playerId': '3270f547-b8a8-476f-8232-4796a4aca97c'
        };


    /**
     * Inits stuff
     *
     * @method init
     * @private
     */
    init = function() {
        $window = $(window);
        $brightcovePlaceholder = $('#brightcovePlaceholder');
        $('.close-btn, #cboxOverlay').on('click touchstart', function(event) {
            if (event) {
                event.preventDefault();
            }
            trackBailout();
            closeColorbox();
        });
    };

    /**
     * Injects the video player element and brightcove js to the page.
     *
     * @method addPlayer
     * @private
     */
    addPlayer = function() {
        // console.log('adding player...');

        // inject the player into the DOM
        document.getElementById('brightcovePlaceholder').innerHTML = '<video id="brightCovePlayer" data-embed="default" class="video-js" controls autoplay></video>';

        // inject js if it's not already there.
        var playerJsSrc = "//players.brightcove.net/" + playerData.accountId + "/" + playerData.playerId + "_default/index.js";
        if ($('script[src="' + playerJsSrc + '"]').length <= 0) {
            // add and execute the player script tag
            var s = document.createElement('script');
            s.src = playerJsSrc;
            s.onload = onPlayerLoad;
            document.body.appendChild(s);
        } else {
            // no need to load js or require bc module... initialize brightcove player.
            initBrightcove();
        }


    };

    /**
     * After brightcove js loads this requires the bc module.
     *
     * @method onPlayerLoad
     * @private
     */
    onPlayerLoad = function() {
        if (!brightcove) {
            // console.log('require bc module (first time only)');
            require(['bc'], function(bc) {
                brightcove = bc;
                initBrightcove();
            });
        }
    };

    /**
     * Configures the player and initializes brightcove js with the player, then starts load of the video.
     *
     * @method initBrightcove
     * @private
     */
    initBrightcove = function() {
        // console.log('initialize brightcove player');
        // add the account and player id to player element
        var player = document.getElementById('brightCovePlayer');
        player.setAttribute('data-account', playerData.accountId);
        player.setAttribute('data-player', playerData.playerId);
        // initialize brightcove module with player
        brightcove(document.getElementById('brightCovePlayer'));
        brightCovePlayer = window.videojs('brightCovePlayer');
        // activate brightcove handlers, load the video, and call resize so play controls are in the right spot
        doResize();
        activate();
        loadVideo(_curId);
    };

    /**
     * Adds event listers used to track and layout the player
     *
     * @method ativate
     * @private
     */
    activate = function() {
        if (isActivated) {
            return;
        }
        isActivated = true;

        // NOTE: using loadedmetadata here because loadeddata does not fire on
        // mobile safari. we may need to look for an alternative if this causes
        // issues with performance on slow connections.
        brightCovePlayer.on('loadedmetadata', function(event) {
            console.log('player data loaded');
            $brightcovePlaceholder.addClass('show');
            doResize();
            brightCovePlayer.play();
        });

        // tagging
        brightCovePlayer.on('firstplay', function(event) {
            MediaTrack(tagId, action = 'MediaOpen', brightCovePlayer.currentTime(), currentVideo.name);
        });

        brightCovePlayer.on('play', function(event) {
            MediaTrack(tagId, action = 'MediaPlay', brightCovePlayer.currentTime(), currentVideo.name);
        });

        brightCovePlayer.on('pause', function(event) {
            MediaTrack(tagId, action = 'MediaStop', brightCovePlayer.currentTime(), currentVideo.name);
        });

        brightCovePlayer.on('ended', function(event) {
            MediaTrack(tagId, action = 'MediaClose', brightCovePlayer.currentTime(), currentVideo.name);
        });

        $window.on('unload', trackBailout);

        // Resize Colorbox when resizing window or changing mobile device orientation
        $window.on('resize orientationchange', onResize);
    };

    /**
     * Removes event listers used to track and layout the player
     *
     * @method decativate
     * @private
     */
    deactivate = function() {
        isActivated = false;
        _curId = null;
        brightCovePlayer.off('loadedmetadata');
        brightCovePlayer.off('firstplay');
        brightCovePlayer.off('play');
        brightCovePlayer.off('pause');
        brightCovePlayer.off('ended');
        $window.off('resize orientationchange', onResize);
        $window.off('unload', trackBailout);
        $brightcovePlaceholder.empty();
    };

    /**
     * Takes in an ID and populates the iFrame of the video.
     *
     * @method openOverlay
     * @private
     */
    openOverlay = function(id) {
        _curId = id;
        if (id) {
            //Opening the colorbox
            openColorBox();
            doResize();
            $('body').css('overflow', 'hidden');
            addPlayer();
        }
    };

    /**
     * Takes in an ID and calls the brightcove api, which loads and plays the video.
     *
     * @method init
     * @private
     */
    loadVideo = function(id) {

        brightCovePlayer.catalog.getVideo(id, function(error, video) {
            if (error) {
                console.error('Play Video :: error: ', error);
            }
            // console.log('Play Video :: video: ', video);
            currentVideo = video;
            // brightCovePlayer.poster(video.poster);
            brightCovePlayer.catalog.load(video);
            // brightCovePlayer.play();
        });
    };


    trackBailout = function() {
        if (action !== 'MediaStop' && action !== 'MediaClose') {
            MediaTrack(tagId, action = 'MediaStop', brightCovePlayer.currentTime());
        }
    };

    /**
     * @private
     * Colorbox resize function
     * debouncing to restrict the number of times this function is called.
     * @see doResize()
     */
    var onResize = _.debounce(function(event) {
        doResize();
    }, 150);

    /**
     * @private
     * this is the actual function that gets called when
     * the timer runs out.
     */
    var doResize = function() {
        // checking curId because it will be null if the overlay is not open.
        if (_curId) {
            $.colorbox.resize({
                width: '90%',
                height: false,
                maxWidth: '1204px'
            });
        }
    };

    ///// COLORBOX
    var openColorBox = function() {
        $.colorbox(colorboxConfig);
        $('#colorbox').addClass('minimal');
    };

    /**
     * Closes the colorbox modal.
     * This should never be called except by updateView()
     * @private
     */
    var closeColorbox = function() {
        deactivate();
        $brightcovePlaceholder.removeClass('show');
        $.colorbox.close();
        $('body').css('overflow', 'visible');
    };

    var onColorboxLoad = function() {
        // console.log('Colorbox Loaded');
    };

    var onColorboxLoadComplete = function() {
        // console.log('Colorbox Loaded Complete');
    };

    var onColorboxClose = function() {
        // console.log('Colorbox Closed');
    };

    $(init);

    return {
        openOverlay: openOverlay
    };
});
