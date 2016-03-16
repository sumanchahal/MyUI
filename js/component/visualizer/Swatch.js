define([
    "jquery",
    "component/tabfilter/TabFilterItem"
], function(
    $,
    TabFilterItem
) {

    /**
     * @class Swatch
     * @extends TabFilterItem
     *
     * Model for a single color swatch or wheel swatch in the visualizer.
     *
     * @param data {SwatchConfig} Initialization data.
     * @constructor
     *
     * @see SwatchGroup
     * @see TrimVisualizer
     * @see SwatchViewController
     */

    function Swatch(data, type) { /** LIM 195**/
        TabFilterItem.call(this, data.id, data.name);

        /** @private @prop _currentSlide {int} */
        this._currentSlide = 0;
        /** @private @prop _image {string} */
        this._image = "";
        /** @private @prop _name {string} */
        this._name = "";
        /** LIM 195**/
        /** @private @prop _efcCode {string} */
        this._efcCode = "";
        this._type = "";

        this.init(data, type);
        /** LIM 195 End**/
    }

    Swatch.prototype = new TabFilterItem();
    Swatch.prototype.parent = TabFilterItem.prototype;
    Swatch.prototype.constructor = Swatch;

    $.extend(Swatch.prototype, {

        /**
         * Initialize swatch with starter json data.
         * @data {SwatchConfig}
         */
        init: function(data, type) { /** LIM 195**/
            this._image = data.image.src;
            this._name = data.name;
            this._efcCode = data.efcCode; /** LIM 195**/
            this._type = type; /** LIM 195**/
        },

        /**
         * Returns the image source url for this swatch.
         * @returns {String}
         */
        getImage: function() {
            return this._image;
        },

        /**
         * Return the name of the swatch.
         * @returns {String}
         */
        getName: function() {
            return this._name;
        },
        /** LIM 195**/
        /**
         * Return the EFC code of the swatch.
         * @returns {String}
         */
        getEfcCode: function() {
            return this._efcCode;
        },

        /**
         * Return the EFC code of the swatch.
         * @returns {String}
         */
        getType: function() {
            return this._type;
        }
        /** LIM 195 End**/
    });

    return Swatch;
});
