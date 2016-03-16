define([
        "jquery",
        "mvc/AbstractViewController",
        "mvc/ListEvent",
        "component/tabfilter/TabFilterViewController",
        "component/gallery/GalleryPage",
        "component/gallery/Gallery",
        "component/gallery/GalleryItemType",
        "component/gallery/GalleryViewController",
        "component/gallery/GalleryOverlayViewController",
        "analytics"
    ],
    function(
        $,
        AbstractViewController,
        ListEvent,
        TabFilterViewController,
        GalleryPage,
        Gallery,
        GalleryItemType,
        GalleryTilesViewController,
        GalleryOverlayViewController,
        analytics
    ) {

        /**
         * The view controller for the whole Gallery page.
         *
         * Note: The Gallery and GalleryViewController classes represent the list of tiles shown on this page and other pages.
         * The GalleryPage adds a filter for trim.
         *
         * @class GalleryPageViewController
         * @extends AbstractViewController
         * @param model {GalleryPage}
         * @param context {jquery}
         * @constructor
         */

        function GalleryPageViewController(model, context) {
            AbstractViewController.call(this);

            this.galleryView = null;
            this.overlayController = null;
            this.categoryFilter = null;
            this.trimFilter = null;

            this.init(model, context, GalleryPage);
        }


        // ANALYTICS

        function onTabFilterClick(event) {
            var action = $(event.target).text();

            analytics.helper.fireGalleryTabFilterClick(action);
        }


        GalleryPageViewController.prototype = new AbstractViewController();
        GalleryPageViewController.prototype.parent = AbstractViewController.prototype;
        GalleryPageViewController.prototype.constructor = GalleryPageViewController;

        $.extend(GalleryPageViewController.prototype, {

            /**
             * Initialize the view.
             * @param model {GalleryPage}
             * @param context {jquery}
             * @param type {String}
             * @private
             */
            init: function(model, context, type) {
                this.parent.init.call(this, model, context, type);

                this.createTiles(context);
                this.createTrimFilter(context);
                this.createCategoryFilter(context);
                this.createGalleryOverlay(this.getModel().getTrimGalleries().getSelectedItem());
            },

            /**
             * Set the model for this view.
             *
             * @param model {GalleryPage}
             */
            setModel: function(model) {
                this.parent.setModel.call(this, model);
                this.getModel().getTrimGalleries().addSelectionListener(this.onSelectedGalleryChanged, this);
                this.getContext().on("click touch", ".gallery-item", $.proxy(this.onItemClick, this));
            },

            /**
             * @inheritDoc
             */
            updateView: function() {
                // see this.onSelectedGalleryChanged
            },

            /**
             * Creates the gallery item tile view.
             * @param context {jquery}
             * @private
             */
            createTiles: function(context) {
                var $galleryTilesContext = context.find("#gallery-container");
                if ($galleryTilesContext.length < 1) {
                    throw new Error("The context provided to the GalleryPageViewController has no element with #gallery-container");
                }
                this.galleryView = new GalleryTilesViewController(this.getModel().getSelectedGallery(), $galleryTilesContext);
            },

            /**
             * Creates the vehicle trim group filter UI.
             *
             * @param context {jquery}
             * @private
             */
            createTrimFilter: function(context) {
                var $trimFilterContext = context.find("#gallery-trim-filter.tab-filter");
                if ($trimFilterContext.length < 1) {
                    throw new Error("The context provided to the GalleryPageViewController has no element with #gallery-trim-filter");
                }
                this.trimFilter = new TabFilterViewController(this.getModel().getTrimGalleries(), $trimFilterContext);

                // ANALYTICS
                $trimFilterContext.on('click touch', '.filter-button', onTabFilterClick);
            },

            /**
             * Creates the gallery item category filter UI.
             *
             * @param context {jquery}
             * @private
             */
            createCategoryFilter: function(context) {
                var $categoryFilterContext = context.find("#gallery-category-filter.tab-filter");
                if ($categoryFilterContext.length < 1) {
                    throw new Error("The context provided to the GalleryPageViewController has no element with #gallery-category-filter");
                }
                this.categoryFilter = new TabFilterViewController(this.getModel().getSelectedGallery().getCategoryFilter(), $categoryFilterContext);

                // ANALYTICS
                $categoryFilterContext.on('click touch', '.filter-button', onTabFilterClick);
            },

            /**
             * Initialize the UI for the gallery overlay.
             *
             * @param model {Gallery} Current selected trim group's Gallery object.
             * @private
             */
            createGalleryOverlay: function(model) {
                var $overlayContext = $('#overlay-container');
                if (!$overlayContext.length) {
                    throw new Error("There is no element with id #overlay-container in this page. Cannot create GalleryOverlayViewController");
                }
                this.overlayController = new GalleryOverlayViewController(model, $overlayContext);
            },

            /**
             * Triggered by an event when the selected trim group (gallery) changes.
             *
             * @param gallery {Gallery}
             * @private
             */
            onSelectedGalleryChanged: function(gallery) {
                if (gallery) {
                    // reset the category filter to all.
                    gallery.reset();
                    this.categoryFilter.setModel(gallery.getCategoryFilter());
                }
                this.overlayController.setModel(gallery);
                this.galleryView.setModel(gallery);
            },


            /**
             * Triggered when a gallery item tile is clicked by the user.
             *
             * @param event {MouseEvent}
             * @private
             */
            onItemClick: function(event) {
                var $clickedItem = $(event.currentTarget);
                var clickedItemModelId = $clickedItem.data("id");

                // ignore clicks from transparent items.
                if (!$clickedItem.hasClass(GalleryItemType.TRANSPARENT)) {
                    // set the item's model as the selected item.
                    var gallery = this.getModel().getSelectedGallery();
                    gallery.getOverlayItems().setSelectedItemId(clickedItemModelId);
                }
            }
        });

        return GalleryPageViewController;
    }

);
