/**
 * @file Behaviors for the compare landing
 */
define([
    "page/compare/landing/ModelListing",
    "PointBreak",
    "analytics"
], function(
    ModelListing,
    PointBreak,
    analytics
) {

    var pointbreak = new PointBreak();
    pointbreak.breakpoints.small = 700;

    /**
     * Kicks off the page-level logic
     */

    function init() {
        setupModelListing();
        initAnalytics();
    }

    /**
     * Displays all models. Renders in accordion for mobile
     * where the user can select a trim.
     */

    function setupModelListing() {
        var modelListing = new ModelListing({
            pointbreak: pointbreak
        });
    }

    function initAnalytics() {
        analytics.helper.fireCompareSelectModelLoad();
    }

    init();
});
