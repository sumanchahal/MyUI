define(["jquery", "PointBreak", "analytics"], function($, PointBreak, analytics) {

    /**
     * Global page back to top button functionality
     *
     * @class BackToTop
     */

    return {

        /**
         * Sets up the back to top button.
         */
        init: function() {
            var pointbreak = new PointBreak(),
                ANIMATION_DURATION = 800; //ms

            if (document.querySelector('footer')) { /** LIM 195**/
                createBackToTop();
                scrollBackToTop(pointbreak);
            }

            /**
             * On page load create the html for the back to top link button
             *
             * @method createBackToTop
             * @private
             */

            function createBackToTop() {
                $('footer').append('<a id="back-to-top" href="#">Top</a>');
                /** LIM 195 START**/
                if (window.favoritesActive) {
                    $('footer').append('<div class="favorite-count desktop">-</div>');
                    $('.small-nav-wrapper').append('<div class="favorite-count mobile">-</div>');
                }
                /** LIM 195 END**/
            }

            /**
             * BackToTop scroll functionality
             *
             * @method scrollBackToTop
             * @param {Object} pointbreak - holds all size breakpoints
             * @private
             */

            function scrollBackToTop(pointbreak) {
                /** LIM 195 START**/
                var $backToTop = $('#back-to-top'),
                    $viewportHeight = $(window).height(),
                    favCountHeight = $('.favorite-count.desktop').outerHeight(),
                    $scrollTop = $(document).scrollTop(),
                    mobileFav = document.getElementById('favorite-count'),
                    subNav = $('#subnav'),
                    $footerHeight = $('footer').outerHeight() + $('.footer-disclaimer-container').height(),
                    stop = $('footer').position().top - $footerHeight,
                    scrollInAction = false;

                /** LIM 195 END*/

                // Set position on load
                setBackToTopPosition();

                // Recalculate viewport height and stop position on browser resize
                $(window).on('resize orientationchange', function() {
                    // Only set back to top button in medium & large viewport
                    if (pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) {
                        $viewportHeight = $(window).height();
                        $(document).scrollTop();
                        stop = $('footer').offset().top - ($backToTop.outerHeight() + favCountHeight); /** LIM 195**/
                    } else {
                        // Hide back to top button in small viewport
                        $backToTop.fadeOut();
                    }
                });

                // Set position on scroll
                $(window).scroll(function() {
                    if (scrollInAction === false && pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) { /** LIM 195**/
                        setBackToTopPosition();
                    }
                });

                /**
                 * Set the position of the BackToTop button
                 *
                 * @method setBackToTopPosition
                 * @private
                 */

                function setBackToTopPosition() {
                    // Only set back to top button in medium & large viewport
                    if (pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) {
                        /** LIM 195 START**/
                        if (window.pageYOffset > window.innerHeight) {
                            if ($('.favorite-count.desktop:visible').length && window.favoritesActive) {
                                if (Math.round(((window.pageYOffset + (window.innerHeight) / 2) - favCountHeight)) >= $('.favorite-count.desktop').offset().top) {
                                    $('.favorite-count.desktop').removeClass('end');
                                } else {
                                    $('.favorite-count.desktop').addClass('end');
                                }
                            }
                            // Check if the document has reached the footer
                            if (Math.round((window.pageYOffset + window.innerHeight)) >= $('footer').offset().top) {
                                // Add a class to position the back to top button absolute
                                // GETTING RID OF THIS R4C-275
                                // $backToTop.addClass('end');
                                if ($('.favorite-count.desktop:visible').length && window.favoritesActive) {
                                    if (Math.round((window.pageYOffset + (window.innerHeight / 2) + favCountHeight)) >= $('footer').offset().top) {
                                        $('.favorite-count.desktop').addClass('end');
                                    } else {
                                        $('.favorite-count.desktop').removeClass('end');
                                    }
                                }
                            } else {
                                // Remove class to make the back to to button fixed
                                $backToTop.removeClass('end');

                                if ($('.favorite-count.desktop:visible').length && window.favoritesActive) {
                                    if (Math.round((window.pageYOffset + (window.innerHeight / 2) + favCountHeight)) >= $('footer').offset().top) {
                                        $('.favorite-count.desktop').addClass('end');
                                    } else {
                                        $('.favorite-count.desktop').removeClass('end');
                                    }
                                }
                            }
                            /** LIM 195 END**/
                            // Check if the document has been scrolled past the viewport height
                            if ($viewportHeight && $(document).scrollTop() > $viewportHeight) {
                                // GETTING RID OF THE FOOTER CHECK, BUTTON REMAINS R4C-275 
                                // Show the back to top button
                                $backToTop.fadeIn();
                            }
                        } else {
                            // Hide the back to top button
                            $backToTop.fadeOut();
                            // Remove class to make the back to to button fixed
                            $backToTop.removeClass('end');
                        }
                    } else {
                        // Hide back to top butto in small viewport
                        $backToTop.fadeOut();
                    }
                }

                /**
                 * On click scroll to the top of the page
                 *
                 * @private
                 */
                $backToTop.one('click', function(e) {
                    e.preventDefault();

                    analytics.helper.fireBackToTopClick();

                    // Set scrolling flag
                    scrollInAction = true;

                    // Hide the back to top button
                    $backToTop.fadeOut();

                    // Animate scroll position to the top
                    $('body,html').stop(true, true).animate({
                        scrollTop: 0
                    }, ANIMATION_DURATION, function() {
                        // Set scrolling flag
                        scrollInAction = false;
                    });



                    return false;
                });
            }
        }

    };

});
