define([
    "jquery",
    "PointBreak",
    "mvc/AbstractViewController",
    "component/visualizer/Swatch",
    "component/visualizer/SwatchGroup",
    "component/visualizer/SwatchViewController",
    "component/Carousel", /** LIM 195**/
    "favorites", /** LIM 195**/
    "favorites-lfr" /** LIM 3199**/
], function(
    $,
    PointBreak,
    AbstractViewController,
    Swatch,
    SwatchGroup,
    SwatchViewController,
    Carousel, /** LIM 195**/
    Favorite, /** LIM 195**/
    FavoriteLFR /** LIM 3199 **/
) {

    var SWATCH_SELECTOR = ".swatch",
        TEMPLATE_SELECTOR = ".template",
        SELECTED_CLASS = "selected",
        pointBreak = new PointBreak(),
        SLIDES_PER_PAGE = {
            small: 5,
            medium: 10,
            large: 10,
            max: 10
        };

    /**
     * View controller for swatch picker element of visualizer.
     *
     * @param model {SwatchGroup}
     * @param context {jquery}
     * @constructor
     */

    function SwatchPickerViewController(model, context) {
        AbstractViewController.call(this);
        this.redrawNeeded = true;

        this.init(model, $(context), SwatchGroup);

        pointBreak.addChangeListener($.proxy(this.onBreakpointChange, this));
    }

    var carouselSettings = {
        slideSelector: '.swatch',
        showIndicators: true,
        showNextPrev: true,
        animationDuration: 450,
        autoSlideHeight: false
    };

    SwatchPickerViewController.prototype = new AbstractViewController();
    SwatchPickerViewController.prototype.parent = AbstractViewController.prototype;
    SwatchPickerViewController.prototype.constructor = SwatchPickerViewController;

    $.extend(SwatchPickerViewController.prototype, {

        /** @inheritDoc */
        setModel: function(model) {
            var oldModel = this.getModel();

            this.parent.setModel.call(this, model);
            if (model && model !== oldModel) {

                if (oldModel && oldModel.getSwatches()) {
                    oldModel.getSwatches().removeSelectionListener(this.onSelectedSwatchChanged, this);
                }
                model.getSwatches().addSelectionListener(this.onSelectedSwatchChanged, this);
                this.redrawNeeded = true;
                this.updateView();
            }
        },

        /** @inheritDoc */
        createView: function(context) {
            var c = context;
            carouselSettings.instance = c;
            var that = this;

            this.$swatchList = c.find(".swatch-list");
            this.$swatchTemplate = this.$swatchList.find(SWATCH_SELECTOR + TEMPLATE_SELECTOR);
            this.$swatchDescription = c.find(".swatch-description");
            this.$swatchFavorite = c.find("#swatch-favorite"); /** LIM 195**/

            this.$swatchList.on("click touchstart", SWATCH_SELECTOR, $.proxy(this.onSwatchClick, this));

            // update view on orientationchange
            $(window).on('orientationchange', function() {
                that.redrawNeeded = true;
                that.updateView();
            });
        },

        /** @inheritDoc */
        updateView: function() {
            if (this.getModel() === null) {
                return;
            }

            var swatches = this.getModel().getSwatches(),
                i,
                selectedSwatch,
                swatch,
                carouselSlideIndex,
                $swatchContext,
                swatchVC;

            if (this.redrawNeeded) {

                // remove old swatches
                this.$swatchList.empty();

                i = swatches.getListIterator();
                selectedSwatch = swatches.getSelectedItem();
                while (i.hasNext()) {
                    swatch = i.next();
                    $swatchContext = this.$swatchTemplate.clone().removeClass(TEMPLATE_SELECTOR);
                    swatchVC = new SwatchViewController(swatch, $swatchContext);
                    $swatchContext.appendTo(this.$swatchList);
                    $swatchContext[0].model = swatch;
                }

                if (selectedSwatch) {
                    this.setSwatchLabel(selectedSwatch); /** LIM 195**/
                }

                carouselSettings.slidesPerPage = this.getNumberOfSwatchesPerPage();

                // If it's the first time, instantiate the carousel
                // subsequent updates to the slides should just reset the slides
                if (typeof this.carousel === "undefined") {
                    this.carousel = new Carousel(carouselSettings);
                } else {
                    this.carousel.resetSlides(carouselSettings);
                }

                // Scroll to the selected image.
                carouselSlideIndex = this.calculateSwatchSlideIndex(swatches.getSelectedItemIndex(), carouselSettings.slidesPerPage);
                this.carousel.jumpToIndex(carouselSlideIndex, "left", true);

                this.redrawNeeded = false;
            }

            // mark selected swatch
            var selectedIndex = swatches.getSelectedItemIndex(),
                $swatches = this.$swatchList.find(SWATCH_SELECTOR);
            $swatches.removeClass(SELECTED_CLASS);
            $swatches.eq(selectedIndex).addClass(SELECTED_CLASS);
        },

        /**
         * Recalculates which page a slide is present on based on the
         * carousel's current slidePerPage value
         * @param itemIndex - the index of a carousel item
         * @param slidesPerPage - how many slides per page display in the carousel
         * @returns {int}
         */

        calculateSwatchSlideIndex: function(itemIndex, slidesPerPage) {
            return Math.floor(itemIndex / slidesPerPage);
        },

        /**
         * Sets the title of the selected swatch.
         *
         * @param label {String} the name of the swatch.
         */
        setSwatchLabel: function(selectSwatch) { /** LIM 195**/
            if (this.$swatchDescription) {

                var label = selectSwatch.getLabel();

                /** LIM 195 START**/
                this.$swatchDescription.html(label);

                if (window.favoritesActive) {
                    this.$swatchFavorite.html('');

                    if (selectSwatch.getType() !== 'Wheels' && selectSwatch.getEfcCode() !== "" && selectSwatch.getEfcCode() !== null) {
                        this.$swatchFavorite.html(
                            '<span class="favorite-listener" ' +
                            'data-action="' + (Favorite.getFavObject.isFavorite(selectSwatch.getType(), selectSwatch.getEfcCode()) ? "removeFavorite" : "addFavorite") + '"' +
                            'data-url="' + selectSwatch.getImage() + '"' +
                            'data-code="' + selectSwatch.getEfcCode() + '"' +
                            'data-title="' + selectSwatch.getName() + '"' +
                            'data-clean-title="' + selectSwatch.getName() + '"' +
                            'data-type="' + selectSwatch.getType() + '">' +
                            (Favorite.getFavObject.isFavorite(selectSwatch.getType(), selectSwatch.getEfcCode()) ? "Remove Color" : "Save Color") +
                            '</span>'
                        );
                    }

                    $('.favorite-listener').on('click touchstart', function(e) {
                        Favorite.getFavObject.favoriteClicked(e);
                    });

                }
                /** LIM 195 END**/

                /** LIM 3199 START**/
                if (window.lfrActive) {
                    // Add color to vehicle info object.
                    window.LexusPlusPageInfo.lfrVehicleInfo.color = label;

                    this.$swatchFavorite.html('');

                    if (selectSwatch.getType() !== 'Wheels' && selectSwatch.getEfcCode() !== "" && selectSwatch.getEfcCode() !== null) {
                        this.$swatchFavorite.html(
                            '<span class="favorite-listener" ' +
                            'data-action="addFavorite" ' +
                            'data-url="' + selectSwatch.getImage() + '"' +
                            'data-code="' + selectSwatch.getEfcCode() + '"' +
                            'data-title="' + selectSwatch.getName() + '"' +
                            'data-clean-title="' + selectSwatch.getName() + '"' +
                            'data-type="' + selectSwatch.getType() + '">' +
                            "Save" +
                            '</span>'
                        );
                    }

                    $('.favorite-listener').on('click touchstart', function(e) {
                        FavoriteLFR.getFavObject.favoriteClicked(e);
                    });

                }
                /** LIM 3199 END**/
            }
        },

        /**
         * Returns the number of tiles to show on each page.
         * @returns {int}
         */
        getNumberOfSwatchesPerPage: function() {
            var size = pointBreak.getCurrentBreakpoint();
            return SLIDES_PER_PAGE[size];
        },

        /**
         * Called when breakpoint changes.
         * @param event {BreakpointChangeEvent}
         */
        onBreakpointChange: function(event) {
            if (SLIDES_PER_PAGE[event.oldBreakpoint] !== this.getNumberOfSwatchesPerPage()) {
                this.redrawNeeded = true;
                this.updateView();
            }
        },

        /**
         * @private
         * Called whenever the current slide changes.
         */
        onSlideChanged: function() {
            // placeholder.
        },

        /**
         * @private
         * Called when swatch button is clicked or touched.
         * Sets the selected item to the clicked item on the model.
         *
         * @param event {MouseEvent|TouchEvent}
         */
        onSwatchClick: function(event) {
            var swatch = event.currentTarget;
            this.getModel().getSwatches().setSelectedItem(swatch.model);
        },

        /**
         * @param newValue {Swatch}
         * @param oldValue {Swatch}
         */
        onSelectedSwatchChanged: function(newValue, oldValue) {
            var label = "";
            if (newValue) {
                label = newValue.getLabel();
            }
            this.setSwatchLabel(newValue); /** LIM 195 End**/
        }
    });

    return SwatchPickerViewController;
});
