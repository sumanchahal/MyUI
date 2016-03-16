/**
 * Bing maps implementation which is used on the model overview page
 * Displays Bing maps with a search field. Upon successful search
 * offers in the area are presented.
 *
 * @class FindNearbyDealers
 * @param {jquery} element
 */

// TODO: this class needs to be refactored since it is mostly copy pasted from dealer-locator-main
define([
    "async!//ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0!OnScriptLoad",
    "lexus",
    "jquery",
    "PointBreak",
    "util/cookie",

    // todo: replace OverviewMap with Map
    // Note: I've temporarily replaced the map with the overview map because this class
    // borrows heavily from dealer-locator-main and needs to be refactored to share a common
    // source. Since dealer-locator-main and Map are being refactored, this class was conflicting
    // and needed an original pristine map from before the refactor.
    "component/map/OverviewMap",

    "component/map/ZipSearch",
    "util/geolocationHelper",
    "analytics"
], function(
    BingMaps,
    LEXUS,
    $,
    PointBreak,
    Cookie,
    Map,
    ZipSearch,
    geolocationHelper,
    analytics
) {
    var FindNearbyDealers = function(element) {
        var self = this;
        var geoAPI = null;
        self.findNearbyDealers = $(element);
        self.map = {};
        self.geolocation = {};
        self.firstTimeVisitorOverlay = self.findNearbyDealers.find(".first-time-visitor");
        self.marketOffer = self.findNearbyDealers.find("#market-offer");
        self.ajaxLoader = self.findNearbyDealers.find("#ajaxLoaderNearbyDealers");
        self.mapContainer = self.findNearbyDealers.find(".map-container");
        self.mapEl = self.findNearbyDealers.find("#map");
        self.zipSearch = self.findNearbyDealers.find(".zip-search-wrapper");
        self.zipCode = "";
        self.searchResults = $(".search-results");
        self.searchResultsContainer = self.findNearbyDealers.find(".search-results ul");
        self.inputSearch = self.zipSearch.find(".input-search");
        self.btnSearch = self.zipSearch.find(".btn-search");
        self.searchResultTmpl = "";
        self.disErrorLarge = $(".dis-error-large");

        var pointbreak = new PointBreak(),
            OFFER_URL = "/offers/",
            SERIES_NAME = LEXUS.offers.subNav.seriesName,
            IS_HYBRID = LEXUS.isHybrid,
            CITY_LEVEL_ZOOM = 14;

        /**
         * @constructor
         */

        function init() {

            // setup results template
            self.searchResultTmpl = generateSearchResultTmpl();

            // load neustar data
            geolocationHelper.fetchData(function(resp) {
                var response = resp.data;

                if (response.zip !== null) {
                    self.geolocation = resp.data;
                    geoAPI = geolocationHelper.getApi(self.geolocation);
                }

                onGeolocationReady();
            });

            initAnalytics();
        }

        /**
         * When geolocation detected preset search field with zip and market
         *
         * @private
         */

        function onGeolocationReady() {
            var marketName = "";

            if (geoAPI !== null) {
                marketName = geoAPI.getMarketName(); //geoAPI.getMarketDataForZip(self.geolocation.zip).marketName;

                self.geolocation = {
                    zipCode: self.geolocation.zip,
                    city: marketName,
                    lng: self.geolocation.longitude,
                    lat: self.geolocation.latitude
                };
            }

            //check for first time visitor
            var isFirstTimeVisitor = Cookie.get("isFirstTimeVisitor");

            //for testing
            //isFirstTimeVisitor = "true";

            //wait for bing maps to be loaded
            mapReadyTest(function() {
                //either show the first time vistor view or the returning user view
                if (isFirstTimeVisitor === "true" || isFirstTimeVisitor === undefined) {
                    initFirstTimeVisitor();
                } else {
                    initReturningVisitor();
                }
            });
        }

        /**
         * Zip Search Module (Next to Nearby Lexus Dealer title)
         *
         * @private
         */

        function initReturningVisitor() {

            //define map center point
            var center = ["", ""];
            if (self.geolocation.lat !== undefined && self.geolocation.lng !== undefined) {
                center = [self.geolocation.lat, self.geolocation.lng];
            }

            $("#mapDiv").html("");

            if ($("#mapDiv").hasClass("initialized")) {
                return;
            }

            self.map = new Map(document.getElementById("mapDiv"), {
                center: center, //current location
                autoResize: true,
                zoom: CITY_LEVEL_ZOOM,
                onReady: function() {
                    $("#mapVid").addClass("initialized");
                    initReturningVisitorZipSearch();
                },
                onPinClick: function(e) {
                    console.log(e);
                    if (zipsearch && e && e.target) {
                        clearOffers();
                        setLocalOffer(zipsearch.getInputSearchZipCode(), e.target.marketName);
                    }
                }
            });
        }

        function initReturningVisitorZipSearch() {

            //show zip search next to module title
            self.zipSearch.addClass("active");

            //initialize new zip search
            zipsearch = new ZipSearch(".zip-search-wrapper", {
                geolocation: self.geolocation,
                zipCode: self.zipCode,
                onAjaxBeforeSend: function() {
                    self.ajaxLoader.show();
                    self.searchResults.hide();

                },
                onAjaxComplete: function() {
                    self.ajaxLoader.hide();
                },
                onAjaxError: function(data) {
                    if (data.status === 500) {
                        self.disErrorLarge.show();
                        self.zipSearch.hide();
                        self.mapEl.hide();
                    }
                    self.ajaxLoader.hide();
                },
                onValidationError: function(type) {
                    if (type === "invalid-zip") {
                        self.map.removePins();
                        clearOffers();
                        analytics.helper.fireFindADealerErrorPageLoad("Error Overlay", self.inputSearch.val());
                    }
                },
                onSuccess: function(searchType, result) {
                    //getDealers() results callback
                    renderSearchResultsTemplate(searchType, result);

                    var dealers = result.data;
                    var marketName = '';

                    if (dealers.length > 0) {
                        marketName = dealers[0].marketName;

                        //in case of multiple marketnames don't show any offers - LRT-6927
                        if (dealers[0].marketNames.length > 1) {
                            clearOffers();
                            return;
                        }
                    }

                    //get local offers
                    var zipCode = extractZipCode(self.inputSearch.val());
                    setLocalOffer(zipCode, marketName);
                    self.searchResults.attr("style", "");
                }
            });

            //check if DIS is down
            zipsearch.isDISDown(function(isDown) {
                if (isDown) {
                    self.disErrorLarge.show();
                    self.zipSearch.hide();
                }
            });

            //remove first time visitor overlay
            self.firstTimeVisitorOverlay.remove();

        }


        /**
         * Extract Zip Code from Input Field which might contain the Area Name
         *
         * @param {String} zip
         * @returns {String} - sanitized zip code
         * @private
         */

        function extractZipCode(zip) {
            return zip.replace(/\(.*?\)/g, "");
        }

        /**
         * First Time Visitor
         *
         * @private
         */

        function initFirstTimeVisitor() {
            //show firstime visitor overlay
            self.firstTimeVisitorOverlay.show();

            //on mobile hide map
            self.mapEl.addClass("hide");

            //calculate map center point
            var center = ["", ""];
            if (self.geolocation.lat !== undefined && self.geolocation.lng !== undefined) {
                center = [self.geolocation.lat, self.geolocation.lng];
            }

            //initialize map
            self.map = new Map(document.getElementById("mapDiv"), {
                center: center, //current location
                disableUserInput: true,
                showDashboard: false,
                autoResize: true,
                zoom: CITY_LEVEL_ZOOM
            });

            //init zip search
            var zipSearchFirsTimeVisitor = new ZipSearch(".zip-search-first-time-wrapper", {
                geolocation: self.geolocation,
                isFirstTimeVisitor: true,
                hasStateDropDown: false,
                onFirstTimeVisitorClose: function(zipCode, geolocation) {

                    //hide first time visitor overaly
                    self.firstTimeVisitorOverlay.fadeOut(function() {
                        self.firstTimeVisitorOverlay.remove();
                    });

                    //set geolocation
                    self.geolocation = geolocation;

                    //set zipcode
                    self.zipCode = zipCode;

                    //set value of zip search next to header title
                    self.zipSearch
                        .addClass("active")
                        .find(".input-search").val(zipCode);

                    //show map
                    self.mapEl.removeClass("hide");

                    //destroy map to reinitialize it after with mousewheel support
                    self.map.destroy();
                    self.map = {};

                    //init returning user view
                    initReturningVisitor();
                }
            });

            //set cookie to hide it next time
            //Cookie.set("isFirstTimeVisitor", false, 1000);

            //check if DIS is down
            zipSearchFirsTimeVisitor.isDISDown(function(isDown) {
                if (isDown) {
                    self.disErrorLarge.show();
                    self.zipSearch.hide();
                    self.mapEl.hide();
                    self.firstTimeVisitorOverlay.remove();
                }
            });
        }

        function clearOffers() {
            var activeOfferClass = "active-offer";
            self.mapContainer.removeClass(activeOfferClass);
            self.marketOffer.hide();
            self.marketOffer.find(".js-offer-result").html("");
            self.map.autoResize();
        }

        /**
         * Display local market offer based on zip
         * If market is unkown or hide offer module
         *
         * @param {String} zip
         * @private
         */

        function setLocalOffer(zip, marketName) {
            var activeOfferClass = "active-offer";

            if (marketName === "Unknown") {
                clearOffers();
                return;
            }

            var ajaxUrl = OFFER_URL + marketName + "/preferred/" + SERIES_NAME;
            var modelCheck = SERIES_NAME;

            if (IS_HYBRID === "true") {
                ajaxUrl += "h";
                modelCheck += "h";
            }

            // if (SERIES_NAME === "IS C") {
            //     ajaxUrl = OFFER_URL + marketName + "/preferred/ISC";
            // }

            $.ajax({
                url: ajaxUrl
            }).done(function(offers) {
                if (offers === "" || $(offers).eq(0).data("series") !== modelCheck) {
                    clearOffers();
                    return;
                }

                self.marketOffer.find(".js-offer-result").html($('<div class="offer"></div>').append($(offers).eq(0)).html());
                self.marketOffer.show();

                //add zip code to button url
                var marketOfferButton = self.marketOffer.find(".offer").find(".button");
                var url = marketOfferButton.attr("href") || "";

                if (url !== "") {
                    var zipCodeStringPos = url.indexOf("zipCode=");
                    var firstPart = url.substring(0, zipCodeStringPos + 8);
                    var secondPart = url.substring(zipCodeStringPos + 8, url.length);
                    var buttonUrl = firstPart + zip + secondPart;
                    marketOfferButton.attr({
                        "href": buttonUrl,
                        "data-zip-code": zip
                    });

                }

                self.mapContainer.addClass(activeOfferClass);
                self.map.autoResize();
                //                self.map.setBestView();
                LEXUS.Disclaimers.disclaimersToFooter();
            }).error(function() {
                //on error hide offer module
                self.marketOffer.hide();
                self.mapContainer.removeClass(activeOfferClass);
                self.map.autoResize();
            });
        }

        /**
         * Parse Search Results and Display Pins
         *
         * @param {String} searchType
         * @param {Object} result
         * @private
         */

        function renderSearchResultsTemplate(searchType, result) {
            var dealers = result.data;

            //https://gist.github.com/Integralist/1225181

            function template(string, data, prop) {
                for (prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        string = string.replace(new RegExp('{{' + prop + '}}', 'g'), data[prop]);
                    }
                }
                return string;
            }

            var output = "",
                pins = [],
                tmplEliteDealerStatus = '<span class="elite-dealer">Elite Dealer</span>',
                tmplDealerDistance = '<span class="distance">{{dealerDistance}}MI.</span>';
            var mobile;
            if (navigator.userAgent.match(/Mobile/i)) {
                mobile = true;
                console.log("MOBILE");
            } else {
                mobile = false;
            }
            $.each(dealers, function(index, dealer) {
                var address = dealer.dealerAddress;
                dealer.address1 = address.address1;
                dealer.city = address.city;
                dealer.state = address.state;
                dealer.zipCode = address.zipCode;
                dealer.phone = dealer.dealerPhone.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                if (mobile) {
                    dealer.phone = '<a href="tel:' + dealer.phone + '"">' + dealer.phone + '</a>';
                }
                dealer.showButtonSeeMoreDealers = "";
                dealer.showDealerDistance = "";

                //check if dealer has elite status
                if (dealer.eliteStatus === true) {
                    dealer.eliteStatus = tmplEliteDealerStatus;
                } else {
                    dealer.eliteStatus = "";
                }

                if (dealer.dealerDistance !== 0) {
                    dealer.showDealerDistance = tmplDealerDistance.replace(new RegExp('{{dealerDistance}}', 'g'), dealer.dealerDistance);
                }

                output += template(self.searchResultTmpl, dealer);

                //location data
                var pin = {
                    dealerName: dealer.dealerName,
                    dealerDetailSlug: dealer.dealerDetailSlug,
                    dealerId: dealer.id,
                    marketName: dealer.marketName,
                    lng: dealer.dealerLongitude,
                    lat: dealer.dealerLatitude
                };
                pins.push(pin);
            });

            //on mobile show search results below map
            self.searchResultsContainer.html(output);

            if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                self.searchResults.hide();
            } else {
                self.searchResults.show();
            }

            //reinitalize map pins
            self.map.removePins();
            self.map.addPins(pins);

            if (dealers.length > 0) {
                analytics.helper.fireFindADealerResultsLoad("Find Nearby Dealers");
            }
        }



        /**
         * Check if Map and Map Api is ready
         *
         * @param {Function} callback
         * @private
         */

        function mapReadyTest(callback) {
            if (window.Microsoft && window.Microsoft.Maps && window.Microsoft.Maps.Location) {
                callback();
            } else {
                setTimeout(mapReadyTest, 100);
            }

        }

        /**
         * Collects property values from page, and creates template used to render individual
         * search results
         *
         * @returns {Object} search result template
         * @private
         */

        function generateSearchResultTmpl() {
            return ['<li data-dealer-id="{{id}}" data-lng="{{dealerLongitude}}" data-lat="{{dealerLatitude}}">',
                '<span class="marker"></span>',
                '<h2 class="sub-heading">{{dealerName}}</h2>',
                '{{showDealerDistance}}',
                '{{eliteStatus}}',
                '<address>',
                '<span class="street">{{address1}}</span>',
                '<span class="city">{{city}}</span>, <span class="state">{{state}}</span>&nbsp;<span class="zip">{{zipCode}}</span>',
                '<span class="phone">{{phone}}</span>',
                '</address>',
                '<p><a href="/dealers/{{id}}-{{dealerDetailSlug}}" class="btn btn-stroke">Dealer Info</a></p>',
                '</li>'
            ].join('\n');
        }

        /**
         * Analytics
         */

        function initAnalytics() {
            // On Find this Lexus button click
            var $offerResult = $('.js-offer-result');
            $offerResult.on('click touch', '.button', function(event) {
                var $thisBtn = $(event.currentTarget),
                    dataModel = $thisBtn.data("model"),
                    dataTrim = $thisBtn.data("trim"),
                    trim = dataModel + ' ' + dataTrim,
                    offerType = $thisBtn.data("offer-type"),
                    zipCode = $thisBtn.data("zip-code"),
                    monthlyPayment = $thisBtn.data("monthly-payment"),
                    leaseMonths = $thisBtn.data("lease-months"),
                    dueAtSigning = $thisBtn.data("due-at-signing"),
                    apr = $thisBtn.data("apr"),
                    aprMonths = $thisBtn.data("apr-months"),
                    container = "Current Offers Module";
                analytics.helper.fireFindThisLexusClick(trim, offerType, zipCode, monthlyPayment, leaseMonths, dueAtSigning, apr, aprMonths, container);
            });

            $(".search-results").on('click touch', "a", function(event) {
                var dealerCode = $(this).data("id"),
                    dealerName = $(this).data("name"),
                    $moduleLinksTarget = $(event.currentTarget),
                    dealerButton = $moduleLinksTarget.text().trim(),
                    container = "Dealer Details Module",
                    events = "event5";
                analytics.helper.fireDealerModuleLinksClick(dealerCode, dealerName, dealerButton, container, events);
            });
        }

        init();
    };

    return FindNearbyDealers;

});
