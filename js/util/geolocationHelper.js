define([
    "mvc/Observable",
    "jquery"
], function(
    Observable,
    $
) {

    var QUOVA_URL = "/rest/location",
        REST_URL_MARKET_NAME = "/rest/offers/marketByZip",
        UNKNOWN_ZIP = "00000",
        UNKNOWN_CITY = "Unknown",
        UNKNOWN_REGION = {
            "marketName": UNKNOWN_CITY,
            "marketURL": "",
            "yldURL": UNKNOWN_CITY,
            "marketZip": UNKNOWN_ZIP,
            "radius": "",
            "zip": []
        };

    /**
     * geolocationHelper loads the quova data then returns an API object that
     * let's you access the data after it's loaded.
     *
     * Example:
     * geolocationHelper.on("dataReady", onData);
     * geolocationHelper.fetchData();
     *
     * function onData(api) {
     *      console.log("My zip code is", api.getZip());
     * }
     *
     * @author Mims Wright
     */
    var geolocationHelper = $.extend(new Observable(), {
        DATA_READY: "dataReady",
        ready: false,
        data: null,

        fetchData: function(callback, scope, settingsOverride) {
            this.on(this.DATA_READY, callback, scope);

            var ajaxSettings = {
                dataType: 'json',
                url: QUOVA_URL
            };

            if (typeof settingsOverride !== "undefined") {
                $.extend(ajaxSettings, settingsOverride);
            }

            return $.ajax(ajaxSettings).done($.proxy(this.saveData, this)).error($.proxy(this.saveData, this));
        },

        saveData: function(data) {
            // format / mock data
            this._api.data = {
                "city": "New York",
                "zip": 10010,
                "latitude": 40.715244,
                "longitude": -74.068731
            };

            this._api.data = data.data;
            this.ready = true;
            this.trigger(this.DATA_READY, [this._api]);
        },

        getApi: function(mockData) {
            if (mockData) {
                this._api.data = mockData;
                return this._api;
            }
            if (this.ready) {
                return this._api;
            }
            return null;
        },

        _api: {
            getZip: function() {

                var zip;
                try {
                    zip = this.data.zip.toString();
                    if (!zip || zip === undefined || zip === null || zip === "0") {
                        zip = UNKNOWN_ZIP;
                    }
                } catch (error) {
                    zip = UNKNOWN_ZIP;
                } finally {
                    return zip;
                }
            },

            getCity: function() {
                try {
                    var city = this.data.city.toString();
                    if (!city) {
                        return UNKNOWN_CITY;
                    }
                    return city;
                } catch (error) {
                    return UNKNOWN_CITY;
                }
            },

            getMarketName: function() {
                try {
                    var marketName = this.data.marketName.toString();
                    if (!marketName) {
                        return UNKNOWN_REGION;
                    }
                    return marketName;
                } catch (error) {
                    return UNKNOWN_REGION;
                }
            },

            getMarketDataForZip: function(zip) {

                var ajaxSettings = {
                    dataType: 'json',
                    url: REST_URL_MARKET_NAME + '/' + zip
                };

                return $.ajax(ajaxSettings);
            },

            getMarketData: function() {
                return this.getMarketDataForZip(this.getZip());
            },

            getRegionCodeForZip: function(zip) {
                return this.getMarketDataForZip(zip).marketZip;
            },

            getRegionCode: function() {
                return this.getRegionCodeForZip(this.getZip());
            },

            isMarketDataValid: function(marketData) {
                return marketData.marketZip && marketData.marketZip !== UNKNOWN_ZIP;
            }
        }
    });

    return geolocationHelper;
});
