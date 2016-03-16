/* global Microsoft */
require([
    "lexus",
    "jquery",
    "PointBreak",
    "component/map/Dealer",
    "component/map/ZipSearch",
    "util/geolocationHelper",
    "component/Carousel",
    "component/ResponsiveImages",
    "component/map/Map",
    "util/setColumnEqualHeights",
    "util/shuffleArray",
    "util/renderTemplate",
    "analytics",
    "model-cookie"
], function(
    LEXUS,
    $,
    PointBreak,
    Dealer,
    ZipSearch,
    geolocationHelper,
    Carousel,
    ResponsiveImages,
    Map,
    ColumnHeight,
    shuffleArray,
    renderTemplate,
    analytics
) {

    var HIDDEN_CLASS = "hidden",
        ACTIVE_CLASS = "active",
        ERROR_CLASS = "error",
        DISABLED_CLASS = "disabled",
        OFFER_URL = "/offers/",
        SEARCH_TIMEOUT = 10000,
        SERIES_NAME = LEXUS.offers.subNav.seriesName,
        SERIES_TYPE = LEXUS.offers.subNav.seriesType,
        TOOLTIP_TEMPLATE = "" +
            "<div class='map-tooltip'>" +
            "<div class='dealer-locator-tooltip-top'>" +
            "<h3>{{name}}</span></h3>" +
            "{{address}}" +
            "<div class='select-button'>" + LEXUS.selectDealerText + "</div>" +
            "</div>" +
            "<div class='dealer-locator-tooltip-bottom'></div>" +
            "</div>";


    var pointbreak = new PointBreak(),
        geolocation = {},
        geoAPI = null,
        mapController = null,
        dealers = [],
        offersCarousel = {},
        offersSlidedefaultSettings = {},
        currentOffersCarousel = {},
        currentOffersSlidedefaultSettings = {},
        availability = "",
        defaultSettings,
        responsiveImages,
        zipsearch = null;

    var $mainWrapper = $(".main-wrapper"),
        $defaultHero = $(".offers-hero.default"),
        $noToutHero = $(".offers-hero.no-tout"),
        $noOffersHero = $(".offers-hero.no-offers"),
        $pageAjaxLoader = $("#loadingAnimation"),
        $currentOffersContainer = $(".current-offers.side-by-side"),
        $currentOffersContainerOffers = $currentOffersContainer.find(".offers"),
        $moreToConsiderContainer = $(".current-offers.more-to-consider"),
        $ajaxLoaderMoreToConsider = $moreToConsiderContainer.find("#ajaxLoaderMoreToConsider"),
        $moreToConsiderOffersContainer = $moreToConsiderContainer.find(".offers"),
        $zipSearch = $(".zip-search-wrapper"),
        $map = $("#map"),
        $multipleMarketDealerList = $("#multipleMarketDealerList"),
        $btnFindADealer = $(".btn-find-a-dealer"),
        $btnFindADealerDis = $(".dis-error-large .btn-find-a-dealer"),
        $formZipSearch = $zipSearch.find(".form-zip-search"),
        $zipError = $zipSearch.find(".invalid-zip"),
        $disError = $zipSearch.find(".error-dis-down"),
        $ajaxLoader = $zipSearch.find("#ajaxLoader"),
        $disErrorLarge = $(".dis-error-large"),
        $oldOffersErrorLarge = $(".old-offers-error-large");


    function init() {
        // load neustar data
        geolocationHelper.fetchData(onGeolocationReady, this, LEXUS.ipOverride);
        // setup large/small images
        setupResponsiveImages();
        initAnalytics();

        //badge remove top line text
        badgeLabelRemove();
    }

    /**
     * Callback triggered when neustar data returns
     */

    function onGeolocationReady(resp) {
        var response = resp.data;
        geoAPI = resp;

        if (response !== undefined) {
            if (response.zip !== null) {
                geolocation = response;
            } else {
                $pageAjaxLoader.remove();
                $mainWrapper.removeClass(HIDDEN_CLASS);
                setHeroImage();
            }
        }

        initZipSearch();
    }

    /**
     * Show and hide proper hero image based on a ongoing sale event
     */

    function setHeroImage() {
        //if there is a campaign banner that one takes priority over
        //the standard header image
        if ($defaultHero.length !== 0) {
            $defaultHero.removeClass(HIDDEN_CLASS);
        } else {
            $noToutHero.removeClass(HIDDEN_CLASS);
        }
    }

    /**
     * Set up Zip Search Module
     *
     * @see onZipSearchSuccess
     */

    function initZipSearch() {
        zipsearch = new ZipSearch(".zip-search-wrapper", {
            getDealers: true,
            geolocation: geolocation,
            zipCode: geolocation.zip,
            onAjaxBeforeSend: function() {
                hideMultipleMarketMap();
                hideListOfDealers();
                $disErrorLarge.hide();
                $oldOffersErrorLarge.hide();
            },
            onSuccess: onZipSearchSuccess,
            onAjaxError: showAjaxError,
            onValidationError: function(error) {
                if (error === "invalid-zip") {
                    showInvalidZipError();
                }
            }
        });
    }

    /**
     * Handles the case of there being multiple market names.
     *
     * @param searchResults {{data:Array.<DealerConfig>}} The results of a zip dealer search
     */

    function onMultipleMarkets(searchResults) {
        /*

        If the user searches or is geolocated to a ZIP Code that is mapped to multiple “Offer markets”, the following should occur:

            √ Detect small and large viewports
            Large/Medium
                √ Display a map with dealers
                √ Map should be styled correctly with the same look and feel as overview page
                √ No dealer should be selected by default
                √ Update text from CURRENT OFFERS to SELECT A DEALER TO VIEW OFFERS
                √ If no dealers are returned by DIS, display the standard "No Offers found" state as specified in CU.L.3.29 in the Annotations.
                √ Selecting a pin on the map reveals a tooltip
                √ Clicking will show tooltip.
                √ Tooltip is customized card with a "select dealer" button
                √ Clicking "select" will display offers for the Market Name of the selected dealer
                √ hide map after selecting a dealer
                √ Hide map if the multiple market names if a new search is initiated.
                √ Update text from SELECT A DEALER TO VIEW OFFERS to CURRENT OFFERS when search changes
                √ Add SELECT A DEALER TO VIEW OFFERS to message bundle

            Small
                √ Display a list of dealers (as is done on Find a Dealer using existing Find a Dealer business rules)
                √ Clicking "select" will display offers for the Market Name of the selected dealer
                √ Order of dealers in the list should be randomized
                √ If no dealers are returned by DIS, display the standard "No Offers found" state as specified in CU.L.3.29 in the Annotations.
                √ Selecting the CTA displays offers (as per current business rules) for the ZIP Code of the selected dealer
        */

        dealers = Dealer.parseSearchResults(searchResults);

        if (mapController) {
            mapController.reset();
        }

        hideCurrentOffers();
        hideMoreToConsider();

        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            showListOfDealers(dealers);
        } else {
            showMultipleMarketsHeader();
            showDealerMap(dealers);
        }



        //        throw new Error("onMultipleMarkets() NOT YET IMPLEMENTED");
    }


    /**
     * Displays a randomized list of dealers for the selected zip code.
     *
     * @param dealers {Array.<Dealers>}
     */

    function showListOfDealers(dealers) {
        // √ Create dealer container
        // √ randomize the order of the dealers
        shuffleArray(dealers);

        showMultipleMarketsHeader();

        $multipleMarketDealerList.empty();
        $multipleMarketDealerList.fadeIn();

        // √ create a tile for each dealer in the list
        $.each(dealers, function(i, location) {
            var tooltipData = {
                url: location.getDetailUrl(),
                name: location.getName(),
                address: location.getAddressAsHTML(),
                dealerId: location.getId()
            };

            var renderedTemplate = renderTemplate(TOOLTIP_TEMPLATE, tooltipData);
            var $dealerTile = $("<li class='dealerTile'>" + renderedTemplate + "</li>");
            // store the original JS data in the new tile.
            $dealerTile[0].dealer = location;
            // add it to the screen.
            $multipleMarketDealerList.append($dealerTile);
        });

        $multipleMarketDealerList.on("click touch", ".select-button", onSelectDealerListClick);
        // √ add event listeners to the dealers and when clicked, show the selected dealer's offers.
    }

    function hideListOfDealers() {
        $multipleMarketDealerList.fadeOut(200);
        hideMultipleMarketsHeader();
    }


    /**
     * Triggered when the user clicks on a dealer select button from the list
     * @param e {Event}
     */

    function onSelectDealerListClick(e) {
        // HACK: pull the dealer data out of the parent dealer tile.
        var dealer = e.target.parentElement.parentElement.parentElement.dealer;
        if (dealer) {
            hideListOfDealers();
            requestAndDisplayOffers(dealer.getMarketName());
        }
    }

    function onMapReady() {
        console.log(mapController);
        console.log(dealers);

        waitForMicrosoftMapsThenCall(function() {
            //            Microsoft.Maps.Events.addHandler(mapController.getInfobox(), 'click', onSelectDealerClick);
            mapController.addLocations(dealers);
            $map.fadeIn();
        });
    }

    /**
     * Shows the dealer locations when the zip brings up multiple markets.
     *
     * @param dealers {Array.<Dealer>}
     */

    function showDealerMap(dealers) {
        // calculate map size
        $map.show();
        var width = $map.width();
        var height = $map.height(); //$(window).height() - $map.offset().top;
        $map.hide(); // To always get the correct width and height
        if (!mapController) {
            waitForMicrosoftMapsThenCall(function() {
                //            Microsoft.Maps.Events.addHandler(mapController.getInfobox(), 'click', onSelectDealerClick);
                $map.fadeIn(400, function() {
                    mapController.addLocations(dealers);
                });
            });
            mapController = new Map(document.getElementById("mapDiv"), {
                width: width,
                height: height,
                center: ["", ""],
                tooltipTemplate: TOOLTIP_TEMPLATE,
                // √ don't fire analytics
                supressInfoboxAnalytics: true,
                onInfoboxClick: onSelectDealerClick
                //            ,
                //            onResize: onResize,
                //            onViewDirty: onViewDirty
            });
            //onMapReady();
        } else {
            console.log("here3");
            waitForMicrosoftMapsThenCall(function() {
                //            Microsoft.Maps.Events.addHandler(mapController.getInfobox(), 'click', onSelectDealerClick);
                $map.fadeIn(400, function() {
                    mapController.addLocations(dealers);
                });
            });
            //onMapReady();
        }

    }

    function waitForMicrosoftMapsThenCall(f) {
        var count = 0;
        var interval = setInterval(function() {
            count++;
            if (Microsoft && Microsoft.Maps && mapController) {
                clearInterval(interval);
                f();
            }
            if (count > 200) {
                clearInterval(interval);
                throw new Error("Timed out loading microsoft maps");
            }
        }, 30);
    }


    /**
     * Triggered when the user clicks on a dealer select button from the map.
     * @param target {Object} A microsoft maps event that was triggered by the click.
     * @param dealer {Dealer} An object containing info about the dealer whose pin was clicked on.
     */

    function onSelectDealerClick(event, dealer) {

        var classNames = event.originalEvent.srcElement === undefined ? event.originalEvent.originalTarget.className : event.originalEvent.srcElement.className;

        console.log("CLICKED ON INFOBOX");
        console.log(event);
        console.log(dealer);

        if (/select-button/gi.test(classNames)) {
            // √ hide map
            hideMultipleMarketMap();
            // √ show results for selected market
            requestAndDisplayOffers(dealer.getMarketName());
        }

    }


    /**
     * Hides the map that shows multiple market options.
     */

    function hideMultipleMarketMap() {
        $map.fadeOut(200);
        hideMultipleMarketsHeader();
    }

    /**
     * Executed after every zip search, used to determine state of offers elements
     *
     * @param {Function} currentOffersRequest - available for b/c $.when, but not used
     * @param {Function} moreToConsiderRequest - used to determine if any content was returned
     */

    function onZipSearchComplete(currentOffersRequest, moreToConsiderRequest) {
        var moreToConsiderResponse = $.trim(moreToConsiderRequest[0]);
        var currentOffersResponse = $.trim(currentOffersRequest[0]);

        if (moreToConsiderResponse === "") {
            $moreToConsiderContainer.addClass(DISABLED_CLASS);
        } else {
            $moreToConsiderContainer.removeClass(DISABLED_CLASS);
        }

        if (currentOffersResponse === "") {
            availability = "No Offers Available";
            $currentOffersContainerOffers.addClass(DISABLED_CLASS);
            $disErrorLarge.show();
            $btnFindADealer.removeClass(ACTIVE_CLASS);
        } else {
            $disErrorLarge.hide();
            $btnFindADealer.addClass(ACTIVE_CLASS);
            availability = "Offers Available";
            $currentOffersContainerOffers.removeClass(DISABLED_CLASS);
            // Get the year from the offers, and check it against the current model year
            var offerYear = $(currentOffersRequest[0]).find("img").attr("src").split("/")[3];
            if (offerYear !== LEXUS.modelYear) {
                var $errorMessage = $oldOffersErrorLarge.find(".error-message");
                $errorMessage.text($errorMessage.data("message").replace("{year}", LEXUS.modelYear));
                $oldOffersErrorLarge.show();
                $(".generalHeader").text("Current " + offerYear + " " + LEXUS.page.seriesName + " Offers");
            }
        }

        // fire analytics
        analytics.helper.fireCurrentOffersLoad(availability);

        $noToutHero.removeClass(HIDDEN_CLASS);
        $pageAjaxLoader.remove();
        $mainWrapper.removeClass(HIDDEN_CLASS);


        // analytics
        initAnalytics();
    }

    /**
     * Handler for when the zip search completes successfully. Kicks off either showing local offer results,
     * showing a multiple market map, or showing an error.
     *
     * @param searchType {String} not used
     * @param searchResults {Array}
     * @param zip {ZipCode} Input by user.
     */

    function onZipSearchSuccess(searchType, searchResults, zip) {
        hideMultipleMarketMap();
        geolocation.zip = zip;

        if (geoAPI !== null) {
            geoAPI.getMarketDataForZip(zip).done(function(result) {
                var marketNames = result.data;
                var hasMultipleMarkets = marketNames.length > 1;

                if (hasMultipleMarkets) {
                    onMultipleMarkets(searchResults);
                } else if (marketNames !== "" && marketNames.length > 0) {
                    requestAndDisplayOffers(marketNames[0]);
                } else {
                    showDisError();
                }
            });
        }

        setHeroImage();
    }

    /**
     * Searches for offers within the market Name
     *
     * @param marketName {String}
     */

    function requestAndDisplayOffers(marketName) {
        $btnFindADealer.addClass(ACTIVE_CLASS);
        geolocation.marketName = marketName;

        $.when(showCurrentOffers(), showMoreToConsider()).done(onZipSearchComplete).fail(onRequestOffersError);
    }

    /**
     * When an error occurs requesting the offers...
     */

    function onRequestOffersError() {
        $defaultHero.addClass(HIDDEN_CLASS);
        $noToutHero.addClass(HIDDEN_CLASS);
        $defaultHero.addClass(HIDDEN_CLASS);
        $noOffersHero.removeClass(HIDDEN_CLASS);
        $pageAjaxLoader.remove();
        $mainWrapper.hide();
    }

    /**
     * Shows error messaging when the ajax request fails.
     */

    function showAjaxError() {
        $currentOffersContainerOffers.addClass(DISABLED_CLASS);
        $moreToConsiderContainer.addClass(DISABLED_CLASS);
        showInvalidZipError();
    }

    /**
     * Shows error messaging when the DIS request fails.
     */

    function showDisError() {
        $disErrorLarge.show();
        $btnFindADealer.removeClass(ACTIVE_CLASS);
        $pageAjaxLoader.remove();
        $mainWrapper.removeClass(HIDDEN_CLASS);
        $currentOffersContainerOffers.addClass(DISABLED_CLASS);
        $moreToConsiderContainer.addClass(DISABLED_CLASS);
    }

    /**
     * Shows error messaging when the input zip code is invalid.
     */

    function showInvalidZipError() {
        $currentOffersContainerOffers.addClass(DISABLED_CLASS);
        $moreToConsiderContainer.addClass(DISABLED_CLASS);
        $btnFindADealer.removeClass(ACTIVE_CLASS);
        $btnFindADealerDis.addClass(ACTIVE_CLASS);
        hideMultipleMarketMap();
        $disErrorLarge.show();
    }

    /**
     * Updates the header text for the page specifically for multiple markets.
     */

    function showMultipleMarketsHeader() {
        $(".generalHeader").hide();
        $(".multipleMarketsHeader").show();
    }

    /**
     * Reverts the header text for the page when not viewing multiple markets.
     */

    function hideMultipleMarketsHeader() {
        $(".multipleMarketsHeader").hide();
        $(".generalHeader").show();
    }

    /**
     * Hide the current offers container.
     */

    function hideCurrentOffers() {
        $currentOffersContainerOffers.addClass(HIDDEN_CLASS);
        $btnFindADealer.removeClass(ACTIVE_CLASS);
    }

    /**
     * Populate and show current offers container
     */

    function showCurrentOffers() {
        var series_hybrid = "";

        if (SERIES_TYPE === "HYBRIDS") {
            series_hybrid = "h";
        }

        return $.ajax({
            beforeSend: function() {
                $ajaxLoader.show();
                $formZipSearch.removeClass(ERROR_CLASS);
                $disError.hide();
                $zipError.hide();
                $currentOffersContainerOffers.addClass(DISABLED_CLASS).html("");
            },
            timeout: SEARCH_TIMEOUT,
            url: OFFER_URL + geolocation.marketName + "/series/" + SERIES_NAME + series_hybrid
        }).done(function(offers) {
            if (offers !== "") {
                $currentOffersContainerOffers.removeClass(HIDDEN_CLASS);
                $currentOffersContainerOffers.html(offers);
                $currentOffersContainerOffers.find("img").remove();

                //add zip code to dealer url
                $currentOffersContainerOffers.find(".offer").each(function() {
                    //add zip code to button url
                    var dealerButton = $(this).find(".button");
                    var url = dealerButton.attr("href") || "";

                    if (url !== "") {
                        var zipCodeStringPos = url.indexOf("zipCode=");
                        var firstPart = url.substring(0, zipCodeStringPos + 8);
                        var secondPart = url.substring(zipCodeStringPos + 8, url.length);
                        var buttonUrl = firstPart + geolocation.zip + secondPart;
                        dealerButton.attr({
                            "href": buttonUrl,
                            "data-zip-code": geolocation.zip
                        });
                    }

                });

                if (Object.keys(currentOffersCarousel).length === 0) {
                    setupCurrentOffersCarousel();
                } else {
                    currentOffersCarousel.resetSlides(currentOffersSlidedefaultSettings);
                }

                LEXUS.Disclaimers.refreshDisclaimers();

            }
            $ajaxLoader.hide();
        }).complete(function() {
            $ajaxLoader.hide();
        }).error(function(e) {});
    }

    /**
     * Hides the more to consider view.
     */

    function hideMoreToConsider() {
        $moreToConsiderContainer.addClass(HIDDEN_CLASS);
    }

    /**
     * More To Consider Offers
     */

    function showMoreToConsider() {
        var groups = LEXUS.offers.vehicleSeries.group.split(',');
        var group = groups[0];

        return $.ajax({
            beforeSend: function() {
                $ajaxLoaderMoreToConsider.show();
                $moreToConsiderOffersContainer.removeClass(DISABLED_CLASS);
                $moreToConsiderOffersContainer.html("");
            },
            timeout: SEARCH_TIMEOUT,
            url: OFFER_URL + geolocation.marketName + "/category/" + group
        }).done(function(offers) {
            $moreToConsiderContainer.removeClass(DISABLED_CLASS);

            if (offers !== "") {
                $moreToConsiderOffersContainer.html(offers);
                $moreToConsiderContainer.removeClass(HIDDEN_CLASS);

                //remove offers from the same category
                $moreToConsiderOffersContainer.find("[data-series='" + SERIES_NAME + "']").remove();

                //add zip code to dealer url
                $moreToConsiderOffersContainer.find(".offer").each(function() {
                    //add zip code to button url
                    var dealerButton = $(this).find(".button");
                    var url = dealerButton.attr("href") || "";

                    if (url !== "") {
                        var zipCodeStringPos = url.indexOf("zipCode=");
                        var firstPart = url.substring(0, zipCodeStringPos + 8);
                        var secondPart = url.substring(zipCodeStringPos + 8, url.length);
                        var buttonUrl = firstPart + geolocation.zip + secondPart;
                        dealerButton.attr("href", buttonUrl);
                    }
                });

                if (Object.keys(offersCarousel).length === 0) {
                    setupOffersCarousel();
                } else {
                    offersCarousel.resetSlides(offersSlidedefaultSettings);
                }

                LEXUS.Disclaimers.refreshDisclaimers();

                $(window).trigger("resize");
                $ajaxLoaderMoreToConsider.hide();
            }
        }).complete(function() {}).error(function() {
            $ajaxLoaderMoreToConsider.hide();
            $moreToConsiderOffersContainer.html("");
            $moreToConsiderOffersContainer.addClass(DISABLED_CLASS);
        });
    }

    /**
     * Returns carousel defaults based off breakpoints
     */

    function getBreakpointSettings() {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            return {
                slidesPerPage: 1,
                animationDuration: 300
            };
        } else if (pointbreak.isCurrentBreakpoint(PointBreak.MED_BREAKPOINT)) {
            return {
                slidesPerPage: 2
            };
        } else {
            return {
                slidesPerPage: 3
            };
        }
    }

    /**
     * Returns carousel defaults based off breakpoints
     */

    function getBreakpointSettingsCurrentOffers() {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            return {
                slidesPerPage: 1,
                animationDuration: 300
            };
        } else {
            return {
                slidesPerPage: 2
            };
        }
    }

    /**
     * Initializes current offers carousel. At different breakpoints
     * the number of slides per page chages.
     */

    function setupCurrentOffersCarousel() {
        currentOffersSlidedefaultSettings = $.extend({
            instance: $(".side-by-side .offers").eq(0),
            slideSelector: ".offer",
            slidesPerPage: 2,
            showNextPrev: true,
            showIndicators: true,
            equalColumnHeights: true
        }, getBreakpointSettingsCurrentOffers());

        currentOffersCarousel = new Carousel(currentOffersSlidedefaultSettings);

        pointbreak.addChangeListener(function() {
            defaultSettings = $.extend(currentOffersSlidedefaultSettings, getBreakpointSettingsCurrentOffers());
            currentOffersCarousel.resetSlides(currentOffersSlidedefaultSettings);
        });
    }

    /**
     * Initializes More to Consider Offer carousel. At different breakpoints
     * the number of slides per page chages.
     */

    function setupOffersCarousel() {
        offersSlidedefaultSettings = $.extend({
            instance: $(".more-to-consider .offers").eq(0),
            slideSelector: ".offer",
            slidesPerPage: 3,
            showNextPrev: true,
            showIndicators: true,
            equalColumnHeights: true
        }, getBreakpointSettings());

        offersCarousel = new Carousel(offersSlidedefaultSettings);

        pointbreak.addChangeListener(function() {
            defaultSettings = $.extend(offersSlidedefaultSettings, getBreakpointSettings());
            offersCarousel.resetSlides(offersSlidedefaultSettings);
        });

        // analytics
        $(".indicators").on("click touch", function() {
            var action = "Carousel";
            analytics.helper.fireCurrentOffersClick(action);
        });

    }

    /**
     * sets up the responsive image helper tag's behaviors
     */

    function setupResponsiveImages() {
        responsiveImages = new ResponsiveImages();
    }


    /**
     * Remove top line text badge label
     */

    function badgeLabelRemove() {
        $('.badge ').find('.top-line').remove();
    }

    /**
     * Initializes Analytics
     */

    function initAnalytics() {

        // Find a Dealer button click (hero)
        var $findDealerBtn = $('.msg .btn');
        $findDealerBtn.on('click touch', function() {
            var container = 'Hero';
            analytics.helper.fireFindADealerClick(container);
        });

        // Find a Dealer button click (current offers)
        var $findDealerBtnOffers = $('.find-a-dealer .btn.btn-find-a-dealer');
        $findDealerBtnOffers.off('click touch');
        $findDealerBtnOffers.on('click touch', function() {
            var container = 'Current Offers';
            analytics.helper.fireFindADealerClick(container);
        });

        // On Find this Lexus button click
        var $marketOfferButton = $(".offer").find(".button");
        $marketOfferButton.on('click touch', function(event) {
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

        // Carousel
        $(document).off("click.carousel touch.carousel");
        $(document).on("click.carousel touch.carousel", ".control, .indicator", function() {
            var action = "Carousel";
            analytics.helper.fireCurrentOffersClick(action);
        });

    }


    init();

});
