/**
 * Controller for home page.
 * Handles most of the resizing of the grid using javascript rather than css.
 *
 * Some of the special homepage tiles have their own controllers.
 */
require([
        "modernizr",
        "jquery",
        "PointBreak",
        "page/home/dealerTileController",
        "page/home/specialOfferTileController",
        "page/home/mboxTileController",
        "page/home/tile-video",
        "analytics",
        "transit"
    ],
    function(
        Modernizr,
        $,
        PointBreak,
        dealerTileController,
        specialOfferTileController,
        mboxTileController,
        tileVideo,
        analytics
    ) {
        var isHeroLayout,
            isSema,
            isTouchEnabled,
            pointbreak,
            tilePositions = [],
            tileSizes = [],
            numberOfTiles = 0,
            hasExtraRow = false,
            gridSize = "",
            SQUARE = 'square',
            HERO_SQUARE = 'herosquare',
            RECT = 'rect',
            MIDDLE = 'middle',
            BOTTOM = 'bottom',
            T = 350,
            SMALL = 'small',
            MEDIUM = 'medium',
            LARGE = 'large',
            curBreak = null,
            imgLoadCount = 0; // animation duration

        /**
         * Initialize page
         */

        function init() {

            console.log('tileVideo: ', tileVideo);

            pointbreak = new PointBreak();

            isHeroLayout = $('.hero').length > 0;
            isSema = $('.grid-sema').length > 0;
            isTouchEnabled = ($('html').hasClass('touch') || $('html').hasClass('mstouch'));

            var $tiles = $(".tile"),
                $imgTiles = $tiles.find('img'),
                $alerts = $(".recall-warning"),
                $dealerTile = $(".tile.dealer"),
                $specialOfferTile = $(".tile.offer"),
                $ownerBenefitsTile = $(".tile.owner");

            numberOfTiles = $tiles.length;
            hasExtraRow = numberOfTiles > 7;

            $tiles.on("click touch", onTileClick);
            $alerts.on("click touch", "a", onAlertClick);

            // Check to see if special tiles are defined before creating them.
            if ($dealerTile.length >= 1) {
                dealerTileController.initDealerTile($dealerTile);
            }
            if ($specialOfferTile.length >= 1) {
                specialOfferTileController.initSpecialOfferTile($specialOfferTile);
            }
            mboxTileController.init();

            // Hover rollover animation for homepage components
            // removing this and using css for transitions for 
            // any browser that supports them, LIM-894

            if (!Modernizr.cssanimations) {
                initHoverStates();
            }
            // Change image sizes on breakpoints
            initBreakpointStates();

            if (!$('html').hasClass('lte-ie10')) {
                analytics.helper.fireHomePageLoad(gridSize);
            } else {
                $('.browser-not-supported-content a').on('click touchstart', function() {
                    var $this = $(this);
                    var module = 'Install Browser';
                    var action = 'Upgrade Google Chrome';
                    if ($this.hasClass('microsoft')) {
                        module = 'Upgrade Browser';
                        action = 'Upgrade Internet Explorer';
                    }
                    if ($this.hasClass('firefox')) {
                        module = 'Install Browser';
                        action = 'Upgrade Firefox';
                    }
                    analytics.helper.fireTag('2604.2', {
                        '<section>': 'IE Version Unsupported',
                        '<module>': module,
                        '<action>': action
                    });
                });
                analytics.helper.fireTag('2604.1', {
                    '<section>': 'IE Version Unsupported'
                });
            }

            //LIM 154 changes
            if (LEXUS.recentbuildType) {
                var index = LEXUS.recentbuildType.split("-")[1];
                analytics.helper.fireRecentBuildPresent(gridSize, tileSizes[index], tilePositions[index]);
            }

        }

        // Hover rollover animation for homepage components

        function initHoverStates() {
            // revert to .animate() when transition is not available
            if (!$.support.transition) {
                $.fn.transition = $.fn.animate;
            }

            if (!isTouchEnabled) {
                var $tiles = $('.tile'),
                    $caption = $tiles.find('.caption'),
                    $captionText = $caption.find('p'),
                    $captionBtn = $caption.find('button'),
                    $hitGrid = $tiles.find('.hit-grid a');
                $tiles.on("mouseenter", onMouseEnter).on("mouseleave", onMouseLeave);
                $hitGrid.on("mouseenter", onMouseEnterHitGrid).on("mouseleave", onMouseLeaveHitGrid);
                $captionText.css({
                    'visibility': 'hidden'
                });
                $captionBtn.css({
                    'visibility': 'hidden'
                });
                $caption.each(function() {
                    if ($(this).hasClass(BOTTOM)) {
                        var btnHeight = $(this).find('button').outerHeight();
                        $(this).find('.btn-outer').height(btnHeight);
                    }
                });
            }

            function onMouseEnter(event) {
                var $tile = $(event.currentTarget),
                    $caption = $tile.find('.caption'),
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

            function onMouseLeave(event) {
                var $tile = $(event.currentTarget),
                    $caption = $tile.find('.caption'),
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

            function onMouseEnterHitGrid(event) {
                var $a = $(event.currentTarget),
                    $hitGridBtn = $a.find('button');

                $hitGridBtn.css({
                    'visibility': 'visible'
                });

                $hitGridBtn.animate({
                    'opacity': 1,
                    'top': '-15px',
                    'height': '37px',
                    'duration': 400
                }, {
                    queue: false
                });
            }

            function onMouseLeaveHitGrid(event) {
                var $a = $(event.currentTarget),
                    $hitGridBtn = $a.find('button');

                $hitGridBtn.css({
                    'visibility': 'hidden'
                });

                $hitGridBtn.animate({
                    'opacity': '0',
                    'top': '-25px',
                    'height': 0,
                    'duration': 100
                }, {
                    queue: false
                });
            }
        }


        // Change image sizes on breakpoints

        function initBreakpointStates() {

            // Create a new instance of breakpoint helper.
            var breakpointAtLoad = pointbreak.getCurrentBreakpoint();

            // Add a specific break point for home small
            pointbreak.addSmallListener(onSmallBreakpoint);
            pointbreak.addMediumListener(onMediumBreakpoint);
            pointbreak.addLargeListener(onLargeBreakpoint);
            pointbreak.addMaxListener(onLargeBreakpoint);

            function onSmallBreakpoint() {
                curBreak = SMALL;
                // SMALL (hero & normal)
                setTileSizes([
                    HERO_SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE,
                    SQUARE
                ]);

                tilePositions = [
                    "1x1",
                    "1x2",
                    "1x3",
                    "1x4",
                    "1x5",
                    "1x6",
                    "1x7",
                    "1x8",
                    "1x9",
                    "1x10"
                ];

                tileSizes = [
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1",
                    "1x1"
                ];

                gridSize = hasExtraRow ? "1x10" : "1x7";
            }

            function onMediumBreakpoint() {
                curBreak = MEDIUM;
                // MEDIUM (hero)
                if (isHeroLayout) {
                    setTileSizes([
                        RECT,
                        RECT, SQUARE,
                        RECT, SQUARE, // these tiles flip
                        RECT, SQUARE,
                        SQUARE, SQUARE, SQUARE
                    ]);


                    tilePositions = [
                        "1x1",
                        "1x3", "3x3",
                        "1x4", "2x4",
                        "1x5", "3x5",
                        "1x6", "2x6", "3x6"
                    ];

                    tileSizes = [
                        "3x2",
                        "2x1", "1x1",
                        "1x1", "2x1",
                        "2x1", "1x1",
                        "1x1", "1x1", "1x1"
                    ];
                    gridSize = hasExtraRow ? "3x6" : "3x5";

                    // MEDIUM (normal)
                } else {
                    if (isSema) {
                        setTileSizes([
                            HERO_SQUARE, SQUARE,
                            SQUARE,
                            SQUARE, SQUARE, // these tiles flip
                            RECT, SQUARE,
                            SQUARE, SQUARE, SQUARE
                        ]);
                    } else {
                        setTileSizes([
                            HERO_SQUARE, SQUARE,
                            SQUARE,
                            RECT, SQUARE, // these tiles flip
                            RECT, SQUARE,
                            SQUARE, SQUARE, SQUARE
                        ]);
                    }

                    tilePositions = [
                        "1x1", "3x1", "3x2",
                        "2x3", "1x3", // flipped tiles
                        "1x4", "3x4",
                        "1x5", "2x5", "3x5"
                    ];

                    tileSizes = [
                        "2x2", "1x1",
                        "1x1",
                        "2x1", "1x1", // flipped tiles
                        "2x1", "1x1",
                        "1x1", "1x1", "1x1"
                    ];
                    gridSize = hasExtraRow ? "3x5" : "3x4";
                }

            }

            function onLargeBreakpoint() {
                curBreak = LARGE;
                // LARGE (hero)
                if (isHeroLayout) {
                    setTileSizes([
                        RECT,
                        SQUARE, SQUARE, RECT,
                        SQUARE, RECT, SQUARE,
                        RECT, SQUARE, SQUARE
                    ]);

                    tilePositions = [
                        "1x1",
                        "1x3", "2x3", "3x3",
                        "1x4", "2x4", "4x4",
                        "1x5", "3x5", "4x5"
                    ];

                    tileSizes = [
                        "4x2",
                        "1x1", "1x1", "2x1",
                        "1x1", "2x1", "1x1",
                        "2x1", "1x1", "1x1"
                    ];
                    gridSize = hasExtraRow ? "4x5" : "4x4";

                    // LARGE (normal)
                } else {
                    if (isSema) {
                        setTileSizes([
                            HERO_SQUARE, SQUARE, SQUARE,
                            SQUARE,
                            SQUARE, RECT, SQUARE,
                            RECT, SQUARE, SQUARE
                        ]);
                    } else {
                        setTileSizes([
                            HERO_SQUARE, SQUARE, SQUARE,
                            RECT,
                            SQUARE, RECT, SQUARE,
                            RECT, SQUARE, SQUARE
                        ]);
                    }


                    tilePositions = [
                        "1x1", "3x1", "4x1",
                        "3x2",
                        "1x3", "2x3", "4x3",
                        "1x4", "3x4", "4x4"
                    ];

                    tileSizes = [
                        "2x2", "1x1", "1x1",
                        "2x1",
                        "1x1", "2x1", "1x1",
                        "2x1", "1x1", "1x1"
                    ];
                    gridSize = hasExtraRow ? "4x4" : "4x3";
                }
            }

            // Onload update breakpoints and images
            if (breakpointAtLoad === PointBreak.SMALL_BREAKPOINT) {
                onSmallBreakpoint();
            }
            if (breakpointAtLoad === PointBreak.MED_BREAKPOINT) {
                onMediumBreakpoint();
            }
            if (breakpointAtLoad === PointBreak.LARGE_BREAKPOINT || breakpointAtLoad === PointBreak.MAX_BREAKPOINT) {
                onLargeBreakpoint();
            }
        }

        /**
         * Returns the index of a tile dom object.
         *
         * @param tile {jquery|HTMLElement} The tile to return the index of.
         * @return {Int}
         *
         * @throws Error if the element or id is not in the right format.
         */

        function getIndexOfTile(tile) {
            var id = $(tile).attr("id");
            var index = parseInt(id.substr(("tile-").length), 10);
            if (isNaN(index)) {
                throw new Error("This tile isn't a valid tile.");
            }
            return index;
        }

        /**
         * Returns the tile element at the index i.
         * If not found, the object will be empty.
         *
         * @param i {Int} Index of teh tile.
         * @returns {jquery}
         */

        function getTileAtIndex(i) {
            return $("#tile-" + i);
        }

        /**
         * Loops through all the tile sizes and sets each tile's size
         * and image accordingly.
         *
         * @param tileSizes {Array.<string>}
         */

        function setTileSizes(tileSizes) {
            setTileSize(getTileAtIndex(0), tileSizes[0], function() {
                var i = 1,
                    l = tileSizes.length;
                for (; i < l; i += 1) {
                    setTileSize(getTileAtIndex(i), tileSizes[i]);
                }
            });

        }

        /**
         * Executed when the user clicks or touches on a tile.
         *
         * @param event {Event}
         */

        function onTileClick(event) {
            var $tile = $(event.currentTarget),
                tileTitle = $tile.find(".title").text(),
                index = getIndexOfTile($tile);

            analytics.helper.fireHomepageTileClick($tile, tileTitle, gridSize, tileSizes[index], tilePositions[index]);
        }

        /**
         * Executed when the user clicks or touches on an alert message.
         *
         * @param event {Event}
         */

        function onAlertClick(event) {
            var $alert = $(event.delegateTarget),
                message = $alert.find(".warning-header").text() + " - " + $alert.find(".warning-description").text(),
                container = $alert.data("container");

            analytics.helper.fireHomepageAlertClick(message, container);
        }

        /**
         * Update image count and if it's time, let the video controller know
         * all the images have loaded.
         *
         * @param event {Event}
         */

        function checkImageCount() {
            // Only do this if current break point is not small and either:
            //   - device is NOT touch enabled or,
            //   - device is touch and wider than 1024px/average tablet
            imgLoadCount++;
            if (tileVideo && imgLoadCount === numberOfTiles && curBreak !== SMALL && (!isTouchEnabled || (isTouchEnabled && window.innerWidth >= 1024))) {
                imgLoadCount = 0;
                // console.error('******** START PRELOADING FROM HOME MAIN JS *********');
                tileVideo.startPreloading();
            }
        }

        // Update image ratio and src based on breakpoint

        function setTileSize(tile, imgType, complete) {
            tile = $(tile);
            var img = tile.find(".background"),
                caption = tile.find('.caption');
            tile.removeClass(SQUARE).removeClass(RECT).removeClass(HERO_SQUARE);

            if (img.length) { // Make sure div is there

                /**
                 * @todo: Using the .load() shortcut is inconsistent across browsers. For example
                 * safari will not fire if image src is set to the same src as before. Event will
                 * also not fire if the image loads from browser cache.
                 */
                // Wait for images to be ready before fading them in
                img.load(function() {
                    var imgCont = $(this).closest('.tile');

                    checkImageCount();

                    // if css3 animations are not supported then using jquery.animate
                    if (!Modernizr.cssanimations) {
                        imgCont.animate({
                            opacity: 1
                        }, 1000);
                        // if css3 animations are supported add a class to set opacity: 1
                    } else {
                        imgCont.addClass('loaded');
                    }
                    // used by tile-video to make sure video doesnt play before image loads.
                    img.parent('.tile').addClass('img-loaded');
                    if (typeof complete === "function") {
                        complete();
                    }

                }).error(function() {
                    checkImageCount();
                });

                // Remove hover styles
                caption.attr("style", "");
                tile.addClass(imgType);

                // dont set the src if it's already set and decrement numberOfTiles so we can still tell videos to start loading.
                if (img.attr('src').length) {
                    numberOfTiles--;
                    return;
                }

                if (imgType === RECT) {
                    img.attr("src", img.data("rectSrc"));

                } else {
                    img.attr("src", img.data("squareSrc"));
                }

            }
        }

        // Initialize page
        init();

    }

);
