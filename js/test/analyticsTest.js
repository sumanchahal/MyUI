/* global fireTag */

define(["analytics", "PointBreak"], function (analytics, PointBreak) {

    module ("TMS Analytics framework");

    test ("Dependencies", function () {
        ok (fireTag, "fireTag() is defined in the global namespace.");
        ok (analytics.framework.fireTag, "fireTag() is defined in the TMS framework namespace.");
        ok (analytics.framework.cod, "cod is loaded.");
        ok (analytics.framework.tmsomnixd, "tmsomnixd is loaded.");
        ok (analytics.framework.s_code, "s_code is loaded.");
        ok (analytics.framework.s, "s is loaded.");
        ok (analytics.framework.tags, "configuration json is loaded.");
        ok (analytics.tagmap, "tagmap is loaded.");
        ok (analytics.global, "global is loaded.");
        ok (analytics.helper, "analytics helper loaded.");
    });

    test("globals", function () {
        var global = analytics.global;

        // NOTE: these values are defined in the  body tag of test html file, js/test/index.html
        equal (global["<section>"], "unit tests", "<section> is defined globally via the dom");
        equal (global["<subsection>"], "qunit", "<subsection> is defined globally via the dom");
        equal (global["<page>"], "analyticsTest", "<page> is defined globally via the dom");

        ok (global["<break_point>"], "<break_point> is defined globally");
        ok (global["<orientation>"], "<orientation> is defined globally");

        var orientation,
            pointBreak = new PointBreak();

        if (window.innerWidth < window.innerHeight) {
            orientation = "portrait";
        } else {
            orientation = "landscape";
        }
        equal(global["<orientation>"], orientation, "orientation is correct.");
        equal(global["<break_point>"], pointBreak.getCurrentBreakpoint(), "break_point is correct.");
    });

    module("Analytics helper");
    var helper = analytics.helper;
    var QUNIT_TAG = "0000.0";

    test ("tagmap", function () {
        equal (analytics.tagmap.QUNIT, QUNIT_TAG, "Tagmap works.");
        equal (analytics.tagmap.HOME_PAGE_ALERT_MESSAGE_CLICK, "2537.3", "Tagmap has english tag ids");
        equal (analytics.tagmap["MS:3.1"],"2545.1", "Tagmap has annotation tag ids");
    });

    test ("Analytics helper functions", function () {

        ok(helper.fireTag, "helper has reference to fireTag()");

        equal(helper.getTagForPageLoad("qunit"), QUNIT_TAG, "getTagForPageLoad() returns a reference to the tag id that's mapped to a page id.");

        equal (helper.firePageLoad("qunit"), QUNIT_TAG, "firePageLoad() fires a tag based on a mapping of page ids to tags.");
        equal (helper.firePageLoad("bogus"), null, "firePageLoad() fails silently and returns null if there is no mapping.");


    });

    test("homepage", function () {
        ok (helper.fireHomepageTileClick("tile text", "3x3", "1x1", "2x2"), "fireHomepageTileClick()");
        ok(helper.fireHomepageAlertClick, "fireHomepageAlertClick()");
        equal(helper.fireHomepageAlertClick.length, 2, "fireHomepageAlertClick() Takes one argument.");
    });


    test ("backToTop", function () {
       ok(helper.fireBackToTopClick, "Back to top event");
       equal(helper.fireBackToTopClick.length, 0, "Back to top takes no args");
    });
});
