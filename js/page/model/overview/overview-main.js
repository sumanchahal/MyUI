require([
        "lexus",
        "jquery",
        "page/model/overview/visualizerComponent",
        "page/model/overview/stylesComponent",
        "component/gallery/Gallery",
        "component/gallery/GalleryViewController",
        "component/gallery/GalleryOverlayViewController",
        "component/accoladeCarousel",
        "component/map/FindNearbyDealers",
        "analytics",
        "component/ResponsiveImages",
        "util/cookie",
        "model-cookie"
    ],
    function(
        LEXUS,
        $,
        visualizerComponent,
        stylesComponent,
        Gallery,
        GalleryViewController,
        GalleryOverlayViewController,
        accoladeCarousel,
        FindNearbyDealers,
        analytics,
        ResponsiveImages,
        cookie
    ) {

        var galleryModel,
            visualizer,
            visualizerViewController,
            visualizerMockData;

        function init() {

            var $hero = $(".hero-bg-img > img");
            var responsiveImages = new ResponsiveImages();

            if (LEXUS.visualizer !== undefined) {
                initVisualizer();
            }
            initStyles();
            initAccolades();
            initGallery();

            // BingMaps init
            //var map = new BingMaps();

            initFindNearbyDealers();
            initCTABar();
            responsiveImages.update();
            // Omniture
            initAnalytics();
        }

        function initCTABar() {
            $('.ctaBar').waypoint('sticky');
            $('.ctaBar .cta').html(
                LEXUS.stayInformedMessage.replace("{startHighlight}", '<span class="highlight">')
                .replace("{endHighlight}", '</span>')
                .replace("{year}", LEXUS.modelYear)
                .replace("{model}", LEXUS.page.seriesName));
            // if cookie doesn't exist, show bar
            if (!cookie.get("hideCTABar")) {
                $(".ctaBar").show();
            }
            $(".ctaBar .close").on("click", function(e) {
                // Add cookie
                LEXUS.cookie.setWithExpiration("hideCTABar", true, 45 * 60 * 1000);
                // Remove bar
                $(".ctaBar").hide();
                return false;
            });
            $(".ctaBar a").on("click", function() {
                var modelFull = LEXUS.page.seriesName + (LEXUS.isHybrid === "true" ? " HYBRID" : "");
                analytics.helper.fireToolbarClick(modelFull);
            });
        }

        function initVisualizer() {
            visualizerComponent.initVisualizer($('#visualizer-container'));
        }

        function initStyles() {
            stylesComponent.initStylesComponent($('#styles-container'));
        }

        function initAccolades() {
            accoladeCarousel.init('.accolade-container', '.accolade-item');
        }

        /**
         * Initialize the gallery (photos and videos) section.
         */

        function initGallery() {
            // normalize the name of the list of gallery items.
            var galleryJSON = LEXUS.galleryData;
            var overlayLinks = LEXUS.overlayLinks;
            galleryJSON.items = galleryJSON.galleryItems;

            var $galleryContext = $("#gallery-container");
            var $galleryOverlayContext = $("#overlay-container");

            galleryModel = new Gallery(galleryJSON);
            galleryModel.setOverlayButton(overlayLinks);

            var galleryView = new GalleryViewController(galleryModel, $galleryContext);
            var galleryOverlayView = new GalleryOverlayViewController(galleryModel, $galleryOverlayContext);

            $galleryContext.on("click", ".gallery-item", onGalleryItemClick);


            // Check the global scope for a LEXUS object
            if (LEXUS && LEXUS.selectedItemId) {
                // If it exists, pull the selected item id from it. Use this to
                // set the selected item on the gallery model.

                galleryModel.deepLinkToItemId(LEXUS.selectedItemId);
                window.location.hash = "#gallery-container";
            }
        }

        function onGalleryItemClick(event) {
            var $clickedItem = $(event.currentTarget);
            var clickedItemModelId = $clickedItem.data("id");

            // select the item in the model. this triggers the overlay to appear.
            galleryModel.getOverlayItems().setSelectedItemId(clickedItemModelId);
        }

        function initFindNearbyDealers() {
            var nearbyDealers = new FindNearbyDealers(".find-nearby-dealers");
        }

        function initAnalytics() {

            var VIZ = 'Visualization',
                STYLES = 'Styles',
                SUBSECTION = 'Overview';

            // Hero click tag
            var heroVideo = $('.hero-video');
            if (heroVideo) {
                heroVideo.on("click touch", function(event) {
                    var $heroVideo = $(event.currentTarget),
                        module = 'Hero',
                        action = 'Play Video',
                        container = 'Hero';
                    analytics.helper.fireHeroClick(module, action, container);
                });
            }

            // Compare Button Click
            var compareBtn = $('.compare-btn');
            compareBtn.on('click touch', function() {
                var container = 'Styles Module';
                analytics.helper.fireCompareBtnClick(container);
            });

            // Compare Links Click
            var compareLinks = $('.compare-link');
            compareLinks.on('click touch', function() {
                var compareContainer = 'Vehicle Styles Module';
                analytics.helper.fireCompareBtnClick(compareContainer);
            });



            // MS:1.3 events

            // Trim group select click tag
            $('.filter-button-list').on('click touch', 'li', function(event) {
                var $filterButtons = $(event.currentTarget),
                    module = VIZ,
                    categoryContainer = $filterButtons.closest('.tab-filter').attr('id'),
                    category,
                    label = $filterButtons.text(),
                    container = 'Visualization Module';
                if (categoryContainer === 'visualizer Swatch Group Filter') {
                    category = 'Option';
                } else if (categoryContainer === 'visualizer Trim Filter') {
                    category = STYLES;
                }
                analytics.helper.fireModelSectionVisualizerClick(module, category, label, container);
            });

            // Visualizer carousel click
            var $carousel = $('#visualizer-container');
            $carousel.on('click touch', '.indicators', function() {
                var module = VIZ,
                    category = 'Carousel',
                    label = ' ',
                    container = 'Visualization Module';
                analytics.helper.fireModelSectionVisualizerClick(module, category, label, container);
            });

            // Visualizer swatch group click tag
            $('#visualizer-container').on('click touch', '.swatch', function(event) {
                var $swatches = $(event.currentTarget),
                    module = VIZ,
                    category = $('#visualizerSwatchGroupFilter .filter-button-list .selected').text(),
                    label = $swatches.attr('id'),
                    container = 'Visualization Module';
                analytics.helper.fireModelSectionVisualizerClick(module, category, label, container);
            });

            // Model Section Module Action Clicks: Trim Options
            var trimOptions = $('.style');
            trimOptions.on('click touch', function(event) {
                // Only fire if disclaimer were not clicked
                if (!$(event.target).is(".tooltip-trigger, .asterisk")) {
                    var $trimOptions = $(event.currentTarget),
                        module = STYLES,
                        action = $trimOptions.find('.name').text(),
                        container = 'Styles Module';
                    analytics.helper.fireModelSectionActionClick(module, action, container);
                }
            });

            // Model Section Module Action Clicks: Explore Features Btn
            var exploreFeaturesBtn = $('.explore-features-btn');
            exploreFeaturesBtn.on('click touch', function(event) {
                var module = STYLES,
                    action = 'Explore Features',
                    container = 'Styles Module';
                analytics.helper.fireModelSectionActionClick(module, action, container);
            });

            // Model Section Module Action Clicks: Gallery Btn
            var galleryBtn = $('.view-gallery');
            galleryBtn.on('click touch', function(event) {
                var module = 'Gallery',
                    action = 'View Gallery',
                    container = 'Gallery Module';
                analytics.helper.fireModelSectionActionClick(module, action, container);
            });

            //carousel indicators / arrows
            var $genericCarousel = $('.accolade-wrapper');


            /*$('body').on('click', '.indicator, .control', $genericCarousel.find('.indicators'), function(event) {
                var $parentCarousel = $(event.currentTarget).parents('.carousel'),
                    $slide = $('.slide.active', $parentCarousel),
                    section = $('body').data('section'),
                    action = 'Carousel',
                    contentTitle = $.trim($('.image', $slide).text());

                analytics.helper.fireAccoladeClick(section, action, contentTitle);

            });*/


        }

        init();
    });
