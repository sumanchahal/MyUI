/**
 * Created by jsemko on 2/3/15.
 */
define(['jquery', 'omniture/analytics-helper'], function($, Analytics) {

    LEXUS = LEXUS || {};
    LEXUS.CategoryPage = (function() {

        var $category = $("#model-category-container"),
            page = $("body").data("page"),
            COMPARE_TAG = "2538.2";

        //Page Load
        Analytics.modelShowCasePageLoad(page);

        //compare button
        $category.find('.compare-btn').click(function(e) {

            fireTag(COMPARE_TAG, {
                "<container>": "Model Showcase"
            });

        });

        // Model links from Model Flyout AND Category pages
        $category.find(".navModel").click(function(e) {

            var label, model;

            if (e.target.className === 'asterisk') {
                return;
            }

            model = e.target.getAttribute("data-model") || $(e.target).closest("a").data("model") || "Model data not found";

            Analytics.modelShowCaseClick(page, "Vehicle Click", "", model.toUpperCase().replace("-", " "));
        });

        function sendTo(e, url) {

            var label, model;

            e.preventDefault();
            e.stopPropagation();

            label = e.target.getAttribute("data-label") || "Label not found";
            model = e.target.getAttribute("data-model") || "Model data not found";

            label = /build/gi.test(label) ? "Build Your Lexus" : label;

            Analytics.modelShowCaseClick(page, "CTA Click", label, model.toUpperCase().replace("-", " "));

            window.location.href = url;
        }

        return {
            sendTo: sendTo
        };
    }());

});
