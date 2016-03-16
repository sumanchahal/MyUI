define(["lexus", "component/social/ShareOverlay", "analytics", "jquery", "transit", "waypoints-sticky"], function(LEXUS, ShareOverlay, analytics, $) {
    var $dropdownList = $('.subnav.small ul'),
        $dropdownTertiary = $('.subnav.small').find('.features-nav.small ul'),
        animationDuration = 300,
        $smallNavWrapper = $('.small-nav-wrapper'),
        $heading = $('.subnav.small .heading'),
        $arrow = $heading.find('.global-tab-select-arrow-inverted.open-indicator'),
        tallestNav = null,
        secondaryNavHeight = null,
        /** LIM 195**/
        terniaryNavheight = null,
        /** LIM 195**/
        stickyClass = 'sticky',
        stickyBottomClass = 'sticky-bottom';

    return {
        /**
         * Global Mobile Nav functionality
         */

        init: function() {
            var $shareOverlay = $('#sidebar-share'),
                $shareButton = $('.features-nav .share-btn');
            if ($shareOverlay.length > 0) {
                var share = new ShareOverlay($shareOverlay, $shareButton, LEXUS.social);

                // LRT-5511: set the shareUrl to the page, excluding any overlay parts of the URL
                share.getSocialContent().shareUrl = LEXUS.metadata.urlSlug;
            }

            this.setFeaturesNav();
            this.setTertiaryNavHeight();
            this.setSecondarySticky();
            this.analyticsEventsSecondary();
            this.analyticsEventsTertiary();


            if (this.isFeaturesPage()) {
                this.initStickyTertiaryNav();
            }
            this.initStickyMobileNav();
            /** Add mouse listeners to nav dropdowns */
            var scope = this;
            this.setFeaturesNav();

            /**
             * handle showing and secondary navigation
             */
            $heading.click(function(event) {
                event.preventDefault();

                if ($('#mobileMenuList').hasClass('open')) {
                    LEXUS.globalNav.closeAllMenus();
                }

                scope.toggleSmallNav();
            });


            /**
             * handle showing and hiding the small featuresNav
             */
            $('.subnav.small .has-tertiary a').not('.tertiary-nav a').on('click', function(e) {
                e.preventDefault();

                $(this).parent().find('.tertiary-nav').transition({
                    'left': '0%',
                    duration: animationDuration
                }).addClass('tertiary-open');
                $('.small-nav-wrapper').addClass('features-open');

                scope.setSmallNavWrapperHeight('tertiary');
            });

            $('.back-wrapper', $smallNavWrapper).on('click', function(e) {
                e.preventDefault();

                $smallNavWrapper.find('.tertiary-open').transition({
                    'left': '100%',
                    duration: animationDuration
                }).removeClass('tertiary-open');

                $('.small-nav-wrapper').removeClass('features-open');

                scope.setSmallNavWrapperHeight('secondary');
            });

            // ensure subnav closes if hamburger is clicked
            if ($smallNavWrapper.length > 0) {
                $("#mobileMenuButton").click(function() {
                    if ($('.small-nav-wrapper').hasClass("open")) {
                        scope.toggleSmallNav();
                    }
                });
            }
        },

        /**
         * Initializes all analytics events for secondary nav
         */
        toggleSmallNav: function() {
            var smallWrapperHeight,
                navAutoHeight = $heading.outerHeight(),
                scope = this;

            /** never show the main mobile menu and sub navigation at the same time */
            if ($smallNavWrapper.find('.tertiary-open').length) {
                /** LIM 195 START**/
                if (terniaryNavheight === null) {
                    terniaryNavheight = scope.getTertiaryNavHeight();
                }
                /** LIM 195 END**/
                smallWrapperHeight = scope.getTertiaryNavHeight();
            } else {
                /** LIM 195 START**/
                if (secondaryNavHeight === null) {
                    secondaryNavHeight = scope.getSecondaryNavHeight();
                }
                /** LIM 195 END**/
                smallWrapperHeight = scope.getSecondaryNavHeight();
            }

            if ($smallNavWrapper.hasClass('open')) {
                navAutoHeight = $heading.outerHeight();
                $smallNavWrapper.removeClass('open');
                $smallNavWrapper.children("#subnav").children("ul").css('display', 'none'); /** LIM 195**/

                $smallNavWrapper.transition({
                    'height': navAutoHeight,
                    duration: animationDuration
                });
                $smallNavWrapper.children("#subnav").css('overflow', 'hidden'); /** LIM 195**/
                $('.favorite-count.mobile').fadeIn(); /** LIM 195**/
            } else {
                $('.favorite-count.mobile').hide(); /** LIM 195**/
                $smallNavWrapper.children("#subnav").css('overflow', 'visible'); /** LIM 195**/
                $smallNavWrapper.children("#subnav").children("ul").css('display', 'block'); /** LIM 195**/
                $smallNavWrapper.children("#subnav").find(".secondary ul").css('display', 'block');
                $smallNavWrapper.children("#subnav").find(".primary-links").css('display', 'block');
                $smallNavWrapper.addClass('open');

                $smallNavWrapper.transition({
                    'height': scope.getSecondaryNavHeight(),
                    duration: animationDuration
                });
            }

            $arrow.toggleClass('rotated');
        },

        /**
         * Initializes all analytics events for secondary nav
         */
        analyticsEventsSecondary: function() {
            var $nav = $('.subnav, .sub-nav'),
                container = '',
                category = '',
                label = '';

            $nav.on('click', 'a:not(".btn-stroke, .list-view-btn, .grid-view-btn")', function(event) {
                var $target = $(event.target);
                category = $target.text();
                label = $target.text();

                // fire only on secondary nav clicks, not tertiary
                if (!$target.parent().hasClass('tertiary-nav-item')) {
                    if (LEXUS.page.sectionId === 'cpo') {
                        analytics.helper.fireCPOToolClick("Sub Nav", label.replace(/\r?\n|\r/, ""));
                    } else {
                        container = getContainer($target);
                        analytics.helper.fireSecondaryNavClick(container, category, label);
                    }
                }
            });

            $nav.on('click', 'a.compare', function(event) {
                var $target = $(event.target);
                container = getContainer($target);
                analytics.helper.fireCompareClick(container);
            });

            $nav.on('click', 'a.dealer', function(event) {
                var $target = $(event.target);
                container = getContainer($target);
                analytics.helper.fireFindADealerClick(container);
            });

            $nav.on('click', 'a.btn-build-yours', function(event) {
                var $target = $(event.target);
                container = getContainer($target);
                analytics.helper.fireBuildYoursNavClick(container);
            });

            //Get parent container to determine large vs. small

            function getContainer($target) {
                var $parent = $target.parents('.subnav');

                //determine if current page is on all-models
                if ($target.parents('.all-models-sub-nav').length) {
                    $parent = $target.parents('.all-models-sub-nav');
                }

                if ($parent.hasClass('large')) {
                    container = 'Secondary Nav';
                } else {
                    container = 'Mobile Menu';
                }


                return container;
            }


        },

        /**
         * Initializes all analytics events for tertiary nav
         *
         */
        analyticsEventsTertiary: function() {
            var $nav = $('.features-nav');
            var container = 'Tertiary Nav';
            var category = 'Features';

            $('.tertiary-nav-item', $nav).on('click', function() {
                var label = $(this).text();
                analytics.helper.fireTertiaryNavClick(container, category, label);
            });

            $('.build-yours', $nav).on('click', function() {
                analytics.helper.fireBuildYoursBtnClick('Tertiary Nav');
            });

            $('.compare', $nav).on('click', function() {
                analytics.helper.fireCompareClick('Tertiary Nav');
            });
        },

        /**
         * checks to see when the body height is changed and calls the provided callback
         * @param callback
         */
        checkDocumentHeight: function(callback) {
            var lastHeight = document.body.clientHeight,
                newHeight, timer;
            (function run() {
                newHeight = document.body.clientHeight;
                if (lastHeight !== newHeight) {
                    callback();
                }
                lastHeight = newHeight;
                timer = setTimeout(run, 200);
            })();
        },
        /**
         * Globally set the subnav to have "sticky" behavior
         * unless loading a features page or a page with a body class of no-secondary
         */
        setSecondarySticky: function() {
            if (!$('body.features').length && !$('body.no-secondary').length) {
                var $largeSubnav = $('#subnav.large');

                $largeSubnav.waypoint('sticky');


                // This next section is to allow fixed position items (i.e. sticky nav) to work
                // when the iPad keyboard is present
                var $body = jQuery('body'),
                    updateInterval = null;

                if (Modernizr.touch) {
                    $(document).on('focus', 'input', function(e) {
                        $body.addClass('fixfixed');

                        // Set up event to trigger field blur in case the user
                        // decides to scroll around while the field is selected
                        // delay it's binding because focusing on the field
                        // causes the window to scroll into position, so it needs
                        // to happen after that occurs
                        setTimeout(function() {
                            $(window).bind("scroll", onWindowScroll);
                        }, 500);

                        clearInterval(updateInterval);
                        updateInterval = setInterval(function() {
                            $largeSubnav.css('top', $(window).scrollTop());
                        }, 200);
                    });

                    $(document).on('blur', 'input', function(e) {
                        clearInterval(updateInterval);
                        $body.removeClass('fixfixed');
                        $largeSubnav.css('top', '');
                        $(window).unbind("scroll", onWindowScroll);
                    });
                }

                var onWindowScroll = function() {
                    $(document.activeElement).blur();
                };
                /// end ipad keyboard section ////
            }
        },

        setSmallNavWrapperHeight: function(nav) {
            var newSmallWrapperHeight;

            if (nav === 'secondary') {
                newSmallWrapperHeight = this.getSecondaryNavHeight();
            } else {
                newSmallWrapperHeight = this.getTertiaryNavHeight();
            }

            $smallNavWrapper.transition({
                'height': newSmallWrapperHeight,
                duration: animationDuration
            });
        },
        getSecondaryNavHeight: function() {
            var secondaryNavHeight = $dropdownList.outerHeight() + ($('#subnav .heading').outerHeight() * 2);
            return secondaryNavHeight;
        },
        getTertiaryNavHeight: function() {
            var tertiaryNavHeight = $dropdownTertiary.outerHeight() + ($('#subnav .heading').outerHeight() * 2);
            return tertiaryNavHeight;
        },

        isFeaturesPage: function() {
            if ($('body.features').length) {
                return true;
            }
        },
        setFeaturesNav: function() {
            /**
             * determine if we are currently on a features page
             * based on body class (on load)
             * then make sure to set the tertiary nav as open in the mobile nav
             */
            if (this.isFeaturesPage()) {
                $('.small-nav-wrapper').addClass('features-open');
                $('.features-nav.small').addClass('tertiary-open');
            }
        },
        setTertiaryNavHeight: function() {
            var scope = this;
            /**
             * set the height of the large tertiary nav
             * on resize of window
             * so that it can be a black bar all the way down to the bottom of the page
             */

            var subNavHeight = $('#subnav.large').outerHeight();

            //var topOffset = headerHeight + subNavHeight + mainNavHeight + (($('body').height() * 0.6) / 100);
            // Adding a check in here because sometimes #subnav.large is not visible and therefore undefined when in smaller viewports
            if ($('#subnav.large').size() > 0) {
                var topOffset = $('#subnav.large').offset().top + subNavHeight;

                $('.tertiary-nav.large').css('height', $('body').height() - ($('footer').outerHeight()));

                $(window).on('resize', function() {
                    //$('.tertiary-nav.large').css('height', $('body').height() - (topOffset + $('#footer').height() / 2));
                    $('.tertiary-nav.large').css('height', $('body').height() - ($('footer').outerHeight()));
                });



                $('#mobileMenuButton').on('click', function(e) {
                    window.setTimeout(scope.initStickyTertiaryNav, 350);
                });
            }




            this.checkDocumentHeight(refreshTertiaryNavRules);

            /**
             * Is to be triggered when content is modified within the page
             * this allows the tertiary nav to reset its rules for when to stick
             * @private
             */

            function refreshTertiaryNavRules() {
                $(window).trigger('resize');
                $.waypoints('refresh');
            }

        },
        initStickyTertiaryNav: function() {
            var subNavHeight = $('#subnav.large').height();
            var $tertiaryNav = $('.tertiary-nav.large');
            var fullNavOffsetTop = $('#subnav.large').offset().top + subNavHeight;
            var _parent = this;

            determineWhetherToStickTertiary();

            $(window).on('resize', function() {
                _parent.initStickyMobileNav();
                determineWhetherToStickTertiary();
            });

            function determineWhetherToStickTertiary() {

                if ($tertiaryNav.length < 1) {
                    return;
                }

                $tertiaryNav.css('-webkit-transform', 'rotateX(0)');

                function getItem() {
                    var viewportHeight = $(window).height();
                    var item;

                    if (viewportHeight > getFullNavHeight()) {
                        item = $tertiaryNav;
                    } else if (viewportHeight > getLinksHeight()) {
                        item = null;
                    } else {
                        item = null;
                        $tertiaryNav.find('.main-links').removeClass('sticky sticky-bottom').css({
                            'bottom': 'auto'
                        });
                        $tertiaryNav.removeClass('sticky sticky-bottom').css({
                            'bottom': 'auto'
                        });
                    }

                    return item;
                }


                function getView() {
                    var viewportHeight = $(window).height();
                    var view;

                    if (viewportHeight > getFullNavHeight()) {
                        view = 'full';
                    } else if (viewportHeight > getLinksHeight()) {
                        view = 'partial';
                    } else {
                        view = 'none';
                    }


                    return view;
                }

                /**
                 * Determine how much of the tertiary nav to stick while scrolling
                 * on resize of window (viewport vertical change)
                 */


                $('.feature-page-content').waypoint(function(direction) {

                    $tertiaryNav.find('.main-links').removeClass('sticky sticky-bottom');
                    $tertiaryNav.removeClass('sticky sticky-bottom');

                    //                    if (direction === 'up' && getItem() !== null) {
                    //                        getItem().removeClass('sticky');
                    //                    } else

                    if (direction === 'down' && getItem() !== null) {
                        getItem().addClass('sticky');
                    }
                }, {
                    offset: function() {
                        var offset;

                        if (getView() === 'full') {
                            offset = 0;
                        } else {
                            var $tertiaryNav = $('.tertiary-nav.large');
                            var badgeHeight = $tertiaryNav.find('.badge-container').outerHeight();

                            offset = badgeHeight;
                        }

                        return offset * -1;
                    }
                });

                $.waypoints('refresh');
                $('footer').waypoint(function(direction) {
                    if (direction === 'up' && getItem() !== null) {

                        $tertiaryNav.find('.main-links').removeClass('sticky sticky-bottom').css({
                            'bottom': 'auto'
                        });
                        $tertiaryNav.removeClass('sticky sticky-bottom').css({
                            'bottom': 'auto'
                        });

                        getItem().addClass(stickyClass);

                    } else if (direction === 'down' && getItem() !== null) {

                        $tertiaryNav.find('.main-links').removeClass('sticky sticky-bottom').css({
                            'bottom': 'auto'
                        });
                        $tertiaryNav.removeClass('sticky sticky-bottom').css({
                            'bottom': 'auto'
                        });


                        getItem().removeClass(stickyClass).addClass(stickyBottomClass).css({
                            'bottom': $('footer').outerHeight() + $('.footer-disclaimer-container').outerHeight() - 1
                        });
                    }

                }, {
                    offset: function() {
                        var $tertiaryNav = $('.tertiary-nav.large');
                        var badgeHeight = $tertiaryNav.find('.badge-container').outerHeight();
                        var navHeight = $tertiaryNav.find('.main-links').outerHeight();
                        var calculatedHeight;

                        if (getView() === 'full') {
                            calculatedHeight = badgeHeight + navHeight;
                        } else if (getView() === 'partial') {
                            calculatedHeight = navHeight;
                        }

                        return calculatedHeight;
                    }
                });
            }


            function getFullNavHeight() {
                var linksHeight = $('.features-nav.large .main-links').outerHeight();
                var badgeHeight = $('.features-nav.large .badge-container').outerHeight();
                var fullNavHeight = linksHeight + badgeHeight;

                return fullNavHeight;
            }

            function getLinksHeight() {
                var linksHeight = $('.features-nav.large .main-links').outerHeight();

                return linksHeight;
            }
        },

        initStickyMobileNav: function() {
            var $mobileNav = $('.small-nav-wrapper');
            var $mobileMenu = $('#mobileMenu');

            function makeMobileNavSticky() {
                var mobileNavHeight = $('.small-nav-wrapper').height();
                if ($mobileNav.hasClass('open')) {
                    return false;
                }
                if ($(window).scrollTop() >= mobileNavHeight) {
                    $mobileNav.addClass('sticky');
                    $mobileMenu.css('margin-bottom', mobileNavHeight);
                } else {
                    $mobileNav.removeClass('sticky');
                    $mobileMenu.css('margin-bottom', 0);
                }
            }
            $(window).on('scroll', function() {
                makeMobileNavSticky();
            });

        }

    };

});
