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
    "analytics",
    "waypoints-sticky",
    "transit"
], function(
    LEXUS,
    $,
    Modernizr,
    cookie,
    fitText,
    PointBreak,
    analytics
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
        VIEW_COOKIE = 'allModelsViewMode',
        SMALL_BREAKPOINT = 'sml',
        MEDIUM_BREAKPOINT = 'med',
        LARGE_BREAKPOINT = 'lrg',
        UP_DIRECTION = 'up',
        DOWN_DIRECTION = 'down',
        SUB_NAV_SELECTOR = '.sub-nav';

    var $mobileDropdown = $('.sub-nav .dropdown'),
        $body = $('body'),
        $disclaimer_container = $('.optional-disclaimers-container .disclaimers > p');

    $("#SearchButton").click(function() {
        showCurrentOffers();
    });

    var $allModelsOffer = $("#showAllOffers");

    $(".currentYearOffers").click(function() {

        $(".previousYearOffers").hide();
        $(".currentYearOffers").show();

    });

    $(".previousYearOffers").click(function() {

        $(".currentYearOffers").hide();
        $(".previousYearOffers").show();

    });
    initAllModels();

    function oncustomButtonlClick(event) {

        var $element = $(event.delegateTarget),
            modelName = 'ISYY',
            action = 'Models-offer',
            viewType = currentView,
            container = 'Select Model';
        analytics.helper.fireAllOffersModelClick(modelName, action, viewType, container);
    }

    /**
     * Determine what view to show first. Based on data from the model
     * @function initAllModels
     */

    function initAllModels() {

        $(".chooseMarketName").click(function() {
            var marketOffersDivId = "#" + $(this).attr('data-showMarketOffers');
            marketOffersDivId = marketOffersDivId.replace(/\s/g, '');
            $(".marketsSpecificOffers").css({
                display: "none"
            });
            $(marketOffersDivId).css({
                display: "block"
            });
            $("#chooseMarketName").css({
                display: "none"
            });

        });

        $(".showCustomOffers").click(function() {

            var offerDivId = '#' + $(this).attr('data-showOfferID');
            $(this).attr('value', ($(this).val() === 'show offers' ? 'hide offers' : 'show offers'));
            $(offerDivId).toggle();

        });

        var $viewWrapper = $('.all-models-container'),
            currentViewport = getCurrentBreakPoint(),
            initialView = $viewWrapper.data('initial-view'),
            viewCookieValue = cookie.get(VIEW_COOKIE);

        // LRT-7753, use javascript instead of CSS so if javascript fails/errors
        // links will still be clickable as fallback
        $('.vehicle-link').css('display', 'none');

        if (viewCookieValue !== initialView && (viewCookieValue === GRID || viewCookieValue === LIST)) {
            initialView = viewCookieValue;
        }

        if (initialView === GRID && currentViewport !== SMALL_BREAKPOINT) {
            initGridView();
            selectedView = GRID;
            $('.view-toggle .selected').removeClass(SELECTED_CLASS);
            $('.view-toggle .grid-view-btn').addClass(SELECTED_CLASS);
        } else {
            initListView();
            selectedView = LIST;
            $('.view-toggle .selected').removeClass(SELECTED_CLASS);
            $('.view-toggle .list-view-btn').addClass(SELECTED_CLASS);
        }


        if (currentViewport !== SMALL_BREAKPOINT) {
            var $secondaryNav = $('.all-models-sub-nav');
            $secondaryNav.addClass(LARGE_CLASS);
        }

        $('.product').on('click', onModelClick);

        initToggleControls();
        initPointBreak();
        initDisclosuresClick();
        removeNonVisibleDisclaimers();
        wrapHybridNames();

        // fire page load analytics
        analytics.helper.fireAllModelsPageLoad(selectedView);
    }


    function showCurrentOffers() {
        return $.ajax({
            beforeSend: function() {
                $allModelsOffer.html("");
            },

            // url: "/models" + geolocation.marketName + "/series/" + SERIES_NAME + series_hybrid
            url: "/offers/alloffersgroup?zipcode=" + $("#zipcode").val(),

        }).done(function(offers) {

            if (offers !== "") {
                $allModelsOffer.html(offers);
                initAllModels();
            }
        }).complete(function() {}).error(function(e) {});
    }
    /**
     * Executed when the user clicks or touches on a model
     *
     * @param event {Event}
     */

    function onModelClick(event) {
        var $target = $(event.target);
        if ($target.hasClass('asterisk') && $target.parent().hasClass('disclaimer')) {
            return;
        }
        if ($target.hasClass('.vehicle-link')) {
            return;
        }
        var $element = $(event.delegateTarget),
            modelName = $element.closest('.product').find('.model').text(),
            action = 'Learn More',
            viewType = currentView,
            container = 'Select Model';
        analytics.helper.fireAllModelsModelClick(modelName, action, viewType, container);
        window.location = $element.closest('.product').find('.vehicle-link').attr('href');
    }

    /**
     * Executed when the user changes view type
     *
     * @param event {Event}
     */

    function onViewToggle(selectedView) {
        var container = 'Body';

        analytics.helper.fireAllModelsViewChange(selectedView, container);

    }
    /**
     * shuts off list view events and animates in the .grid-view element
     * @function initGridView
     */

    function initGridView() {
        currentView = GRID;
        $body.removeClass('showing-list-view');
        $body.addClass('showing-grid-view');

        initStickyNav();
        $(SUB_NAV_SELECTOR).addClass('unstuck');


        $('.all-models-container .grid-view').fadeIn(animationDuration, updateGridTitles);
        $.waypoints('disable');
        $('.header-wrapper').waypoint('enable');


    }

    /**
     * updateGridTitles
     * Calls fitText on grid titles and updates all grid titles to smallest value
     */

    function updateGridTitles() {
        var $titles = $('.grid-view:visible .title');
        var width = parseInt(($titles.parent().width() * 0.9), 10);
        var resizeTo = fitText.resize($titles, width, [24, 22, 20, 17, 14, 12]);
        $titles.css('font-size', resizeTo);
    }

    /**
     * animates in the .lis-view element and re-instates events
     * @function initListView
     */

    function initListView() {
        var currentBreakpoint = getCurrentBreakPoint();
        currentView = LIST;


        $body.removeClass('showing-grid-view');
        $body.addClass('showing-list-view');
        $('.all-models-container .list-view').show();

        $.waypoints('enable');

        initRollOvers();
        initStickyNav();

        //determine whether to use fittext or not. based on viewport size
        if (currentBreakpoint === SMALL_BREAKPOINT) {
            $('.list-view .model-group').each(function(key, value) {
                var title = $(value).find('.title');
                //refer to util/fitText.js for parameter information
                fitText.resize(title, 260, [70, 65, 60, 55, 50, 45, 40, 35, 30]);
                title.css('display', 'none');
            });

            $('.details .offers .prefix').each(function(key, value) {
                var prefixElement = $(value);
                if (prefixElement.find('.tooltip-trigger.disclaimer').length === 0) {
                    prefixElement.css('margin-top', '4px');
                }
            });


        } else {
            //clear out fittext size if it was previously applied
            $('.list-view .model-group').each(function(key, value) {
                var title = $(value).find('.title');
                $(title).attr('style', '');
            });
        }
    }

    /**
     * @function initPointBreak;
     */

    function initPointBreak() {
        var previousBreakPoint = getCurrentBreakPoint();

        //set up pointbreak listeners
        pointbreak.addChangeListener(onBreakpointChange);

        /**
         * @function onBreakpointChange
         * when going to small viewport we need to ensure that the list view gets shown, and not the grid view.
         * when going back out to medium and large views (or essentially just as long as its NOT small) then we show what view we came from.
         */

        function onBreakpointChange() {
            var thisView = currentView;
            var viewport = getCurrentBreakPoint();
            var $secondaryNav = $('.all-models-sub-nav');

            if (viewport === SMALL_BREAKPOINT && viewport !== previousBreakPoint) {
                previousBreakPoint = SMALL_BREAKPOINT;

                $('.all-models-container .grid-view').hide();
                $('.sub-nav .nav-wrapper').height(60);
                $('.sub-nav .dropdown').removeClass(OPEN_CLASS);
                $('.sub-nav .arrow').removeClass(OPEN_CLASS);
                switchToListView();


                $secondaryNav.removeClass(LARGE_CLASS);

            } else if (viewport !== SMALL_BREAKPOINT && viewport !== previousBreakPoint) {
                $secondaryNav.addClass(LARGE_CLASS);
                previousBreakPoint = getCurrentBreakPoint();

                if (selectedView === GRID) {
                    switchToGridView();
                } else {
                    switchToListView();
                }
            } else if (viewport !== SMALL_BREAKPOINT && selectedView === GRID) {
                switchToGridView();
            }
        }
    }

    /**
     * uses waypoints to determine when to anchor .sub-nav element to top of page
     * which lists group types like sedans, suvs, etc..
     * @function initStickyNav
     */

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
            e.preventDefault();
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
            e.preventDefault();

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
                subNavTitle = $('.sub-nav .title .name');



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
            if (direction === UP_DIRECTION) {
                $('.dropdown .default').addClass(ACTIVE_CLASS);
                $('.sub-nav .title .name').text($('.dropdown .default').text());
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

    function initDisclosuresClick() {
        var disclaimer = "Disclaimer List";

        $('.optional-disclaimers-container').on('click', '.disclaimers-title, .show-disclaimers', function() {
            if (fireDisclaimer) {
                analytics.helper.fireLegalDisclosuresClick(disclaimer);
                fireDisclaimer = false;
            } else {
                fireDisclaimer = true;
            }

        });
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


    /**
     * Initializes click events for toggling between grid and list views
     * @function initToggleControls
     */

    function initToggleControls() {
        var $gridBtn = $('.view-toggle .grid-view-btn');
        var $listBtn = $('.view-toggle .list-view-btn');

        $gridBtn.on('click', function(e) {
            e.preventDefault();

            if (currentView !== GRID) {
                switchToGridView();
                selectedView = GRID;

                onViewToggle(selectedView);
            }

        });

        $listBtn.on('click', function(e) {
            e.preventDefault();
            if (currentView !== LIST) {
                switchToListView();
                selectedView = LIST;
                onViewToggle(selectedView);
            }
        });
    }

    function scrollToTop() {
        $(document).scrollTop(0);
    }


    /**
     * @function initRollOvers
     */

    function initRollOvers() {
        var rollOverTimer;
        var animationDuration = 550;
        var rollOverDelay = 600;
        var currentBreakpoint = getCurrentBreakPoint();
        var scrollTimer;
        var scrolling = false;


        //only do rollOvers if currentBreakpoint is large
        //IF LARGE AND NOT TOUCH
        if (currentBreakpoint === LARGE_BREAKPOINT && !isTouch()) {
            $('.list-view .product').each(function(key, value) {
                rollOut($(value));
            });
            //set up mouse events for roll overs
            $('.list-view .product').mouseenter(function() {
                clearInterval(rollOverTimer);
                var thisElement = $(this);

                rollOverTimer = setInterval(function() {
                    clearInterval(rollOverTimer);
                    rollOver(thisElement);
                }, rollOverDelay);
            }).mouseleave(function() {
                var thisElement = $(this);
                clearInterval(rollOverTimer);
                rollOut(thisElement);
            }).mousemove(function() {
                if (scrolling === false) {
                    clearInterval(rollOverTimer);
                    var thisElement = $(this);
                    rollOver(thisElement);
                }
            });

            $(window).on('scroll', function() {
                clearTimeout(scrollTimer);
                scrolling = true;

                scrollTimer = window.setTimeout(function() {
                    scrolling = false;
                }, 200);
            });


        } else {
            //if breakpoint is small then clear out unnecessary functions
            //$(window).off('scroll');
            $('.list-view .product').unbind('mouseenter mouseleave mousemove');
            $('.list-view .product .btn-learn-more').attr('style', '');

        }


        function rollOver(element) {
            var over = element.find('.over-state');
            var content = element.find('.content-wrapper .product-image');
            var details = element.find('.details-wrapper');
            var offers = element.find('.offers');
            var readMoreBtn = element.find('.btn-learn-more');
            var hoverTextColor;


            if (element.hasClass('dark')) {
                hoverTextColor = '#000';
            } else {
                element.addClass('over');
                hoverTextColor = '#fff';
            }

            offers.stop(true, false).transition({
                duration: animationDuration / 2,
                height: '0',
                padding: '1px 0 0 0',
                margin: '5px 0px'
            });

            details.stop(true, false).transition({
                duration: animationDuration,
                //marginTop: '5%',
                color: hoverTextColor
            }).css('color', hoverTextColor);

            over.stop(true, false).transition({
                duration: animationDuration / 2,
                opacity: 1
            });

            content.stop(true, false).transition({
                duration: animationDuration / 2,
                opacity: 0
            });

            readMoreBtn.stop(true, false).transition({
                duration: animationDuration,
                marginTop: '2%',
                opacity: 1
            });

        }

        function rollOut(element) {
            var over = element.find('.over-state');
            var content = element.find('.content-wrapper .product-image');
            var details = element.find('.details-wrapper');
            var readMoreBtn = element.find('.btn-learn-more');
            var offers = element.find('.offers');
            var newHeight = element.find('.over-state').height();
            var hoverTextColor;

            element.removeClass('over');

            if (element.hasClass('dark')) {
                hoverTextColor = '#fff';
            } else {
                hoverTextColor = '#000';
            }

            offers.stop(true, false).transition({
                duration: animationDuration / 2,
                height: '20px',
                padding: '2% 0px',
                margin: '0 0 2% 0'
            }).css('height', 'auto');

            details.stop(true, false).transition({
                duration: animationDuration,
                marginTop: '9%',
                color: 'black'
            }).css('color', '#000');

            over.stop(true, false).transition({
                duration: animationDuration,
                opacity: 0
            });

            content.stop(true, false).transition({
                duration: animationDuration,
                opacity: 1
            });

            readMoreBtn.stop(true, false).transition({
                duration: animationDuration,
                marginTop: '8%',
                opacity: 0
            });
        }
    }
    /**
     * Sets all events and shows content for list view
     * @function switchToListView
     */

    function switchToListView() {
        var $listView = $('.all-models-container .list-view');
        var $gridView = $('.all-models-container .grid-view');

        scrollToTop();

        $('.sub-nav .dropdown').attr('style', '');

        $gridView.fadeOut();
        $listView.fadeIn(this.animationDuration, function() {
            initListView();
        });


        $('.view-toggle .selected').removeClass(SELECTED_CLASS);
        $('.view-toggle .list-view-btn').addClass(SELECTED_CLASS);

        cookie.set(VIEW_COOKIE, LIST);
    }

    /**
     * Sets all events and shows content for list view
     * @function switchToGridView()
     */

    function switchToGridView() {
        var $listView = $('.all-models-container .list-view');
        var $gridView = $('.all-models-container .grid-view');


        scrollToTop();

        $listView.fadeOut();
        $gridView.fadeIn(this.animationDuration, function() {
            initGridView();
        });

        $('.view-toggle .selected').removeClass(SELECTED_CLASS);
        $('.view-toggle .grid-view-btn').addClass(SELECTED_CLASS);

        cookie.set(VIEW_COOKIE, GRID);
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

    /**
     * Hides the disclaimers that are in the description elements when user is in mobile view.
     */

    function removeNonVisibleDisclaimers() {
        if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            return;
        }
        var index = 0;

        // Get the set of disclaimers that are not visible and will need to be hidden
        $('.disclaimer-counters').parent('.description').each(function() {
            $(this).children('.disclaimer-counters').each(function() {
                index = $(this).html();
                removeDisclaimer(index);
            });
        });
    }



    /**
     * Hides a disclaimer with the corresponding index in the "Disclosures" section.
     * @param Integer
     */

    function removeDisclaimer(index) {
        var match = /\[[0-9]+\]/,
            // Format the index to match the format of the disclaimer index
            clean_index = '[' + index + ']',
            result = '';

        $disclaimer_container.each(function() {
            // Extract the index from the disclaimer
            result = match.exec($(this).html());
            if (result === clean_index) {
                $(this).css('display', 'none');
                return;
            }
        });
    }

    /**
     * Wrap the word "Hybrid" for styling purposes
     *
     */

    function wrapHybridNames() {
        $("[itemprop='model']").each(function() {
            $(this).html($(this).html().replace("HYBRID", "<span class='hybrid-name'>HYBRID</span>"));
        });
    }

});
