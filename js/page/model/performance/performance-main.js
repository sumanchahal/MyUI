/**
 * @file Behaviors for the Model performance page
 */
require(
    [
        "lexus",
        "jquery",
        "analytics",
        "PointBreak",
        "component/Carousel",
        "component/accoladeCarousel",
        "component/ResponsiveImages",
        "page/model/performance/PerformanceStyling",
        "page/model/performance/PerformanceStylingViewController",
        "component/gallery/Gallery",
        "component/gallery/GalleryOverlayViewController",
        "waypoints-sticky",
        "model-cookie"
    ],

    function(
        LEXUS,
        $,
        analytics,
        PointBreak,
        Carousel,
        accoladeCarousel,
        ResponsiveImages,
        PerformanceStyling,
        PerformanceStylingViewController,
        Gallery,
        GalleryOverlayViewController
    ) {

        var pointbreak = new PointBreak(),
            responsiveImages = new ResponsiveImages(),
            heroCarousels = [],
            accoladeCarousels = [],
            $responsiveBgs = $(".responsive-background"),
            $heros = $(".hero");

        function init() {
            setupHeroCarousels();
            setupViewportBehaviors();
            initFeatureOverlays();
            initPerformanceStyling();
            initAccolades();
            //initAnalytics();
        }

        /**
         * Sets up accolades modules
         */

        function initAccolades() {
            var $accoladeCarousels = $(".accolade-container");

            $accoladeCarousels.each(function(i, itm) {
                var $instance = $(itm),
                    numItems = $instance.find(".accolade-item").length;
                if (numItems === 1) {
                    $instance.addClass("single-accolade");
                    accoladeCarousel.initSingleAccolade();
                } else {
                    var carousel = new Carousel({
                        instance: $instance,
                        slideSelector: ".accolade-item",
                        slidesPerPage: 1,
                        showNextPrev: true,
                        showIndicators: true
                    });
                    accoladeCarousels.push(carousel);
                    accoladeCarousel.initAnalytics(false, carousel);
                }
            });
        }

        /**
         * Initializes feature overlays.
         * Each trim has its own overlays.
         */

        function initFeatureOverlays() {
            var $featureGroup = $(".features-tout");
            var $galleryOverlayContext = $("#overlay-container");
            var galleryOverlay = new GalleryOverlayViewController(null, $galleryOverlayContext);


            // loop through each feature group
            $featureGroup.each(function(i) {
                var $featureGroup = $(this),
                    featureJSONDataForThisTrim = getFeatureData(i),
                    modelForThisTrim = new Gallery(featureJSONDataForThisTrim),
                    overlayLinks = LEXUS.overlayLinks;

                modelForThisTrim.setOverlayButton(overlayLinks);

                $featureGroup.on("click touch", ".has-overlay", function(event) {
                    event.preventDefault();

                    var clickedId = $(this).data("id");

                    galleryOverlay.setModel(modelForThisTrim);
                    modelForThisTrim.getOverlayItems().setSelectedItemId(clickedId);
                });
            });

            // TODO: Enable deep linking keeping in mind that the selected item could be in one of several Gallery objects.
            // TODO: Scroll to the trim containing the deep linked item
        }


        /**
         * Gets the feature data for a particular group of features
         *
         * @param {int} index - feature data object to access
         * @returns {Object} feature data based on
         */

        function getFeatureData(index) {
            var rawData = LEXUS.featureBlockList[index].content;
            var items = [];

            for (var i = 0; i < rawData.length; i++) {
                var item = rawData[i];
                if (item.overlay) {
                    items.push(item);
                }
            }

            var featureData = {
                items: items
            };

            return featureData;
        }

        /**
         * Loops through all the hero carousels and applies viewport-specific settings
         */

        function updateHeroCarousels() {
            for (var i = 0; i < heroCarousels.length; i++) {
                heroCarousels[i].resetSlides(getBreakpointSettings());
            }
        }

        /**
         * Adds listener so responsive images are updated
         * based on breakpoint
         */

        function setupHeroCarousels() {
            $heros.each(function(i, itm) {
                var defaultSettings = $.extend({
                    instance: $(itm).find(".details").eq(0),
                    slideSelector: ".key-spec"
                }, getBreakpointSettings());

                heroCarousels.push(new Carousel(defaultSettings));
            });
        }

        /**
         * Sets up responsive-specific behaviors
         */

        function setupViewportBehaviors() {
            pointbreak.addChangeListener(function() {
                updateHeroCarousels();
            });
        }

        /**
         * returns carousel configuration for given breakpoint
         *
         * @returns {Object} - carousel settings based on breakpoint size
         */

        function getBreakpointSettings() {
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                return {
                    slidesPerPage: 1,
                    showIndicators: true,
                    animationDuration: 300
                };
            } else {
                return {
                    slidesPerPage: 4,
                    showNextPrev: false,
                    showIndicators: false,
                    animationDuration: 600
                };
            }
        }

        /**
         * Setup for performance styling components
         */

        function initPerformanceStyling() {
            var $context = $(".performance-styling"),
                data = LEXUS.performanceStyling,
                model,
                view;

            if (data && $context.length > 0) {
                model = new PerformanceStyling(data);
                view = new PerformanceStylingViewController(model, $context);

                //                if (Modernizr.touch) {
                //                    view.onContextBecomesVisible();
                //                }
            }
        }

        /**
         * set up omniture analytics.
         */

        function initAnalytics() {

            // when a feature is clicked

            var $features = $(".feature");
            $features.on("click touch", function(event) {
                var $clickedFeature = $(event.currentTarget),
                    container = "Performance",
                    title = $clickedFeature.find(".feature-title").first().text(),
                    module = $clickedFeature.data("trim-group");
                analytics.helper.firePerformanceFeatureClick(module, title, container);
            });


            // when a package is clicked.

            var $packageInfo = $(".package-item .info");

            // fire when package endcap is clicked.
            $packageInfo.on("click touch", function(event) {
                var packageTitle = $packageInfo.find(".package-title").text();
                analytics.helper.firePerformancePackageClick(packageTitle);
            });

            // Accolade click
            var $accoladeWrapper = $(".accolade-wrapper");
            $accoladeWrapper.on("click touch", ".indicator, .control, .link", function(event, isSingle) {
                var $clickTarget = $(event.target),
                    $thisImageContainer = $clickTarget.closest(".accolade-item").find(".image"),
                    section = "Model Section",
                    action = "Learn More",
                    contentTitle;

                // set contentTitle
                // if single accolade
                if (isSingle) {
                    // if image exists
                    if ($thisImageContainer.has("img").length) {
                        contentTitle = $(".image").find("img").attr("title");
                    } else {
                        contentTitle = $(".image").text().trim();
                    }
                } else {
                    // if image exists
                    if ($thisImageContainer.has("img").length) {
                        contentTitle = $(".slide.active .image").find("img").attr("title");
                    } else {
                        contentTitle = $(".slide.active .image").text().trim();
                    }
                }

                // if carousel
                if ($clickTarget.hasClass("control") || $clickTarget.hasClass("indicator")) {
                    action = "Carousel";
                }
                // This was being called here, even though it's in accoladeCarousel.js, causing double tags firing
                //analytics.helper.fireAccoladeClick(section, action, contentTitle);
            });

        }

        init();
    }
);
