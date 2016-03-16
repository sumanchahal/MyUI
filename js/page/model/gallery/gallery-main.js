/**
 * The main script for the Model Gallery page. Not the
 * same as the Gallery module.
 */
require([
        "lexus",
        "component/gallery/GalleryPage",
        "component/gallery/GalleryPageViewController",
        "jquery",
        "waypoints-sticky",
        "model-cookie"
    ],
    function(
        LEXUS,
        GalleryPage,
        GalleryPageViewController,
        $
    ) {
        function init() {

            // normalize the name of the list of gallery items.
            var galleries = LEXUS.galleryPageData.galleries;
            for (var i = galleries.length - 1; i >= 0; i--) {
                var gallery = galleries[i];
                gallery.items = gallery.galleryItems;
            }

            // Create variable for overlay data
            var galleryData = {
                "items": galleries,
                "seriesId": LEXUS.seriesId
            };

            // set up the model for the gallery
            var galleryContext = $("#gallery");

            var galleryPageData = new GalleryPage(galleryData, LEXUS.overlayLabel);
            galleryPageData.setSeriesId(LEXUS.seriesId);

            var galleryViewController = new GalleryPageViewController(galleryPageData, galleryContext);

            // Check the global scope for a LEXUS object
            if (LEXUS.selectedItemId) {
                // If it exists, pull the selected item id from it. Use this to
                // set the selected item on the gallery model.

                galleryPageData.deepLinkToItemId(LEXUS.selectedItemId);
            }
        }

        init();
    }
);
