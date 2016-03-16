define([
    "jquery",
    "analytics",
    "PointBreak",
    "util/setColumnEqualHeights",
    "util/smartResize",
    "touchSwipe",
    "transit"
], function(
    $,
    analytics,
    PointBreak,
    ColumnHeight
) {

    /**
     * Carousel widget which allows for dynamic number of pages
     * to be configred to help support repsonsive.
     *
     * @class Carousel
     * @typedef  {config}  configuration parameters.
     * @property {jquery}  instance - (required) jQuery object containing module wrapper
     * @property {String}  slideSelector - (required) CSS selector specifying what elements will be considered the slides
     * @property {Boolean} autoHeight - Determines whether or not to automatically make the height that of the tallest element
     * @property {Number}  slidesPerPage - Number of slides per page
     * @property {Boolean} showIndicators - Whether or not to show dot navigation
     * @property {Boolean} showNextPrev - Whether or not to show left/right navigation
     * @property {Number}  animationDuration - Length of the slide animation
     * @property {Boolean} autoSlideHeight - Determines whether or not container resizes to match slide page height
     */
    var Carousel = function(params) {
        var opts = $.extend({
            instance: null,
            slideSelector: ".item",
            autoHeight: true,
            slidesPerPage: 1,
            showIndicators: false,
            showNextPrev: false,
            animationDuration: 600,
            autoSlideHeight: false,
            equalColumnHeights: false,
            viz: false,
            preventAllPadding: false // Needed for CPO carousel, add to make sure other carousels don't break
        }, params),
            pointbreak = new PointBreak(),
            $module = opts.instance,
            $slides = null,
            $pages = null,
            $indicators = null,
            ACTIVE_CLASS = "active",
            SLIDE_CHANGED = "slideChanged",
            isLocked = false,
            previousIndex = 0,
            currentIndex = 0;

        /**
         * @constructor
         */

        function init() {

            if ($module !== null) {
                registerSlides();

                $module.addClass("carousel");

                setupSlides();

                if ($slides.length > opts.slidesPerPage) {
                    setupControls();
                }

                bindResize();
                addTouchEvents();
            } else {
                throw new Error("Carousel - module instance is required");
            }

        }

        /**
         * Sets the slides, can be used for dynamically updating slideshow contents
         *
         * @method registerSlides
         * @private
         */

        function registerSlides() {
            $slides = $module.find(opts.slideSelector);
        }

        /**
         * Set up UI elements that can interact with the carousel
         *
         * @method setupControls
         * @private
         */

        function setupControls() {
            if (opts.showIndicators === true) {
                renderIndicators();

                $module.on("click.carousel", ".indicators a", onIndicatorClick);
                updateIndicators(0);
            }

            if (opts.showNextPrev === true) {
                renderNextPrev();
            }
        }

        /**
         * Update slide state after clicking an indicator
         *
         * @method onIndicatorClick
         * @param {Event} e - jquery event object
         * @private
         */

        function onIndicatorClick(e) {
            e.preventDefault();
            var $this = $(this),
                index = $(this).data("num");

            if (isLocked === false) {
                if ($this.hasClass("next")) {
                    next();
                } else if ($this.hasClass("prev")) {
                    prev();
                } else {
                    var direction = index > currentIndex ? "right" : "left";
                    currentIndex = index;
                    updateIndicators(currentIndex);
                    jumpToIndex(currentIndex, direction);
                }
            }
        }

        /**
         * Updates the currently selected indicator
         *
         * @method updateIndicators
         * @param {Number} index - indicator to update
         * @private
         */

        function updateIndicators(index) {
            if (opts.showIndicators === true) {
                if (!$indicators) {
                    $indicators = $module.find(".indicators a");
                }
                $indicators.removeClass(ACTIVE_CLASS);
                $indicators.eq(index).addClass(ACTIVE_CLASS);
            }
        }

        /**
         * Using swipe plugin to manage left/right swipe, while still allowing up/down scrolling
         *
         * @method addTouchEvents
         * @private
         */

        function addTouchEvents() {
            if (Modernizr.touch) {
                $module.swipe({
                    swipe: function(event, direction, distance, duration, fingerCount) {
                        if (isLocked === false) {
                            isLocked = true;

                            if (direction === "left") {
                                next();
                            } else if (direction === "right") {
                                prev();
                            }
                        }
                    },
                    allowPageScroll: "vertical"
                });
            }
        }

        /**
         * Group slides into sections based on slidesPerPage
         *
         * @method setupSlides
         * @private
         */

        function setupSlides() {
            var slideClass = "slide";

            for (var i = 0; i < $slides.length; i += opts.slidesPerPage) {
                if (i < opts.slidesPerPage) {
                    slideClass = "slide " + ACTIVE_CLASS;
                } else {
                    slideClass = "slide";
                }

                $slides.slice(i, (i + opts.slidesPerPage)).wrapAll('<div class="' + slideClass + '" />');
            }

            $pages = $module.find(".slide");

            if (opts.autoHeight === true) {
                setSlideHeight();
            }

            //count the number of slides
            $pages.each(function() {
                $(this).addClass("slide-count-" + $(this).children().addClass("single-slide").length);
            });

            if (opts.equalColumnHeights) {
                if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                    setSlidesEqualHeight($module, ".equal-height");
                }
            }

            jumpToIndex(0);
        }

        /**
         * Calculate tallest slide and set heights so it's easier to animate
         *
         * @method setSlideHeight
         * @public
         */

        function setSlideHeight() {
            var tallestSlideHeight = 0;

            $pages.each(function() {
                tallestSlideHeight = Math.max($(this).height(), tallestSlideHeight);
            });

            if (opts.viz === true) {
                //This fixes the bad padding given to lazyloaded images in the visualizer
                $module.css("padding-top", '43%');
            } else {
                $module.css("padding-top", tallestSlideHeight);
            }
        }

        function setSlidesEqualHeight($container, $equalHeightClass) {
            ColumnHeight.setColumnEqualHeights($container, $equalHeightClass);

            if (opts.autoHeight === true) {
                setSlideHeight();
            }

        }

        function removeSlidesEqualHeight($container, $equalHeightClass) {
            ColumnHeight.removeColumnEqualHeights($container, $equalHeightClass);

            if (opts.autoHeight === true) {
                setSlideHeight();
            }

        }

        /**
         * Setup carousel's next/prev buttons
         *
         * @method renderNextPrev
         * @private
         */

        function renderNextPrev() {
            var $indicatorsWrap = $module.find(".indicators"),
                $visualizer = $('#visualizer-container').find('.visualizer-carousel'),
                $visualizerNext = null,
                $visualizerPrev = null,
                $next = $module.find(".next"),
                $prev = $module.find(".prev");

            if ($visualizer && $visualizer.find(".next").length < 1) {
                $visualizer.prepend('<a href="#" class="control prev">');
                $visualizer.append('<a href="#" class="control next">');

                $visualizerNext = $visualizer.find(".next");
                $visualizerPrev = $visualizer.find(".prev");
            }

            $indicatorsWrap.prepend('<a href="#" class="control prev">');
            $indicatorsWrap.append('<a href="#" class="control next">');


            $next.add($visualizerNext).on("click.carousel", function(e) {
                e.preventDefault();
                if (isLocked === false) {
                    next();
                }
            });

            $prev.add($visualizerPrev).on("click.carousel", function(e) {
                e.preventDefault();
                if (isLocked === false) {
                    prev();
                }
            });
        }

        /**
         * Renders carousel indicators which highlight the currently selected slide
         *
         * @method renderIndicators
         * @private
         */

        function renderIndicators() {
            var $indicatorsWrap = $('<div class="indicators" />');

            $pages.each(function(i) {
                $indicatorsWrap.append('<a href="#" class="indicator" data-num="' + i + '" />');
            });

            $module.append($indicatorsWrap);
            $indicators = $module.find(".indicators a");
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT) && $pages.length > 16) {
                $('.indicator').css('display', 'none');
            }
        }

        /**
         * Jumps to a particular slide
         *
         * @method jumpToIndex
         * @param {Number} index - slide to jump to
         * @param {String} direction - which direction the animation should go. valid options are left|right
         * @param {boolean} [noAnimation=false] - If false, jump to the slide immediately.
         * @public
         */

        function jumpToIndex(index, direction, noAnimation) {
            noAnimation = noAnimation === true ? true : false;

            if (previousIndex !== index) {
                isLocked = true;
                updateIndicators(index);

                if (typeof direction !== "undefined") {
                    transitionSlides(index, direction, noAnimation);
                } else if (previousIndex > index) {
                    transitionSlides(index, "left", noAnimation);
                } else {
                    transitionSlides(index, "right", noAnimation);
                }

                currentIndex = index;

                $module.trigger(SLIDE_CHANGED);

            }
        }


        /**
         * Slide the current slide away, and the next one into view
         *
         * @method transitionSlides
         * @param {Number} index - slide to show
         * @param {String} direction - which direction the animation should go. valid options are left|right
         * @param {boolean} [noAnimation=false] - If false, jump to the slide immediately.
         * @private
         */

        function transitionSlides(index, direction, noAnimation) {
            var offset = $module.outerWidth();
            var leftOffset = (direction === "left") ? offset : -(offset);

            if (opts.autoSlideHeight === true) {
                if (noAnimation) {
                    $module.css("padding-top", $pages.eq(index).height());
                } else {
                    $module.animate({
                        "padding-top": $pages.eq(index).height()
                    }, opts.animationDuration);
                }
            }

            var $page = $pages.eq(index);
            var $active = $module.find(".slide.active");
            $page.show();

            if (noAnimation) {
                $page.css("left", 0);
                $active.css("left", leftOffset);
                afterAnimate();
            } else {
                $page.css({
                    left: (direction === "left") ? -(offset) : offset
                });

                $page.transition({
                    left: 0
                }, opts.animationDuration, afterAnimate);

                $active.transition({
                    left: leftOffset
                }, opts.animationDuration);
            }

            /**
             * @private
             *
             * Run after the animation completes. swap the active page and unlock.
             */

            function afterAnimate() {
                $(window).trigger("lazyload"); // Load any lazy load images
                $pages.removeClass(ACTIVE_CLASS).hide();
                $pages.eq(index).addClass(ACTIVE_CLASS).show();


                isLocked = false;
                previousIndex = index;
            }
        }

        /**
         * Increments slide index and jumps to new value
         *
         * @method transitionSlides
         * @public
         */

        function next() {
            currentIndex++;

            if (currentIndex >= $pages.length) {
                currentIndex = 0;
            }

            jumpToIndex(currentIndex, "right");
        }

        /**
         * Decrements slide index and jumps to new value
         *
         * @method prev
         * @public
         */

        function prev() {
            currentIndex--;

            if (currentIndex < 0) {
                currentIndex = $pages.length - 1;
            }

            jumpToIndex(currentIndex, "left");
        }

        /**
         * Resets slides with new settings
         *
         * @method resetSlides
         * @param {Object} config @see init()
         * @public
         */

        function resetSlides(newSettings) {

            $.fx.off = true;

            opts = $.extend(opts, newSettings);
            currentIndex = 0;
            previousIndex = 0;
            isLocked = false;

            $module.off("click");
            clean();

            // If the slides have changed, re-register the DOM
            if (typeof newSettings !== "undefined" && newSettings.slideSelector !== null) {
                registerSlides();
            }

            setupSlides();

            if ($slides.length > opts.slidesPerPage) {
                setupControls();
            }

            $.fx.off = false;
        }

        /**
         * Cleans up generated markup
         *
         * @method clean
         * @private
         */

        function clean() {
            $slides.unwrap();
            $module.find(".control").remove();
            $module.find(".indicators").remove();
            // remove visulaizer arrows
            $module.parents('.visualizer-carousel').find('.control').remove();
        }

        /**
         * Binds an adjustment to the resize to make sure the carousel
         * height adjusts properly based on variable height of slides
         *
         * @method bindResize
         * @private
         */

        function bindResize() {
            $(window).smartresize(function() {
                var index = currentIndex;
                var numOfSlides = $slides.length;

                resetSlides();

                if (numOfSlides === $slides.length) {
                    jumpToIndex(index, 'left', true);
                }

                if (opts.equalColumnHeights) {
                    if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                        setSlidesEqualHeight($module, ".equal-height");
                    } else {
                        removeSlidesEqualHeight($module, ".equal-height");
                    }
                }

                if (!opts.preventAllPadding && isLocked === false) {
                    $module.css("padding-top", "auto");
                    setSlideHeight();
                }
            });
        }

        /**
         * returns index of currently selected slide
         *
         * @method getCurrentIndex
         * @return {int} currentIndex - the index of the current slide
         * @public
         */

        function getCurrentIndex() {
            return currentIndex;
        }

        init();

        return {
            jumpToIndex: jumpToIndex,
            resetSlides: resetSlides,
            next: next,
            prev: prev,
            setSlideHeight: setSlideHeight,
            module: $module,
            getCurrentIndex: getCurrentIndex,
            SLIDE_CHANGED: SLIDE_CHANGED
        };
    };

    return Carousel;
});
