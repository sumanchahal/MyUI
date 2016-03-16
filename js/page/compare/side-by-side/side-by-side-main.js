/**
 * @file Behaviors for the compare side-by-side
 */
define([
        "jquery",
        "lexus",
        "PointBreak",
        "component/Carousel",
        "component/TrimSelectorDrawer",
        "component/TrimDrillDown",
        "component/social/ShareOverlay",
        "component/ResponsiveImages",
        "analytics",
        // jquery plugins
        "mousewheel",
        "waypoints",
        "waypoints-sticky",
        "transit"
    ],
    function(
        $,
        LEXUS,
        PointBreak,
        Carousel,
        TrimSelectorDrawer,
        TrimDrillDown,
        ShareOverlay,
        ResponsiveImages,
        analytics
    ) {

        var PRINT_DIALOG_DELAY = 1000,
            ANIMATION_TIME = 600,
            SCROLL_SPEED = 300,
            SCROLL_OFFSET = 15,
            WAYPOINT_OFFSET = 45,
            HEADER_HEIGHT = 190,
            TOOLTIP_FITS = 450,
            SELECTED_CLASS = 'selected',
            SHOWN_CLASS = 'shown',
            CLOSE_CLASS = 'close',
            HOVER_CLASS = 'hover',
            HIDDEN_CLASS = 'hidden',
            UNAVAILABLE_CLASS = 'unavailable',
            DISPLAY_ADVANTAGE_CLASS = 'display-advantage',
            CHANGE_LEXUS_CLASS = '.change-lexus-drill-down',
            CHANGE_COMPETITOR_CLASS = '.change-competitor-drill-down',
            LEFT = "left",
            RIGHT = "right",
            CENTER = "center",
            carousel,
            defaultSettings,
            groupname,
            prevPoint,
            pointbreak = new PointBreak(),
            trimSelectorDrawer = null,
            isStickySubnavLocked = false,
            tooltipAdjustInterval = null,
            headerResizeThreshold = 0,
            $target = null,
            $body = $("body"),
            $wrapper = $("#wrapper"),
            $report = $('.report'),
            $sectionSelector = $('.section-selector'),
            $listItems = $sectionSelector.find('li'),
            $vehicleChangeItem = $('.side-by-side-header .competitor.product'),
            $compareTrayHeading = $(".compare-tray-heading"),
            $showAdvantage = $report.find('.show-advantage'),
            $showAll = $report.find('.show-all'),
            $changeHeader = $report.find('.change-header'),
            $changeHeaderUpArrow = $changeHeader.find(".up-arrow"),
            $changeHeaderBackdrop = $report.find('.change-header-backdrop'),
            $stickyHeader = $('.sticky-header'),
            $window = $(window);

        function init() {
            jumpToScrollPosition(0);

            setupResponsiveImages();
            setupBreakpointListener();
            setupMoreDetails();
            setupScrollSelectDropdown();
            setupStickySubnav();
            setupCarousel();
            setupTrimSelectorDrawer();
            setupAdvantageToggle();
            setupChangeVehicleDrillDown();
            setUpHeaderHover();
            setupRemoveVehicle();
            LEXUS.loadingAnimation.stop();

            var isPrintMode = determinePrintMode();

            if (!isPrintMode) {
                setupShare();
            } else {
                setupPrintDialog();
            }

            $(document).ready(function() {
                setUpWayPoints();
            });

            ensurePageReload();
            headerResizeThreshold = $sectionSelector.offset().top;
            initAnalytics();
        }

        /**
         * Kicks off large/small image logic
         */

        function setupResponsiveImages() {
            var responsiveImages = new ResponsiveImages();
        }

        /**
         * Scrolls page to a particular y position
         *
         * @param {Integer} y - scroll position
         */

        function jumpToScrollPosition(y) {
            $("html, body").scrollTop(y);
        }

        /**
         * Set up trim selector drawer
         */

        function setupTrimSelectorDrawer() {
            trimSelectorDrawer = new TrimSelectorDrawer({
                instance: $(".trim-selector-drawer").eq(0),
                hideCallback: onTrimSelectorHide,
                beforeShowCallback: onBeforeTrimSelectorShow,
                onCompareTraySubmit: displayLoadingState
            });
            // bind drawer to add button
            $(".side-by-side-header").on("click", ".add-button", function(e) {
                e.preventDefault();
                trimSelectorDrawer.show();
            });
        }

        /**
         * Callback method executed prior to trim drawer showing
         */

        function onBeforeTrimSelectorShow() {
            jumpToScrollPosition(0);

            // give it a sec to recalculate after scrolling up
            // otherwise it doesn't calculate correctly, even
            // though it should happen instantly
            setTimeout(function() {
                trimSelectorDrawer.setOffsetTop(calculateDrawerOffsetTop());
            }, 10);
        }

        /**
         * Sets height of the trim selector to be as tall enough
         * to reach the footer.
         */

        function setTrimSelectorHeight() {
            var trimSelectorOffsetTop = $('.trim-selector-drawer').offset().top,
                footerTop = $('footer').offset().top;

            isStickySubnavLocked = true;

            if (trimSelectorDrawer) {
                trimSelectorDrawer.setHeight(footerTop - trimSelectorOffsetTop);
            }
        }


        /**
         * Callback method executed when drawer is hidden
         * Helps handle lock/unlocking the sticky header
         */

        function onTrimSelectorHide() {
            isStickySubnavLocked = false;
            $stickyHeader.waypoint('enable');
        }

        /**
         * calculate top position of trim selector
         *
         * @returns {Number} - calculated offet
         */

        function calculateDrawerOffsetTop() {
            var $sectionSelector = $(".section-selector");

            return $sectionSelector.position().top + $sectionSelector.outerHeight();
        }

        /**
         * Set up breakpoint listener
         */

        function setupBreakpointListener() {
            pointbreak.breakpoints.small = 700;
            pointbreak.addChangeListener(onBreakpointChange);
        }

        /**
         * React to changing breakpoint to trigger different behaviors after page resize
         *
         * @param {Event} event
         */

        function onBreakpointChange(event) {
            defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
            carousel.resetSlides(defaultSettings);

            // move trim selector's top position
            if ($body.hasClass("trim-selector-open")) {
                if (trimSelectorDrawer !== null) {
                    trimSelectorDrawer.setOffsetTop(calculateDrawerOffsetTop());
                }
                $compareTrayHeading.waypoint('unsticky');
                $compareTrayHeading.waypoint('sticky');
            }

            $.waypoints('refresh');
        }

        /**
         * Set up more details dropdown
         */

        function setupMoreDetails() {
            var $showButtons = $('.subsections button.show'),
                $hideButtons = $('.subsections button.hide'),
                $sectionHeadings = $('#side-by-side h2');

            $showButtons.click(function(e) {
                var $showButtonWrap = $(this).parents('.button-hider'),
                    $hideButtonWrap = $showButtonWrap.next('.button-hider'),
                    $section = $showButtonWrap.parents(".subsections"),
                    $hiddenRows = $section.find('.hidden-rows');

                // Show hidden rows and toggle hide/show buttons
                $showButtonWrap.addClass(HIDDEN_CLASS);
                $hideButtonWrap.removeClass(HIDDEN_CLASS);
                $hiddenRows.addClass(SHOWN_CLASS);

                refreshWayPoints();
            });

            $hideButtons.click(function(e) {
                var $hideButtonWrap = $(this).parents('.button-hider'),
                    $showButtonWrap = $hideButtonWrap.prev('.button-hider'),
                    $section = $hideButtonWrap.parents(".subsections"),
                    $hiddenRows = $section.find('.hidden-rows');

                // Show hidden rows and toggle hide/show buttons
                $hideButtonWrap.addClass(HIDDEN_CLASS);
                $showButtonWrap.removeClass(HIDDEN_CLASS);
                $hiddenRows.removeClass(SHOWN_CLASS);

                refreshWayPoints();

                // Re-adjust so user isn't stranded in an unrelated section
                $("html, body").stop().animate({
                    scrollTop: $hiddenRows.offset().top - (window.innerHeight * 0.6)
                }, SCROLL_SPEED);

            });

            // in the case of the smaller layout (less than 700px)
            $('.header-select').parent('.section-header').click(function(e) {

                if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {

                    var $selectedHeader = $(this);
                    var previouslySelectedPrecedes = ($selectedHeader.nextAll('.' + CLOSE_CLASS).length < 1) ? true : false;
                    var subsectionsHeight = $('.' + CLOSE_CLASS).next('.subsections').outerHeight();

                    if ($selectedHeader.hasClass(CLOSE_CLASS)) {
                        hideOpenSubsections();
                    } else {
                        hideOpenSubsections();
                        $selectedHeader.addClass(CLOSE_CLASS);
                        scrollToHeader($selectedHeader, previouslySelectedPrecedes, subsectionsHeight);
                        $selectedHeader.next('.subsections').addClass(SHOWN_CLASS);

                        analytics.helper.fireCompareScrollLink($selectedHeader.find(".short-name").text());
                    }
                }
            });
        }

        /**
         * The remove vehicle buttons are just a link,
         * but when they are clicked we should bind the
         * laoding animation.
         */

        function setupRemoveVehicle() {
            $report.find(".remove-vehicle").click(function(e) {
                displayLoadingState();
            });
        }

        /**
         * Hide open subsections
         */

        function hideOpenSubsections() {
            $('.section-header').removeClass(CLOSE_CLASS);
            $('.subsections').removeClass(SHOWN_CLASS);
        }

        /**
         * Show closed subsections
         */

        function showClosedSubsections() {
            $('.section-header').addClass(CLOSE_CLASS);
            $('.subsections').addClass(SHOWN_CLASS);
            $('.button-hider.hide').addClass(HIDDEN_CLASS);
            $('.button-hider.show').removeClass(HIDDEN_CLASS);
        }

        /**
         * Scroll to the top of a selected header after it's shown
         *
         * @param {jQuery} $selectedHeader
         * @param {Boolean} previouslySelectedPrecedes
         * @param {Number} subsectionsHeight
         */

        function scrollToHeader($selectedHeader, previouslySelectedPrecedes, subsectionsHeight) {
            var newPosition;
            if (previouslySelectedPrecedes) {
                newPosition = $selectedHeader.offset().top - $stickyHeader.outerHeight() - subsectionsHeight;
            } else {
                newPosition = $selectedHeader.offset().top - $stickyHeader.outerHeight();
            }

            /** *LIM 148 Start** */

            if (LEXUS.ComparatorDealerCode) {
                $("html, body").stop().animate({
                    scrollTop: newPosition
                }, SCROLL_SPEED);

                require(["resizer"], function(resizer) {
                    resizer.updateHeight(newPosition + $stickyHeader.outerHeight());
                });
            } else {
                $("html, body").stop().animate({
                    scrollTop: newPosition
                }, SCROLL_SPEED);
            }
        }


        /**
         * Set up scroll link navigation
         */

        function setupScrollSelectDropdown() {
            $listItems.click(function(event) {
                $item = $(event.target);
                if (!($showAll.hasClass('selected'))) {
                    showAllRows();
                    setTimeout(function() {
                        scrollToSection($item);
                    }, ANIMATION_TIME);
                } else {
                    scrollToSection($item);
                }

                //fire section-header
                analytics.helper.fireCompareScrollLink($item.text());

            });
        }

        /**
         * Scroll to section
         */

        function scrollToSection($item) {
            newTarget = $.find("." + $item.data('group'));
            targetPosition = $(newTarget).offset().top - $stickyHeader.outerHeight();
            /** *LIM 148 Start** */
            if (LEXUS.ComparatorDealerCode) {
                $("body,html").scrollTo(targetPosition, SCROLL_SPEED);
                $listItems.removeClass(SELECTED_CLASS);
                $sectionSelector.find("[data-group='" + $item.data('group') + "']").addClass(SELECTED_CLASS);
                require(["resizer"], function(resizer) {
                    resizer.updateHeight($(newTarget).offset().top);
                });

            } else {
                $("html, body").stop().animate({
                    scrollTop: targetPosition
                }, SCROLL_SPEED);
            }
            /** *LIM 148 End** */
        }

        /**
         * Set up sticky subnavigation
         */

        function setupStickySubnav() {
            // set 'quick facts' on by default
            $sectionSelector.find("li").eq(0).addClass(SELECTED_CLASS);

            $stickyHeader.waypoint("sticky", {
                handler: function(direction) {
                    refreshWayPoints();
                    if (!LEXUS.ComparatorDealerCode) {
                        setTrimSelectorHeight();
                    }
                    makeShareCloseButtonSticky(direction);
                },
                // JIRA 148 fix - doc issue 4 	 	
                offset: -20
            });
        }

        /**
         * If share overlay is open, make sure share button remains in sight just under the sticky nav
         */

        function makeShareCloseButtonSticky(direction) {
            if ($('.share-overlay').css('display') !== 'none') {
                if (direction === 'up') {
                    $('#share-close').css('top', 0);
                } else {
                    var newTop = $sectionSelector.outerHeight();
                    $('#share-close').css('top', newTop);
                }
            }
        }

        /**
         * Set up waypoints that update the navigation
         */

        function setUpWayPoints() {
            $('#side-by-side h2.section-header').waypoint(
                function(direction) {
                    if (direction === 'down') {
                        groupname = $(this).data('groupname');
                    } else if (direction === 'up') {
                        prevPoint = $(this).waypoint('prev');
                        groupname = $(prevPoint).data('groupname');
                    } else {
                        groupname = $(this).data('groupname');
                    }

                    // update the nav based on the name of the section that is entering the viewport
                    $listItems.removeClass(SELECTED_CLASS);

                    if ($(window).scrollTop() < headerResizeThreshold) {
                        groupname = "quick";
                    }

                    $sectionSelector.find("[data-group='" + groupname + "']").addClass(SELECTED_CLASS);
                }, {
                    offset: HEADER_HEIGHT + WAYPOINT_OFFSET + SCROLL_OFFSET
                }
            );
        }

        /**
         * Refresh waypoints after something has changed
         */

        function refreshWayPoints() {
            setTimeout(function() {
                // waypoints refreshed. Timeout lets animations finish first
                $.waypoints('refresh');
            }, ANIMATION_TIME);
        }

        /**
         * Disable and reenable waypoints after something has changed. This is different from
         * refreshWayPoints() because it also involves disabling and reenabling them.
         */

        function disableWaypointsOnTimer() {
            $.waypoints('disable');
            setTimeout(function() {
                // waypoints reenabled and refreshed. Timeout lets animations finish first
                $.waypoints('enable');
                $.waypoints('refresh');
            }, ANIMATION_TIME);
        }

        /**
         * Set up carousel for mobile version of footer
         */

        function setupCarousel() {
            defaultSettings = {
                instance: $(".benefits"),
                slideSelector: ".benefit"
            };

            defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
            carousel = new Carousel(defaultSettings);
        }

        /**
         * calculates carousel defaults based off breakpoints
         *
         * @returns {Object} - carousel settings based on breakpoint size
         */

        function getBreakpointSettings() {
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                return {
                    slidesPerPage: 1,
                    showNextPrev: false,
                    showIndicators: true,
                    animationDuration: 300
                };
            } else {
                return {
                    slidesPerPage: 3,
                    showNextPrev: false,
                    showIndicators: false
                };
            }
        }

        /**
         * Initializes events for when you hover over part of the header
         */

        function setUpHeaderHover() {
            if (Modernizr.touch === false && ($('.num-competitors-3').length === 1 || $('.num-competitors-2').length === 1)) {
                // Mouse events
                $vehicleChangeItem.hover(
                    function() {
                        $(this).addClass(HOVER_CLASS);
                    },
                    function() {
                        $(this).removeClass(HOVER_CLASS);
                    }
                );
            }
        }

        /**
         * Initializes toggling Lexus advantages
         */

        function setupAdvantageToggle() {
            $showAdvantage.click(function() {
                disableWaypointsOnTimer();
                $showAll.removeClass(SELECTED_CLASS);
                $showAdvantage.addClass(SELECTED_CLASS);
                $report.addClass(DISPLAY_ADVANTAGE_CLASS);
                $('.hidden-rows').addClass(SHOWN_CLASS);
                showClosedSubsections();
            });

            $showAll.click(function() {
                showAllRows();
            });
        }

        /**
         * Show all rows
         */

        function showAllRows() {
            disableWaypointsOnTimer();
            $showAdvantage.removeClass(SELECTED_CLASS);
            $showAll.addClass(SELECTED_CLASS);
            $report.removeClass(DISPLAY_ADVANTAGE_CLASS);
            $('.hidden-rows').removeClass(SHOWN_CLASS);
            hideOpenSubsections();
        }


        /**
         * add select boxes to drill down to change the current vehicle
         * trim from the fixed-position header
         */

        function setupChangeVehicleDrillDown() {
            initChangeLexusDrilldown();
            initChangeCompetitorDrillDown();
            addChangeButtonListener();
        }

        /**
         * set up the drill down that allows the user to change the Lexus vehicle
         */

        function initChangeLexusDrilldown() {
            changeLexusDrillDown = new TrimDrillDown({
                instance: $report.find(CHANGE_LEXUS_CLASS),
                lexusOnly: true,
                addCallback: function(data) {
                    handleChangeTrimAdd(data, true);
                }
            });
        }

        /**
         * set up the drill down that allows the user to change
         * the competitor vehicles
         */

        function initChangeCompetitorDrillDown() {
            changeCompetitorDrillDown = new TrimDrillDown({
                instance: $report.find(CHANGE_COMPETITOR_CLASS),
                addCallback: function(data) {
                    handleChangeTrimAdd(data, false);
                }
            });
        }

        /**
         * Executed when a user attempts to change a trim in compare
         * via the add button.
         */

        function handleChangeTrimAdd(data, onlyLexus) {
            var addSucceeded = drillDownAddCallback(data, onlyLexus, this);

            if (addSucceeded === true) {
                displayLoadingState();
            } else {

                // make sure selectbox kicks back into correct state
                if (onlyLexus) {
                    changeLexusDrillDown.resetForm();
                    hideDrillDown();
                } else {
                    changeCompetitorDrillDown.resetForm();
                    hideDrillDown();
                }
            }
        }


        /**
         * Shows a blocker with a centered loading gif
         * to indicate that the page is processing results
         */

        function displayLoadingState() {
            LEXUS.loadingAnimation.start();

            hideDrillDown();
            $("#resultsLoader").addClass("show");

            $(".trim-selector-drawer").hide();
            $(".dimmer").unbind("click").addClass("on").css({
                opacity: 0.6
            });
        }

        /**
         * callback when user clicks to change the vehicle after selecting a new vehicle with the drill-down
         *
         * @param {Object} data
         * @param {Boolean} onlyLexus
         * @param {jQuery} thisDrillDown
         * @returns {Boolean} whether or not add succeeded
         */

        function drillDownAddCallback(data, onlyLexus, thisDrillDown) {

            var pathNameToCheck = window.location.href.substr(window.location.href.indexOf('report'));

            var trimData = data || {},
                // regular expression gets the part of the url containing the Lexus vehicle that is the basis for comparison
                reg1 = new RegExp('/[0-9][0-9][0-9][0-9][0-9]/'),
                reg2 = new RegExp(','),
                competitorTrims = pathNameToCheck.split(reg1)[1],
                competitorTrimsList = competitorTrims.split(reg2),
                //newUrl = "http://" + window.location.host + window.location.pathname.split(reg1)[0],
                newUrl = window.location.href.substr(0, window.location.href.indexOf('report')) + 'report', //LIM 148                
                newID = trimData.id,
                repeatedID = false;

            if (newID === pathNameToCheck.match(reg1)) {
                repeatedID = true;
            }
            $.each(competitorTrimsList, function(index, value) {
                if (newID === value) {
                    repeatedID = true;
                }
            });
            if (!repeatedID) {
                if (!onlyLexus) {
                    newUrl = newUrl + pathNameToCheck.match(reg1);
                    competitorTrimsList[currentVehicleIndex] = newID;
                    $.each(competitorTrimsList, function(index, value) {
                        if (index > 0) {
                            newUrl += ",";
                        }
                        newUrl += value;
                    });
                } else {
                    newUrl = newUrl + "/" + newID + "/" + competitorTrims;
                }
                if (trimData.helperFile && (newUrl.indexOf("?parent=") === -1)) {
                    newUrl += "?parent=" + trimData.helperFile;
                }
                location.href = newUrl;
                return true;
            } else {
                return false;
            }
        }


        /**
         * attach the drill down to the change buttons on the header
         */

        function addChangeButtonListener() {
            // shows drill-down menu when user clicks on Change button
            $('.change-button').each(function(index, trigger) {
                $(trigger).data("index", index).click(onChangeButtonClicked);
            });

            // hides drill-down menu when user clicks anywhere outside menu
            $changeHeaderBackdrop.click(function(event) {
                hideDrillDown();
            });

            // hides drill-down menu when user clicks the close button (only shows up on mobile)
            $changeHeader.find(".close").click(function(e) {
                e.preventDefault();
                hideDrillDown();
            });
        }

        /**
         * Determines which menu to show, and then positions based on
         * viewport type.
         *
         * @param {Event} e - jquery event object
         */

        function onChangeButtonClicked(e) {
            e.preventDefault();
            e.stopPropagation();


            $target = $(e.target);

            setTooltipType();

            if (!($target.hasClass(UNAVAILABLE_CLASS))) {
                $target.addClass(UNAVAILABLE_CLASS);
                if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT) || $target.offset().top - $(document).scrollTop() + TOOLTIP_FITS > $(window).height()) {
                    showMobileChangeOverlay();
                } else {
                    showChangeTooltip();
                }
            }
        }

        /**
         * Shows the change overlay as an overlay instead of tooltip for mobile
         */

        function showMobileChangeOverlay() {
            $report.addClass('mobile-style');
            blockPageScroll();

            if (LEXUS.ComparatorDealerCode) {


                $changeHeader.css({
                    top: 0
                });

                require(["resizer"], function(resizer) {
                    resizer.updateHeight(0);
                });
            } else {


                $changeHeader.css({
                    top: $window.scrollTop() + ($window.height() - $changeHeader.outerHeight()) / 2
                });

            }

            $changeHeaderBackdrop.addClass(SHOWN_CLASS);
            $changeHeader.addClass(SHOWN_CLASS);

        }


        // Prevents page from scrolling and making tooltip disappear as soon as the
        // user has scrolled to the bottom or top of the tooltip content

        function blockPageScroll() {
            $changeHeaderBackdrop.bind('mousewheel DOMMouseScroll touchmove', function(e) {
                if (Modernizr.touch) {
                    e.preventDefault();
                } else if (!$(e.currentTarget).hasClass('find-vehicle')) {
                    e.preventDefault();
                }
            });
            $changeHeader.bind('mousewheel DOMMouseScroll touchmove', function(e) {
                if (Modernizr.touch) {
                    e.preventDefault();
                } else if (!$(e.currentTarget).hasClass('find-vehicle')) {
                    e.preventDefault();
                }
            });
            if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                $('body').css('overflow', 'hidden');
                $('#back-to-top').css('visibility', 'hidden');
            }
        }

        // Removes page scroll blcok

        function unblockPageScroll() {
            $changeHeaderBackdrop.unbind('mousewheel DOMMouseScroll touchmove');
            $changeHeader.unbind('mousewheel DOMMouseScroll touchmove');
            if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                $('body').css('overflow', 'auto');
                $('#back-to-top').css('visibility', 'visible');
            }
        }


        /**
         * Shows the change tooltip, and recalculates position on an
         * interval to prevent it getting detached.
         */

        function showChangeTooltip() {
            tooltipAdjustInterval = setInterval(function() {
                calculateTooltipPosition();
            }, 250);
        }

        /**
         * Determines whether to show Lexus selector or trim selector
         */

        function setTooltipType() {
            if ($target.hasClass('lexus-change')) {
                $report.find(CHANGE_LEXUS_CLASS).show();
                $report.find(CHANGE_COMPETITOR_CLASS).hide();
            } else if ($target.hasClass('competitor-change')) {
                $report.find(CHANGE_LEXUS_CLASS).hide();
                $report.find(CHANGE_COMPETITOR_CLASS).show();
                currentVehicleIndex = $target.data("index") - 1;
            }
        }

        /**
         * Calculates position of tooltip based on position of change button/link
         */

        function calculateTooltipPosition() {
            var paddingLeft = parseInt($wrapper.css("paddingLeft"), 10),
                paddingTop = parseInt($wrapper.css("paddingTop"), 10),
                tooltipTop = $target.offset().top + $target.outerHeight() - paddingTop,
                tooltipLeft = $target.offset().left + ($target.outerWidth() / 2) - ($changeHeader.outerWidth() / 2) - paddingLeft;

            $changeHeaderBackdrop.addClass(SHOWN_CLASS);
            $changeHeader.addClass(SHOWN_CLASS);

            setTooltipPosition(tooltipTop, tooltipLeft);
        }

        /**
         * sets tooltip position
         */

        function setTooltipPosition(top, left) {
            var changeHeaderWidth = $changeHeader.outerWidth(),
                rightBound = left + changeHeaderWidth,
                windowWidth = $window.width();

            $changeHeaderUpArrow.css("margin-left", "");

            if (left < 0) {
                $changeHeaderUpArrow.css("margin-left", left);
                left = 0;
            } else if (rightBound > windowWidth) {
                $changeHeaderUpArrow.css("margin-left", (rightBound - (windowWidth - changeHeaderWidth) - changeHeaderWidth));

                left = windowWidth - changeHeaderWidth;
            }

            $changeHeader.css({
                top: top,
                left: left
            });
        }


        /**
         *  Hides Drill down menu
         */

        function hideDrillDown() {
            clearInterval(tooltipAdjustInterval);

            $changeHeaderBackdrop.removeClass(SHOWN_CLASS);
            $changeHeader.removeClass(SHOWN_CLASS);

            setTimeout(function() {
                $report.removeClass('mobile-style');
            }, 400);

            unblockPageScroll();

            $('.change-button').removeClass(UNAVAILABLE_CLASS);
        }

        /**
         * Looks at the page and determines whether or not it's
         * currently in print mode
         *
         * @returns {Boolean} - whether or not print mode is enabled
         */

        function determinePrintMode() {
            if (document.location.href.search("print") !== -1) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Show print dialog once the window loads
         */

        function setupPrintDialog() {
            setTimeout(function() {
                window.print();
            }, PRINT_DIALOG_DELAY);
        }

        /**
         * Triggers the click event on the share button
         */

        function triggerShareOverlay() {
            alert('trigger share overlay');
            $shareButton = $(".share-btn");
            $shareButton.on("click", function(e) {
                e.preventDefault();
                triggerShareOverlay();
            });
        }

        /**
         * Instantiates share overlay
         */

        function setupShare() {
            // get default messages from page object

            var $overlayContext = $("#side-by-side-share"),
                $shareButton = $(".share-btn");

            var share = new ShareOverlay($overlayContext, $shareButton, LEXUS.social);
        }

        /**
         * Makes sure the page reloads when the back button
         * is pressed
         */

        function ensurePageReload() {
            $window.unload($.noop);
            $window.bind('pageshow', function(event) {
                if (event.originalEvent.persisted) {
                    window.location.reload();
                }
            });
        }

        /**
         * Analytics
         */

        function initAnalytics() {

            // page load analytics
            var modelName = LEXUS.seriesName,
                trim = LEXUS.trimName,
                competitorVehicles = [];

            // get all compare models
            for (var i = 0; i < LEXUS.competitorVehicles.length; i++) {
                var competitor = LEXUS.competitorVehicles[i];
                competitorVehicles[i] = competitor.modelYear + " " + competitor.makeName + " " + competitor.modelName + " " + competitor.trimName;
            }

            analytics.helper.fireCompareSideBySideLoad(competitorVehicles, modelName, trim);

            // on click of back to start link
            var $backBtn = $(".back");
            $backBtn.on('click touch', function() {
                var container = "Header",
                    action = "Back To Start";
                analytics.helper.fireCompareResultsLinkClick(container, action, modelName, trim);
            });

            // on click of download PDF
            var $downloadPDFBtn = $(".download-pdf");
            $downloadPDFBtn.on('click touch', function() {
                var container = "Header",
                    action = "Download PDF",
                    events = "event16";
                analytics.helper.fireCompareResultsUtilityNavClick(container, action, modelName, trim, events);
            });

            // on click of print buttons
            var $printBtn = $(".print");
            $printBtn.on('click touch', function() {
                var container = "Header",
                    action = "Print",
                    events = "event12";
                analytics.helper.fireCompareResultsUtilityNavClick(container, action, modelName, trim, events);
            });

            // on click of share buttons
            var $shareBtn = $(".share-btn");
            $shareBtn.on('click touch', function() {
                var container = "Header",
                    shareLink = LEXUS.social.shareUrl,
                    shareContent = LEXUS.social.googlePlus ? LEXUS.social.googlePlus.title : "";
                analytics.helper.fireGlobalElementShareClick(container, shareLink, shareContent);
            });

            // on click of Find a Dealer CTA
            var $findDealerBtn = $(".button.find-dealer");
            $findDealerBtn.on('click touch', function() {
                var container = "End Cap Module";
                analytics.helper.fireFindADealerClick(container);
            });

            // on click of Build Your Lexus CTA
            var $buildYoursBtn = $(".button.build-yours");
            $buildYoursBtn.on('click touch', function() {
                var container = "End Cap Module";
                analytics.helper.fireBuildYoursNavClick(container);
            });

            // on click of show more and learn more links
            var $showMoreBtn = $(".button.show");
            $showMoreBtn.on('click touch', function() {
                var container = "Button",
                    action = "Show More";
                analytics.helper.fireCompareResultsLinkClick(container, action, modelName, trim);
            });

            // With Every Lexus, read/learn more links
            var $learnMoreLinks = $(".learn-more");
            $learnMoreLinks.on('click touch', function(event) {
                var container = "With Every Lexus Module",
                    action = $(event.currentTarget).closest(".benefit").find(".title").text();
                analytics.helper.fireCompareResultsLinkClick(container, action, modelName, trim);
            });

            // Add/Change Vehicle buttons
            var $sideBySideHeader = $(".side-by-side-header"),
                $changeBtns = $sideBySideHeader.find(".button");

            $changeBtns.on("click", function(e) {
                var $target = $(e.target),
                    action = $target.hasClass("add-button") ? "Add Vehicle" : "Change Vehicle",
                    container = $target.hasClass("lexus-change") ? "Lexus Vehicle" : "Competitor Vehicle";

                analytics.helper.fireCompareResultsLinkClick(container, action, modelName, trim);
            });

            // Lexus Advantage filter
            var $advantageToggleLinks = $(".advantage-toggle").find("li");
            $advantageToggleLinks.on("click", function(e) {
                var $target = $(e.target),
                    action = $target.hasClass("show-all") ? "All" : "Lexus Advantages";

                analytics.helper.fireCompareResultsLinkClick("Quick Facts Filter", action, modelName, trim);
            });

            //on click of the jellies and specifically the image in the compare report.
            var $compareImage = $(".product-image");
            $compareImage.on("click", function(e) {
                var container = $(this).hasClass('competitor') ? "Competitor Vehicle" : "Lexus Vehicle",
                    action = "Image Selection";
                analytics.helper.fireCompareResultsLinkClick(container, action);
            });

            //on click of the jellies and specifically the copy in the compare report.
            var $compareCopy = $(".details");
            $compareCopy.on("click", function(e) {
                var container = $(this).hasClass('competitor') ? "Competitor Vehicle" : "Lexus Vehicle",
                    action = "Info Selection";
                analytics.helper.fireCompareResultsLinkClick(container, action);
            });
        }

        init();

    });
