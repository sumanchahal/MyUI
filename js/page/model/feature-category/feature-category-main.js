/**
 * @fileOverview Behaviors for the features pages:
 * Read more
 * Gallery overlay
 * Responsive images
 */
require([
    "modernizr",
    "lexus",
    "jquery",
    "component/gallery/Gallery",
    "component/gallery/GalleryOverlayViewController",
    "component/ResponsiveImages",
    "component/accoladeCarousel",
    "analytics",
    "model-cookie"
], function(
    Modernizr,
    LEXUS,
    $,
    Gallery,
    GalleryOverlayViewController,
    ResponsiveImages,
    accoladeCarousel,
    analytics
) {
    var galleryModel,
        galleryOverlayView;

    /**
     * On load initializes all page level methods
     * @method init
     * @private
     */

    function init() {
        // Initialize accolade carousel
        initAccolades();

        initGalleryOverlay();
        initCarouselAnalytics();

        removeTopBorder();

        // setup responsive images
        var responsiveImages = new ResponsiveImages();

        // Omniture analytics
        $('.feature-item').find('a').on('click touch', onTileClick);

        listifyFeatureText();
    }


    function listifyFeatureText() {
        $(".feature-item .text").each(function(i, elem) {
            var originalText = $(elem).html();
            var newText = originalText;

            var BULLET_SEARCH = /(^|\n)-(.*|$)/g;
            var firstListItem = originalText.search(BULLET_SEARCH);
            if (firstListItem >= 0) {
                newText = newText.replace(BULLET_SEARCH, "$1<li>$2</li>");
                var endListPosition = newText.lastIndexOf('<\/li>') + 5;
                newText = newText.substring(0, firstListItem) + "<ul>" + newText.substring(firstListItem, endListPosition) + "</ul>" + newText.substring(endListPosition);
            }

            $(elem).html(newText);
        });
    }


    /**
     * Accolade carousel functionality
     * @method initAccolades
     * @private
     */

    function initAccolades() {
        var accolade = $('.feature-accolade-carousel').find('.accolade-container')[0];
        accoladeCarousel.init(accolade, '.accolade-item');
    }

    /**
     * Finds and removes the border-top of the top most element on this page
     *
     * @private
     */

    function removeTopBorder() {
        $('.features-content div').first().css({
            'border-top': '0px'
        });
    }

    /**
     * Gallery overlay functionality and model data setup
     * @method initGalleryOverlay
     * @private
     */

    function initGalleryOverlay() {
        var $overlayContext = $('#overlay-container');

        // Check if overlay content exists
        if (!$overlayContext.length) {
            throw new Error("There is no element with id #overlay-container in this page. Cannot create GalleryOverlayViewController");
        }

        var items = [],
            i, j;

        // Loop through page data for overlay data
        for (i = 0; i < LEXUS.featureBlockList.length; i++) {
            var block = LEXUS.featureBlockList[i];

            if (block.type === "FEATURE") {
                if (block.content.overlay) {
                    if ($.trim(block.content.video)) {
                        block.content.tileType = 'video';
                    }
                    items.push(block.content);
                }
            }
            if (block.type === "COLUMN") {
                for (j = 0; j < block.leftFeatureItems.length; j++) {
                    if (block.leftFeatureItems[j].overlay) {
                        items.push(block.leftFeatureItems[j]);
                    }
                }
                for (j = 0; j < block.rightFeatureItems.length; j++) {
                    if (block.rightFeatureItems[j].overlay) {
                        items.push(block.rightFeatureItems[j]);
                    }
                }
            }
        }

        // Create variable for overlay data
        var galleryData = {
            items: items
        };
        var overlayLinks = LEXUS.overlayLinks;

        galleryModel = new Gallery(galleryData);
        galleryModel.setOverlayButton(overlayLinks);
        //[LIM - 3024] The third paramete is actually used for tagging to determin what type
        // of tag to send. From what I can see, that's it's only use. Added this type so that
        // the correct tag would fire per James' request.
        galleryOverlayView = new GalleryOverlayViewController(galleryModel, $overlayContext, 'feature');

        // add click listeners to the features
        $(".has-overlay").find('.feature-img').on("click", onClickFeature);

        //deep link to overlay selected item
        if (LEXUS.features.hasOwnProperty('selectedId')) {
            galleryModel.deepLinkToItemId(LEXUS.features.selectedId);
        }
    }

    /**
     * Open gallery overlay on feature click
     * @method onClickFeature
     * @private
     */

    function onClickFeature(e) {
        e.preventDefault();

        var $clickedFeature = $(e.currentTarget),
            clickedId = $clickedFeature.parent('.feature-item').attr("id");


        //[LIM-3024] Per this ticket, we are adding this tag which is also
        // present on key features. 
        var $tile = $(e.currentTarget).closest('.feature-item'),
            id = $(e.currentTarget).closest('.feature-item').data('id'),
            page = LEXUS.featureCategory,
            contentTitle = $tile.find('h2').text(),
            module = contentTitle,
            container = page + " Module";

        analytics.helper.fireGenericModuleClick(module, contentTitle, container);

        galleryModel.getOverlayItems().setSelectedItemId(clickedId);
    }

    /**
     * Executed when the user clicks or touches on a tile.
     *
     * @param event {Event}
     */

    function onTileClick(event) {

        var $eventTarget = $(event.currentTarget),
            $tile = $eventTarget.closest('.feature-item'),
            module = (LEXUS.featureCategory).replace(/&amp;/g, '&'),
            contentTitle = $tile.find('h2').text(),
            featuredTitle = $tile.find('h3').text(),
            container = (LEXUS.featureCategory + ' Module').replace(/&amp;/g, '&');

        if (featuredTitle) {
            module = featuredTitle;
            container = featuredTitle + ' Module';
        }

        // fire analytics
        analytics.helper.fireGenericModuleClick(module, contentTitle, container);

        if (Modernizr.touch) {
            // make the browser scroll to the correct location
            $('html, body').scrollTop(event.currentTarget.offsetTop - ($('.header-wrapper').height()));
        }
    }

    /**
     * initCarouselAnalytics
     *
     * Fires analytics tags on carousel interactions
     */

    function initCarouselAnalytics() {

        //carousel indicators / arrows
        var $genericCarousel = $('.accolade-wrapper');

        $('body').on('click', '.indicator, .control', $genericCarousel.find('.indicators'), function(event) {
            var $parentCarousel = $(event.currentTarget).parents('.carousel'),
                $slide = $('.slide.active', $parentCarousel),
                section = $('body').data('section'),
                action = 'Carousel',
                contentTitle = $.trim($('.image', $slide).text());

            analytics.helper.fireAccoladeClick(section, action, contentTitle);

        });
    }

    init();
});
