define([
        "util/pointrollUtil",
        "util/geolocationHelper",
        "jquery"
    ],
    function(
        pointroll,
        geo,
        $
    ) {

        /**
         * A controller for the special offer tile on the homepage.
         * @exports "page/home/specialOfferTile"
         * @class specialOfferTile
         */
        return {
            /**
             * @property image {jquery}
             * @private
             */
            image: null,

            /**
             * @property apr {number}
             * @private
             */
            apr: 0,

            /**
             * Initializes the special offer pointroll tile.
             *
             * @method initSpecialOfferTile
             * @param $tile {jquery} - A pointer to the tile element.
             */
            initSpecialOfferTile: function($tile) {
                // ensure that it's a jquery object.
                this.$tile = $($tile);
                if (this.$tile.hasClass("mboxTile")) {
                    return;
                }
                // fetch data from quova.
                geo.fetchData(this._onDataReady, this);
            },

            _onDataReady: function(geoApi) {
                if (this.$tile.hasClass("mboxTile")) {
                    return;
                }
                var description = this.$tile.find(".description");
                this.image = this.$tile.find("img.background")[0];
                var _self = this;
                var marketName = geoApi.getMarketName();

                if (typeof marketName === "object") {
                    marketName = marketName.marketName;
                }

                if (typeof marketName === "string") {
                    if (marketName !== "" && marketName !== "Unknown") {
                        description.text(marketName + " area");
                    }
                }
                //                else {
                // By default, use the description from the cms.
                //                }

                pointroll.fetchDataForMarket(marketName)
                    .done($.proxy(this._updateView, this))
                    .fail(function(request, status, error) {
                        var $img = $(_self.image);
                        $img.attr("src", $img.data("square-src"));
                        $img.load(_self._loadImage);
                        // use default description and text from CMS.
                    });
            },

            /**
             * applies the APR data to the tile
             *
             * @private
             * @method _updateView
             * @param data {jqXHR} - Data returned from pointroll.
             */
            _updateView: function(data) {
                if (this.$tile.hasClass("mboxTile")) {
                    return;
                }
                var apr = pointroll.findLowestAPR(data),
                    aprImagePath,
                    $img = $(this.image);

                // check that APR is valid.
                if (apr >= 0 && apr < 100 && !isNaN(apr)) {
                    aprImagePath = $(this.image).data("aprSrc");

                    var IMG_URL = aprImagePath + apr + ".png";

                    $img.data("squareSrc", IMG_URL);
                    $img.attr('src', IMG_URL);
                    $img.attr('alt', apr + "% APR");

                } else {
                    // if not, use what was defined in the CMS (default image)
                    $img.attr("src", $img.data("square-src"));
                }
                $img.load(this._loadImage);
            },

            _loadImage: function() {
                var $img = $(this);
                if (!Modernizr.cssanimations) {
                    $img.parent(".tile").animate({
                        opacity: 1
                    }, 1000);
                    // if css3 animations are supported add a class to set opacity: 1
                } else {
                    $img.parent(".tile").addClass('loaded');
                }
                // used by tile-video to make sure video doesnt play before image loads.
                $img.parent(".tile").addClass('img-loaded');
            }
        };
    });
