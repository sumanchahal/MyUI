define(["mvc/AbstractModel"], function(AbstractModel) {

    /**
     * @author mwright
     * @class WallpaperAsset
     * @extends AbstractModel
     *
     * A single wallpaper asset for the downloads section of the Gallery.
     *
     * @param data {JSON} Initialization data.
     *
     * @constructor
     */

    function
    WallpaperAsset(data) {
        AbstractModel.call(this);

        // instance properties
        /**
         * @private
         * @type String
         */
        this._type = "";
        /**
         * @private
         * @type String
         */
        this._url = "";

        /**
         * @private
         * @type String
         */
        this._size = "";

        this.init(data);
    }

    WallpaperAsset.prototype = new AbstractModel();
    WallpaperAsset.prototype.parent = AbstractModel.prototype;
    WallpaperAsset.prototype.constructor = WallpaperAsset;

    $.extend(WallpaperAsset.prototype, {
        // instance methods

        /**
         * Initialize with json data.
         * @param data {JSON}
         */
        init: function(data) {
            if (data) {
                this.setType(data.type);
                this.setUrl(data.imagePath);
                this.setSize(data.size);
            }
        },


        /**
         * Type of image, such as "desktop"
         * @return type {String}
         */
        getType: function() {
            return this._type;
        },
        /**
         * @param type {String}
         */
        setType: function(type) {
            this._type = type;
        },

        /**
         * Path to the Image
         * @return url {String}
         */
        getUrl: function() {
            return this._url;
        },
        /**
         * @param url {String}
         */
        setUrl: function(url) {
            this._url = url;
        },

        /**
         * Size in the form of "WWWxHHH"
         * @return size {String}
         */
        getSize: function() {
            return this._size;
        },
        /**
         * @param size {String}
         */
        setSize: function(size) {
            this._size = size;
        }

    });

    return WallpaperAsset;
});
