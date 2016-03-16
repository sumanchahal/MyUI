define([
    "jquery",
    "mvc/AbstractModel"
], function(
    $,
    AbstractModel
) {

    var DEALER_DETAIL_PATH = "/dealers";

    /**
     * Dealer location data. Also used for map pins.
     *
     * @class Dealer
     * @extends AbstractModel
     * @implements Location
     * @author Mims Wright
     *
     * @method Dealer
     * @param data {DealerConfig} Initialize with the DIS data for a single dealer
     *
     * @prop id {String}
     * @prop name {String}
     * @prop address1 {String}
     * @prop address2 {String}
     * @prop city {String}
     * @prop state {String}
     * @prop zip {ZipCode}
     * @prop phone {Phone}
     * @prop distance {Number}
     * @prop latitude {Number}
     * @prop longitude {Number}
     * @prop hasEliteStatus {Boolean}
     * @prop dealerLink {URL}
     * @prop dealerContactLink {URL}
     * @prop dealerDetailSlug {String}
     * @prop marketName {String}
     *
     * @constructor
     * @public
     */
    var Dealer = function(data) {
        AbstractModel.apply(this, [data.dealerLatitude, data.dealerLongitude]);
        this.init(data);
    };

    Dealer.prototype = new AbstractModel();
    Dealer.prototype.parent = AbstractModel.prototype;
    Dealer.prototype.constructor = Dealer;

    $.extend(Dealer.prototype, {

        /**
         * @method init
         * @param data {DealerConfig}
         * @private
         */
        init: function(data) {

            /** @type {String} */
            this.id = data.id;
            /** @type {Number?} */
            this.distance = data.dealerDistance;

            /** @type {String} */
            this.name = data.dealerName;

            /** @type {DealerAddressConfig} */
            var address = data.dealerAddress;

            if (address) {
                /** @type {String} */
                this.address1 = address.address1;
                /** @type {String} */
                this.address2 = address.address2;
                /** @type {String} */
                this.city = address.city;
                /** @type {String} */
                this.state = address.state;
                /** @type {ZipCode} */
                this.zip = address.zipCode;
            }


            /** @type {Phone} */
            this.setPhone(data.dealerPhone);

            this.setLatitude(data.dealerLatitude);
            this.setLongitude(data.dealerLongitude);


            /** @type {Boolean} */
            this.hasEliteStatus = data.eliteStatus;

            /** @type {URL} */
            this.dealerLink = data.dealerWebUrl;
            /** @type {URL} */
            this.dealerContactLink = data.dealerContactWebUrl;
            /** @type {URL} */
            this.dealerLinkLarge = data.dealerWebUrl;
            /** @type {URL} */
            this.dealerLinkMedium = data.dealerTabletUrl;
            /** @type {URL} */
            this.dealerLinkSmall = data.dealerMobileUrl;

            /** @type {String} */
            this.dealerDetailSlug = data.dealerDetailSlug;

            /** @type {String} */
            this.marketName = data.marketName;
        },

        /**
         * @returns {String}
         * @public
         */
        getName: function() {
            return this.name;
        },

        /**
         * @returns {String}
         * @public
         */
        getId: function() {
            return this.id;
        },

        /**
         * @param latitude {Number}
         */
        setLatitude: function(latitude) {
            if (this.latitude !== latitude) {
                this.latitude = latitude;
            }
        },

        /**
         * @return latitude {Number}
         * @public
         */
        getLatitude: function() {
            return this.latitude;
        },

        /**
         * @param longitude {Number}
         */
        setLongitude: function(longitude) {
            if (this.longitude !== longitude) {
                this.longitude = longitude;
            }
        },

        /**
         * @return longitude {Number}
         * @public
         */
        getLongitude: function() {
            return this.longitude;
        },


        /**
         * @returns {String}
         * @public
         */
        getMarketName: function() {
            return this.marketName;
        },


        /**
         * @returns {Boolean} True if the dealer has elite status.
         * @public
         */
        isElite: function() {
            return this.hasEliteStatus;
        },

        /**
         * @param phone {Phone}
         * @public
         */
        setPhone: function(phone) {
            // reformats phone number.
            if (phone) {
                this.phone = phone.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
            } else {
                this.phone = "";
            }
        },

        /**
         * @return phone {Phone}
         */
        getPhone: function() {
            return this.phone;
        },


        /**
         * Returns the dealer detail page URL for this item.
         *
         * @returns {string}
         */
        getDetailUrl: function() {
            return DEALER_DETAIL_PATH + "/" + this.id + "-" + this.dealerDetailSlug;
        },

        /**
         * Formats the address and phone as HTML.
         * @returns {string} Formatted address String
         */
        getAddressAsHTML: function() {
            var html = '<address>' +
                '<span class="street">' + this.address1 + '</span>' +
                '<span class="city">' + this.city + '</span>, <span class="state">' + this.state + '</span>&nbsp;<span class="zip">' + this.zip + '</span>' +
                '<span class="phone">' + this.phone + '</span>' +
                '</address>';
            return html;
        }
    });

    /**
     * Converts the search results json into an array of Dealer objects.
     * @param searchResults {{data:Array.<DealerConfig>}}
     * @returns {Array.<Dealer>}
     *
     * @static
     * @method
     */

    Dealer.parseSearchResults = function(searchResults) {
        var i = 0,
            l = searchResults.data.length,
            dealerJSON,
            dealer,
            dealers = [];

        for (; i < l; i += 1) {
            dealerJSON = searchResults.data[i];
            dealer = new Dealer(dealerJSON);
            dealers.push(dealer);
        }

        return dealers;
    };

    return Dealer;
});
