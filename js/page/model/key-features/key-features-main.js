/**
 * @file Behaviors for the key features page.
 */
define([
        "modernizr",
        "lexus",
        "jquery",
        "PointBreak",
        "component/gallery/Gallery",
        "component/gallery/GalleryOverlayViewController",
        "component/ResponsiveImages",
        "analytics",
        "model-cookie"
    ],
    function(
        Modernizr,
        LEXUS,
        $,
        PointBreak,
        Gallery,
        GalleryOverlayViewController,
        ResponsiveImages,
        analytics
    ) {

        var featuresModel,
            galleryOverlay,
            featuresData,
            $features,
            bp;

        var pointbreak = new PointBreak();

        pointbreak.addSmallListener(onSmallBreakpoint);
        pointbreak.addMediumListener(onMediumBreakpoint);


        /**
         * @private
         * @method init
         * @desc Initializes key features page - Impliments LEXUS, Gallery, GalleryOverlayViewController, binds click/touch events to feature-item
         */

        function init() {
            var $context = $(".features-wrapper"),
                $galleryOverlayContext = $("#overlay-container");

            // setup responsive images
            var responsiveImages = new ResponsiveImages();

            // init overlay
            var i = 0,
                l = LEXUS.keyFeatures.length,
                featureData,
                items = [];

            for (; i < l; i++) {
                var tile = LEXUS.keyFeatures[i].content;
                if (tile.overlay || tile.interactiveUrl) {
                    items.push(tile);
                }
            }
            var overlayLinks = LEXUS.overlayLinks;

            featuresData = {
                items: items
            };

            featuresModel = new Gallery(featuresData);
            featuresModel.setOverlayButton(overlayLinks);

            galleryOverlay = new GalleryOverlayViewController(featuresModel, $galleryOverlayContext, 'feature');

            setListeners();

            //deep link to overlay selected item
            if (LEXUS.features.hasOwnProperty('selectedId')) {
                featuresModel.deepLinkToItemId(LEXUS.features.selectedId);
            }

        }


        /**
         * @description - determines which selectors will trigger overlay based on breakpoint
         */

        function setListeners() {
            //remove existing listeners
            $('.feature-item , .button-select, .has-overlay').off();

            //get current bp
            bp = pointbreak.getCurrentBreakpoint();

            //determine selector(s)
            $features = (Modernizr.touch || bp === 'small') ? $('.feature-image, .feature-video, .button-select') : $('.has-overlay');

            //bind events to selector
            $features.on("click touch", onClickFeature);
        }

        /**
         * @description - update selectors on small bp event
         * @param event
         */

        function onSmallBreakpoint(event) {
            setListeners();
        }


        /**
         * @description - update selectors on medium bp event
         * @param event
         */

        function onMediumBreakpoint(event) {
            setListeners();
        }


        /**
         * Handles feature click event
         *
         * @private
         * @method onClickFeature
         * @param {Object}
         * @desc  Handles feature item click/touch event. Opens Overlay and Fires Analytics
         */

        function onClickFeature(event) {
            event.preventDefault();

            var $tile = $(event.currentTarget).closest('.feature-item'),
                id = $(event.currentTarget).closest('.feature-item').data('id'),
                page = "Key Features",
                module = "Key Features",
                contentTitle = $tile.find('h2').text(),
                container = page + " Module";

            analytics.helper.fireGenericModuleClick(module, contentTitle, container);

            setSelectedFeature(id);

        }

        /**
         * Sets selected features item
         *
         * @public
         * @method setSelectedFeature
         * @param id {String}
         * @desc Sets selected feature item on Gallery instance
         */

        function setSelectedFeature(id) {
            featuresModel.getOverlayItems().setSelectedItemId(id);
        }

        /**
         * Get Selected Feature
         *
         * @public
         * @method getSelectedFeature
         * @returns {d._id|*|_id|._setSortBy._id|String|Number}
         * @desc Extracts selected item from Gallery instance
         */

        function getSelectedFeature() {
            return featuresModel._overlayItems._selectedItem;
        }




        init();


        return {
            setSelectedFeature: setSelectedFeature,
            getSelectedFeature: getSelectedFeature
        };
    }
);
