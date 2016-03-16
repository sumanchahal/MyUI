/**
 * @fileOverview Behaviors for the owner benefits page:
 * Accolade functionality
 * Touch detection
 * Breakpoint checks
 * LeftRail scroll
 * Sorting Tiles
 */
require(["modernizr", "jquery", "PointBreak", "component/accoladeCarousel", "component/ResponsiveImages", "analytics", "model-cookie"],
    function(Modernizr, $, PointBreak, accoladeCarousel, ResponsiveImages, analytics) {

        var $benefits = $('.owner-benefits-item'),
            $benefitsContent = $('.owner-benefits-content'),
            isTouchEnabled = Modernizr.touch,
            pointbreak;

        /**
         * On load initializes all page level methods
         * @method init
         * @private
         */

        function init() {
            // Initialize breakpoints
            pointbreak = new PointBreak();
            pointbreak.addChangeListener(onBreakpointChange);

            // If touch device enable click state for the whole benefit tile
            learnMoreTouch();

            // Initialize accolade carousel
            initAccolades();

            // initial sorting of tiles.
            sortTiles();

            // Initialize left rail sticky functionality
            initLeftRail();

            // Initialize analytics functionality
            initAnalytics();

            // Setup responsive images
            var responsiveImages = new ResponsiveImages();
        }

        /**
         * Called when the breakpoint changes.
         * @method onBreakpointChange
         * @private
         */

        function onBreakpointChange() {
            sortTiles();
            learnMoreTouch();
        }


        /**
         * Rearrange the benefits based on viewportSize.
         * @method sortTiles
         * @private
         */

        function sortTiles() {
            var viewportColumns = null;
            // Trigger correct breakpoint on load
            var currentBreakpoint = pointbreak.getCurrentBreakpoint();

            switch (currentBreakpoint) {
                case "max":
                    /* falls through */
                case "large":
                    viewportColumns = 3;
                    break;
                case "medium":
                    viewportColumns = 2;
                    break;
                case "small":
                    /* falls through */
                default:
                    viewportColumns = 1;
                    break;
            }

            // Remove the pre-existing columns
            $benefitsContent.empty();

            // Append the number of columns for this breakpoint
            for (var column = 1; column <= viewportColumns; column++) {
                $benefitsContent.append('<div class="col"></div>');
            }

            var count = 0;

            // Append each benefit to a column
            $benefits.each(function(index) {
                var column = index % viewportColumns,
                    $benefit = $benefits[index];

                // Find the appropriate column
                var $column = $('.col').eq(column);

                // Append the appropriate benefit to the corresponding column
                $column.append($benefit);
            });
        }

        /**
         * In touch make the whole benefit clickable
         * @method learnMoreTouch
         * @private
         */

        function learnMoreTouch() {
            if (isTouchEnabled) {
                var url = null;
                $benefits.on('click touch', function(event) {
                    if ($(event.target).attr("href")) {
                        return;
                    }
                    url = $(event.target).parent().find('a.link').attr('href');
                    if (url) {
                        $(event.target).parent().find('a.link').trigger('click');
                    }
                });
            }
        }

        /**
         * Accolade carousel functionality
         * @method initAccolades
         * @private
         */

        function initAccolades() {
            var ownersAccolade = accoladeCarousel.init('.accolade-container', '.accolade-item');

            //On resize force the carousel back to the begining
            $(window).resize(function() {
                ownersAccolade.resetSlides();
            });
        }

        /**
         * Left rail scrolling and positioning functionality
         * @method initLeftRail
         * @private
         */

        function initLeftRail() {
            var $subNav = null,
                $leftRail = null,
                $leftRailContent = null,
                leftRailContentHeight = null,
                headerHeight = null,

                subNavHeight = null,
                $viewportHeight = null,
                topOffset = null,
                footerOffsetTop = null,
                footerHeight = null;

            // Set variables on load
            setVariables();
            // Set rail position on load
            setRailPosition();

            /**
             * Set and reset variables on load and window resize
             * @method setVariables
             * @private
             */

            function setVariables() {

                $subNav = $('#subnav.large');
                $leftRail = $('.owner-benefits-side-bar');
                $leftRailContent = $('.owner-benefits-inner');
                leftRailContentHeight = $leftRailContent.outerHeight();
                headerHeight = $('.header-wrapper').outerHeight();
                subNavHeight = $subNav.outerHeight();
                $viewportHeight = $(window).height();
                topOffset = $subNav.offset().top + subNavHeight;
                footerOffsetTop = $('footer').offset().top;
                footerHeight = $('footer').outerHeight() + $('.footer-disclaimer-container').outerHeight();

                // Set the height of the left rail
                $leftRail.css('height', $('#content').height() - (topOffset + footerHeight / 2));
            }

            $(window).on('DOMContentLoaded load resize scroll touchmove', function() {
                setRailPosition();
            });

            // Set variables on resize
            $(window).on('resize orientationchange', function() {
                resetLeftRail();
            });

            // Set variables on mobile menu click
            $('#mobileMenuButton').on('click', function(e) {
                setTimeout(function() {
                    resetLeftRail();
                }, 350);
            });

            /**
             * Call all left rail positining functions again
             * @method resetLeftRail
             * @private
             */

            function resetLeftRail() {
                setVariables();
                setRailPosition();
            }

            /**
             * Add/remove classes to position the left rail
             * @method setRailPosition
             * @private
             */

            function setRailPosition() {
                // If the left rail is smaller than the viewport height make it sticky
                if ($viewportHeight && leftRailContentHeight < $viewportHeight) {
                    // The scroll position is passed the subNav and Header
                    if ($(window).scrollTop() >= (subNavHeight + headerHeight)) {
                        $leftRailContent.addClass('sticky');
                        $leftRailContent.css({
                            'bottom': 0,
                            'top': 0
                        });
                        // The scroll position is at the footer area

                        if ($(window).scrollTop() >= (footerOffsetTop - leftRailContentHeight)) {
                            $leftRailContent.css({
                                'top': $('body').height() - ($(window).scrollTop() + footerHeight + leftRailContentHeight)
                            });
                        }
                    } else {
                        removeSticky();
                    }
                }
                // Left rail is greater than the viewport height
                else {
                    removeSticky();
                    $leftRailContent.css({
                        'top': 0
                    });
                }

                // Remove sticky functionality

                function removeSticky() {
                    $leftRailContent.removeClass('sticky');
                    $leftRailContent.css({
                        'bottom': 0
                    });
                }
            }

        }

        /**
         * Analytics events
         * @method initAnalytics
         * @private
         */

        function initAnalytics() {
            var $ownerBenefitsItem = $('.owner-benefits-item');
            $ownerBenefitsItem.on("click touch", function(event) {
                var $target = $(event.target);
                if ($target.hasClass('asterisk') && $target.parent().hasClass('disclaimer')) {
                    return;
                }
                var contentTitle = $(event.currentTarget).find('h2').text();
                analytics.helper.fireOwnerBenefitsTilesClick(contentTitle);
            });

            var $ownerBenefitsAccolade = $('.owner-benefits-accolade');
            $ownerBenefitsAccolade.on("click touch swipe", function(event) {
                var $clickTarget = $(event.target),
                    action = "Carousel";

                if ($clickTarget.hasClass("control")) {
                    action = "Toggle";
                }

                if (!$clickTarget.hasClass("link")) {
                    analytics.helper.fireOwnerBenefitsAccoladesClick(action);
                }

            });
        }

        init();
    }
);
