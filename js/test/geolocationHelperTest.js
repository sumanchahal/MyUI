define(["jquery", "util/geolocationHelper"], function($, geolocationHelper) {
    module("geolocationHelper");

    test("Dependencies loaded", function() {
        ok(geolocationHelper, "geolocationHelper is loaded.");
    });

    test("zip and market data (using mock data)", function () {

        // get an geolocation API object pre-populated with mock data.
        var api = geolocationHelper.getApi({
                "city": "Los Angeles",
                "zip": 90048,
                "latitude": 123,
                "longitude": 123,
                "marketName": "Los Angeles Area"
        });
        var zip = api.getZip();
        equal(zip.length, 5, "Zip code returned is 5 digits");

        var marketName = api.getMarketName();
        equal(api.getMarketName(), "Los Angeles Area", "getMarketName()");
    });

    test("unkown zipcode", function () {
        // get an geolocation API object pre-populated with bad mock data.
        var api = geolocationHelper.getApi({
                "city": null,
                "zip": 0,
                "latitude": null,
                "longitude": null
            });
        var zip = api.getZip();
        equal(zip, "00000", "Unknown zip is 00000");
        equal(api.getCity(), "Unknown", "Unknown city is 'unknown'");
    });
});
