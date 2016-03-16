define([
        "lexus",
        "modernizr",
        "mvc/AbstractViewController",
        "mvc/ListEvent",
        "page/model/performance/PerformanceStyling",
        "page/model/performance/PerformanceStylingComparison",
        "component/tabfilter/TabFilterViewController",
        "analytics",
        "jquery",
        "waypoints"
    ],
    function(
        LEXUS,
        Modernizr,
        AbstractViewController,
        ListEvent,
        PerformanceStyling,
        PerformanceStylingComparison,
        TabFilterViewController,
        analytics,
        $
    ) {

        var ANIMATE_DURATION = 600,
            FADE_OUT_DURATION = 200,
            FADE_IN_DURATION = 500,
            MIDDLE = 0.5,
            //
            $window,
            $context,
            $tabFilterContext,
            $loadingAnimation,
            $comparisonContainer,
            $beforeContainer,
            $afterContainer,
            $beforeImage,
            $beforeLabel,
            $afterImage,
            $afterLabel,
            $scrubber,
            $scrubberLine,
            $scrubberThumb,
            //
            scrubberWidth,
            imageWidth,
            leftLimit,
            rightLimit,
            currentProportion,
            currentClass,
            windowWidth,
            //
            imagesLoaded = 0,
            animationInterval,
            animationStartTime,
            animationStartValue,
            firstTime = true,
            INTERIOR_CLASS = "INTERIOR",
            EXTERIOR_CLASS = "EXTERIOR",
            INTERIOR_IMAGE_PROPORTION = 375 / 934,
            EXTERIOR_IMAGE_PROPORTION = 526 / 934;

        /**
         * @class PerformanceStylingViewController
         * @extends AbstractViewController
         * @constructor
         */

        var PerformanceStylingViewController = function(model, context) {
            AbstractViewController.call(this);

            this.isFirstTimeUsingScrubber = true;

            this.init(model, context, PerformanceStyling);
            $comparisonContainer.removeClass("template");
            $loadingAnimation.addClass("loaded");
        };

        PerformanceStylingViewController.prototype = new AbstractViewController();
        PerformanceStylingViewController.prototype.parent = AbstractViewController.prototype;
        PerformanceStylingViewController.prototype.constructor = PerformanceStylingViewController;

        $.extend(PerformanceStylingViewController.prototype, {
            setModel: function(model) {

                if (this.getModel()) {
                    this.getModel().getComparisons().removeSelectionListener(this.updateView, this);
                }
                this.parent.setModel.call(this, model);
                if (model) {
                    var comparisons = model.getComparisons();
                    this.tabFilter.setModel(comparisons);
                    comparisons.addSelectionListener(this.updateView, this);
                }
            },

            createView: function(context) {
                $context = $(context);
                $window = $(window);
                $tabFilterContext = $("#image-category-tab-filter");
                $loadingAnimation = $("#performanceStylingLoader");

                $comparisonContainer = $(".comparison-container");

                $afterContainer = $comparisonContainer.find(".image-container.after");
                $beforeContainer = $comparisonContainer.find(".image-container.before");
                $beforeImage = $beforeContainer.find("img");
                $beforeLabel = $context.find(".label.before");
                $afterImage = $afterContainer.find("img");
                $afterLabel = $context.find(".label.after");

                $scrubber = $comparisonContainer.find(".image-scrubber");
                $scrubberLine = $scrubber.find(".scrubber-line");
                $scrubberThumb = $scrubber.find(".scrubber-thumb");
                scrubberWidth = $scrubber.width();
                windowWidth = $window.width();

                // animate slider when you scroll here.
                $(document).ready($.proxy(this.setUpWaypoints, this));
                $window.on("resize", $.proxy(this.onWindowResize, this));

                this.tabFilter = new TabFilterViewController(null, $tabFilterContext);

                if (!this.getSlider()) {
                    this.setSlider(0.0);
                }

                this.addDragListener();
                this.addClickListener();
                LEXUS.loadingAnimation.unregister("performanceStylingLoader");
            },

            setUpWaypoints: function() {
                if (Modernizr.touch) {
                    this.setSlider(MIDDLE);
                } else {
                    $context.waypoint($.proxy(this.onContextBecomesVisible, this), {
                        offset: 500
                    });
                }
            },

            onWindowResize: function() {
                if (windowWidth !== $window.width()) {
                    windowWidth = $window.width();
                    this.updateSliderView();
                    this.setScrubberHeight(false);
                    $.waypoints('refresh');
                }
            },

            updateView: function() {
                var model = this.getModel(),
                    comparison = model.getComparisons().getSelectedItem();

                currentClass = comparison._id.toUpperCase();

                if (currentClass.indexOf(INTERIOR_CLASS) !== -1) {
                    $beforeContainer.addClass(INTERIOR_CLASS);
                    $afterContainer.addClass(INTERIOR_CLASS);
                    currentClass = INTERIOR_CLASS;
                } else {
                    $beforeContainer.removeClass(INTERIOR_CLASS);
                    $afterContainer.removeClass(INTERIOR_CLASS);
                    currentClass = EXTERIOR_CLASS;
                }

                this.setScrubberHeight(true);

                imagesLoaded = 0;

                var beforeImageProxy = new Image();
                $(beforeImageProxy).one("load", $.proxy(this.onImageLoaded, this));

                var afterImageProxy = new Image();
                $(afterImageProxy).one("load", $.proxy(this.onImageLoaded, this));

                // hide old images
                $beforeImage.fadeOut(FADE_OUT_DURATION, function() {
                    $beforeLabel.html("<p>" + comparison.getBeforeLabel() + "</p><p>" + comparison.getBeforeColor() + "</p>");
                    $beforeImage.attr("alt", comparison.getBeforeLabel() + " Styling");
                    $beforeImage.css("backgroundImage", "url(" + comparison.getBeforeImage().src + ")");
                    beforeImageProxy.src = comparison.getBeforeImage().src;
                });

                if (comparison.getAfterImage()) {
                    $afterImage.fadeOut(FADE_OUT_DURATION, function() {
                        $afterLabel.html("<p>" + comparison.getAfterLabel() + "</p><p>" + comparison.getAfterColor() + "</p>");
                        $afterImage.attr("alt", comparison.getAfterLabel() + " Styling");
                        $afterImage.css("backgroundImage", "url(" + comparison.getAfterImage().src + ")");
                        afterImageProxy.src = comparison.getAfterImage().src;
                    });
                }

                this.animateSlider();

            },

            setCurrentProportion: function() {
                if (currentClass === INTERIOR_CLASS) {
                    currentProportion = INTERIOR_IMAGE_PROPORTION;
                } else {
                    currentProportion = EXTERIOR_IMAGE_PROPORTION;
                }
            },

            setScrubberHeight: function(animate) {
                // make line as tall as image plus the height of the labels.
                this.setCurrentProportion();

                var h = ($afterContainer.outerWidth() * currentProportion) + Math.max($afterLabel.height() > 30 ? $afterLabel.height() : 30, $beforeLabel.height() > 30 ? $beforeLabel.height() : 30) + 20;

                if (animate) {
                    $scrubberLine.animate({
                        height: h
                    }, 150, 'linear');
                } else {
                    $scrubberLine.css('height', h);
                }
            },

            updateSliderView: function() {
                var percentage = this.getSlider();
                var containerPx = $afterImage.width();
                var widthPx = Math.round(percentage * containerPx);
                var scrubberWidth = $scrubber.width();

                // set width of image box and adjust background size.
                $beforeImage.css("width", widthPx + "px")
                    .css("background-size", containerPx + "px");

                var scrubberX = widthPx - scrubberWidth / 2;
                $scrubber.css("left", scrubberX + "px");
            },

            onImageLoaded: function(event) {
                imagesLoaded++;
                if (imagesLoaded === 2) {
                    this.onAllImagesLoaded();
                }
            },

            onAllImagesLoaded: function() {
                var model = this.getModel(),
                    comparison = model.getComparisons().getSelectedItem();

                imagesLoaded = 0;

                // animate in images.
                $afterImage.fadeIn(FADE_IN_DURATION);
                $beforeImage.fadeIn(FADE_IN_DURATION);
                $.waypoints('refresh');
            },

            addDragListener: function() {
                $scrubber.on("mousedown touchstart", $.proxy(this.onStartDrag, this));
            },

            removeDragListener: function() {
                $scrubber.off("mousedown touchstart", $.proxy(this.onStartDrag, this));
            },

            addDropListener: function() {
                $window.on("mouseup touchend", $.proxy(this.onStopDrag, this));
                $window.on("mousemove touchmove", $.proxy(this.doDrag, this));
            },

            removeDropListener: function() {
                $window.off("mouseup touchend", $.proxy(this.onStopDrag, this));
                $window.off("mousemove touchmove", $.proxy(this.doDrag, this));
            },

            addClickListener: function() {
                $comparisonContainer.on("click", $.proxy(this.getPosition, this));
            },

            removeClickListener: function() {
                $comparisonContainer.off("click", $.proxy(this.getPosition, this));
            },


            getPosition: function(event) {
                if (typeof TouchEvent !== "undefined" && event.originalEvent instanceof TouchEvent) {
                    event = event.originalEvent.touches[0];
                }

                leftLimit = $afterImage.offset().left;
                imageWidth = $afterImage.width();
                rightLimit = leftLimit + imageWidth;

                var mouseX = event.pageX,

                    x = Math.min(Math.max(leftLimit, mouseX), rightLimit);

                var percentage = ((x - leftLimit) / imageWidth);
                this.animateSlider(percentage);
            },

            onStartDrag: function(event) {
                event.preventDefault();
                this.removeClickListener();
                //                clickStart = event.pageX;
                imageWidth = $afterImage.width();
                leftLimit = $afterImage.offset().left;
                rightLimit = leftLimit + imageWidth;
                this.removeDragListener();
                this.addDropListener();
                this.killAnimation();

                if (this.isFirstTimeUsingScrubber) {
                    this.isFirstTimeUsingScrubber = false;
                    analytics.helper.firePerformanceStylingSliderClick();
                }
            },

            doDrag: function(event) {
                event.preventDefault();

                if (typeof TouchEvent !== "undefined" && event.originalEvent instanceof TouchEvent) {
                    event = event.originalEvent.touches[0];
                }

                var mouseX = event.pageX,

                    x = Math.min(Math.max(leftLimit, mouseX), rightLimit);

                var percentage = ((x - leftLimit) / imageWidth);
                this.setSlider(percentage);
            },


            onStopDrag: function(event) {
                event.preventDefault();
                this.removeDropListener();
                this.addDragListener();
                this.addClickListener();
            },

            onContextBecomesVisible: function() {
                if (firstTime) {
                    this.animateSlider();
                }
                firstTime = false;
            },


            animateSlider: function(target) {
                var self = this;
                target = target || MIDDLE;

                animationStartValue = this.getSlider();
                animationStartTime = new Date().getTime();
                clearInterval(animationInterval);

                animationInterval = setInterval(function() {
                    self.doAnimateSlider(target, self);
                }, 20);
            },

            doAnimateSlider: function(target, scope) {
                scope = scope || this;
                var delta = target - animationStartValue,
                    now = new Date().getTime(),
                    elapsed = now - animationStartTime,
                    animationPercentage = easeOut(elapsed, ANIMATE_DURATION);

                var val = animationStartValue + delta * Math.min(Math.max(0, animationPercentage), 1);
                scope.setSlider(val);

                if (Math.abs(val - target) < 0.001) {
                    scope.killAnimation();
                }

                function easeOut(timeElapsed, duration) {
                    return ((timeElapsed = timeElapsed / duration - 1) * timeElapsed * timeElapsed + 1);
                }
            },

            killAnimation: function() {
                clearInterval(animationInterval);
            },

            setSlider: function(percentage) {
                percentage = Math.min(Math.max(0, percentage), 1);
                this._percentage = percentage;
                this.updateSliderView();
            },

            getSlider: function() {
                return this._percentage;
            }

        });

        return PerformanceStylingViewController;
    }
);
