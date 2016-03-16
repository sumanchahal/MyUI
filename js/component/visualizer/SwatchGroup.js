define([
    "jquery",
    "mvc/AbstractModel",
    "mvc/SelectableList",
    "component/tabfilter/TabFilterItem",
    "component/visualizer/Swatch"
], function(
    $,
    AbstractModel,
    SelectableList,
    TabFilterItem,
    Swatch
) {

    /**
     * @class SwatchGroup
     * @extends TabFilterItem
     *
     * Model representing a group of swatches. The group has a title like "external" or "Wheels".
     *
     * @param data {SwatchGroupConfig} Initialization data.
     * @param strings {SwatchGroupStrings} Static string constants for this swatch group.
     * @constructor
     */

    function SwatchGroup(data, strings) {
        TabFilterItem.call(this, strings.title);

        this._selectText = strings.selectText;
        this._title = strings.title;

        this.init(data, strings.title); /** LIM 195**/
    }

    SwatchGroup.prototype = new TabFilterItem();
    SwatchGroup.prototype.parent = TabFilterItem.prototype;
    SwatchGroup.prototype.constructor = SwatchGroup;

    $.extend(SwatchGroup.prototype, {

        /**
         * Initializes swatch group with json data.
         *
         * @param data {SwatchGroupConfig}
         */
        init: function(data, title) { /** LIM 195**/
            this._numberOfAngles = data.numberOfAngles;

            var swatchesJSON = data.swatches,
                l = swatchesJSON.length,
                i = 0,
                swatch;

            this._swatches = new SelectableList([], Swatch);

            for (; i < l; i++) {
                swatch = new Swatch(swatchesJSON[i], title); /** LIM 195**/
                this._swatches.addItem(swatch);
            }

            this._swatches.selectFirstItem();
        },

        /**
         * The title of the swatch group.
         * @returns {string}
         */
        getTitle: function() {
            return this._title;
        },

        /**
         * Number of carousel items for this swatch group.
         * @returns {int}
         */
        getNumberOfAngles: function() {
            return this._numberOfAngles;
        },

        /**
         * Returns the list of swatches in this group.
         *
         * @returns {SelectableList.<Swatch>}
         */
        getSwatches: function() {
            return this._swatches;
        },

        /**
         * Returns the currently selected swatch.
         *
         * @returns {Swatch}
         */
        getSelectedSwatch: function() {
            return this.getSwatches().getSelectedItem();
        }
    });

    return SwatchGroup;
});
