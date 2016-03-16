define(["jquery", "mvc/AbstractModel", "mvc/SelectableList", "component/gallery/Gallery"], function($, AbstractModel, SelectableList, Gallery) {

    /**
     * @class GalleryPage
     * @param data {JSON}
     * @constructor
     * @extends AbstractModel
     */

    function GalleryPage(data) {
        AbstractModel.call(this);

        this._trimGalleries = null;
        this._seriesId = null;

        this.init(data);
    }

    GalleryPage.prototype = new AbstractModel();
    GalleryPage.prototype.parent = AbstractModel.prototype;
    GalleryPage.prototype.constructor = GalleryPage;

    $.extend(GalleryPage.prototype, {
        init: function(data) {
            var galleries = this.createGalleryListFromJSON(data.items);
            this.setTrimGalleries(galleries);
            this.setSeriesId(data.seriesId);

            // select the first gallery by default
            this.getTrimGalleries().selectFirstItem();
        },

        /**
         * Parses JSON into model objects.
         * @param galleriesJSON {JSON}
         * @returns {SelectableList.<Gallery>}
         */
        createGalleryListFromJSON: function(galleriesJSON) {
            var i = 0,
                l = galleriesJSON.length,
                gallery = null,
                galleries = new SelectableList([], Gallery);
            var overlayLinks = LEXUS.overlayLinks;

            for (; i < l; i++) {
                gallery = new Gallery(galleriesJSON[i]);
                gallery.setOverlayButton(overlayLinks);
                galleries.addItem(gallery);
            }
            return galleries;
        },

        /**
         * Given an item id, select the first gallery with that id and display
         * the item in an overlay.
         *
         * @param itemId {String} the image id to display in the overlay.
         */
        deepLinkToItemId: function(itemId) {
            var galleries = this.getTrimGalleries(),
                galleryIterator = galleries.getListIterator(),
                gallery,
                itemIterator,
                item;

            while (galleryIterator.hasNext()) {
                gallery = galleryIterator.next();
                itemIterator = gallery.getOverlayItems().getListIterator();
                while (itemIterator.hasNext()) {
                    item = itemIterator.next();
                    if (item.getId() === itemId) {
                        galleries.setSelectedItem(gallery);
                        gallery.getOverlayItems().setSelectedItem(item);
                        return;
                    }
                }
            }
        },

        /**
         * Returns the current selected gallery (vehicle trim group's gallery)
         * @returns {Gallery}
         */
        getSelectedGallery: function() {
            return this.getTrimGalleries().getSelectedItem();
        },

        /**
         * @returns {List.<GalleryItem>}
         */
        getSelectedGalleryItems: function() {
            return this.getSelectedGallery().getItems();
        },

        /**
         * Sets the gallery items for this page.
         *
         * @param trimGalleries {SelectableList.<Gallery>}
         * @returns {SelectableList.<Gallery>}
         */
        setTrimGalleries: function(trimGalleries) {
            this._trimGalleries = trimGalleries;
            return this._trimGalleries;
        },

        /**
         * @returns {SelectableList.<Gallery>}
         */
        getTrimGalleries: function() {
            return this._trimGalleries;
        },

        /**
         * Set the vehicle series name (e.g. ES) for the page.
         *
         * @param seriesId {String}
         * @returns {String}
         */
        setSeriesId: function(seriesId) {
            this._seriesId = seriesId;
            return this._seriesId;
        },
        /** @return <String> */
        getSeriesId: function() {
            return this._seriesId;
        }

    });

    return GalleryPage;
});
