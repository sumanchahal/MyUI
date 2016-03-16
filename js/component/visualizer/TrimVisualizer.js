define([
    "jquery",
    "component/tabfilter/TabFilter",
    "component/tabfilter/TabFilterItem",
    "mvc/SelectableList",
    "component/visualizer/SwatchGroup"
], function($, TabFilter, TabFilterItem, SelectableList, SwatchGroup) {

    /**
     * Represents a visualizer for a single trim group.
     *
     * @class TrimVisualizer
     * @extends TabFilterItem
     *
     * @constructor
     * @param data {TrimVisualizerConfig} Initialization data.
     * @param strings {SwatchGroupStrings} String constants
     */

    function TrimVisualizer(data, strings) {
        TabFilterItem.call(this, data.id, data.name);

        this.init(data, strings);
    }

    TrimVisualizer.prototype = new TabFilterItem();
    TrimVisualizer.prototype.parent = TabFilterItem.prototype;
    TrimVisualizer.prototype.constructor = TrimVisualizer;

    $.extend(TrimVisualizer.prototype, {

        /**
         * Initialize object with json data.
         *
         * @param data {TrimVisualizerConfig}
         * @param strings {SwatchGroupStrings}
         */
        init: function(data, strings) {
            var listArray = [];
            if (data.exteriorColors.swatches.length > 0) {
                this._exteriorColors = new SwatchGroup(data.exteriorColors, strings.exteriorColors);
                listArray.push(this._exteriorColors);
            }
            if (data.interiorColors.swatches.length > 0) {
                this._interiorColors = new SwatchGroup(data.interiorColors, strings.interiorColors);
                listArray.push(this._interiorColors);
            }
            if (data.wheels.swatches.length > 0) {
                this._wheels = new SwatchGroup(data.wheels, strings.wheels);
                listArray.push(this._wheels);
            }

            this._exteriorAngle = 0;
            this._interiorAngle = 0;

            this._year = data.year;
            this._seriesName = data.seriesName;
            this._trimName = data.name;
            this._displayName = data.displayName;
            console.log(data.interiorColors);
            this._swatchGroups = new SelectableList(listArray, SwatchGroup);
            this._swatchGroups.selectFirstItem();
        },

        /**
         * Return the model year for this vehicle series
         *
         * @returns {string|int}
         */
        getYear: function() {
            return this._year;
        },

        /**
         * Returns the vehicle series
         *
         * @returns {string}
         */
        getSeriesName: function() {
            return this._seriesName;
        },

        /**
         * Returns the trim group display name
         *
         * @returns {string}
         */
        getDisplayName: function() {
            return this._displayName;
        },

        /**
         * Alias to getTrimName.
         * @returns {string}
         */
        getLabel: function() {
            return this.getDisplayName();
        },

        /**
         * Gets the name of the trim group.
         *
         * @returns {string}
         */
        getTrimName: function() {
            return this._trimName;
        },

        /**
         *
         * @returns {SelectableList.<SwatchGroup>}
         */
        getSwatchGroups: function() {
            return this._swatchGroups;
        },

        /**
         * Returns the exterior swatch group.
         * @returns {SwatchGroup}
         */
        getExteriorColors: function() {
            return this._exteriorColors;
        },

        /**
         * Returns the interior swatch group.
         * @returns {SwatchGroup}
         */
        getInteriorColors: function() {
            return this._interiorColors;
        },

        /**
         * Returns the wheels swatch group.
         * @returns {SwatchGroup}
         */
        getWheels: function() {
            return this._wheels;
        },

        /**
         * Returns the currently selected swatch group.
         * @returns {SwatchGroup|null}
         */
        getSelectedSwatchGroup: function() {
            return this.getSwatchGroups().getSelectedItem();
        },

        /**
         * Returns the currently selected swatch in the currently selected swatch group.
         * @returns {Swatch}
         */
        getSelectedSwatch: function() {
            return this.getSelectedSwatchGroup.getSelectedSwatch();
        },

        /**
         * Returns true if exterior or wheels are selected.
         * @returns {boolean}
         */
        isExteriorSelected: function() {
            var swatches = this.getSelectedSwatchGroup();
            return (swatches === this.getExteriorColors() || swatches === this.getWheels());
        },


        /**
         * Returns the currentAngle for the selected swatchgroup.
         * @returns {int}
         */
        getCurrentAngle: function() {
            return this.isExteriorSelected() ? this._exteriorAngle : this._interiorAngle;
        },

        /**
         * Sets the currentAngle for the selected swatchgroup.
         * @param angle {int}
         */
        setCurrentAngle: function(angle) {
            if (this.isExteriorSelected()) {
                this._exteriorAngle = angle;
            } else {
                this._interiorAngle = angle;
            }
        },


        /**
         * Returns the number of angles for the currently selected swatch group.
         * @returns {int}
         */
        getCurrentNumberOfAngles: function() {
            return this.isExteriorSelected() ? this._exteriorColors.getNumberOfAngles() : this._interiorColors.getNumberOfAngles();
        }

    });

    return TrimVisualizer;
});
