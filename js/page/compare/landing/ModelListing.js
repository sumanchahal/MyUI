define(["modernizr", "PointBreak", "jquery", "analytics", "transit"], function(Modernizr, PointBreak, $, analytics) {
    /**
     * A list of vehicles which can be interacted with to
     * select a vehicle trim for comparing.
     *
     * @class ModelListing
     */
    var ModelListing = function(params) {
        var opts = $.extend({
            pointbreak: null
        }, params),
            $carWrapper = $(".car-wrapper"),
            $module = $(".model-listing"),
            $window = $(window),
            isAnimating = false,
            pointbreak = opts.pointbreak || new PointBreak(),
            TRIM_SELECTOR_OPEN = "trim-selector-open",
            HOVER_CLASS = "hover",
            SELECTED_CLASS = "selected";

        /**
         * @constructor
         */

        function init() {
            setupVehicleHover();
            bindVehicleClick();
            delegateCloseButton();
            closeOnResize();
        }

        /**
         * When the window resizes, close the trim selector immediately
         * this is because as you move back and forth some odd edge-case
         * states can occur.
         *
         * @private
         */

        function closeOnResize() {
            var width = $(window).width();
            $window.resize(function() {
                if ($(window).width() !== width) {
                    // JIRA 148 fix doc issue 2
                    if (isAnimating === false && !LEXUS.ComparatorDealerCode) {
                        closeTrimSelector(true);
                    }
                }
            });

            scrollToTop();
        }

        /**
         * Jumps window back to the top
         *
         * @private
         */

        function scrollToTop() {
            $("html, body").stop().animate({
                scrollTop: 0
            }, 10);
        }

        /**
         * Initializes events for when you hover over a vehicle
         * Shows a box with a 'select model' call to action
         *
         * @private
         */

        function setupVehicleHover() {
            var $btn = $carWrapper.find(".button");

            if (Modernizr.touch === false) {
                // Mouse events
                $carWrapper.on("mouseenter", showModelHover);
                $carWrapper.on("mouseleave", hideModelHover);

                // Adding focus/blur events for accessibility
                $btn.on("focus", showModelHover);
                $btn.on("blur", hideModelHover);
            }
        }

        /**
         * Displays the hover state behind the model
         *
         * @param {Event} e - jQuery event object
         * @private
         */

        function showModelHover(e) {
            var $this = $(this);

            if (e.type === "focus") {
                $this = $(this).parents(".car-wrapper");
            }

            if (Modernizr.touch === false) {
                setOverlaySize($this);

                if (Modernizr.csstransitions) {
                    $this.addClass(HOVER_CLASS);
                } else {
                    $this.find(".car-hover").stop().css({
                        left: -50
                    }).animate({
                        opacity: 1
                    }, 400);
                }
            }
        }

        /**
         * Hide the hover state behind the model
         *
         * @private
         * @param {Event} e - jQuery event object
         */

        function hideModelHover(e) {
            var $this = $(this);

            if (e.type === "blur") {
                $this = $(this).parents(".car-wrapper");
            }

            if (Modernizr.touch === false) {
                if (Modernizr.csstransitions) {
                    $this.removeClass(HOVER_CLASS);
                } else {
                    $this.find(".car-hover").stop().animate({
                        opacity: 0
                    }, 400).css({
                        left: "-999em"
                    });
                }
            }
        }

        /**
         * Sets up click event for vehicle, on click it opens
         * the trim selector
         *
         * @private
         */

        function bindVehicleClick() {

            $(".car-hover").on("click", function(e) {
                e.preventDefault();

                var $carWrap = $(this).parents(".car-wrapper"),
                    $product = $carWrap.find(".product"),
                    $target = $(e.target);

                if (checkForDisclaimer($target)) {
                    return;
                }

                if (isTrimSelectorOpen($carWrap) === false) {
                    openTrimSelector($product);
                } else {
                    closeTrimSelector(false, $carWrap.next());
                }
            });

            $module.find(".product").on("click", function(e) {
                e.preventDefault();

                var $target = $(e.target);

                if (checkForDisclaimer($target)) {
                    return;
                }

                if (isTrimSelectorOpen($(this).parents(".car-wrapper")) === false) {
                    openTrimSelector($(this));
                } else {
                    closeTrimSelector(false, $(this).parents(".car-wrapper").next());
                }
            });
        }

        /**
         * Checks to see if target is a disclaimer
         *
         * @param {jQuery} $target - element that needs to be checked
         * @returns {Boolean} - whether or not given element is a disclaimer target
         * @private
         */

        function checkForDisclaimer($target) {
            return $target.is(".disclaimer") || $target.is(".asterisk");
        }

        /**
         * Determines if the current model has an open trim selector
         *
         * @param {jQuery} m - car wrapper being tested
         * @returns {Boolean} - flag whether or not the trim selector is open
         * @private
         */

        function isTrimSelectorOpen(m) {
            var $model = m || null;

            if ($model !== null && $model.next().hasClass("select-trim")) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Slides open the trim selector where the user can select
         * their primary car to compare
         *
         * @param {jQuery} $product - the selected product that needs to be open
         * @private
         */

        function openTrimSelector($product) {

            var currentModel = $product.find(".model").data("token"),
                selectTrimUrl = "",
                trimSelectorFormId = "trim-selector-form",
                $carWrapper = $product.parents(".car-wrapper"),
                $sectionWrapper = $carWrapper.parents(".wrapper"),
                $trimOverlay = null;
            $previousSelectTrim = $module.find('.select-trim');

            if (!Modernizr.csstransitions) {
                $carWrapper.find(".car-hover").css({
                    left: "-999em",
                    opacity: 0
                });
            }

            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                isAnimating = true;

                $carWrapper.removeClass(HOVER_CLASS).addClass(SELECTED_CLASS);
                $module.addClass(TRIM_SELECTOR_OPEN);

                $trimOverlay = $(".trim-selector-" + currentModel).eq(0).clone();
                $carWrapper.after($trimOverlay);

                $trimOverlay.css({
                    "max-height": 0,
                    opacity: 0
                });

                // animate open overlay, and simultaneously scroll to top of vehicle

                closeTrimSelector(true, $previousSelectTrim);

                // LIM 148  changes

                if (LEXUS.ComparatorDealerCode) {
                    require(["resizer"], function(resizer) {

                        resizer.updateHeight($carWrapper.position().top);

                    });

                    $trimOverlay.transition({
                        "max-height": 4000,
                        opacity: 1
                    }, 200, function() {
                        isAnimating = false;
                    });

                } else {
                    //LIM 3287 - Doing some maths
                    // Have to add the correct height for the image, currently the 
                    // Placeholder pixel is getting some extra height and width. 
                    var sampleHeight = 287;
                    var sampleWindowWidth = 468;

                    var windowWidth = $(window).width();

                    var imageHeight = (sampleHeight * windowWidth) / sampleWindowWidth;
                    $('#landing .car-wrapper img').height(imageHeight);


                    $trimOverlay.transition({
                        "max-height": 4000,
                        opacity: 1
                    }, 4500, function() {
                        isAnimating = false;
                    });

                    $("html, body").animate({
                        scrollTop: $carWrapper.position().top
                    }, 500, function() {
                        $('#landing .car-wrapper img').height('auto');
                    });


                }


            } else {
                selectTrimUrl = $carWrapper.find(".button").attr("href");

                $("#" + trimSelectorFormId).remove();
                /** LIM 148 Change */
                $("body").append('<form id="' + trimSelectorFormId + '" method="POST" action="' + selectTrimUrl + '" />');

                $carWrapper.removeClass(HOVER_CLASS);
                $("#" + trimSelectorFormId).submit();

            }

            // Fire Analytics
            var modelName = currentModel,
                action = "Select Model",
                container = "Select Model";
            analytics.helper.fireCompareSelectModelClick(modelName, action, container);
        }

        /**
         * Callback triggered when clicking the trim selector close button
         *
         * @private
         */

        function delegateCloseButton() {
            $module.on("click", ".close", function(e) {
                e.preventDefault();

                var $this = $(e.target),
                    $trimSelector = $this.parents(".select-trim");

                $this.fadeOut();

                closeTrimSelector(false, $trimSelector);
            });
        }

        /**
         * Closes the trim selector
         *
         * @param {Boolean} closeImmediately - whether or not to animate close
         * @param {jQuery} $elementToClose - which model is open
         * @private
         */

        function closeTrimSelector(closeImmediately, $elementToClose) {
            var $currentTrimSelector = $elementToClose || $(".model-listing .select-trim");

            $module.removeClass(TRIM_SELECTOR_OPEN);
            $(".car-wrapper.selected").removeClass(SELECTED_CLASS);

            if (closeImmediately !== null && closeImmediately === true) {
                $currentTrimSelector.remove();
            } else {
                $currentTrimSelector.transition({
                    "max-height": 0
                }, 400, function() {
                    $currentTrimSelector.remove();
                });
            }
        }

        /**
         * Adjust the size of the overlay based on how big the car image is
         *
         * @param {jQuery} $el - the element which the car image will be extracted from
         * @private
         */

        function setOverlaySize($el) {
            var $img = $el.find("img"),
                $overlay = $el.find(".car-hover"),
                imgHeight = $img.height(),
                imgWidth = $img.width(),
                HEIGHT_ADJUST = 0.19,
                WIDTH_ADJUST = 0.13;

            $overlay.css({
                height: imgHeight + (imgHeight * HEIGHT_ADJUST),
                width: imgWidth + (imgWidth * WIDTH_ADJUST)
            });
        }

        /**
         * Opens a model drawer by id, used when the page opens
         * and needs to display a particular model by default.
         *
         * @param {String} id - model id to open
         * @public
         */

        function jumpToModel(id) {
            var $models = $module.find(".model"),
                $product = null;

            $models.each(function() {
                var $this = $(this);

                if ($this.data("token") === id && $product === null) {
                    $product = $this.parents(".product");
                    openTrimSelector($product);
                }
            });
        }

        init();

        return {
            jumpToModel: jumpToModel
        };
    };

    return ModelListing;
});
