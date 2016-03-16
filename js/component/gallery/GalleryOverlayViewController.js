define(["mvc/AbstractViewController",
        "mvc/List",
        "mvc/SelectableList",
        "component/social/ShareOverlay",
        "component/gallery/WallpaperAssetsViewController",
        "component/gallery/Gallery",
        "component/gallery/GalleryItem",
        "component/gallery/GalleryItemType",
        "mvc/ListEvent",
        "lexus",
        "analytics",
        "jquery",
        // jquery plugins...
        "colorbox", "waypoints", "transit", "touchSwipe"
    ],
    function(
        AbstractViewController,
        List, SelectableList,
        ShareOverlay,
        WallpaperView,
        Gallery,
        GalleryItem,
        GalleryItemType,
        ListEvent,
        LEXUS,
        analytics,
        $
    ) {

        var mouseTimer,
            bodyId = $('body').attr('id'),
            animationDuration = 300,
            arrowAnimationDuration = 200,
            mouseOverArrow = false,
            colorboxInitiallyLoaded = false,
            removeImageUrl = false,
            $iFrame,
            $smallImage,
            iFrameInterval,
            previousIFrameHeight,
            fixColorBox,
            resizeTimer,
            minimalLayout = false,
            MEDIUM_BREAKPOINT = 959,
            animationsEnabled = ($('.touch').length || $(window).width() < MEDIUM_BREAKPOINT) ? true : false,
            $xOfY = $("#overlay-colon, #overlay-of, #overlay-x-of-y"),
            RESIZE_DELAY = 150,
            NEXT_PREV_BUTTON_FADE_TIME = 1200,
            PREVIOUS = "prev",
            NEXT = "next",
            GALLERY = "gallery",
            ESC = 27,
            LEFT = 37,
            UP = 38,
            RIGHT = 39,
            DOWN = 40,
            leftArrowSelected = null;

        /**
         * A view controller for a gallery or feature overlay.
         *
         * @class GalleryOverlayViewController
         * @extends AbstractViewController
         * @param model {Gallery} The model object
         * @param context {jquery} The location in the dom to render the view
         * @constructor
         */

        function GalleryOverlayViewController(model, context, type) {
            AbstractViewController.call(this);

            this.init(model, context, Gallery);

            this.type = type || GALLERY;

            var scope = this;


            // Expose the next and previous methods to the iFrame
            window.selectNextGalleryItem = function() {
                var gallery = scope.getModel();
                gallery.getOverlayItems().selectNextItem();
            };

            window.selectPreviousGalleryItem = function() {
                var gallery = scope.getModel();
                gallery.getOverlayItems().selectPreviousItem();
            };
        }

        GalleryOverlayViewController.prototype = new AbstractViewController();
        GalleryOverlayViewController.prototype.parent = AbstractViewController.prototype;
        GalleryOverlayViewController.prototype.constructor = GalleryOverlayViewController;

        $.extend(GalleryOverlayViewController.prototype, {

            /** @inheritDoc */
            setModel: function(model) {
                // update regular model (Gallery)
                if (this._model !== model) {
                    this._model = model;
                    if (model) {
                        model.on(model.OVERLAY_ITEMS_CHANGED, this.onOverlayItemChange, this);
                    }

                }
                // update overlay items (SelectableList)
                if (model && model.getOverlayItems() !== this.items) {
                    this.items = model.getOverlayItems();
                    this.items.on(ListEvent.SELECTED_ITEM_CHANGED, this.updateView, this);
                }

            },

            /**
             * @private
             * Called when the Gallery object's overlayList has changed.
             */
            onOverlayItemChange: function() {
                this.setModel(this.getModel());
                this.updateView();
            },


            /**
             * This handles all basic interactions of the colorbox overlay for the features / gallery pages
             *
             * @inheritDoc
             */
            createView: function($context) {
                this.initMouseInteractions();
                this.placeOverlayNav();

                var shareOverlay = $("#gallery-overlay-share");
                var shareButton = this.getContext().find(".share-btn");
                this.share = new ShareOverlay(shareOverlay, shareButton);
                this.share.setOpenCallback(this.onShareOpen);
                this.share.setCloseCallback(this.onShareClose);


                // downloadable wallpaper
                var downloadBtn = this.getContext().find(".download-wall-paper");
                this.wallpaper = new WallpaperView(null, downloadBtn);

                // cache variables
                this.$overlayTitle = $("#overlay-title");
                this.$overlaySubtitle = $("#overlay-subtitle");
                this.$overlayDescriptions = $("#overlay-description");

                // Deselect item when you click on the overlay (grey background) or x button
                $context.on('click touch', '#overlay-close', $.proxy(this.deselectItem, this));

                this.$touts = $context.find("#overlay-touts");
                this.$toutTitleTemplate = this.$touts.find(".title.template");
                this.$toutDescriptionTemplate = this.$touts.find(".description.template");

                // Swipe behaviour on images
                $context.find("#overlay-media-container").swipe({
                    swipe: $.proxy(this.onItemSwipe, this),
                    allowPageScroll: "vertical" //Horizontal scroll blocked
                });

                $context.find('.share-btn').click($.proxy(this.onShareClick, this));
                // Deselect item when you press the escape key
                $(document).on('keydown', $.proxy(this.onKeyDown, this));

                // Resize Colorbox when resizing window or changing mobile device orientation
                $(window).on('resize orientationchange', $.proxy(this.onResize, this));

                // close the share overlay when you click on the text portion of the overlay.
                // $context.on("click", ".overlay-content", $.proxy(this.onClickContent, this));

                //Wallpaper download behaviors
                $context.on('click touch', '.download-dropdown-content a', $.proxy(this.onWallpaperSelection, this));

                //Listen for iframe messages
                if (typeof(window.postMessage) !== 'undefined') {
                    if (typeof(window.addEventListener) !== 'undefined') {
                        window.addEventListener("message", $.proxy(this.onMessageFromIFrame, this), false);
                    }
                }

                this.updateView();
            },

            /**
             * Called when a message is dispatched from the iframe brightcove player.
             *
             * @param event {{data:string}} Data property is a swipe direction either "left" or "right".
             */
            onMessageFromIFrame: function(event) {
                if (event.data === "left") {
                    this.items.selectNextItem();
                } else if (event.data === "right") {
                    this.items.selectPreviousItem();
                }
            },

            /**
             * Destroys share and re-instantiates with new context.
             */
            resetShare: function() {
                this.share.destroy();
                this.share = new ShareOverlay(this.getContext());
                this.share.setOpenCallback(this.onShareOpen);
                this.share.setCloseCallback(this.onShareClose);
            },

            /**
             * @inheritDoc
             */
            updateView: function() {
                var model = this.getModel(),
                    items;
                if (model) {
                    items = model.getOverlayItems();
                } else {
                    return;
                }

                if (items) {
                    var itemData = items.getSelectedItem();

                    if (itemData) {
                        // update the share with the new item
                        this.share.setSocialContent(itemData.social);
                        this.wallpaper.setModel(this.items.getSelectedItem().wallpaperAssets);
                    } else {
                        this.share.setSocialContent(null);
                    }

                    // Hide the share panel whenever the user switches items.
                    this.share.closeShare();

                    this.updateButton();

                    if (itemData) {

                        this.$overlayTitle.html(itemData.titleAllCaps);
                        this.$overlaySubtitle.html(itemData.subtitle ? itemData.subtitle : "");
                        this.$overlayDescriptions.html(itemData.description);

                        // put model data where it belongs

                        if (!this.$overlayTitle.html().trim()) {
                            this.$overlayTitle.hide();
                            // If no title is found, set minimal layout
                            minimalLayout = true;
                            this.setMinimalLayout();
                        } else {
                            this.$overlayTitle.show();
                        }

                        if (!this.$overlaySubtitle.html().trim()) {
                            this.$overlaySubtitle.hide();
                        } else {
                            this.$overlaySubtitle.show();
                        }

                        if (!this.$overlayDescriptions.html().trim()) {
                            this.$overlayDescriptions.hide();
                        } else {
                            this.$overlayDescriptions.show();
                        }

                        if (!this.$overlayDescriptions.html().trim() && !this.$overlaySubtitle.html().trim()) {
                            this.$overlayTitle.addClass('no-description');
                        }

                        // hide image
                        var $overlayImage = $("#overlay-image");
                        //Prevent-show class is for prevent the onImageLoaded
                        //when you switch really fast between images and videos
                        $overlayImage.hide().addClass("prevent-show").stop();

                        if ($smallImage) {
                            $smallImage.remove();
                            $smallImage = null;
                        }

                        // hide video player
                        var $overlayVideo = $("#overlay-video-player");
                        $overlayVideo.hide();

                        // hide interactive
                        if ($iFrame) {
                            $iFrame.remove();
                            $iFrame = null;
                        }
                        if (iFrameInterval) {
                            clearInterval(iFrameInterval);
                        }


                        // if the item is a video or an interactive overlay, put it in an iframe
                        if (itemData.isVideo() || itemData.isInteractive()) {
                            // Css class for video
                            var videoClass = '';
                            //isMobile is a parameter which determines which version of the overlay video player to use. Parsed on /video/video.jsp
                            var isMobile = navigator.userAgent.match(/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/) ? true : false;

                            if (itemData.isVideo()) {
                                videoClass = 'video';
                            }

                            var src = itemData.getIFramePath() + (itemData.getIFramePath().indexOf('?') > 0 ? '&' : '?') + 'isMobile=' + isMobile;

                            $iFrame = $("<iframe id='overlay-interactive-frame' class='" + videoClass + "' src='" + src + "' frameborder='0' scrolling='no'></iframe>");
                            $iFrame.one("load", $.proxy(this.onIFrameLoaded, this));

                            var $mediaContainer = this.getContext().find("#overlay-media-container");
                            $mediaContainer.append($iFrame);

                            if (itemData.interactive.mobileImage && itemData.isInteractive()) {
                                $smallImage = $('<img id="overlay-interactive-small-image" />');
                                $smallImage.attr('src', itemData.interactive.mobileImage.src).attr('title', itemData.interactive.mobileImage.title).attr('alt', itemData.interactive.mobileImage.title);
                                $mediaContainer.append($smallImage);
                            }



                        } else {
                            // set up onLoad listener that hides loading animation.
                            // (overlay image gets shown after loading)
                            //IE 11 won't fire load unless we remove src attribute
                            $overlayImage.removeClass("prevent-show").removeAttr('src').one("load", $.proxy(this.onImageLoaded, this));
                            // set image data

                            // TODO: do this logic in the GalleryItem class
                            if (itemData.overlay) {
                                $overlayImage.attr("src", itemData.overlay.image.src);
                                $overlayImage.attr("title", itemData.overlay.image.title);
                                $overlayImage.attr("alt", itemData.overlay.image.title);
                            } else {
                                $overlayImage.attr("src", itemData.fullsize.src);
                                $overlayImage.attr("title", itemData.fullsize.title);
                                $overlayImage.attr("alt", itemData.fullsize.title);
                            }
                            // show loader
                            this.showLoadingAnimation();
                        }

                        // next and prev buttons
                        $('#overlay-next-title').html(items.getNextItem().titleAllCaps);
                        $('#overlay-previous-title').html(items.getPreviousItem().titleAllCaps);

                        $xOfY.show();
                        // Fix from adding single video overlays on CPO
                        // Only show arrows for navigation if there's something to navigate tos
                        if (items.getLength() < 2) {
                            $("#overlay-nav").hide();
                        } else {
                            $("#overlay-nav").show();
                        }
                        $("#colorbox").data("galleryCount", items.getLength());
                        // set the "gallery xx of xx" text
                        $("#overlay-current-index").html(items.getSelectedItemIndex() + 1);
                        $("#overlay-total-index").html(items.getLength());

                        // Set list of feature touts.
                        this.$touts.empty();
                        var touts;

                        if (itemData.overlay) {
                            touts = itemData.overlay.paragraph;
                        }


                        if (touts && touts.length) {
                            var i = 0,
                                l = touts.length,
                                tout;

                            for (; i < l; i++) {
                                tout = touts[i];
                                this.$toutTitleTemplate.clone().removeClass("template").html(tout.title).appendTo(this.$touts);
                                this.$toutDescriptionTemplate.clone().removeClass("template").html(tout.description).appendTo(this.$touts);
                            }
                            this.$touts.show();
                        } else {
                            this.$touts.hide();
                        }

                        // do any other stuff htat has to happen to be updated.
                        // for example, position buttons,
                        // resize, etc.

                        this.openColorbox();
                        this.updateArrowText();
                        // trigger resize immediately
                        this.doResize();
                        // trigger resize again a bit later
                        this.onResize();
                    } else {
                        removeImageUrl = true;
                        this.closeColorbox();
                    }

                }

                // reset arrow selection
                leftArrowSelected = null;

            },


            //// Manipulating the model

            /**
             * Deselects the selected item in the gallery model.
             * This makes the selected item null which in turn
             * causes the overlay to close.
             *
             * @param [e] {Object} Event object. Optional. only used when called as an event handler.
             */
            deselectItem: function(e) {
                if (e) {
                    e.preventDefault();
                }
                this.items.setSelectedItem(null);
            },

            /**
             * @private
             * Sets a minimal theme for colorbox.
             */
            setMinimalLayout: function() {
                $('#colorbox').addClass('minimal');
            },

            /**
             * @private
             * Triggered by clicking the next button.
             */
            onNextButton: function(e) {
                var hasMSTouch = $('html').hasClass('mstouch');
                if (e) {
                    e.preventDefault();
                    //Check for disclaimer click
                    if (e.target.className === 'asterisk') {
                        leftArrowSelected = false;

                    } else {
                        analytics.helper.fireOverlayNextClick(this.type, this.items.getSelectedItem());
                        this.items.selectNextItem();
                        if (!hasMSTouch) {
                            this.onMouseEnterNext();
                        }
                    }
                }
            },

            /**
             * @private
             * Triggered by clicking the previous button.
             */
            onPreviousButton: function(e) {
                var hasMSTouch = $('html').hasClass('mstouch');
                if (e) {
                    e.preventDefault();
                    //Check for disclaimer click
                    if (e.target.className === 'asterisk') {
                        leftArrowSelected = true;
                    } else {
                        analytics.helper.fireOverlayPreviousClick(this.type, this.items.getSelectedItem());
                        this.items.selectPreviousItem();
                        if (!hasMSTouch) {
                            this.onMouseEnterPrevious();
                        }
                    }
                }
            },

            /**
             * @private
             * Called when the user selects a wallpaper to download.
             * @param e {Event}
             */
            onWallpaperSelection: function(e) {
                var $button = $(e.currentTarget);
                var size = $button.find(".dimensions").text();
                analytics.helper.fireOverlayDownloadLinkClick(this.items.getSelectedItem().title, size);
            },

            /**
             * @private
             * Triggered when the image in the overlay is loaded.
             * Hides the loading animation and fades the image in.
             */
            onImageLoaded: function(e) {
                if ($("#overlay-image").hasClass("prevent-show")) {
                    return;
                }
                this.hideLoadingAnimation();
                $("#overlay-image").stop().fadeTo(500, 1);
            },

            /**
             * @private
             * Triggered when the iframe contnet is loaded.
             * Resizes the iframe to match the content area.
             */
            onIFrameLoaded: function(e) {
                // stop the old iframe interval and clear the previous size
                clearInterval(iFrameInterval);
                previousIFrameHeight = NaN;
                fixColorBox = false;
                // start polling the iframe for changes in size.
                iFrameInterval = setInterval($.proxy(this.resizeIFrame, this), 50);
            },

            /**
             * @private
             * Resize the iFrame to match its content.
             */
            resizeIFrame: function() {
                if ($iFrame && $iFrame.length) {
                    this.hideLoadingAnimation();
                    var contentHeight = null,
                        contentWidth = null,
                        $iFrameDoc = $($iFrame[0].contentWindow.document),
                        $module = $iFrameDoc.find(".module");

                    // Check if Iframe is a Brightcove Video vs Interactive
                    if ($iFrameDoc.find('.gallery-video').length) {
                        contentHeight = $module.css('padding-bottom');
                    } else {
                        contentHeight = $module.css('height');
                    }

                    if (contentHeight !== previousIFrameHeight) {
                        previousIFrameHeight = contentHeight;
                        $iFrame.height(contentHeight);
                    }

                    // Reset width in Brightcove iframe
                    if ($($iFrame[0].contentWindow.document).find('iframe').length) {
                        // set iFrame width to the width of it's container.
                        contentWidth = $('#overlay-media-container').width();
                        contentHeight = $iFrame.height();

                        $($iFrame[0].contentWindow.document).find('iframe').width(contentWidth);
                        $($iFrame[0].contentWindow.document).find('iframe').height(contentHeight);
                    }
                    if (!fixColorBox) {
                        this.doResize();
                        fixColorBox = true;
                    }
                }
            },

            /**
             * @private
             * Adds key commands to the gallery for scrolling left and right and for closing the window.
             */
            onKeyDown: function(e) {
                // Make sure there is a colorbox to reference before performing any operations
                if (!this.colorboxIsOpen()) {
                    return;
                }
                // Deselect item when you press the escape key
                var key = e.keyCode;
                if (key === ESC) {
                    e.preventDefault();
                    if (this.share && this.share.shareOverlayIsOpen()) {
                        this.share.closeShare();
                    } else {
                        this.deselectItem();
                    }
                }
                if (key === LEFT) {
                    this.onPreviousButton(e);
                    this.removeKeyDownState(e);
                }
                if (key === RIGHT) {
                    this.onNextButton(e);
                    this.removeKeyDownState(e);
                }
                if (key === DOWN) {
                    $("#cboxLoadedContent").scrollTop($("#cboxLoadedContent").scrollTop() + 40);
                }
                if (key === UP) {
                    $("#cboxLoadedContent").scrollTop($("#cboxLoadedContent").scrollTop() - 40);
                }

            },

            /**
             * Removes the left/right preview arrows when using the left/right arrow keys
             * @param e
             */
            removeKeyDownState: function(e) {
                if (!this.colorboxIsOpen()) {
                    return;
                }
                // Remove the hover state of the arrow when pressing left/right buttons
                var that = this,
                    key = e.keyCode;
                setTimeout(function() {
                    if (key === LEFT) {
                        that.onMouseLeavePrevious();
                    } else if (key === RIGHT) {
                        that.onMouseLeaveNext();
                    }
                }, 1400);

            },

            /**
             * @private
             * Colorbox resize function
             * using this timer to delay how often the resize method gets called on colorbox
             * @see doResize()
             */
            onResize: function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout($.proxy(this.doResize, this), RESIZE_DELAY);
            },

            /**
             * @private
             * this is the actual function that gets called when
             * the timer runs out.
             */
            doResize: function() {
                var idealHeight = $('#overlay-container').height();

                if (this.colorboxIsOpen()) {
                    $.colorbox.resize({
                        width: '90%',
                        maxWidth: '1204px',
                        height: '90%'
                    });
                }
                $('#colorbox.minimal').css('height', idealHeight);
                animationsEnabled = ($('.touch').length || $(window).width() < MEDIUM_BREAKPOINT) ? true : false;
            },

            /**
             * @private
             * Sets up the mouse interactions for the buttons in the overlay.
             */
            initMouseInteractions: function() {
                var previousButton = $('#overlay-prev-btn');
                var nextButton = $('#overlay-next-btn');
                var hasMSTouch = $('html').hasClass('mstouch');
                var bodyElement = $('#' + bodyId);

                // LIM-1628 only enable if not in a microsoft touch device
                if (hasMSTouch) {
                    previousButton.on("click touch", $.proxy(this.onPreviousButton, this));
                    nextButton.on("click touch", $.proxy(this.onNextButton, this));
                } else {
                    //handles fade in / out of arrows  
                    bodyElement.on("mouseleave", "#colorbox, .tooltip.default, .tooltip-background", $.proxy(this.fadeOutArrows, this));

                    bodyElement.on('mousemove', '#colorbox, .tooltip.default, .tooltip-background', function() {
                        $('#overlay-nav').stop(true, true).transition({
                            'opacity': 1,
                            'duration': animationDuration
                        });
                        window.clearTimeout(mouseTimer);
                        mouseTimer = window.setTimeout(onButtonTimer, NEXT_PREV_BUTTON_FADE_TIME);
                    });

                    //arrow mouseovers
                    previousButton.on("mouseenter", $.proxy(this.onMouseEnterPrevious, this))
                        .on("mouseleave", $.proxy(this.onMouseLeavePrevious, this))
                        .on("click touch", $.proxy(this.onPreviousButton, this));

                    nextButton.on("mouseenter", $.proxy(this.onMouseEnterNext, this))
                        .on("mouseleave", $.proxy(this.onMouseLeaveNext, this))
                        .on("click touch", $.proxy(this.onNextButton, this));
                }

                var that = this;

                function onButtonTimer() {
                    that.fadeOutArrows();
                }
            },

            /**
             * @private
             * Handles the rollover for previous button.
             */
            onMouseEnterPrevious: function() {
                mouseOverArrow = true;
                if ((leftArrowSelected && $('.tooltip-background').is(':visible')) || leftArrowSelected === null) {
                    if (!animationsEnabled) {
                        this.showArrowText(PREVIOUS, $('.peek', $('#overlay-prev-btn')));
                    }
                }
            },

            /**
             * @private
             * Handles the rollout for previous button.
             */
            onMouseLeavePrevious: function() {
                mouseOverArrow = false;
                if (!animationsEnabled) {
                    this.hideArrowText(PREVIOUS, $('.peek', $('#overlay-prev-btn')));
                }
            },

            /**
             * @private
             * Handles the rollover for next button.
             */
            onMouseEnterNext: function() {
                mouseOverArrow = true;
                if ((!leftArrowSelected && $('.tooltip-background').is(':visible')) || leftArrowSelected === null) {
                    if (!animationsEnabled) {
                        this.showArrowText(NEXT, $('.peek', $('#overlay-next-btn')));
                    }
                }


            },

            /**
             * @private
             * Handles the rollout for next button.
             */
            onMouseLeaveNext: function() {
                mouseOverArrow = false;
                if (!animationsEnabled) {
                    this.hideArrowText(NEXT, $('.peek', $('#overlay-next-btn')));
                }
            },


            /**
             * @private
             * Called when the image was swiped.
             *
             * @param event {object} The original swipe event.
             * @param direction {string} direction of the swipe.
             *
             * additional unused params are distance, duration, fingerCount
             */
            onItemSwipe: function(event, direction) {
                var gallery = this.getModel();
                if (direction === "left") {
                    gallery.getOverlayItems().selectNextItem();
                }
                if (direction === "right") {
                    gallery.getOverlayItems().selectPreviousItem();
                }

            },


            /**
             * @private
             * Animates out the left and right arrow buttons.
             */
            fadeOutArrows: function() {
                if (!mouseOverArrow && !animationsEnabled) {
                    window.clearTimeout(mouseTimer);
                    $('#overlay-nav').stop(true, false).transition({
                        'opacity': '.1',
                        'duration': animationDuration
                    });
                }
            },

            /**
             * @private
             * Animates in the left and right arrow button text.
             */
            showArrowText: function(direction, element) {
                var elWidth = element.width();
                var MAX_NAV_WIDTH = $('#overlay-nav').width() * 0.40;

                if (elWidth > MAX_NAV_WIDTH) {
                    elWidth = MAX_NAV_WIDTH;
                    element.width(elWidth);
                }

                if (direction === PREVIOUS) {

                    element.css('left', elWidth * -1); //required for Safari
                    element.stop(true, false).transition({
                        'left': '60px',
                        'duration': arrowAnimationDuration
                    });

                    element.parent().stop(true, false).transition({
                        'padding-right': elWidth + 25,
                        'duration': arrowAnimationDuration
                    });

                } else {

                    element.stop(true, false).transition({
                        'duration': arrowAnimationDuration
                    });

                    element.parent().stop(true, false).transition({
                        'padding-left': elWidth + 25,
                        'duration': arrowAnimationDuration
                    });
                }
            },

            /**
             * @private
             * Hides the text on the arrow buttons.
             *
             * @param direction {string} "left" or "right" for wipe direction.
             * @param $element {jquery} The button to change.
             */
            hideArrowText: function(direction, $element) {
                var elWidth = $element.width();
                if (direction === PREVIOUS) {
                    $element.stop(true, false).transition({
                        'left': elWidth * -1,
                        'duration': arrowAnimationDuration
                    });


                    $element.parent().stop(true, false).transition({
                        'padding-right': 0,
                        'duration': arrowAnimationDuration
                    });

                } else {

                    $element.stop(true, false).transition({
                        'duration': arrowAnimationDuration
                    });

                    $element.parent().stop(true, false).transition({
                        'padding-left': 0,
                        'duration': arrowAnimationDuration
                    });

                }
                $element.width('auto');
            },

            /**
             * @private
             * Updates the button at the bottom of the overlay.
             * This only needs to happen once per page load since all overlays share the same button.
             */
            updateButton: function() {
                var m = this.getModel();
                var c = this.getContext();

                if (m.hasGalleryButton && !this.$galleryButton) {
                    this.$galleryButton = c.find("#gallery-overlay-button");
                    this.$galleryButton.removeClass("template");
                    this.$galleryButton.find("a").text(m.galleryButtonLabel).attr("href", m.galleryButtonUrl);
                }

                if (m.hasDealerButton && !this.$dealerButton) {
                    this.$dealerButton = c.find("#dealer-overlay-button");
                    this.$dealerButton.removeClass("template");
                    this.$dealerButton.find("a").text(m.dealerButtonLabel).attr("href", m.dealerButtonUrl);

                    this.$dealerButton.on("click touch", function() {
                        analytics.helper.fireFindADealerClick("Overlay");
                    });
                }
            },

            /**
             * @private
             * Updates the text on the left and right buttons.
             */
            updateArrowText: function() {
                //                if (mouseOverArrow) {
                //                    TODO: adjusts the position of the arrows if they are already open and change size.
                //                }

                $('#overlay-nav').find('.peek').width('auto');
            },

            /**
             * @private
             *
             * Appends the overlay to the dom.
             */
            placeOverlayNav: function() {
                var overlayNav = $('#overlay-nav', this.getContext());
                $('#overlay-container').append(overlayNav);
            },

            /**
             * Shows the loading animation.
             */
            showLoadingAnimation: function() {
                /* Set the height of the loading wrapper to match the size of the image */
                var mediaContainer = $('#overlay-container').find('.image');
                mediaContainer.height(9999);
                var wWidth = mediaContainer.width();
                if (wWidth <= 0) {
                    wWidth = ($(window).width() > 1337) ? 1204 : $(window).width() * 0.9;
                }
                var height = Math.round(wWidth * 677 / 1204);
                mediaContainer.height(height);

                $("#overlayLoadingAnimation").show();
            },

            /**
             * Removes the loading animation when the image is loaded.
             */
            hideLoadingAnimation: function() {
                /* Reset the height of the wrapper when loading is done */
                $("#overlay-container .image").height('auto');

                $("#overlayLoadingAnimation").hide();
                LEXUS.loadingAnimation.stop();

            },


            ///// COLORBOX

            /**
             * Opens the overlay.
             *
             * This should never be called except by updateView(). Instead,
             * just set a selected item in the model.
             *
             * @private
             */
            openColorbox: function() {
                $.colorbox({
                    href: "#" + this.getContext().attr("id"),
                    inline: true,
                    width: '90%',
                    height: '90%',
                    scalePhotos: true,
                    maxWidth: '1204px',
                    transition: 'none',
                    closeButton: false,
                    escKey: false,
                    fixed: true,
                    overlayClose: false,
                    onLoad: $.proxy(this.onColorboxLoad, this),
                    onComplete: $.proxy(this.onColorboxLoadComplete, this),
                    onClosed: $.proxy(this.onColorboxClose, this)
                });
            },

            /**
             * Closes the colorbox modal.
             * This should never be called except by updateView()
             * @private
             */
            closeColorbox: function() {
                if (this.colorboxIsOpen()) {
                    $(window).trigger("tooltip.close");
                    $.colorbox.close();
                }
            },

            /**
             * @private
             * Called when colorbox finishes loading.
             */
            onColorboxLoadComplete: function() {
                $('body').css({
                    overflow: 'hidden'
                });
                $("#cboxOverlay").on("click touchstart", $.proxy(this.deselectItem, this));
            },

            /**
             * @private
             * Remove the iframe, stop the iframe resize handler, and clear the contents of the iframe.
             */
            killIFrame: function() {
                if ($iFrame && $iFrame.length) {
                    clearInterval(iFrameInterval);
                    $iFrame.remove();
                }
            },

            /**
             * @private
             * Called when colorbox starts loading.
             */
            onColorboxLoad: function() {
                //[LIM - 3024] Commenting this out, before, this check made sure we didn't fire
                // the tag if it had already been fired onload, but CPD wants this tag to fire any time
                // you toggle through the gallery. Commenting it out for now because some minds might be changed
                // and this might need to be updated again.
                // if (!colorboxInitiallyLoaded) {
                //     analytics.helper.fireOverlayLoad(this.type, this.items.getSelectedItem());
                //     colorboxInitiallyLoaded = true;
                // }
                analytics.helper.fireOverlayLoad(this.type, this.items.getSelectedItem());
            },

            /**
             * @private
             * Called when colorbox closes.
             */
            onColorboxClose: function() {
                $('body').css({
                    overflow: 'auto'
                });
                this.killIFrame();
                colorboxInitiallyLoaded = false;

                if (removeImageUrl) {
                    removeImageUrl = false;

                    //Removes the source of the image to for the load event when the image is in the cache
                    $("#overlay-image").attr('src', null);
                }
            },

            onShareClick: function() {
                $('#cboxLoadedContent').scrollTop(0);
                var item = this.items.getSelectedItem();
                analytics.helper.fireOverlayShareClick(this.type, item, item.social.shareUrl);
            },
            /**
             * On Share Open/Close Actions
             */
            onShareOpen: function() {
                $('#overlay-nav').hide();
            },
            onShareClose: function() {
                if ($("#colorbox").data("galleryCount") < 2) {
                    return;
                }
                $('#overlay-nav').show();
            },

            /**
             * Returns true when the colorbox is open.
             * @returns {boolean}
             */
            colorboxIsOpen: function() {
                return $('#cboxOverlay').is(':visible');
            }
        });

        return GalleryOverlayViewController;
    });
