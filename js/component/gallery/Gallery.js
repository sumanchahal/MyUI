define([
        "jquery",
        "mvc/List",
        "mvc/SelectableList",
        "component/tabfilter/TabFilter",
        "component/tabfilter/TabFilterItem",
        "component/gallery/GalleryItem",
        "component/gallery/GalleryItemType"
    ],
    function(
        $,
        List,
        SelectableList,
        TabFilter,
        TabFilterItem,
        GalleryItem,
        GalleryItemType
    ) {

        /** {TabFilterItem} The "all" filter for the gallery page. */
        var FILTER_ALL = new TabFilterItem(GalleryItemType.ALL);
        /** {TabFilterItem} The "video" filter for the gallery page */
        var FILTER_VIDEO = new TabFilterItem(GalleryItemType.VIDEO);

        /**
         * Model class for a Gallery. Also used for feature pages with overlays.
         *
         * @class Gallery
         * @extends TabFilterItem
         *
         * @constructor
         * @param data {GalleryJSON} Initial data used to instantiate the object.
         */
        var Gallery = function(data) {
            TabFilterItem.call(this, null);
            this._overlayItemsDirty = true;
            this._categoryFilterDirty = true;
            this._filteredItemsDirty = true;
            this._items = null;
            this._overlayItems = null;
            this._filteredItems = null;
            this._label = null;
            this._categoryFilter = null;

            this.init(data);
        };

        Gallery.prototype = new TabFilterItem();
        Gallery.prototype.parent = TabFilterItem.prototype;
        Gallery.prototype.constructor = Gallery;

        /** Event type for when the overlay changes. */
        Gallery.prototype.OVERLAY_ITEMS_CHANGED = "overlayItemsChanged";

        $.extend(Gallery.prototype, {

            /**
             * Initialize the object with Json data.
             * @param data {GalleryJSON}
             *
             * @public
             * @method init
             */
            init: function(data) {
                var items = this.createGalleryItemsFromJSON(data.items);
                this.setId(data.trimId);
                this.setLabel(data.trimGroupName);
                this.setItems(items);
            },

            /**
             *
             * Runs through the items in the JSON data and adds them to the model.
             *
             * @param itemsJSON {Array.<json>}
             * @returns {List.<GalleryItem>}
             *
             * @private
             * @method createGalleryItemsFromJSON
             */
            createGalleryItemsFromJSON: function(itemsJSON) {
                var items = new List(null, GalleryItem);

                var i = 0,
                    l = itemsJSON.length,
                    item = null;


                for (; i < l; i++) {
                    item = new GalleryItem(itemsJSON[i]);
                    items.addItem(item);
                }

                return items;
            },


            /**
             * Resets the filters and overlay items array.
             *
             * @public
             * @method reset
             */
            reset: function() {
                this.getCategoryFilter().setSelectedItem(FILTER_ALL);
            },

            /**
             * Sets the list of gallery items.
             *
             * @param items {List.<GalleryItem>}
             * @returns {List.<GalleryItem>}
             *
             * @public
             * @method setItems
             */
            setItems: function(items) {
                this._items = items;
                this._categoryFilterDirty = true;
                this._overlayItemsDirty = true;
                this._filteredItemsDirty = true;
                this.trigger(this.OVERLAY_ITEMS_CHANGED);
                return this._items;
            },

            /**
             * @returns {List.<GalleryItem>}
             *
             * @public
             * @method getItems
             */
            getItems: function() {
                return this._items;
            },

            /**
             * Returns only the elements that are able to be viewed in
             * the overlay. This is a SelectableList rather than a regular list.
             *
             * @returns {SelectableList.<GalleryItem>} items that should appear in the overlay.
             *
             * @public
             * @method getOverlayItems
             */
            getOverlayItems: function() {
                if (this._overlayItemsDirty) {
                    this.updateOverlayItems();
                }
                return this._overlayItems;
            },

            /**
             * Upates the set of overlay items when other factors like filters have changed.
             *
             * @private
             * @method updateOverlayItems
             */
            updateOverlayItems: function() {
                var overlayItems = new SelectableList([], GalleryItem);

                var i = this.getFilteredItems().getListIterator();
                while (i.hasNext()) {
                    var item = i.next();
                    if (item.type !== GalleryItemType.TRANSPARENT) {
                        overlayItems.addItem(item);
                    }
                }
                this._overlayItemsDirty = false;
                this._overlayItems = overlayItems;
                return overlayItems;
            },

            /**
             * Returns the model for the overlay category filters.
             *
             * @returns {TabFilter}
             *
             * @public
             * @method getCategoryFilter
             */
            getCategoryFilter: function() {
                if (this._categoryFilterDirty) {
                    this.updateCategoryFilter();
                }
                return this._categoryFilter;
            },

            /**
             * Looks through the list of items and returns a list of all the categories that are found.
             *
             * @returns {TabFilter} A tab filter list of all the categories.
             *
             * @private
             * @method updateCategoryFilter
             */
            updateCategoryFilter: function() {

                var items = this.getItems();

                if (!items) {
                    return;
                }

                var itemIterator = items.getListIterator(),
                    categoryMap = {},
                    categoryFilters = [],
                    category,
                    item;

                while (itemIterator.hasNext()) {
                    item = itemIterator.next();

                    category = item.category;
                    // if the category hasn't already been added to the list...
                    if (!categoryMap[category]) {
                        categoryMap[category] = true;
                        categoryFilters.push(new TabFilterItem(category));
                    }

                    // if the item is a video, make sure a video filter is added to the map
                    if (item.isVideo()) {
                        categoryMap.video = true;
                    }
                }

                // alphabetize the categories of items
                // note that 'all' stays at the beginning and 'video' stays at the end.
                // e.g. ["all", "aardvark", "kappa", "zulu", "video"]
                categoryFilters = categoryFilters.sort(function(a, b) {
                    if (a.getLabel() > b.getLabel()) {
                        return 1;
                    }
                    if (a.getLabel() < b.getLabel()) {
                        return -1;
                    }
                    return 0;
                });

                // add all category at the beginning.
                categoryFilters.unshift(FILTER_ALL);

                // add video category at the end if there was any video items
                if (categoryMap.video) {
                    categoryFilters.push(FILTER_VIDEO);
                }

                // If there is nothing but "all", don't bother showing anything.
                if (categoryFilters.length === 1 && categoryFilters[0] === FILTER_ALL) {
                    categoryFilters = [];
                }

                if (this._categoryFilter) {
                    this._categoryFilter.removeSelectionListener(this.onCategoryChanged, this);
                }

                this._filteredItemsDirty = true;
                this._overlayItemsDirty = true;
                this._categoryFilterDirty = false;

                this._categoryFilter = new TabFilter(categoryFilters);
                this._categoryFilter.addSelectionListener(this.onCategoryChanged, this);
                this._categoryFilter.selectFirstItem();
            },

            /**
             * Returns a selectable list of the items filtered by category.
             * Special cases include "all" which shows all images and videos
             * and "video" which shows only videos.
             *
             * @returns {TabFilter}
             *
             * @public
             * @method getFilteredItems
             */
            getFilteredItems: function() {
                if (this._filteredItemsDirty) {
                    this.updateFilteredItems();
                }
                return this._filteredItems;
            },

            /**
             * Updates the filtered items if they are dirty.
             *
             * @private
             * @method updateFilteredItems
             */
            updateFilteredItems: function() {
                var allItems = this.getItems(),
                    filter = this.getCategoryFilter().getSelectedItem();

                this._filteredItems = new SelectableList([], GalleryItem);
                var i = allItems.getListIterator();

                while (i.hasNext()) {
                    var item = i.next();

                    if (!filter || filter === FILTER_ALL) {
                        this._filteredItems.addItem(item);
                        continue;
                    }
                    if (filter === FILTER_VIDEO) {
                        if (item.type === GalleryItemType.VIDEO) {
                            this._filteredItems.addItem(item);
                        }
                    } else {
                        // otherwise, use the item's category
                        // but exclude all transparent images.
                        if (item.category === filter.getId() &&
                            item.type !== GalleryItemType.TRANSPARENT) {
                            this._filteredItems.addItem(item);
                        }
                    }
                }
                this._filteredItemsDirty = false;

                // reset overlay items since they rely on this filtered list.
                this._overlayItemsDirty = true;
            },


            /**
             * Given an item id, select and display
             * the item in an overlay.
             *
             * @param itemId {String} the image id to display in the overlay.
             *
             * @public
             * @method deepLinkToItemId
             */
            deepLinkToItemId: function(itemId) {
                var items = this.getOverlayItems(),
                    itemIterator = items.getListIterator(),
                    item;

                while (itemIterator.hasNext()) {
                    item = itemIterator.next();
                    if (item.getId() === itemId) {
                        items.setSelectedItem(item);
                        return;
                    }
                }
            },



            /**
             * Called when the selected category changes.
             *
             * @param {TabFilterItem} newCategory
             * @param {TabFilterItem} oldCategory
             *
             * @private
             * @method onCategoryChanged
             */
            onCategoryChanged: function(newCategory, oldCategory) {
                // if category changed.
                if (newCategory !== oldCategory) {
                    if (newCategory === null) {
                        this.getCategoryFilter().setSelectedItem(FILTER_ALL);
                    } else {
                        // update the overlay items.
                        this._filteredItemsDirty = true;
                        this._overlayItemsDirty = true;
                        this.trigger(this.OVERLAY_ITEMS_CHANGED);
                    }
                }
            },

            /**
             * Sets the values for the gallery overlay's button.
             *
             * @param overlayLinks {obj} Will contain display text and url for buttons
             *
             * @public
             * @method setOverlayButton
             */
            setOverlayButton: function(overlayLinks) {
                if (overlayLinks.galleryUrl && overlayLinks.galleryLabel) {
                    this.hasGalleryButton = true;
                    this.galleryButtonLabel = overlayLinks.galleryLabel;
                    this.galleryButtonUrl = overlayLinks.galleryUrl;
                }

                if (overlayLinks.dealerUrl && overlayLinks.dealerLabel) {
                    this.hasDealerButton = true;
                    this.dealerButtonLabel = overlayLinks.dealerLabel;
                    this.dealerButtonUrl = overlayLinks.dealerUrl;
                }
            }
        });

        return Gallery;
    });
