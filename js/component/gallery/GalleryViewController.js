define([
        "mvc/AbstractViewController",
        "mvc/ListEvent",
        "component/gallery/Gallery",
        "component/gallery/GalleryItemViewController",
        "component/gallery/GalleryItemType",
        "PointBreak",
        "analytics"
    ],
    function(
        AbstractViewController,
        ListEvent,
        Gallery,
        GalleryItemViewController,
        GalleryItemType,
        PointBreak,
        analytics
    ) {
        var IMAGE_TEMPLATES = 29,
            FADE_OUT_DURATION = 200, // ms
            FADE_IN_DURATION = 400,
            FADE_IN_STAGGER = 50,
            pointbreak = new PointBreak();

        /**
         * @class GalleryViewController
         * @extends AbstractViewController
         *
         * @constructor
         * @param model {Gallery}
         * @param context {jquery}
         */

        function GalleryViewController(model, context) {
            AbstractViewController.call(this);

            this.$galleryTemplate = null;
            this.$smallTemplate = null;
            this.templates = [];
            this.itemViews = [];
            this.mode = null;

            this.init(model, context, Gallery);

            this.getContext().addClass("loaded");

            pointbreak.addChangeListener($.proxy(this.onBreakpointChange, this));

            this.onBreakpointChange();

            this.initAnalytics();
        }

        GalleryViewController.prototype = new AbstractViewController();
        GalleryViewController.prototype.parent = AbstractViewController.prototype;
        GalleryViewController.prototype.constructor = GalleryViewController;

        $.extend(GalleryViewController.prototype, {

            /**
             * @inheritDoc
             * @param model {Gallery}
             */
            setModel: function(model) {
                if (this.getModel()) {
                    this.getModel().getCategoryFilter().removeSelectionListener(this.updateView, this);
                }
                this.parent.setModel.call(this, model);
                if (model) {
                    model.getCategoryFilter().addSelectionListener(this.updateView, this);
                }
            },

            /**
             * @inheritDoc
             */
            createView: function(context) {
                this.$galleryTemplate = context.find(".gallery-images.template");
                if (this.$galleryTemplate.length < 1) {
                    throw new Error("The context provided to the GalleryViewController has no element with .gallery-images.template");
                }

                this.$smallTemplate = context.find(".gallery-images-small .gallery-item.template");
                if (this.$smallTemplate.length < 1) {
                    throw new Error("The context provided to the GalleryViewController has no element with gallery-images-small .gallery-item.template");
                }
            },

            /**
             * @type {listener}
             * @param {Event} event
             */
            onBreakpointChange: function(event) {

                var newBreakpoint = pointbreak.getCurrentBreakpoint();

                if (newBreakpoint === PointBreak.SMALL_BREAKPOINT) {
                    if (this.mode !== "small") {
                        this.mode = "small";
                        // update small view
                        this.updateView();
                        // hide large
                        $('.gallery-images-large').css('display', 'none');
                        // show small
                        $('.gallery-images-small').css('display', 'block');

                    }

                } else {
                    if (this.mode !== "large") {
                        this.mode = "large";
                        // update large view
                        this.updateView();
                        // hide large
                        $('.gallery-images-large').css('display', 'block');
                        // show small
                        $('.gallery-images-small').css('display', 'none');
                    }
                }
            },

            /**
             * @inheritDoc
             */
            updateView: function() {
                if (this.mode === "large") {
                    this.updateViewLarge();
                } else {
                    this.updateViewSmall();
                }
            },

            /**
             * @private
             * Update just the large view.
             */
            updateViewLarge: function() {
                var gallery = this.getModel(),
                    items = gallery.getFilteredItems(),
                    i = 0,
                    l = items.getLength(),
                    itemModel,
                    itemView,
                    itemViewController,
                    numTemplates = this.getNumberOfTemplatesNeeded(),
                    template,
                    context = this.getContext().find('.gallery-images-large');

                var that = this;

                // remove existing gallery templates from the list.
                context.find(".gallery-item").fadeTo(FADE_OUT_DURATION, 0.0);
                setTimeout(function() {
                    afterFadeOut();
                }, FADE_OUT_DURATION);

                function afterFadeOut() {
                    context.find(".gallery-images").remove();

                    that.templates = [];
                    that.itemViews = [];
                    for (; i < numTemplates; i++) {
                        template = that.$galleryTemplate.clone();
                        template.removeClass("template");
                        // hide all gallery items inside the template until later
                        template.find(".gallery-item").hide();
                        template.appendTo(context);
                        template.attr("id", "gallery-items-" + i);
                        that.templates.push(template);
                    }

                    that.itemViews = [];
                    for (i = 0; i < l; i++) {
                        itemModel = items.getItemAtIndex(i);
                        var idWithinTemplate = i % IMAGE_TEMPLATES;
                        var templateId = Math.floor(i / IMAGE_TEMPLATES);
                        itemView = that.templates[templateId].find(".item-" + idWithinTemplate);

                        itemView.attr("id", "item" + i);
                        itemView.data("id", itemModel.getId());
                        itemViewController = new GalleryItemViewController(itemModel, itemView);
                        that.itemViews.push(itemViewController);

                        // show the item after a short delay
                        itemView.delay(i * FADE_IN_STAGGER).fadeTo(FADE_IN_DURATION, 1.0);
                    }

                    //Sets the last absolutely positioned item in the gallery to a relative position
                    that.setRelativePositionToLastItem('item' + (l - 1));

                    //ensure the .gallery-container elements are visisble
                    //context.find('.gallery-container').show();
                    // Hide the empty gallery components
                    that.hideEmptyGalleryRows(l);
                }
            },

            /**
             * Update just the small view.
             */
            updateViewSmall: function() {
                var gallery = this.getModel(),
                    items = gallery.getFilteredItems(),
                    i = 0,
                    l = items.getLength(),
                    itemModel,
                    itemView,
                    itemViewController,
                    context = this.getContext().find(".gallery-images-small"),
                    opposite = null,
                    position = null;

                var that = this;

                that.itemViews = [];
                // remove existing gallery templates from the list.
                context.find(".gallery-item").remove();

                for (i = 0; i < l; i++) {
                    itemModel = items.getItemAtIndex(i);
                    itemView = that.$smallTemplate.clone();
                    itemView.removeClass('template');

                    // switch position if image transparents are found
                    if (itemModel.type !== GalleryItemType.TRANSPARENT) {
                        if (opposite !== true) {
                            if (i % 2 === 0) {
                                position = 'left';
                            } else {
                                position = 'right';
                            }
                        } else {
                            if (i % 2 === 0) {
                                position = 'right';
                            } else {
                                position = 'left';
                            }

                        }
                    } else {
                        if (opposite === true) {
                            opposite = false;
                        } else {
                            opposite = true;
                        }
                    }

                    itemView.attr("class", "item-" + i + " gallery-item " + position);
                    itemView.attr("id", "item" + i);
                    itemView.data("id", itemModel.getId());
                    itemViewController = new GalleryItemViewController(itemModel, itemView);
                    that.itemViews.push(itemViewController);
                    itemView.appendTo(context);
                }

            },

            /**
             * @private
             * Sets a relative position in case the last image is overlapped by the footer
             * @param {id} the id of the last item.
             */

            setRelativePositionToLastItem: function(id) {
                var lastItem = $('#' + id);
                var container = $('#gallery-container');
                var lastItemBottom = lastItem.offset().top + lastItem.outerHeight();
                var containerBottom = container.offset().top + container.outerHeight();

                if (lastItemBottom > containerBottom) {
                    lastItem.css('position', 'relative');
                }
            },

            /**
             * Hides the empty galleries.
             *
             * @param numberOfItems {int}
             */
            hideEmptyGalleryRows: function(numberOfItems) {
                var delay = numberOfItems * FADE_IN_STAGGER;

                setTimeout(function() {
                    hideRows();
                }, delay);

                function hideRows() {
                    var $galleryComponentContainers = $('.gallery-container');

                    $galleryComponentContainers.each(function() {
                        var $galleryItems = $(this).find('.gallery-item'),
                            itemLength = $galleryItems.length,
                            that = $(this),
                            count = 0;

                        $galleryItems.each(function() {
                            var opacity = $(this).attr('opacity');
                            if (opacity === '0') {
                                count = count + 1;
                            }
                            if (count === itemLength && opacity === '0') {
                                that.css('display', 'none');
                            }
                        });
                    });
                }
            },

            /**
             * @private
             * Since we have to actually copy and paste the entire set of gallery templates, this counts up how many we
             * need based on the number of gallery items.
             * @returns {int}
             */
            getNumberOfTemplatesNeeded: function() {
                var l = this.getModel().getItems().getLength();
                return Math.ceil(l / IMAGE_TEMPLATES);
            },

            /**
             * @priavate
             * Initialize Omniture tracking code
             */
            initAnalytics: function() {
                var that = this;

                // Gallery image click
                this.getContext().on('click touch', '.gallery-item', function(event) {
                    var $clickTarget = $(event.currentTarget),
                        items = that.getModel().getFilteredItems(),
                        id = $clickTarget.data("id"),
                        itemModel = items.getItemById(id),
                        category = itemModel.category,
                        itemTitle = itemModel.title,
                        type = itemModel.type,
                        numberOfFilteredImages = items.getLength(),
                        indexOfImage = items.getIndexOfItem(itemModel) + 1,
                        title = itemTitle + ' ' + category + ' Image ' + indexOfImage;
                    analytics.helper.fireGalleryModuleClick(category, title, type, numberOfFilteredImages, indexOfImage);
                });
            }

        });

        return GalleryViewController;
    }
);
