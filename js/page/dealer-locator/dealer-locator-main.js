/**
 * @file Behaviors for the find a dealer landing page.
 */
require([
        "modernizr",
        "lexus",
        "jquery",
        "async!//ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0!OnScriptLoad",
        "component/map/Map",
        "component/map/Dealer",
        "component/map/ZipSearch",
        "PointBreak",
        "util/cookie",
        "util/geolocationHelper",
        "util/renderTemplate",
        "analytics",
        "touchSwipe"
    ],
    function(
        Modernizr,
        LEXUS,
        $,
        BingMaps,
        Map,
        Dealer,
        ZipSearch,
        PointBreak,
        Cookie,
        geolocationHelper,
        renderTemplate,
        analytics
    ) {

        var ACTIVE_CLASS = "active",
            MAX_PMA_DEALERS = 5,
            MAPS_LOAD_TIMEOUT = 30, // ms
            SCROLL_ANIMATION_DURATION = 500,
            CENTER_OF_USA = [37.71859, -97.03125],
            DEFAULT_LOCATION = CENTER_OF_USA,
            PMA_SEARCH_CLASS = "pma-search",
            HAS_SEARCH_RESULTS_CLASS = "has-search-results",
            LANDING_MODE_CLASS = "mode-landing",
            RESULTS_MODE_CLASS = "mode-results",
            MARKER_SELECTOR = ".search-results .marker",
            FIRST_TIME_VISITOR_COOKIE = "isFirstTimeVisitor",

            $window = $(window),
            $doc = $(document),
            $body = $("body"),
            $searchResults = $(".search-results"),
            $scrollPane = $(".scroll-pane-search-results"),
            $searchResultsContainer = $searchResults.find("ul"),
            $map = $("#map"),
            $firstTimeVisitor = $(".first-time-visitor"),
            $touchDeviceFooter,
            $disErrorMobileContainer = $(".mobile-map-error-container"),
            $jsBtnSeeMoreDealers = $(".js-btn-see-more-dealers"),

            pointbreak = new PointBreak(),

            /**
             * Array of all dealer results.
             *
             * @type {Array.<Dealer>}
             */
            dealers = [],
            eliteDealers = [],

            geolocation = {},
            geoAPI = null,

            zipsearch,
            zipSearchFirstTimeVisitor,
            bingMap = null,
            firstTimeMap = null,
            mobileBingMap = null,
            previousDealers = [],
            zipCode = "",
            formattedLocationData = null,
            searchResultTmpl,
            searchResultsCountNonPMADealers = 0,
            searchResultsCountPMADealers = 0,
            eliteClicked = false;

        /**
         * Page Initialization
         */

        function init() {
            //scroll to top on page load
            scrollToTop();

            // setup results template
            searchResultTmpl = generateDealerViewTemplate();

            $touchDeviceFooter = createFooterForTouchDevices();

            initAnalytics();

            // load neustar data
            geolocationHelper.fetchData(function(response) {
                // validate data
                if (response.data !== undefined) {
                    if (response.data.zip !== null) {
                        geolocation = response.data;
                        geoAPI = geolocationHelper.getApi(response.data);
                    }
                }

                onGeolocationReady(geolocation, geoAPI);
            });
        }


        /**
         * Called when geolocation results are successfully returned.
         */

        function onGeolocationReady(geolocationData, geoAPI) {
            var marketName = "";
            if (geoAPI !== null) {
                marketName = geoAPI.getMarketName();
                formattedLocationData = convertGeolocationData(geolocationData, marketName);
            }


            // Decide if we should render the results page or first time visitor experience
            if (isFirstTimeVisitor()) {
                initFirstTimeVisitor();
                analytics.helper.fireFindADealerLoad('Zip Code Overlay');
            } else {
                $firstTimeVisitor.remove();
                initResultsPage();
                analytics.helper.fireFindADealerLoad('Dealer Locator');
            }
        }


        function isFirstTimeVisitor() {
            //check for first time visitor
            var firstTimeCookie = Cookie.get(FIRST_TIME_VISITOR_COOKIE);
            return (firstTimeCookie === "true" || typeof firstTimeCookie === "undefined" || firstTimeCookie === null);
        }


        /**
         * If the user is a first time visitor show FirsTimeVisitor Popup
         */

        function initFirstTimeVisitor() {
            $body.addClass(LANDING_MODE_CLASS);

            var width = $map.width(),
                height = $window.height() - $map.offset().top,
                zoom = 5,
                centerPoint = CENTER_OF_USA;
            var lastBreakpoint = pointbreak.getCurrentBreakpoint();

            // Zoom in closer if a location is found
            if (areValidCoordinates(formattedLocationData)) {
                centerPoint = getCurrentLocation();
                zoom = 7;
            }

            firstTimeMap = new Map(document.getElementById("mapDiv"), {
                width: width,
                height: height,
                center: centerPoint,
                zoom: zoom,
                autoResize: true,
                disableUserInput: true,
                onReady: function() {
                    if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                        $firstTimeVisitor.fadeIn(500);
                    } else {
                        $firstTimeVisitor.show();
                    }
                }
            });
            pointbreak.addChangeListener(function() {
                if (lastBreakpoint === pointbreak.getCurrentBreakpoint() || $.isEmptyObject(firstTimeMap)) {
                    return;
                }
                lastBreakpoint = pointbreak.getCurrentBreakpoint();
                firstTimeMap.destroy();
                firstTimeMap = {};
                var width = $map.width(),
                    height = $window.height() - $map.offset().top,
                    zoom = 5,
                    centerPoint = CENTER_OF_USA;

                // Zoom in closer if a location is found
                if (areValidCoordinates(formattedLocationData)) {
                    centerPoint = getCurrentLocation();
                    zoom = 7;
                }
                firstTimeMap = new Map(document.getElementById("mapDiv"), {
                    width: width,
                    height: height,
                    center: centerPoint,
                    zoom: zoom,
                    autoResize: true,
                    disableUserInput: true,
                    onReady: function() {
                        if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                            $firstTimeVisitor.fadeIn(500);
                        } else {
                            $firstTimeVisitor.show();
                        }
                    }
                });
            });

            zipSearchFirstTimeVisitor = new ZipSearch(".zip-search-first-time-wrapper", {
                geolocation: formattedLocationData,
                isFirstTimeVisitor: true,
                hasStateDropDown: false,
                onFirstTimeVisitorClose: function(zipCode, formattedLocationData) {
                    $map.addClass(ACTIVE_CLASS);
                    $("#dealer-search").addClass(ACTIVE_CLASS);

                    if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                        $firstTimeVisitor.fadeOut(function() {
                            $firstTimeVisitor.remove();
                        });
                    } else {
                        $firstTimeVisitor.remove();
                    }

                    //initialize with zipcode
                    zipCode = zipCode;
                    geolocation = formattedLocationData;

                    //set cookie to hide it next time
                    //Cookie.set(FIRST_TIME_COOKIE, false);
                    initResultsPage();
                }
            });
        }


        /**
         * Initializes results page
         */

        function initResultsPage() {
            $body.removeClass(LANDING_MODE_CLASS);
            $body.addClass(RESULTS_MODE_CLASS);

            //render initial ui state
            showSidebarAndMapContainer();

            // wait for bing maps to be loaded
            checkToSeeIfMapIsReadyThenCall(onBingMapsLoaded);

            // trigger a change event
            onBreakPointChange();
        }

        /**
         * Guarantee Bing Maps is loaded
         *
         * @param {Function} callback
         */

        function checkToSeeIfMapIsReadyThenCall(callback) {
            if (window.Microsoft && window.Microsoft.Maps && window.Microsoft.Maps.Location) {
                callback();
            } else {
                setTimeout(checkToSeeIfMapIsReadyThenCall, MAPS_LOAD_TIMEOUT);
            }

        }


        /**
         * Called once Bing Maps has loaded.
         */

        function onBingMapsLoaded() {
            bindEvents();
            initMap();
            initZipSearch();
        }

        /**
         * Zip Search Module
         */

        function initZipSearch() {
            var cookiedZipCode = Cookie.get("dealer-last-search-dealerZip");
            if (cookiedZipCode !== undefined && cookiedZipCode !== "") {
                zipCode = cookiedZipCode;
            }

            zipsearch = new ZipSearch(".zip-search-wrapper", {
                geolocation: formattedLocationData,
                zipCode: zipCode,
                onSuccess: onZipSearchSuccess,
                onAjaxError: onZipSearchAjaxError,
                onSearchTypeChange: onZipSearchTypeChange,
                onValidationError: onZipSearchValidationError
            });
        }


        /**
         * Determines which map to initialize
         */

        function initMap() {

            // check browser width to initialize ui components
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                destroyScrollPane();
            } else {
                initScrollPane();
                initDesktopMap();
            }
        }

        /**
         * Calculate Scroll Pane height
         */

        function initScrollPane() {
            var footerHeight = 0;
            if (Modernizr.touch) {
                footerHeight = $touchDeviceFooter.outerHeight(); //$dealerSearchContainer.find("footer").outerHeight();
            }

            var height = document.getElementById("map").offsetHeight - document.getElementById("zip-wrapper").offsetHeight - $("#footer-search-results").height() - $("#dealer-search").css("padding-top").replace("px", "");
            $scrollPane.addClass(ACTIVE_CLASS);
            $scrollPane.height(height);
        }


        /**
         * Init Large View Map
         */

        function initDesktopMap() {

            // if map object already exists don't initialize it again
            if (bingMap !== null) {
                return;
            }

            if (firstTimeMap !== null) {
                firstTimeMap.destroy();
                firstTimeMap = {};
            }

            // calculate map size
            var width = $map.width();
            var height = $window.height() - $map.offset().top;

            bingMap = new Map(document.getElementById("mapDiv"), {
                width: width,
                height: height,
                autoResize: true,
                center: getCurrentLocation(),
                onReady: onMapReady,
                onResize: onResize,
                onViewDirty: onViewDirty
            });
        }

        function onMapReady() {
            if (previousDealers.length > 0) {
                bingMap.addLocations(previousDealers);
            }
        }


        function onZipSearchSuccess(searchType, searchResults) {
            var dealers = Dealer.parseSearchResults(searchResults);
            eliteDealers = dealers.filter(function(value) {
                return value.hasEliteStatus;
            });

            if (eliteClicked && eliteDealers.length > 0) {
                renderSearchResultsTemplate(eliteDealers, searchType);
            } else {
                renderSearchResultsTemplate(dealers, searchType);
            }

        }

        function onZipSearchTypeChange() {
            if (bingMap !== null) {
                bingMap.setActiveDealer(null);
            }
        }

        function onZipSearchAjaxError() {
            $scrollPane.attr("style", "");

            if (bingMap !== null) {
                bingMap.reset();
            }

            if (mobileBingMap !== null) {
                mobileBingMap.reset();
            }
            $jsBtnSeeMoreDealers.hide();
            $('.js-btn-see-more-dealers').hide();
            $('.side-dealer-message').hide();

            //remove overflow-y if there are no search results
            $scrollPane.removeClass(HAS_SEARCH_RESULTS_CLASS);
        }

        function onZipSearchValidationError() {
            $scrollPane.removeClass(ACTIVE_CLASS);
            $searchResultsContainer.html("");
            $searchResults.removeClass("show-more-dealers");
            $('.js-btn-see-more-dealers').hide();
            $('.side-dealer-message').hide();
        }

        function onResize() {
            if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                initScrollPane();
            }
        }


        /**
         * Bind analytics click events
         */

        function initAnalytics() {
            // See more dealers / see elite dealers links

            $(".dealer-links").on("click touchstart", "a", function(e) {
                var action = $.trim($(e.target).text());
                analytics.helper.fireFindADealerSeeMoreClick(action);
            });

            $searchResults.on('click touchstart', "a", function(event) {
                if ($(this).hasClass("dealer-details")) {
                    var buttonContainer = "Dealer Details Module",
                        buttonAction = $(this).text(),
                        dealer_code = $(this).data("id"),
                        dealer_name = $(this).parents(".dealer-sidebar-view").find(".sub-heading a").text().trim(),
                        buttonEliteStatus = findEliteStatusById($(this).data("id").toString()) ? "Elite" : "Non Elite";
                    analytics.helper.fireDealerDetailsClick(buttonContainer, buttonAction, buttonEliteStatus, dealer_code, dealer_name);
                } else if ($(this).data("id")) {
                    var dealerCode = $(this).data("id"),
                        dealerName = $(this).data("name"),
                        $moduleLinksTarget = $(event.currentTarget),
                        dealerButton = $moduleLinksTarget.text().trim(),
                        container = "Dealer Details Module",
                        events = "event5",
                        eliteStatus = findEliteStatusById($(this).data("id").toString()) ? "Elite" : "Non Elite";
                    analytics.helper.fireDealerModuleLinksClick(dealerCode, dealerName, dealerButton, container, events, eliteStatus);
                }
            });
        }


        /**
         * Render views for all search results.
         *
         * @param dealers {Array.<Dealer>}
         * @param searchType {String}
         */

        function renderSearchResultsTemplate(dealers, searchType) {

            if (!dealers || dealers.length < 1) {
                // if there are no results
                resetResults();
            } else {
                // if there ARE results

                var i = 0,
                    l = dealers.length,
                    dealer,
                    sidebarViewHTML = "";

                //loop through dealers and append HTML structure
                for (; i < l; i += 1) {
                    dealer = dealers[i];
                    sidebarViewHTML += createDealerSidebarView(dealer);
                }

                //if there are more dealers show 'more dealers' button
                if (i - 1 < MAX_PMA_DEALERS && searchType === "dealerZip") {
                    $jsBtnSeeMoreDealers.show();
                    $(".js-btn-elite-dealers").show();
                }

                // Render results HTML to dom
                $searchResults.show();
                //add overflow-y if there are search results
                $scrollPane.addClass(HAS_SEARCH_RESULTS_CLASS);
                $scrollPane.addClass(ACTIVE_CLASS);
                $disErrorMobileContainer.html("");
                $searchResultsContainer.html(sidebarViewHTML);
                $searchResults.removeClass("show-more-dealers");
                updatePMAView(dealers.length);

                // LIM 3199
                //Bind event for save button
                if (window.lfrActive) {
                    $('.dealer-search-favorite-listener').on('click', function() {
                        var name = $(this).attr('data-name');
                        var id = $(this).attr('data-id');
                        console.log("dealer selected: " + id + " - " + name);
                        $(document).triggerHandler("SetLFRPreferredDealer", [id, name]);
                    });
                }


                //Only show this logic if you are searching by zipcode
                if (searchType === "dealerZip") {
                    if (eliteDealers.length > 0) {
                        if (!eliteClicked) {
                            $(".js-btn-elite-dealers").show();
                            $(".cahip-message").prepend($(".elite-message"));
                            //hide the noelite message just in case
                            $(".no-elite-message").hide();
                            $(".cahip-message .link-arrow").css("margin-left", "10px");
                            $(".cahip-message .link-arrow").css("margin-top", "0px");
                        } else {
                            $jsBtnSeeMoreDealers.show();
                            $(".js-btn-elite-dealers").hide();
                            $(".elite-message").show();
                            $scrollPane.prepend($(".elite-message")[0]);
                            $(".no-elite-message").hide();
                            $(".cahip-message .link-arrow").css("margin-left", "25px");
                            $(".cahip-message .link-arrow").css("margin-top", "15px");
                        }
                    } else {
                        if (eliteClicked) {
                            $(".js-btn-elite-dealers").hide();
                            $(".elite-message").hide();
                            $scrollPane.prepend($(".no-elite-message")[0]);
                            $(".cahip-message .link-arrow").css("margin-left", "25px");
                            $(".cahip-message .link-arrow").css("margin-top", "0px");
                        } else {
                            $(".no-elite-message").hide();
                            $(".elite-message").hide();
                            if ($jsBtnSeeMoreDealers.css("display") !== "none") {
                                $(".cahip-message .link-arrow").css("margin-left", "25px");
                                $(".cahip-message .link-arrow").css("margin-top", "15px");
                            } else {
                                $(".cahip-message .link-arrow").css("margin-left", "25px");
                                $(".cahip-message .link-arrow").css("margin-top", "0px");
                            }
                        }
                    }
                    eliteClicked = false;
                } else {
                    $(".no-elite-message").hide();
                    $(".elite-message").hide();
                    $(".cahip-message .link-arrow").css("margin-left", "25px");
                    $(".cahip-message .link-arrow").css("margin-top", "0px");
                }
                if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                    initScrollPane();
                }

                //check if map is initialized
                if (bingMap) {
                    bingMap.reset();
                    bingMap.addLocations(dealers);
                }

                previousDealers = dealers;

                // analytics
                var zip = $('input[name = "zip"]').val();
                var eliteStatus = eliteDealers.length > 0 ? "Elite" : "Non Elite";
                analytics.helper.fireFindADealerResultsLoad("Results Page", zip, eliteStatus);
            }
        }

        function updatePMAView(numberOfDealers) {
            //if no pma dealers available show pma message
            if ($searchResults.hasClass(PMA_SEARCH_CLASS)) {
                searchResultsCountPMADealers = numberOfDealers;
            } else {
                searchResultsCountNonPMADealers = numberOfDealers;
            }

            $searchResultsContainer.find(".no-pma-dealers-found").remove();

            if (searchResultsCountPMADealers === searchResultsCountNonPMADealers && $searchResults.hasClass(PMA_SEARCH_CLASS)) {
                $searchResultsContainer.find("li").last().append('<span class="no-pma-dealers-found">' + LEXUS.noPMADealersFound + '</span>');
                searchResultsCountPMADealers = 0;
                $jsBtnSeeMoreDealers.hide();
                $(".js-btn-elite-dealers").hide();
            }

            $searchResults.removeClass(PMA_SEARCH_CLASS);
        }

        /**
         * Resets the page to the initial state with no results.
         */

        function resetResults() {
            previousDealers = [];
            $searchResultsContainer.html("");
            $searchResults.hide();
            //remove overflow-y if there are no search results
            $scrollPane.removeClass(HAS_SEARCH_RESULTS_CLASS);

            if (bingMap) {
                bingMap.reset();
            }
        }


        /**
         * Creates an HTML view for a dealer object.
         * @param dealer {Dealer}
         * @returns {String}
         */
        // TODO: extract to class DealerSidebarView

        function createDealerSidebarView(dealer) {
            //If it doesn't have the class show-more-dealers we know it's the smaller window, add the see more in along with the other buttons
            var tmplEliteDealerStatus = '<span class="elite-dealer">Elite Dealer</span>',
                tmplDealerDistance = '<span class="distance">{{dealerDistance}} MI.</span>';
            var mobile;
            if (navigator.userAgent.match(/Mobile/i)) {
                mobile = true;
            } else {
                mobile = false;
            }
            if (mobile) {
                dealer.phone = '<a href="tel:' + dealer.phone + '">' + dealer.phone + '</a>';
            }
            dealer.addressTemplate = dealer.getAddressAsHTML();
            dealer.dealerDetailPageLink = dealer.getDetailUrl();

            // conditional templates
            dealer.distanceTemplate = "";
            if (dealer.distance !== 0) {
                dealer.distanceTemplate = tmplDealerDistance.replace(new RegExp('{{dealerDistance}}', 'g'), dealer.distance);
            }

            dealer.eliteTemplate = "";
            if (dealer.isElite()) {
                dealer.eliteTemplate = tmplEliteDealerStatus;
                dealer.elite = "elite";
            } else {
                dealer.elite = "non-elite";
            }
            return renderTemplate(searchResultTmpl, dealer);
        }

        /**
         * Creates template used to render individual search results.
         *
         * @returns {String} Template for an individual dealer result
         */
        // TODO: extract to class DealerSidebarView

        function generateDealerViewTemplate() {
            var contactLinkText = LEXUS.contactLinkText,
                dealerLinkText = LEXUS.dealerLinkText;

            // todo: extract to view class.
            // LIM 3199
            if (window.lfrActive) {
                return ['<li class="dealer-sidebar-view" id="sidebar-dealer-{{id}}" data-dealer-id="{{id}}" data-lng="{{longitude}}" data-lat="{{latitude}}">',
                    '<a href="#" class="marker {{elite}}"></a>',
                    '<h2 class="sub-heading"><a href="{{dealerDetailPageLink}}">{{name}}</a></h2>',
                    '{{distanceTemplate}}',
                    '{{eliteTemplate}}',
                    '{{addressTemplate}}',
                    '<p>',
                    '<a target="_blank" href="{{dealerLink}}" data-id="{{id}}" data-name="{{name}}" class="link-hours link-arrow show-large inlink">' + dealerLinkText + '</a><br/>',
                    '<a href="{{dealerContactLink}}" data-id="{{id}}" data-name="{{name}}" class="inlink link-contact-dealer link-arrow show-large" target="_blank">' + contactLinkText + '</a>',
                    '<a href="{{dealerLinkMedium}}" data-id="{{id}}" data-name="{{name}}" class="inlink link-contact-dealer link-arrow show-medium" target="_blank">' + contactLinkText + '</a>',
                    '<a href="{{dealerLinkSmall}}" data-id="{{id}}" data-name="{{name}}" class="inlink link-contact-dealer link-arrow show-small" target="_blank">' + contactLinkText + '</a>',
                    '</p>',
                    '<p><a href="{{dealerDetailPageLink}}" data-id="{{id}}" class="btn btn-stroke dealer-details">Dealer Details</a></p>',
                    '<div class="favorite-wrapper"><span id="dealer-search-favorite"><span class="dealer-search-favorite-listener" data-action="addFavoriteDealer" data-id="{{id}}" data-name="{{name}}">Save</span></span></div>',
                    '</li>'
                ].join('\n');
            } else {
                return ['<li class="dealer-sidebar-view" id="sidebar-dealer-{{id}}" data-dealer-id="{{id}}" data-lng="{{longitude}}" data-lat="{{latitude}}">',
                    '<a href="#" class="marker {{elite}}"></a>',
                    '<h2 class="sub-heading"><a href="{{dealerDetailPageLink}}">{{name}}</a></h2>',
                    '{{distanceTemplate}}',
                    '{{eliteTemplate}}',
                    '{{addressTemplate}}',
                    '<p>',
                    '<a target="_blank" href="{{dealerLink}}" data-id="{{id}}" data-name="{{name}}" class="link-hours link-arrow show-large inlink">' + dealerLinkText + '</a><br/>',
                    '<a href="{{dealerContactLink}}" data-id="{{id}}" data-name="{{name}}" class="inlink link-contact-dealer link-arrow show-large" target="_blank">' + contactLinkText + '</a>',
                    '<a href="{{dealerLinkMedium}}" data-id="{{id}}" data-name="{{name}}" class="inlink link-contact-dealer link-arrow show-medium" target="_blank">' + contactLinkText + '</a>',
                    '<a href="{{dealerLinkSmall}}" data-id="{{id}}" data-name="{{name}}" class="inlink link-contact-dealer link-arrow show-small" target="_blank">' + contactLinkText + '</a>',
                    '</p>',
                    '<p><a href="{{dealerDetailPageLink}}" data-id="{{id}}" class="btn btn-stroke dealer-details">Dealer Details</a></p>',
                    '</li>'
                ].join('\n');
            }

        }

        /**
         * Takes response data from geolocation helper and returns an object in the correct
         * format for the page.
         * @param geolocationData {Object}
         * @param marketName {String}
         * @return {Object}
         */

        function convertGeolocationData(geolocationData, marketName) {
            return {
                zipCode: geolocationData.zip,
                city: marketName,
                lng: geolocationData.longitude,
                lat: geolocationData.latitude
            };
        }

        /**
         * Returns the current location as a pair of coordinates.
         * @returns {Array.<Number>}
         */

        function getCurrentLocation() {
            if (areValidCoordinates(formattedLocationData)) {
                return [formattedLocationData.lat, formattedLocationData.lng];
            }
            return DEFAULT_LOCATION;
        }

        /**
         * Checks that the lat and long are valid.
         *
         * @param location {{lat:Number,lng:Number}}
         * @returns {Boolean}
         */

        function areValidCoordinates(location) {
            return location && location.lat !== undefined && location.lng !== undefined;
        }

        /**
         * Create the search results footer.
         * @return {jQuery} a jquery object for the footer
         */

        function createFooterForTouchDevices() {
            $("footer").prepend('<div id="footer-search-results" class="footer-search-results"></div>');
            return $(".footer-search-results");
        }

        /**
         * Hide ScrollPane
         */

        function destroyScrollPane() {
            $scrollPane.removeClass(ACTIVE_CLASS);
            $scrollPane.attr("style", "");
        }

        /** Scroll to the top of the page */

        function scrollToTop() {
            $("html, body").scrollTop(0);
        }

        /**
         * Setup the UI. Show Sidebar and Map Container
         */

        function showSidebarAndMapContainer() {
            $("#dealer-search, #map").addClass(ACTIVE_CLASS);
        }

        /**
         * Bind Events
         */

        function bindEvents() {
            // sidebar pin hover
            // todo: make the entire tile selectable instead of just the pin.
            $doc.on('mouseenter', MARKER_SELECTOR, onMouseEnterSidebarPin)
                .on('mouseleave', MARKER_SELECTOR, onMouseLeaveSidebarPin)
                .on('click touchstart', MARKER_SELECTOR, onClickSidebarPin);

            $doc.on("click touchstart", ".js-btn-see-more-dealers", onClickMoreButton);
            $doc.on("click touchstart", ".js-btn-elite-dealers", onClickEliteButton);

            pointbreak.addChangeListener(onBreakPointChange);
        }

        /**
         * Called when the user hovers over a sidebar pin.
         * @param e {Event}
         */

        function onMouseEnterSidebarPin(e) {
            // Do nothing for small viewport.
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                e.preventDefault();
                return;
            }

            var dealerId = $(this).parent().data("dealer-id");
            bingMap.setHoveredDealer(dealerId);
        }

        /**
         * Called when the user exits the sidebar pin.
         */

        function onMouseLeaveSidebarPin() {
            if (bingMap) {
                bingMap.setHoveredDealer(null);
            }
        }

        /**
         * Called when the user clicks on a sidebar pin.
         * @param e {Event}
         */

        function onClickSidebarPin(e) {

            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                e.preventDefault();
                return;
            }

            var dealerId = $(this).parent().data("dealer-id");
            bingMap.setActiveDealer(dealerId);
        }


        /**
         * Gets called by the Map.js when the view needs to be redrawn
         * (that is, when activeDealer or hoveredDealer have changed)
         *
         * @param activeDealer {String} id of selected dealer
         * @param hoveredDealer {String} id of dealer that the user hovered on.
         * @param needsScroll {Boolean} If true, the active dealer has changed by a map click.
         */

        function onViewDirty(activeDealer, hoveredDealer, needsScroll) {
            unhighlightAllSidebarPins();
            highlightSidebarPin(hoveredDealer);
            highlightSidebarPin(activeDealer);
            if (needsScroll) {
                scrollToPin(activeDealer);
            }
        }

        /**
         * Unhighlights all sidebar dealer views.
         */

        function unhighlightAllSidebarPins() {
            $searchResults.find("li .marker").removeClass(ACTIVE_CLASS);
        }


        /**
         * Set the sidebar pin matching the id to the active state.
         * @param id {String}
         */

        function highlightSidebarPin(id) {
            getSidebarPinById(id).find(".marker").addClass(ACTIVE_CLASS);
        }

        /**
         * Scroll the view to focus on the active pin.
         *
         * @param id {String}
         */

        function scrollToPin(id) {
            var pin = getSidebarPinById(id);
            if (pin) {
                var offset = pin.offset();
                if (offset) {
                    offset = offset.top;
                    // subtract the container's offset to get an accurate number.
                    offset -= $searchResults.offset().top;

                    // animate scrolling to result.
                    $scrollPane.stop().animate({
                        scrollTop: offset
                    }, SCROLL_ANIMATION_DURATION);
                }
            }
        }

        /**
         * Returns the sidebar dealer view with the matching id.
         * @param id {String}
         * @returns {jQuery}
         */

        function getSidebarPinById(id) {
            return $searchResults.find("li[data-dealer-id=" + id + "]");
        }


        /**
         * Called when the user clicks on the show more dealers button.
         *
         * @param e {Event}
         */

        function onClickMoreButton(e) {
            e.preventDefault();
            $jsBtnSeeMoreDealers.hide();
            $(".js-btn-elite-dealers").hide();
            $searchResults.addClass("show-more-dealers");
            $searchResults.addClass("pma-search");
            var lastSearch = zipsearch.getLastSearch() !== "" ? zipsearch.getLastSearch().query : "";
            zipsearch.getDealers("AndPma", lastSearch);

            //analytics.helper.fireFindADealerSeeMoreClick("See More Dealers");
        }

        /**
         * Called when the user clicks on the elite dealers button.
         * Will filter both the map and the sidebar to only show elite dealers.
         *
         * @param e {Event}
         */

        function onClickEliteButton(e) {
            e.preventDefault();
            if ($(".js-btn-see-more-dealers").css("display") !== "none") {
                $(".js-btn-elite-dealers").hide();
                $jsBtnSeeMoreDealers.hide();
                $searchResults.addClass("show-more-dealers");
                $searchResults.addClass("pma-search");
                eliteClicked = true;
                $(".cahip-message .link-arrow").css("margin-left", "25px");
                $(".cahip-message .link-arrow").css("margin-top", "0px");
                var lastSearch = zipsearch.getLastSearch() !== "" ? zipsearch.getLastSearch().query : "";
                zipsearch.getDealers("AndPma", lastSearch);
            } else {
                $searchResults.find("ul").hide();
                $searchResults.prepend('<div class="loading animation" id="ajaxLoader"></div><script>LEXUS.loadingAnimation.register(ajaxLoader);</script>');
                $(".js-btn-elite-dealers").hide();
                $(".elite-message").hide();
                $jsBtnSeeMoreDealers.hide();

                //Filtering the sidebar.
                $searchResults.find("li").each(function(index, listDealer) {
                    if (!findEliteStatusById(listDealer.dataset.dealerId)) {
                        listDealer.remove();
                    }
                });
                setTimeout(function() {
                    //Filtering the map
                    if (bingMap) {
                        bingMap.reset();
                    }
                    bingMap.addLocations(eliteDealers);
                    analytics.helper.fireFindADealerEliteClick("Elite Dealers");
                    $jsBtnSeeMoreDealers.show();
                    $searchResults.find(".loading.animation").remove();
                    $(".cahip-message .link-arrow").css("margin-left", "25px");
                    $(".cahip-message .link-arrow").css("margin-top", "15px");
                    if (eliteDealers.length > 0) {
                        $(".elite-message").show();
                        $scrollPane.prepend($(".elite-message")[0]);
                    }
                    $searchResults.find("ul").show();
                }, 1500);
            }
        }


        /**
         * Helper function that finds whether a dealer is elite based on the
         * dealer id.
         *
         * @param dealerID {String}
         */

        function findEliteStatusById(dealerID) {
            var flag = false;
            for (var i = 0; i < eliteDealers.length; i++) {
                if (dealerID === eliteDealers[i].id) {
                    flag = true;
                }
            }
            return flag;
        }
        /**
         * On Resize check which modules need to be destroyed and initialized
         */

        function onBreakPointChange() {
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                destroyScrollPane();
                $touchDeviceFooter.hide();
            } else {
                initScrollPane();
                initDesktopMap();

                if (Modernizr.touch) {
                    $touchDeviceFooter.show();
                } else {
                    $touchDeviceFooter.hide();
                }
            }
        }

        init();
    });
