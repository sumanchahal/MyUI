define(["util/stringUtil", "mvc/List", "mvc/SelectableListItem", "component/gallery/WallpaperAsset", "component/gallery/GalleryItemType"], function(stringUtil, List, SelectableListItem, WallpaperAsset, GalleryItemType) {

    var VIDEO_PLAYER_PATH = "/video/video?bctid=";

    /**
     * A single item in a gallery.
     *
     * @class GalleryItem
     * @extends SelectableListItem
     *
     * @constructor
     * @param json {json}
     */
    var GalleryItem = function(json) {
        var id = json.id;

        SelectableListItem.call(this, id);

        this.init(json);
    };

    GalleryItem.prototype = new SelectableListItem();
    GalleryItem.prototype.parent = SelectableListItem.prototype;
    GalleryItem.prototype.constructor = GalleryItem;

    $.extend(GalleryItem.prototype, {

        /**
         * Initialize with json data from the webapp.
         *
         * @param json {json}
         */
        init: function(json) {

            /** @type {SocialContent} */
            var socialJSON;

            // set the share metadata based on its location in the model.
            if (json.social) {
                socialJSON = json.social;
            } else if (json.overlay && json.overlay.social) {
                socialJSON = json.overlay.social;
            } else {
                socialJSON = {};
            }

            // search for values in the overlay object
            if (json.overlay) {
                json.title = json.overlay.title;
                json.subTitle = json.overlay.marketingHeadline;
                json.description = json.overlay.description;
            }

            // Selectively copy values from json into this object.
            $.extend(this, {
                "type": json.tileType || json.featureTileType,
                "category": json.tileCategory,
                "thumbnail": {
                    "src": json.thumbImage.src,
                    "title": json.thumbImage.title
                },
                "fullsize": {
                    "src": json.fullImage.src,
                    "title": json.fullImage.title
                },
                "video": {
                    "id": json.video
                },
                "interactive": {
                    "url": json.interactiveUrl,
                    "mobileImage": {
                        "src": json.imageSmall ? json.imageSmall.src : "",
                        "title": json.imageSmall ? json.imageSmall.title : ""
                    }
                },
                "titleAllCaps": stringUtil.wrapHybridHWithLowercaseSpan(json.title),
                "title": json.title,
                "subtitle": json.subTitle,
                "description": json.description,
                "disclaimer": {
                    "id": "1",
                    "text": json.disclaimer
                },
                "social": socialJSON,
                "shareURL": socialJSON.shareUrl,
                "touts": json.touts,
                "dealerLink": json.dealerLink,
                "overlay": json.overlay,
                "dealerCode": json.dealerCode,
                "dealerZipCode": json.dealerZipCode,
                "dealerName": json.dealerName
            });

            if (json.downloadContent) {
                this.wallpaperAssets = new List(null, WallpaperAsset);

                var i = 0,
                    l = json.downloadContent.length,
                    wallpaperAsset;
                for (; i < l; i += 1) {
                    wallpaperAsset = new WallpaperAsset(json.downloadContent[i]);
                    this.wallpaperAssets.addItem(wallpaperAsset);
                }
            }
        },

        isVideo: function() {
            return this.type.toLowerCase() === GalleryItemType.VIDEO;
        },

        isInteractive: function() {
            return this.type.toLowerCase() === GalleryItemType.INTERACTIVE || this.type.toLowerCase() === GalleryItemType.HERO_INTERACTIVE;
        },

        getVideoPath: function() {
            return VIDEO_PLAYER_PATH + this.video.id;
        },

        getGalleryItemType: function() {
            return this.category;
        },


        /**
         * Returns the path to the content to show in the iFrame for this item if any exists.
         * @returns {String|null}
         */
        getIFramePath: function() {
            if (this.isVideo()) {

                return this.getVideoPath();

            } else if (this.isInteractive()) {

                return this.interactive.url;
            }
            return null;
        }
    });

    return GalleryItem;
});
