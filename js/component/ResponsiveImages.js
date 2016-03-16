define(["jquery", "PointBreak", "component/lazyLoadManager"], function($, PointBreak, lazyLoadManager) {

    /**
     * Handles changing img and background img sources
     * wschoenberger: updated this to support an image for each breakpoint: small, medium, large, and max.
     *
     * @class ResponsiveImages
     */

    var ResponsiveImages = function() {
        var pointbreak = new PointBreak(),
            LOADED_CLASS = "loaded",
            IMG_SELECTOR = ".responsive-image",
            $images = $(IMG_SELECTOR),
            breakpoints;

        /**
         * @constructor
         */

        function init() {
            // get the registered breakpoints and sort the names from largest to smallest
            breakpoints = pointbreak.getBreakpoints();
            if (breakpoints) {
                breakpoints = _.map(breakpoints, function(value, key) {
                    return {
                        key: key,
                        value: value
                    };
                });
                breakpoints = _.pluck(_.sortBy(breakpoints, 'value'), 'key').reverse();
            }

            updateImagePaths();
            pointbreak.addChangeListener(updateImagePaths);
        }

        /**
         * Loops through all images and determines if it's a
         * background image or regular one. Uses data attributes
         * to apply new source in either case.
         *
         * @private
         */

        function updateImagePaths() {
            var breakpointSize = pointbreak.getCurrentBreakpoint();
            $images.each(function(i, itm) {
                var $this = $(itm),
                    isImage = $this.prop("tagName") === "IMG" ? true : false;

                // get the image src from data attribute for breakpoint.
                var imgSrcForBreakpoint = $this.data(breakpointSize);
                // if there isnt an image for this breakpoint look for the next largest
                if (!imgSrcForBreakpoint) {
                    var j, len = breakpoints.length;
                    for (j = 0; j < len; j++) {
                        imgSrcForBreakpoint = $this.data(breakpoints[j]);
                        if (imgSrcForBreakpoint) {
                            break;
                        }
                    }
                }
                // get the background-image if this isnt an <img>
                var curBg = isImage ? null : $this.css("background-image");
                // check if we need to update this thing
                var imageNotAlreadyLoaded = isImage ? ($this.attr("src") !== imgSrcForBreakpoint) : (curBg && curBg.indexOf(imgSrcForBreakpoint) === -1);
                // bail if we don't need to update
                if (!imageNotAlreadyLoaded) {
                    return;
                }

                if (isImage) {
                    if ($this.hasClass("lazy-load")) {
                        $this.data("original", imgSrcForBreakpoint);
                        // reset just this image
                        lazyLoadManager.init($this);
                    } else {
                        $this.attr("src", imgSrcForBreakpoint);
                    }

                    if (!$this.hasClass(LOADED_CLASS)) {
                        $this.addClass(LOADED_CLASS);
                    }
                } else {
                    if ($this.hasClass("lazy-load")) {
                        $this.data("original", imgSrcForBreakpoint);
                        // reset just this image
                        lazyLoadManager.init($this);
                    } else {
                        $this.css({
                            "background-image": "url('" + imgSrcForBreakpoint + "')"
                        });
                    }
                }
            });
        }

        /**
         * Used to re-register the images if content is dynamically
         * added to the page after the initial load.
         *
         * @public
         */

        function update() {
            $images = $(IMG_SELECTOR);
            updateImagePaths();
        }

        init();

        return {
            update: update
        };
    };

    return ResponsiveImages;

});
