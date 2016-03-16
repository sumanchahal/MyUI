/**
 * @file All Models functionality for both List and Grid View
 *
 */
require([
    "lexus",
    "jquery",
    "modernizr",
    "util/cookie",
    "util/fitText",
    "PointBreak",
    "component/social/ShareOverlay",
    "component/ResponsiveImages",
    "analytics",
    "page/cpo/cpoNav",
    "waypoints-sticky",
    "transit",
    "component/mobileSecondaryTertiaryNav",
], function(
    LEXUS,
    $,
    Modernizr,
    cookie,
    fitText,
    PointBreak,
    ShareOverlay,
    ResponsiveImages,
    analytics,
    cpoNav
) {

    var pointbreak = new PointBreak(),
        currentView,
        selectedView,
        animationDuration = 500,
        fireDisclaimer = true;

    var SELECTED_CLASS = 'selected',
        OPEN_CLASS = 'open',
        ACTIVE_CLASS = 'active',
        STICKY_CLASS = 'sticky',
        LARGE_CLASS = 'large',
        GRID = 'grid',
        LIST = 'list',
        SMALL_BREAKPOINT = 'sml',
        MEDIUM_BREAKPOINT = 'med',
        LARGE_BREAKPOINT = 'lrg',
        UP_DIRECTION = 'up',
        DOWN_DIRECTION = 'down',
        SUB_NAV_SELECTOR = '#mobileMenuButton',
        TERTIARY_NAV = '.cpo-models-sub-nav';

    var $mobileDropdown = $('.sub-nav .dropdown');

    function initCPOModels() {
        var responsiveImages = new ResponsiveImages();
        analytics.helper.fireCPOModelLoad("", "", "");
        $(".product .dropdown-options li a").on("click", function() {
            var $dropdownWrapper = $(this).parents(".dropdown-wrapper");
            analytics.helper.fireCPOModelClick($dropdownWrapper.data("model"), $(this).find(".label").text(), $dropdownWrapper.data("model") + " Line", "Select Model", $dropdownWrapper.data("category"));
        });
        var nav = new cpoNav();

        $('.vehicle-link').css('display', 'none');

        $('#cpo-all-models .product').on('click', onModelClick);

        /*
        var currentViewport = getCurrentBreakPoint();
        if (currentViewport !== SMALL_BREAKPOINT) {
            var $secondaryNav = $('.cpo-models-sub-nav');
            $secondaryNav.addClass(LARGE_CLASS);
        }
        */
        initPointBreak();

        initShareOverlay();
        initWaypoints();
    }

    function onModelClick(event) {
        var el = $(event.delegateTarget).find('.dropdown-wrapper'),
            $previous = $('.dropdown-wrapper.open'),
            $element = $(event.delegateTarget),
            modelName = $element.find('.model > span').text(),
            action = 'Select Year',
            viewType = currentView,
            container = 'Select CPO Model';
        // close previous then open if different
        //$previous.toggleClass('open');
        if ($previous.attr('data-model') !== el.attr('data-model')) {
            showDropdown(el);
            // Wrong tag, and there doesn't seem to be a tag associated
            // analytics.helper.fireAllModelsModelClick(modelName, action, viewType, container);
        } else {
            hideDropdown(el);
        }

        function showDropdown(element) {
            hideDropdown($('.dropdown-wrapper.open'));

            element.addClass('open');
        }

        function hideDropdown(element) {
            element.removeClass("open");

        }
    }



    function initShareOverlay() {
        var $overlayContext = $("#nav-share-overlay"),
            $shareButton = $(".subnav").find("a.share");
        var share = new ShareOverlay($overlayContext, $shareButton, LEXUS.social);
        var $secondaryNavShare = $('.nav-footer li a:contains("SHARE")');
        $secondaryNavShare.on('click', $.proxy(share.showShareOverlay, share));
        var $mobileNavShare = $('.small-nav-wrapper a.share');
        $mobileNavShare.on('click', $.proxy(share.showShareOverlay, share));
    }

    /*function openTertiaryNav() {
        var t = $('#mobileNavButton'),
            b = $('#modelsPageNav');
        t.toggleClass('open').animate();

        if (t.hasClass('open')) {
            b.removeClass('open').animate();
        } else {
            b.addClass('open').animate();
        }
    }

    function initGridView() {
        initStickyNav();
        $(SUB_NAV_SELECTOR).addClass('unstuck');
    }
*/


    function initPointBreak() {
        var previousBreakPoint = getCurrentBreakPoint();

        //set up pointbreak listeners
        pointbreak.addChangeListener(onBreakpointChange);

    }

    function onBreakpointChange() {
        var viewport = getCurrentBreakPoint();
    }

    function initWaypoints() {
        $('.model-group').waypoint(function(direction) {
            var thisIndex = $(this).index(),
                nav = $('.sub-nav-models'),
                navLi = $('.sub-nav-models li'),
                navLink = $('.sub-nav-models li a'),
                subNavTitle = $('.subnav .model-id');


            $('.dropdown').find('a.active').removeClass(ACTIVE_CLASS);
            //if scrolling down
            if (direction === DOWN_DIRECTION) {
                if (getCurrentBreakPoint() === SMALL_BREAKPOINT) {
                    subNavTitle.text(navLi.eq(thisIndex).find('a').text());
                }

                navLi.removeClass(ACTIVE_CLASS);
                navLi.eq(thisIndex).addClass(ACTIVE_CLASS);

            } else {
                navLi.removeClass(ACTIVE_CLASS);
                if (thisIndex === 0) {
                    $('.dropdown .default').addClass(ACTIVE_CLASS);
                } else {
                    navLi.eq(thisIndex - 1).addClass(ACTIVE_CLASS);
                    if (getCurrentBreakPoint() === SMALL_BREAKPOINT) {
                        //if we've hit the topmost group
                        if (thisIndex !== 0) {
                            subNavTitle.text(navLi.eq(thisIndex - 1).find('a').text());
                        }
                    }
                }
            }


        }, {
            offset: function() {
                return 70;
            }
        });



        $('.header-wrapper').waypoint(function(direction) {
            if (direction === UP_DIRECTION) {
                $('.subnav .model-id').text("ALL MODELS");
            }

        }, {
            offset: -20
        });
    }

    function initStickyNav() {
        var currentBreakpoint = getCurrentBreakPoint();
        var $subNavTitle = $('.sub-nav .title');

        $(SUB_NAV_SELECTOR).removeClass('unstuck');

        //make the model list sticky
        $('.header-wrapper').waypoint(function(direction) {
            $(window).trigger('resize');
            if (direction === UP_DIRECTION) {
                $(SUB_NAV_SELECTOR).removeClass(STICKY_CLASS);
            } else {
                $(SUB_NAV_SELECTOR).addClass(STICKY_CLASS);
            }
        }, {
            offset: function() {
                var headerHeight = $('.header-wrapper').outerHeight();
                var borderHeight = parseFloat($('#wrapper').css('paddingTop'));

                return (headerHeight + borderHeight) * -1;
            }
        });



        // takes care of scrolling down on category click
        $('.sub-nav-models li a').off();
        $('.sub-nav-models li a').on('click', function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            var thisIndex = $(this).parent().index();
            var scrollPosition;
            var scrollDuration = 800;


            if (thisIndex === 0) {
                scrollPosition = $('.header-wrapper').outerHeight() - 2;
            } else {
                scrollPosition = $('.model-group').eq(thisIndex).offset().top - $('.sub-nav.sticky').outerHeight() + 1;
            }

            //determine if in small view and if so auto collapse the menu
            if (currentBreakpoint === SMALL_BREAKPOINT) {
                scrollDuration = 1800;
                if ($mobileDropdown.hasClass(OPEN_CLASS)) {
                    $('.sub-nav .nav-wrapper').transition({
                        height: '60'
                    });
                }


                $subNavTitle.find('.arrow').toggleClass(OPEN_CLASS);
                $mobileDropdown.slideToggle().toggleClass(OPEN_CLASS);

            }

            //scroll page to the chosen position
            $('html, body').stop(true, false).animate({
                scrollTop: scrollPosition
            }, {
                duration: scrollDuration
            });
        });

        $('.sub-nav .default').on('click', function(e) {
            if (e.preventDefault) {
                exp.preventDefault();
            } else {
                e.returnValue = false;
            }

            $('html, body').stop(true, false).animate({
                scrollTop: 0
            }, {
                duration: 800
            });


            $subNavTitle.find('.arrow').toggleClass(OPEN_CLASS);
            //$mobileDropdown.slideToggle().toggleClass(OPEN_CLASS);
            $mobileDropdown.toggleClass(OPEN_CLASS);

            $('.sub-nav .nav-wrapper').transition({
                height: '60'
            });

            $('.dropdown').find('a.active').removeClass(ACTIVE_CLASS);
            $('.dropdown .default').addClass(ACTIVE_CLASS);
            $('.sub-nav .title .name').text($('.dropdown .default').text());

        });






        //highlights the model type you're scrolling through
        $('.model-group').waypoint(function(direction) {
            var thisIndex = $(this).index(),
                nav = $('.sub-nav-models'),
                navLi = $('.sub-nav-models li'),
                navLink = $('.sub-nav-models li a'),
                subNavTitle = $('.subnav .model-id');
            console.log("CASAS");


            $('.dropdown').find('a.active').removeClass(ACTIVE_CLASS);
            //if scrolling down
            if (direction === DOWN_DIRECTION) {
                if (getCurrentBreakPoint() === SMALL_BREAKPOINT) {
                    subNavTitle.text(navLi.eq(thisIndex).find('a').text());
                }

                navLink.removeClass(ACTIVE_CLASS);
                navLi.eq(thisIndex).find('a').addClass(ACTIVE_CLASS);

            } else {
                navLink.removeClass(ACTIVE_CLASS);
                if (thisIndex === 0) {
                    $('.dropdown .default').addClass(ACTIVE_CLASS);
                } else {
                    navLi.eq(thisIndex - 1).find('a').addClass(ACTIVE_CLASS);
                    if (getCurrentBreakPoint() === SMALL_BREAKPOINT) {
                        //if we've hit the topmost group
                        if (thisIndex !== 0) {
                            subNavTitle.text(navLi.eq(thisIndex - 1).find('a').text());
                        }
                    }
                }
            }


        }, {
            offset: function() {
                return 70;
            }
        });



        $('.header-wrapper').waypoint(function(direction) {
            console.log($('.dropdown .default').text());
            if (direction === UP_DIRECTION) {
                $('.dropdown .default').addClass(ACTIVE_CLASS);
                $('.subnav .model-id').text($('.dropdown .default').text());
                $('.dropdown').find('a.active').removeClass(ACTIVE_CLASS);
                $('.dropdown .default').addClass(ACTIVE_CLASS);
            }

        }, {
            offset: -20
        });



        //make sure to close the model names nav if its open when opening the secondary nav
        $('#mobileMenuButton').on('click', function() {
            //if secondary nav is closed
            if ($('.sub-nav .dropdown').hasClass(OPEN_CLASS)) {
                closeMobileDropdown();
            }

            //trigger a refresh of waypoints after 400 ms
            var waypointDelay = window.setTimeout(function() {
                $.waypoints('refresh');
                clearTimeout(waypointDelay);
            }, 400);

        });

        /*
         * handle the show and hide of the nav when in small viewport
         */
        if (currentBreakpoint === SMALL_BREAKPOINT) {

            $subNavTitle.off('click');
            $subNavTitle.on('click', handleMobileToggle);


        } else {
            $subNavTitle.off('click');
        }


        $(window).trigger('scroll');




    }

    function handleMobileToggle() {
        if ($('#mobileMenuList').hasClass(OPEN_CLASS)) {
            if (typeof LEXUS.globalNav !== "undefined") {
                LEXUS.globalNav.closeAllMenus();
            }
        }

        if ($mobileDropdown.hasClass(OPEN_CLASS)) {
            closeMobileDropdown();
        } else {
            openMobileDropdown();
        }
        $(this).find('.arrow').toggleClass(OPEN_CLASS);

    }

    function openMobileDropdown() {
        var viewportHeight = $(window).outerHeight();

        $mobileDropdown.addClass(OPEN_CLASS).slideDown();
        //set the height of the nav to the height of the viewport
        $('.sub-nav .nav-wrapper').transition({
            height: viewportHeight
        });
    }

    function closeMobileDropdown() {
        $mobileDropdown.removeClass(OPEN_CLASS).slideUp();
        $('.sub-nav .nav-wrapper').transition({
            height: '60'
        });
    }

    function scrollToTop() {
        $(document).scrollTop(0);
    }

    /**
     * @function getCurrentBreakPoint
     * @returns {string}
     */

    function getCurrentBreakPoint() {
        var currentBreakPoint;

        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            currentBreakPoint = SMALL_BREAKPOINT;
        } else if (pointbreak.isCurrentBreakpoint(PointBreak.MED_BREAKPOINT)) {
            currentBreakPoint = MEDIUM_BREAKPOINT;
        } else {
            currentBreakPoint = LARGE_BREAKPOINT;
        }

        return currentBreakPoint;
    }

    /**
     * @function isTouch
     * @returns {boolean}
     */

    function isTouch() {
        if (Modernizr.touch || Modernizr.mstouch) {
            return true;
        }
    }

    initCPOModels();
});
