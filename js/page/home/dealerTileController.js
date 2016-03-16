define(["util/geolocationHelper", "jquery"], function(geo, $) {
    return {

        /**
         * Initializes the dealer tile.
         *
         * @param tile{jquery|HTMLElement} A pointer to the tile element.
         * @author mwright
         */
        initDealerTile: function(tile) {
            this.$tile = $(tile);
            this.$description = this.$tile.find(".description");

            geo.fetchData(this._onDataReady, this);
        },

        _onDataReady: function(geoApi) {
            var marketName = geoApi.getMarketName();

            if (typeof marketName === "string" && marketName !== "") {
                this.$description.text(marketName + " area");
            } else {
                this.$description.text("In your area");
            }
        }
    };
});
