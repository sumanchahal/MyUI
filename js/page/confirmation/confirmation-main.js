/**
 * @author Mims Wright
 */
require(["jquery", "analytics", "util/cookie"], function($, analytics, cookie) {
    init();

    /**
     * Initializes confirmation page.
     * @private
     */

    function init() {
        fireConfirmationAnalytics();
        initLink();
    }

    /**
     * Fires the tag for the confirmation page based on cookie data from the form page.
     * @private
     */

    function fireConfirmationAnalytics() {
        // Sanitize data-section
        var rawData = cookie.get(cookie.key.LEAD_FORM_DATA_ANALYTICS_COOKIE);
        if (rawData) {
            var analyticsData = JSON.parse(decodeURI(rawData));
            analytics.helper.fireLeadFormConfirmationLoad(analyticsData);
            cookie.set(cookie.key.LEAD_FORM_DATA_ANALYTICS_COOKIE, "");
        }
    }

    /**
     * Sets up the link button to fire analytics tag when the user clicks.
     * @private
     */

    function initLink() {
        // Fire analytics tag when user clicks on the link.
        $("#confirmationLink").on("click touch", function() {
            //LRT-8072 Remove tag on close button submission form confirmation
            //            analytics.helper.fireLeadFormConfirmationLinkClick();
            window.close();
        });
    }
});
