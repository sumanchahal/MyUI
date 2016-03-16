/**
 * @file Behaviors for the dealer details page:
 *       Same code is used for regular mode and print mode.
 *       Sets up responsive images
 *       Initializes Bing maps, and gallery for the hero component
 *       Sets up Share functionality
 *       If market data is present, shows a carousel of offers
 */
define([
        "async!//ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0!OnScriptLoad",
        "jquery",
        "lexus",
        "component/social/ShareOverlay",
        "component/map/Map",
        "component/map/mapAPIKey",
        "component/map/Dealer",
        "component/Carousel",
        "PointBreak",
        "component/gallery/Gallery",
        "component/gallery/GalleryOverlayViewController",
        "component/ResponsiveImages",
        "analytics",
        "util/geolocationHelper"
    ],
    function(
        BingMaps,
        $,
        LEXUS,
        ShareOverlay,
        Map,
        API_KEY,
        Dealer,
        Carousel,
        PointBreak,
        Gallery,
        GalleryOverlayViewController,
        ResponsiveImages,
        analytics,
        geolocationHelper
    ) {

        var pointbreak = new PointBreak(),
            $map = $(".map"),
            map,
            CITY_LEVEL_ZOOM = 14,
            $gallery = $(".gallery-target"),
            $galleryOverlayContext = $('#overlay-container');

        /**
         * Kicks off the page-level methods
         */

        function init() {
            var isPrintMode = determinePrintMode();

            initResponsiveImages();

            if (!isPrintMode) {
                setupShare();
                setupOffersCarousel();
                setupKeyContactsCarousel();
                bindShareProxy();
                setupGalleryAndMap();
                //LIM 3199
                if (window.lfrActive) {
                    bindLFRSave();
                }

            } else {
                preventPrintLinks();
                setupStaticMap(function() {
                    setupPrintDialog();
                });
            }

            // Analytics
            initAnalytics();
        }

        // LIM 3199

        function bindLFRSave() {
            //Bind event for save button
            $('.dealer-detail-favorite-listener').on('click', function() {
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                console.log("dealer selected: " + name + " - " + id);
                $(document).triggerHandler("SetLFRPreferredDealer", [id, name]);
            });
        }

        /**
         * Kicks off large/small image logic
         */

        function setupGalleryAndMap() {
            if (LEXUS.galleryPageData !== undefined) {
                setupDealerGallery();

                //make sure the first image is loaded before initializing the map to set the proper
                //map dimensions
                $gallery.find(".responsive-image").eq(0).load(function() {
                    setupMap();
                });
            } else {
                setupMap();
            }
        }

        /**
         * Kicks off large/small image logic
         */

        function initResponsiveImages() {
            var responsiveImages = new ResponsiveImages();
        }

        /**
         * Ensures that you cannot click on links when in print mode
         */

        function preventPrintLinks() {
            $("a").removeAttr("href", "#");
        }

        /**
         * Looks at the page and determines whether or not it's
         * currently in print mode
         *
         * @return {Boolean} whether or not the user is in print mode
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
            window.print();
        }

        /**
         * Initializes offer carousel. At different breakpoints
         * the number of slides per page chages.
         */

        function setupOffersCarousel() {
            var offersCarousel,
                defaultSettings = $.extend({
                    instance: $(".offers").eq(0),
                    slideSelector: ".offer",
                    slidesPerPage: 3,
                    showNextPrev: true,
                    showIndicators: true,
                    equalColumnHeights: true
                }, getBreakpointSettings());

            offersCarousel = new Carousel(defaultSettings);

            pointbreak.addChangeListener(function() {
                defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
                offersCarousel.resetSlides(defaultSettings);
            });
        }

        /**
         * Initializes keycontacts carousel. At different breakpoints
         * the number of slides per page chages.
         */

        function setupKeyContactsCarousel() {
            var keyContactsCarousel,
                defaultSettings = $.extend({
                    instance: $(".contacts").eq(0),
                    slideSelector: ".contact",
                    slidesPerPage: 4,
                    showNextPrev: true,
                    showIndicators: true,
                    equalColumnHeights: true
                }, getKeyContactsBreakpointSettings());

            keyContactsCarousel = new Carousel(defaultSettings);

            pointbreak.addChangeListener(function() {
                defaultSettings = $.extend(defaultSettings, getKeyContactsBreakpointSettings());
                keyContactsCarousel.resetSlides(defaultSettings);
            });
        }

        /**
         * On the mobile view the share button moves to a totally
         * different location on the page from it's original position.
         * The proxy allows another button that then just triggers the
         * overlay
         */

        function bindShareProxy() {
            var $shareProxy = $(".share-proxy");

            $shareProxy.on("click", function(e) {
                e.preventDefault();
                triggerShareOverlay();
            });
        }

        /**
         * Triggers the click event on the share button
         */

        function triggerShareOverlay() {
            $shareButton = $(".utility-nav .share-btn");
            $shareButton.trigger("click");
        }

        /**
         * Instantiates share overlay
         */

        function setupShare() {
            var $shareOverlay = $("#dealer-share"),
                $shareButton = $(".utility-nav .share-btn");
            var share = new ShareOverlay($shareOverlay, $shareButton, LEXUS.social);
        }

        /**
         * Uses the static maps api to render in print mode
         * This allows the Bing attribution to appear to correctly,
         * and loads faster
         *
         * imgLoadedCallback {Function}
         */

        function setupStaticMap(imgLoadedCallback) {
            var lat = $map.data("lat"),
                lng = $map.data("lng"),
                height = getMapHeight() || $map.height(),
                width = $map.width(),
                PIN_SRC = "/assets/img/global/bing-map-pin-dark.png",
                MAP_SRC = 'http://dev.virtualearth.net/REST/v1/Imagery/Map/Road/' + lat + ',' + lng + '/' + CITY_LEVEL_ZOOM + '?mapSize=' + width + ',' + height + '&mapLayer=mapLayer&format=JPEG&mapMetadata=0&key=' + API_KEY,
                pinImage = new Image(),
                mapImg = new Image();

            // chaining them together because bing errors out with deferreds
            pinImage.onload = function() {
                mapImg.onload = function() {
                    var $mapPin = $map.append('<img class="pin" src="' + PIN_SRC + '" />'),
                        $mapImg = $map.append('<img src="' + MAP_SRC + '" />');

                    imgLoadedCallback();
                };

                mapImg.src = MAP_SRC;
            };

            pinImage.src = PIN_SRC;
        }

        /**
         * Instantiates dealer map based on position
         * defined in data attributes
         */

        function setupMap() {
            var eliteStatus = LEXUS.dealer.eliteStatus;
            var lat = $map.data("lat"),
                lng = $map.data("lng"),

                /** @type {Location} */
                pin = new Dealer({
                    dealerLatitude: lat,
                    dealerLongitude: lng,
                    eliteStatus: eliteStatus,
                });

            //prevent map from initialzing again
            if (map !== undefined) {
                return;
            }

            map = new Map($map.get(0), {
                zoom: CITY_LEVEL_ZOOM,
                disableUserInput: true,
                height: getMapHeight(),
                width: $map.width(),
                onResize: function() {
                    var width = $map.width(),
                        height = getMapHeight();

                    map.setDimensions(width, height);
                },
                pins: [pin]
            });


            geolocationHelper.fetchData(function(resp) {
                var geolocation = resp.data;
                if (geolocation.zip !== null) {
                    lat = geolocation.latitude;
                    lng = geolocation.longitude;
                    map.addCurrentLocationPin([lat, lng]);
                }
            });

        }

        /**
         * Returns the map height based on whether you are in gallery mode
         * or map-standalone mode
         */

        function getMapHeight() {
            // if there is no gallery, then use the map height
            return ($gallery.get(0) !== null) ? $gallery.height() : $map.height;
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
         * Returns keycontacts defaults based off breakpoints
         */

        function getKeyContactsBreakpointSettings() {
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                return {
                    slidesPerPage: 1,
                    animationDuration: 300
                };
            } else {
                return {
                    slidesPerPage: 4
                };
            }
        }

        /**
         * Initializes dealer image gallery
         */

        function setupDealerGallery() {

            // normalize the name of the list of gallery items.
            var gallery = LEXUS.galleryPageData[0];
            gallery.items = gallery.galleryItems;

            // Create variable for overlay data
            var galleryData = {
                "items": gallery.galleryItems
            };

            if (!$galleryOverlayContext.length) {
                throw new Error("There is no element with id #overlay-container in this page. Cannot create GalleryOverlayViewController");
            }

            galleryModel = new Gallery(galleryData);
            galleryOverlayView = new GalleryOverlayViewController(galleryModel, $galleryOverlayContext, 'dealer');


            // add click listeners to the features
            $(document).on("click", ".has-overlay", onClickFeature);
        }

        /**
         * Open dealer image gallery
         *
         * @param index {Event}
         */

        function onClickFeature(e) {
            e.preventDefault();

            var $clickedFeature = $(e.currentTarget),
                clickedId = $clickedFeature.attr("id");


            galleryModel.getOverlayItems().selectFirstItem();
        }

        /**
         * Initialize Analytics
         */

        function initAnalytics() {
            // On load of Dealer Details page
            var dealerCode = LEXUS.dealer.id,
                dealerName = LEXUS.dealer.dealerName,
                zipCode = LEXUS.dealer.dealerAddress.zipCode,
                shareLink = window.location.pathname,
                eliteStatus = (LEXUS.dealer.eliteStatus ? "Elite" : "Non Elite");

            analytics.helper.fireDealerDetailsPageLoad(dealerCode, dealerName, zipCode, eliteStatus);

            // Utility links analytics
            var $backBtn = $('.utility-nav .back'),
                $printBtn = $('.utility-nav .print'),
                $shareBtn = $('.utility-nav .share');

            // Search for other dealers link
            $backBtn.on('click touch', function() {
                var action = "Search For Other Dealers",
                    events = " ";
                analytics.helper.fireDealerUtilityLinksClick(dealerCode, dealerName, action, events);
            });

            // Print link
            $printBtn.on('click touch', function() {
                var action = "Print",
                    events = "event12";
                analytics.helper.fireDealerUtilityLinksClick(dealerCode, dealerName, action, events);
            });

            // Share links
            $shareBtn.on('click touch', function(event) {
                var $shareBtnTarget = $(event.currentTarget),
                    container = "Body",
                    contentTitle = $(document).find("title").text();
                if ($($shareBtnTarget).is("header *")) {
                    container = "Header";
                }
                analytics.helper.fireDealerDetailShareClick(dealerCode, dealerName, shareLink, container, contentTitle);
            });

            // Dealer locator module links
            var $moduleLinks = $('.detail-group a.button, a.link-arrow, a.desktop, a.tablet, a.mobile, .tel-mobile a');
            $moduleLinks.on('click touch', function(event) {
                var $moduleLinksTarget = $(event.currentTarget),
                    dealerButton = $moduleLinksTarget.text().trim(),
                    container = $moduleLinksTarget.closest("section").attr("class").replace(/-/g, " ") + " Module",
                    events = "event5";
                // directions link
                if ($moduleLinksTarget.hasClass("link-directions")) {
                    events = " ";
                }
                // call link
                else if ($($moduleLinksTarget).is(".tel-mobile *,.tel-mobile")) {
                    events = "event9";
                    dealerButton = "Call Link";
                }
                analytics.helper.fireDealerModuleLinksClick(dealerCode, dealerName, dealerButton, container, events);
            });

            // Key Contacts Carousel
            $(".key-contacts").on("click touch", ".indicators a", function() {
                analytics.helper.fireDealerDetailsCarouselClick(dealerCode, dealerName, "Carousel", "Key Contacts Module");
            });

            $('.offer').on('click touch', '.button', function(event) {
                var $offerElement = $(event.currentTarget);

                analytics.helper.fireFindThisLexusDealerClick(
                    $offerElement.data('model') + ' ' + $offerElement.data('trim'),
                    $offerElement.data('offer-type'),
                    $offerElement.data('zip-code'),
                    $offerElement.data('monthly-payment'),
                    $offerElement.data('lease-months'),
                    $offerElement.data('due-at-signing'),
                    $offerElement.data('apr'),
                    $offerElement.data('apr-months'),
                    'Dealer Details'
                );
            });
        }

        init();
    });
