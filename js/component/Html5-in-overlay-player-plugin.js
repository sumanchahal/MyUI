/**
 * @author: Drew Robinson
 * @description Plugin for brightcove to leverage the SmartPlayer Video Overlay. Styled based on native iOS look/feel.
 *
 * - Swipe Functionality for Video's in touch devices.
 * - Video Play/Pause
 * - Fullscreen for webkit browsers
 * - Video Time increment/decrement display
 * - Video progress indicator/scrubber for HTML5 enabled browsers
 * - brightcoveOverlayVideo.tag is the player for this js
 */
(function(win, doc, $) {

    /**
     * Determines swipe from tap and posts appropriate message to parent window
     * @type {{touches: {touchstart: {x: number, y: number}, touchmove: {x: number, y: number}, touchend: boolean, direction: string}, touchHandler: touchHandler}}
     */
    var swipeFunc = {

        touches: {
            "touchstart": {
                "x": -1,
                "y": -1
            },
            "touchmove": {
                "x": -1,
                "y": -1
            },
            "touchend": false,
            "direction": "undetermined"
        },
        touchHandler: function(event) {
            var touch;
            if (typeof event === 'undefined') {
                return;
            }

            event.preventDefault();
            if (typeof event.touches !== 'undefined') {
                touch = event.touches[0];
                switch (event.type) {
                    case 'touchstart':
                    case 'touchmove':
                        swipeFunc.touches[event.type].x = touch.pageX;
                        swipeFunc.touches[event.type].y = touch.pageY;
                        break;
                    case 'touchend':

                        swipeFunc.touches[event.type] = true;

                        if (swipeFunc.touches.touchstart.x > -1 &&
                            swipeFunc.touches.touchmove.x > -1) {

                            //if touchmove distance > 35 it's a swipe otherwise consider it a tap
                            var distance = swipeFunc.touches.touchmove.x - swipeFunc.touches.touchstart.x;
                            var swipeDistance = Math.abs(distance);

                            if (swipeDistance > 60) {
                                swipeFunc.touches.direction = swipeFunc.touches.touchstart.x < swipeFunc.touches.touchmove.x ? "right" : "left";
                                //post message to window
                                if (typeof(window.postMessage) !== 'undefined') {
                                    parent.postMessage(swipeFunc.touches.direction, '*');
                                }
                            } else {
                                this.togglePlay();
                            }
                        } else {
                            this.togglePlay();
                        }
                        break;
                }
            }

        }
    };

    /**
     *
     * @param modVP
     * @constructor
     */

    function PlayerControls(modVP) {

        this.modVP = modVP;

        this.modVP.addEventListener(brightcove.api.events.MediaEvent.BEGIN, this.onMediaEventFired.bind(this));
        this.modVP.addEventListener(brightcove.api.events.MediaEvent.CHANGE, this.onMediaEventFired.bind(this));
        this.modVP.addEventListener(brightcove.api.events.MediaEvent.COMPLETE, this.onMediaEventFired.bind(this));
        this.modVP.addEventListener(brightcove.api.events.MediaEvent.ERROR, this.onMediaEventFired.bind(this));
        this.modVP.addEventListener(brightcove.api.events.MediaEvent.PLAY, this.onMediaEventFired.bind(this));
        this.modVP.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, this.onMediaEventFired.bind(this));
        this.modVP.addEventListener(brightcove.api.events.MediaEvent.STOP, this.onMediaEventFired.bind(this));


        this.init();

    }

    /**
     * PlayerControls Prototype
     * @type {{modExp: null, modVP: null, video: null, overlay: null, container: null, element: null, controls: null, playCtrl: null, swipeCtrl: null, fullscreenCtrl: null, timerCtrl: null, scrubCtrl: null, hasLoadedMetaData: boolean, videoIsPlaying: boolean, videoBegan: boolean, videoPosition: Number, videoDuration: Number, seekable: null, init: init, loadedMetaData: loadedMetaData, _swipeCtrl: _swipeCtrl, _playCtrl: _playCtrl, _fullscreenCtrl: _fullscreenCtrl, _timerCtrl: _timerCtrl, _scrubCtrl: _scrubCtrl, _controls: _controls, togglePlay: togglePlay, playVideo: playVideo, pauseVideo: pauseVideo, updateProgress: updateProgress, _sToTime: _sToTime, _msToTime: _msToTime, onMediaEventFired: onMediaEventFired, onMediaProgressFired: onMediaProgressFired}}
     */

    PlayerControls.prototype = {
        modExp: null,
        modVP: null,
        video: null,
        overlay: null,
        container: null,
        element: null,
        controls: null,
        playCtrl: null,
        swipeCtrl: null,
        fullscreenCtrl: null,
        timerCtrl: null,
        scrubCtrl: null,
        hasLoadedMetaData: false,
        videoIsPlaying: false,
        videoBegan: false,
        videoPosition: NaN,
        videoDuration: NaN,
        seekable: null,
        ID: null,
        action: null,
        actionPosition: null,

        /**
         * @description - init: creates instances of video controls and binds event listeners
         */
        init: function() {

            this.container = doc.getElementById(this.modVP.videoPlayer.id);

            this.video = this.modVP.getCurrentVideo();
            this.seekable = this.modVP.seekable();
            this.element = this.container.querySelector("#bcVideo");
            this.overlay = this.modVP.overlay();
            this.swipeCtrl = this._swipeCtrl();
            this.playCtrl = this._playCtrl();
            this.fullscreenCtrl = this._fullscreenCtrl();
            this.timerCtrl = this._timerCtrl();
            this.scrubCtrl = this._scrubCtrl();
            this.controls = this._controls();

            this.overlay.appendChild(this.swipeCtrl);
            this.overlay.appendChild(this.controls);

            this.swipeCtrl.addEventListener('touchstart', swipeFunc.touchHandler.bind(this), false);
            this.swipeCtrl.addEventListener('touchmove', swipeFunc.touchHandler.bind(this), false);
            this.swipeCtrl.addEventListener('touchend', swipeFunc.touchHandler.bind(this), false);

            this.playCtrl.button.addEventListener('touchend', this.playCtrl.handler.bind(this));
            this.fullscreenCtrl.button.addEventListener('touchend', this.fullscreenCtrl.handler.bind(this));

            this.scrubCtrl.scrubber.addEventListener("touchstart", this.scrubCtrl.touchHandler.bind(this));
            this.scrubCtrl.scrubber.addEventListener("touchend", this.scrubCtrl.touchHandler.bind(this));
            this.scrubCtrl.scrubber.addEventListener("input", this.scrubCtrl.inputHandler.bind(this));

            if (this.element.readyState > 0) {
                this.loadedMetaData.call(this.element);
            } else {
                this.element.addEventListener('loadedmetadata', this.loadedMetaData.bind(this));
            }

            //Omniture Tracking
            this.omnitureUnloadTracking();
        },

        /**
         * @description - Handles MetaDataLoaded event, determines if fullscreen support is available.
         */
        loadedMetaData: function() {
            this.hasLoadedMetaData = true;

            //webkitSupportsFullscreen is always false until meta data loads
            if (this.element.webkitSupportsFullscreen) {
                this.fullscreenCtrl.show();
            }
        },

        /**
         * Creates a dom node for swipe layer
         * @returns {HTMLElement}
         * @private
         */
        _swipeCtrl: function() {
            var height = $(this.container).css('height');
            var element = doc.createElement('div');
            var css = 'position:absolute;top:0;left:0;width:100%;height:' + height + ';';

            element.setAttribute('id', 'swipeControl');
            element.setAttribute('style', css);

            return element;
        },

        /**
         * Creates Play/Pause Dom nodes and defines touch event handler. Uses Base64 encoded images
         * @returns {{playSrc: string, pauseSrc: string, button: HTMLElement, img: HTMLElement, handler: handler}}
         * @private
         */
        _playCtrl: function() {
            var playSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABV0RVh0Q3JlYXRpb24gVGltZQAzLzE5LzE0dpmrtQAAAIBJREFUKJGlk9EJBCEMRCfL1aLVWI2WodVMNbGZ7MfhciyCCffAn8CbMR+Bqlrv3eDEzJ53AUApBdEQAF95EQ25dkNvyFb2hoiquvckiVqruJp3P5lz2hjDws1vQs0LkkgpSUhe0trbJZNEzllaa/I7/5ykt3CUT9JW9koP/1zVDTpqYRjRnJk4AAAAAElFTkSuQmCC";
            var pauseSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABV0RVh0Q3JlYXRpb24gVGltZQAzLzE5LzE0dpmrtQAAAEhJREFUKJHtjTESgEAIAxf//yAa3rY2p4OMjZ3FpQohO0GlqrxUVTI0/yoqoQI8gIiIfrtKvQJwzJUv2vCG/w5n5h10/5Z1fwK1YTZ4DYodewAAAABJRU5ErkJggg==";
            var css = 'position:absolute;top:0;left:0;display:block;width:16px;height:16px;padding:14px;';

            var button = doc.createElement('div');
            var img = doc.createElement('img');

            var handler = function(e) {
                e.preventDefault();

                parent.postMessage('playBtnEvent', '*');
                this.togglePlay();
            };

            img.setAttribute('src', playSrc);
            button.setAttribute('id', 'playCtrl');
            button.setAttribute('style', css);
            button.appendChild(img);

            return {
                playSrc: playSrc,
                pauseSrc: pauseSrc,
                button: button,
                img: img,
                handler: handler
            };
        },

        /**
         * Creates fullscreen control. Defines touch event handler. Uses Bases64 encoded image.
         * @returns {{fullscreenSrc: string, button: HTMLElement, img: HTMLElement, handler: handler, show: show}}
         * @private
         */
        _fullscreenCtrl: function() {
            var fullscreenSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABV0RVh0Q3JlYXRpb24gVGltZQAzLzE5LzE0dpmrtQAAAHVJREFUKJGV0UsOwCAIBNBpuf+VSLgUbtDpisb+MJ0diU+ZCL7E3YmPkAT+gFcUESVItOcwxoCIQFWXEPNKZkaSrCBJ4N4hYYn+5tLp4wDN7HJ1a61+SlU5Q3cvV3/A3vv5Ndu6BRARFJFzLjvlSjNYJjvccwBSqMF22wdXgQAAAABJRU5ErkJggg==";
            var css = 'position:absolute;top:0;right:0;display:block;width:16px;height:16px;padding:14px;display:none;';

            var button = doc.createElement('div');
            var img = doc.createElement('img');

            var handler = function(e) {
                e.preventDefault();

                if (!this.hasLoadedMetaData) {
                    return;
                }

                parent.postMessage('fullscreenBtnEvent', '*');

                this.element.webkitEnterFullScreen();
            };

            var show = function() {
                this.button.style.display = 'block';
            };

            img.setAttribute('src', fullscreenSrc);
            button.setAttribute('id', 'fullscreenCtrl');
            button.setAttribute('style', css);
            button.appendChild(img);

            return {
                fullscreenSrc: fullscreenSrc,
                button: button,
                img: img,
                handler: handler,
                show: show
            };
        },

        /**
         * Creates DOM notes for Video Time Display. Shows time remaining as well as time to passed.
         * @returns {{inc: HTMLElement, dec: HTMLElement}}
         * @private
         */
        _timerCtrl: function() {
            var inc = doc.createElement('div');
            var dec = doc.createElement('div');

            var incCss = 'position:absolute;left:44px;width:44px;height:100%;font-family:arial;font-size:12px;padding:1.2em 0;color:white;text-align:center;';
            var decCss = 'position:absolute;right:44px;width:44px;height:100%;font-family:arial;font-size:12px;padding:1.2em 0;color:white;text-align:center;';

            inc.setAttribute('style', incCss);
            dec.setAttribute('style', decCss);

            //set default values
            inc.innerHTML = this._sToTime(0);
            dec.innerHTML = '-' + this._msToTime(this.video.length);

            return {
                inc: inc,
                dec: dec
            };
        },

        /**
         * Creates video progress/scrub control. Uses HTML5 input range. Defines touch handler method.
         * @returns {{element: HTMLElement, scrubber: HTMLElement, touchHandler: touchHandler, changeHandler: changeHandler}}
         * @private
         */
        _scrubCtrl: function() {

            var element = doc.createElement('div');
            var scrubber = doc.createElement('input');

            var elmCss = 'position:absolute;left:88px;right:88px;height:100%;';
            var scrubberCss = 'position:absolute;top:0;left:0;width:100%;height:39px;background:blue;';

            element.setAttribute('id', 'scrubControl');
            element.setAttribute('style', elmCss);
            scrubber.setAttribute('type', 'range');
            scrubber.setAttribute('value', 0);
            scrubber.setAttribute('style', scrubberCss);

            element.appendChild(scrubber);

            var touchHandler = function(e) {
                switch (e.type) {
                    case 'touchstart':
                        this.pauseVideo();
                        break;
                    case 'touchend':
                        this.playVideo();
                        break;
                }
            };

            var inputHandler = function(e) {
                var duration = (this.video.length / 1000);
                var currentTime = duration * (this.scrubCtrl.scrubber.value / 100);
                this.modVP.seek(currentTime);

            };

            return {
                element: element,
                scrubber: scrubber,
                touchHandler: touchHandler,
                inputHandler: inputHandler
            };
        },

        /**
         * Creates video controls dom wrapper and appends various controls as children nodes.
         * @returns {HTMLElement}
         * @private
         */
        _controls: function() {
            var outerCss = 'position:absolute;left:0;bottom:0;width:100%;height:44px;background:rgba(0,0,0,0.85);';
            var innerCss = 'position:relative;margin:0 auto;width:80%;height:44px;';
            var outer = doc.createElement('div');
            var inner = doc.createElement('div');

            outer.setAttribute('id', 'videoControls');
            outer.setAttribute('style', outerCss);
            inner.setAttribute('id', 'wrapper');
            inner.setAttribute('style', innerCss);

            inner.appendChild(this.playCtrl.button);
            inner.appendChild(this.fullscreenCtrl.button);
            inner.appendChild(this.timerCtrl.inc);
            inner.appendChild(this.timerCtrl.dec);
            inner.appendChild(this.scrubCtrl.element);
            outer.appendChild(inner);

            return outer;
        },

        /**
         * Toggles video play/pause
         */
        togglePlay: function() {

            if (this.videoIsPlaying) {
                this.pauseVideo();
            } else {
                this.playVideo();
            }
        },

        /**
         * Plays video
         */
        playVideo: function() {
            this.modVP.play();
            this.playCtrl.img.setAttribute('src', this.playCtrl.pauseSrc);
        },


        /**
         * Pauses video
         */
        pauseVideo: function() {
            this.modVP.pause(true);
            this.playCtrl.img.setAttribute('src', this.playCtrl.playSrc);
        },

        /**
         * Updates progress indicator as well as time display
         */
        updateProgress: function() {
            var duration = (this.video.length / 1000);
            var currentTime = (100 / duration) * this.videoPosition;

            this.timerCtrl.inc.innerHTML = this._sToTime(this.videoPosition);
            this.timerCtrl.dec.innerHTML = '-' + this._sToTime(this.videoDuration - this.videoPosition);
            this.scrubCtrl.scrubber.value = currentTime;
        },

        /**
         * Seconds to Time - converts seconds to formatted time string
         * @param position
         * @returns {string}
         * @private
         */
        _sToTime: function(position) {

            var minutes = Math.floor(position / 60);
            var seconds = Math.floor(position - minutes * 60);

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return minutes + ":" + seconds;
        },


        /**
         * Milliseconds to Time - converts milliseconds to formatted time string
         * @param duration
         * @returns {string}
         * @private
         */
        _msToTime: function(duration) {
            var milliseconds = parseInt((duration % 1000) / 100, 10),
                seconds = parseInt((duration / 1000) % 60, 10),
                minutes = parseInt((duration / (1000 * 60)) % 60, 10);

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return minutes + ":" + seconds;
        },

        /**
         * Media Event Handler - updates video controls based on playback events and fires analytics.
         * @param e
         */
        onMediaEventFired: function(e) {

            switch (e.type) {
                case 'mediaPlay':
                    this.videoBegan = true;
                    this.videoIsPlaying = true;
                    //Omniture updates
                    //Check if at the beginning of video
                    if (e.position === 0) {
                        this.action = 'MediaOpen';
                        this.actionPosition = e.duration;
                        this.omniturePostMessage(this.action, this.actionPosition, this.video.displayName);
                    }

                    this.action = 'MediaPlay';
                    this.actionPosition = e.position;
                    this.omniturePostMessage(this.action, this.actionPosition, this.video.displayName);
                    break;

                case 'mediaBegin':
                    this.videoPosition = e.media.position;
                    this.videoIsPlaying = true;
                    break;

                case 'mediaProgress':
                    this.videoIsPlaying = true;
                    this.videoPosition = e.position;
                    this.videoDuration = e.duration;
                    //Updates video controls based on playback
                    this.updateProgress();
                    //Omniture updates
                    this.actionPosition = e.position;
                    break;

                case 'mediaStop':
                    this.videoPosition = e.media.position;
                    this.videoIsPlaying = false;
                    //Omniture updates
                    this.action = 'MediaStop';
                    this.actionPosition = e.position;
                    this.omniturePostMessage(this.action, this.actionPosition, this.video.displayName);
                    break;

                case 'mediaComplete':
                    this.videoPosition = e.media.position;
                    this.videoIsPlaying = false;
                    //Omniture updates
                    this.action = 'MediaClose';
                    this.actionPosition = '';
                    this.omniturePostMessage(this.action, this.actionPosition, this.video.displayName);
                    break;
            }

        },

        /**
         * Media Unload Handler - User leaves without stopping video
         */

        omnitureUnloadTracking: function() {
            var that = this;
            //TODO this doesn't work b/c the top iframe is gone
            //User leaves without stopping video
            $(window).unload(function() {
                if ((that.action !== 'MediaStop') && (that.action !== 'MediaClose') && (that.actionPosition !== 'null')) {
                    that.omniturePostMessage('MediaStop', that.actionPosition, that.video.displayName);
                }
            });
        },

        /**
         * Post Message to upper iframe to fire omniture media tracking events
         * @param action - string of media event name
         * @param position - number for media progress
         */

        omniturePostMessage: function(action, position, title) {
            var json = {
                action: action,
                position: position,
                title: title
            };
            parent.postMessage(JSON.stringify(json), '*');
        }

    };

    var player,
        modVP,
        modExp,
        APIModules;
    /**
     * Creates new instance of Player Controls
     */

    function onPlayerReady() {
        var playerControls = new PlayerControls(modVP);
        //Resize player
        resizePlayer();
        //Trigger resize of player
        $(window).on('resize orientationchange', function() {
            resizePlayer();
        });

        // Hide standear play overlay
        modVP.playOverlayCallbacks({
            show: function() {
                return false; //prevent standard play overlay
            },
            hide: function() {
                return false;
            }
        });

    }

    /**
     * Video player responsive resizing
     */

    function resizePlayer() {
        var isAndroid = navigator.userAgent.match(/Android/i) ? true : false;
        var $videoWindow = $(window),
            overlay = modVP.overlay(),
            overlayWidth = $videoWindow.width(),
            //Android Landscape requires reduced height
            overlayHeight = (isAndroid && window.innerWidth > window.innerHeight) ? $videoWindow.height() - 65 : $videoWindow.height();

        // Set video size through brightcove api call
        modExp.setSize(overlayWidth, overlayHeight);
        //Set the overlay size
        $(overlay).width(overlayWidth).height(overlayHeight);
    }

    //onload
    player = brightcove.api.getExperience();
    APIModules = brightcove.api.modules.APIModules;
    modExp = player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
    modVP = player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);

    if (modExp.getReady()) {
        onPlayerReady();
    } else {
        modExp.addEventListener(brightcove.player.events.ExperienceEvent.TEMPLATE_READY, onPlayerReady);
    }


})(window, document, jQuery);
