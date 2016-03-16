define(["component/ThirdPartyInterstitial"], function (ThirdPartyInterstitial) {
    var interstitial = null;
    var whitelistedUrls = ["lexus.com","toyota.com","instagram.com/lexususa","lexusnavigation.com","luxuryawaits.com","twitter.com/lexus","facebook.com/lexus","lexus-global.com","lexusdrivers.com","lexusenformappsuite.com","lexusfinancial.com","lstudio.com","toyota-global.com","plus.google.com","yourlexusdealer.com","youtube.com/LexusVehicles","lexusenformappsuite.com","tmm.taleo.net","evidon.com","aboutads.info/choices","ghostery.com/en","exponential.com/our-company/privacy"];

    module("Third Party Interstitial", {
        setup: function () {

            interstitial = new ThirdPartyInterstitial();
            interstitial.setWhitelist(whitelistedUrls);
        },
        teardown: function() {
            interstitial = null;
        }
    });

    test("whitelisted Link detection", function () {
        // white-list detection
        equal(interstitial.isLinkWhitelisted("http://lexus.com", whitelistedUrls), true, "Lexus.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://ford.com", whitelistedUrls), false, "ford.com is not whitelisted.");
        equal(interstitial.isLinkWhitelisted("lexus.com", whitelistedUrls), true, "doesn't require absolute url");

        // White-listed urls
        equal(interstitial.isLinkWhitelisted("http://lexus.com", whitelistedUrls), true, "Lexus.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("https://lexus.com", whitelistedUrls), true, "secure Lexus.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://toyota.com", whitelistedUrls), true, "toyota.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://instagram.com/lexususa", whitelistedUrls), true, "instagram is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexusnavigation.com", whitelistedUrls), true, "lexusnavigation.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://luxuryawaits.com", whitelistedUrls), true, "luxuryawaits.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://twitter.com/lexus", whitelistedUrls), true, "twitter.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://facebook.com/lexus", whitelistedUrls), true, "facebook.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexus-global.com", whitelistedUrls), true, "lexus-global.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexusdrivers.com", whitelistedUrls), true, "lexusdrivers.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexusenformappsuite.com", whitelistedUrls), true, "lexusenformappsuite.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexusfinancial.com", whitelistedUrls), true, "lexusfinancial.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lstudio.com", whitelistedUrls), true, "lstudio.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://toyota-global.com", whitelistedUrls), true, "toyota-global.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://yourlexusdealer.com", whitelistedUrls), true, "yourlexusdealer.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://youtube.com/LexusVehicles", whitelistedUrls), true, "youtube.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lstudio.com", whitelistedUrls), true, "lstudio.com is whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexusenformappsuite.com", whitelistedUrls), true, "lexusenformappsuite.com is whitelisted");

        // not whitelisted
        equal(interstitial.isLinkWhitelisted("http://twitter.com/", whitelistedUrls), false, "twitter.com i not whitelisted if it's not the lexus account");
        equal(interstitial.isLinkWhitelisted("http://cnn.com", whitelistedUrls), false, "cnn.com is not whitelisted");
        equal(interstitial.isLinkWhitelisted("http://lexus.org", whitelistedUrls), false, "lexus.org is not whitelisted");
    });

    test("isOutboundLink", function() {
        equal(interstitial.isOutboundLink("http://lexus.com"), false, "lexus.com is internal");
        equal(interstitial.isOutboundLink("http://lexus.com/models/is/technology"), false, "lexus.com subpaths are internal");
        equal(interstitial.isOutboundLink("http://lexus.com/foo"), false, "lexus.com arbitrary path is internal");
        equal(interstitial.isOutboundLink("http://www.lexus.com"), false, "www.lexus.com is internal");
        equal(interstitial.isOutboundLink("https://www.lexus.com"), false, "https is internal");

        equal(interstitial.isOutboundLink("https://www.lexus.org"), true, "external");
        equal(interstitial.isOutboundLink("http://www.facebook.com"), true, "external");
        equal(interstitial.isOutboundLink("http://lstudio.com"), true, "external");
        equal(interstitial.isOutboundLink("http://toyota.com"), true, "external");
    });

    test("Absolute URL detection", function () {
        equal(interstitial.isUrlAbsolute("/dealers"), false, "/dealers is not an absolute link");
        equal(interstitial.isUrlAbsolute("http://www.lexus.com"), true, "http://lexus.com is an absolute link");
        equal(interstitial.isUrlAbsolute("https://www.lexus.com"), true, "https://lexus.com is an absolute link");
    });
});