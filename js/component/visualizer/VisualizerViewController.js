define([
    "jquery",
    "mvc/AbstractViewController",
    "component/visualizer/Visualizer",
    "component/visualizer/SwatchPickerViewController",
    "component/visualizer/ImageCarouselViewController",
    "component/tabfilter/TabFilterViewController",
], function(
    $,
    AbstractViewController,
    Visualizer,
    SwatchPickerViewController,
    ImageCarouselViewController,
    TabFilterViewController
) {


    /**
     * A view controller for the visualizer module, aka explore & customize.
     *
     * @class VisualizerViewController
     * @extends AbstractViewController
     *
     * @param model {Visualizer} A model object to bind to this view.
     * @param context {jquery|HTMLElement} A dom location to draw the view.
     *
     * @constructor
     */

    function VisualizerViewController(model, context) {
        AbstractViewController.call(this);

        this.init(model, context, Visualizer);
    }

    VisualizerViewController.prototype = new AbstractViewController();
    VisualizerViewController.prototype.parent = AbstractViewController.prototype;
    VisualizerViewController.prototype.constructor = VisualizerViewController;

    $.extend(VisualizerViewController.prototype, {

        /** @inheritdoc */
        setModel: function(model) {
            this.parent.setModel.call(this, model);
            if (model) {
                var trimGroups = model.getTrimGroups();
                trimGroups.addSelectionListener(this.onTrimChange, this);
                this.imageCarousel.setModel(model);
            }
        },

        /** @inheritdoc */
        createView: function($context) {
            this.createTrimFilter($context);
            this.createSwatchGroupFilter($context);
            this.createSwatchPicker($context);
            this.createImageCarousel($context);
        },

        /**
         * Sets up the trim group filter view.
         *
         * @param context {jquery}
         */
        createTrimFilter: function(context) {
            var filterContext = context.find("#visualizerTrimFilter");
            if (filterContext.length < 1) {
                throw new Error("The Visualizer context must include a tab-filter.tag with id 'visualizerTrimFilter'");
            }
            this.trimFilter = new TabFilterViewController(null, filterContext);
        },

        /**
         * Sets up the swatch group filter view.
         *
         * @param context {jquery}
         */
        createSwatchGroupFilter: function(context) {
            var filterContext = context.find("#visualizerSwatchGroupFilter");
            if (filterContext.length < 1) {
                throw new Error("The Visualizer context must include a tab-filter.tag with id 'visualizerSwatchGroupFilter'");
            }
            this.swatchGroupFilter = new TabFilterViewController(null, filterContext);
        },

        /**
         * Sets up the swatch picker view.
         *
         * @param context {jquery}
         */
        createSwatchPicker: function(context) {
            var swatchPickerContext = context.find("#visualizerSwatchPicker");
            if (swatchPickerContext.length < 1) {
                throw new Error("The Visualizer context must include a tab-filter.tag with id 'visualizerSwatchGroupFilter'");
            }
            this.swatchPicker = new SwatchPickerViewController(null, swatchPickerContext);
        },

        /**
         * Sets up the image carousel view.
         *
         * @param context {jquery}
         */
        createImageCarousel: function(context) {
            var carouselContext = context.find(".carousel-container");
            if (carouselContext.length < 1) {
                throw new Error("The Visualizer context must include a container with class '.carousel-container'");
            }
            this.imageCarousel = new ImageCarouselViewController(this.getModel(), carouselContext);
        },

        /** @inheritdoc */
        updateView: function() {
            var model = this.getModel(),
                trimGroups = null,
                swatchGroups = null;

            if (model) {
                trimGroups = model.getTrimGroups();
                this.trimFilter.setModel(trimGroups);

                // hide if there is only one item in the list.
                if (!trimGroups || trimGroups.getLength() <= 1) {
                    this.trimFilter.getContext().hide();
                } else {
                    this.trimFilter.getContext().show();
                }

                swatchGroups = trimGroups.getSelectedItem().getSwatchGroups();
                swatchGroups.addSelectionListener(this.onSwatchGroupChange, this);
                swatchGroups.getSelectedItem().getSwatches().addSelectionListener(this.onSwatchChange, this);

                this.swatchGroupFilter.setModel(swatchGroups);
                this.swatchPicker.setModel(swatchGroups.getSelectedItem());
                this.imageCarousel.updateView();
            }

        },

        /**
         * @private
         * Called when selected trim changes on model.
         *
         * @param newTrim {TrimVisualizer}
         * @param oldTrim {TrimVisualizer}
         */
        onTrimChange: function(newTrim, oldTrim) {
            this.updateView();
        },

        /**
         * @private
         * Called when selected swatchGroup changes within trim.
         *
         * @param newSwatchGroup {SwatchGroup}
         * @param oldSwatchGroup {SwatchGroup}
         */
        onSwatchGroupChange: function(newSwatchGroup, oldSwatchGroup) {
            this.updateView();
        },

        /**
         * @private
         * Called when selected swatch changes within swatch group.
         *
         * @param newSwatch {Swatch}
         * @param oldSwatch {Swatch}
         */
        onSwatchChange: function(newSwatch, oldSwatch) {
            this.updateView();
        }
    });

    return VisualizerViewController;
});
