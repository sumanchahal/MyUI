define([
    "jquery",
    "mvc/AbstractModel",
    "mvc/SelectableList",
    "component/visualizer/TrimVisualizer",
    "component/visualizer/visualizerImageStringBuilder",
    "PointBreak"
], function(
    $,
    AbstractModel,
    SelectableList,
    TrimVisualizer,
    visualizerImageStringBuilder,
    PointBreak
) {

    /**
     * The model for the entire Visualizer component.
     * Contains 1 or more TrimVisualizer instances which contain all the data for
     * each trim group within the visualizer.
     * Also provides a mechanism for getting the path to the image displayed
     * by the visualizers image.
     *
     * @author Mims Wright
     *
     * @see visualizerImageStringBuilder
     *
     * @constructor
     * @class Visualizer
     * @extends AbstractModel
     *
     * @param data {VisualizerConfig} Data to be used to initialize the object.
     */

    function Visualizer(data) {
        AbstractModel.call(this);

        this._trimGroups = null;
        this._breakpoint = null;

        this.init(data);
    }

    Visualizer.prototype = new AbstractModel();
    Visualizer.prototype.parent = AbstractModel.prototype;
    Visualizer.prototype.constructor = Visualizer;

    $.extend(Visualizer.prototype, {
        IMAGE_CHANGE: "imageChange",

        /**
         * Initialize with json data.
         *
         * @param data {VisualizerConfig}
         */
        init: function(data) {
            var list = data.visualizerTrimGroups,
                trimGroupData,
                trimGroup,
                i = 0,
                l = list.length;

            var pointBreak = new PointBreak();
            this.setBreakpoint(pointBreak.getCurrentBreakpoint());

            this._disclaimer = data.disclaimer;
            this._trimGroups = new SelectableList([], TrimVisualizer);

            for (; i < l; i++) {
                trimGroupData = list[i];
                trimGroup = new TrimVisualizer(trimGroupData, data.strings);
                this._trimGroups.addItem(trimGroup);
            }

            // select first trim group by default.
            this._trimGroups.selectFirstItem();

        },

        /**
         * Returns the computed url for the image to display for the given slide index / angle.
         *
         * @param slideIndex {int} angle number / index of the image to display.
         * @returns {string} URL computed from a combination of model values.
         * @see visualizerImageStringBuilder
         */
        getImageUrl: function(slideIndex) {
            return visualizerImageStringBuilder.getImagePathForVisualizerState(this, slideIndex);
        },

        /**
         * Returns an alt tag with the composed description of the image.
         *
         * @param slideIndex {int}
         * @return {String}
         */
        getImageAlt: function(slideIndex) {
            return visualizerImageStringBuilder.getAltForVisualizerState(this, slideIndex);
        },

        /**
         * Returns the list of trim groups / TrimVisualizer objects.
         * @returns {SelectableList.<TrimVisualizer>}
         */
        getTrimGroups: function() {
            return this._trimGroups;
        },

        /**
         * Returns the selected trim group object.
         * @returns {TrimVisualizer}
         */
        getSelectedTrimGroup: function() {
            return this.getTrimGroups().getSelectedItem();
        },

        /**
         * Returns the selected trim group's selected swatch group.
         * @returns {SwatchGroup}
         */
        getSelectedSwatchGroup: function() {
            return this.getSelectedTrimGroup().getSelectedSwatchGroup();
        },

        /**
         * Returns the selected trim group's selected swatch group's selected swatch.
         * @returns {Swatch}
         */
        getSelectedSwatch: function() {
            return this.getSelectedSwatchGroup().getSelectedSwatch();
        },

        /**
         * Returns the disclaimer associated with this visualizer (if it exists).
         * @returns {Disclaimer}
         */
        getDisclaimer: function() {
            return this._disclaimer;
        },

        /**
         * Sets the current breakpoint name. E.g. large or small.
         * @param breakpointName {String}
         */
        setBreakpoint: function(breakpointName) {
            this._breakpoint = breakpointName;
        },

        /**
         * Gets the current breakpoint name (used by image buidler)
         * @returns {string}
         * @see visualizerImageStringBuilder
         */
        getBreakpoint: function() {
            return this._breakpoint;
        }
    });

    return Visualizer;
});
