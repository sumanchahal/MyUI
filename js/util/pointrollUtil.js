define(["jquery"], function($) {

    var APR_SEARCH = /APR/;

    /**
     * Provides a streamlined interface for communicating with the Pointroll API
     * which provides local offers.
     *
     * @class pointrollUtil
     * @exports util/pointrollUtil
     * @author Mims H. Wright
     */
    var exports = {
        pointRollURLBase: '/rest/offers',
        data: null,

        /**
         * Returns the parameterized URL for the pointroll request.
         *
         * @method getURL
         * @param marketName {String} A market name from the zipBank (see geolocationHelper)
         */
        getURL: function(marketName) {
            return this.pointRollURLBase + "/" + marketName + "/lowestAPR";
        },

        /**
         * Request the pointroll data for a market.
         *
         * @method fetchDataForMarket
         * @param {String} marketName - The market name from zipbank.
         * @return {jqXHR} A promise for returning the offer data.
         */
        fetchDataForMarket: function(marketName) {
            return $.ajax({
                dataType: 'json',
                url: this.getURL(marketName)
            });
        },

        /**
         * Returns the lowest APR returned from the offers service
         *
         * @method findLowestAPR
         * @param {JSON} data - The results from pointroll.
         * @returns {number} The lowest APR value for the requested market
         */
        findLowestAPR: function(data) {
            // To begin, lowest offer is Infinity.
            // i.e. every real offer is less than it.
            var lowestAPR = Infinity;

            if (data.status === 200 && typeof data.data === "number" && data.data >= 0) {
                lowestAPR = data.data;
            }

            return lowestAPR;
        }
    };

    return exports;
});
