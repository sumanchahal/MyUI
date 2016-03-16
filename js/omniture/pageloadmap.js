define(["omniture/tagmap"], function(tagmap) {

    /**
     * A mapping of page ids to tag ids.
     * These are used by the analytics-helper to call
     *
     * @type {Object}
     *
     * @see analyticsHelper#firePageLoad()
     */
    return {
        "overview": tagmap.MODEL_LOAD,
        "accessories": tagmap.MODEL_LOAD,
        "key-features": tagmap.MODEL_LOAD,
        "feature-category": tagmap.MODEL_LOAD,
        "gallery": tagmap.MODEL_GALLERY_LOAD,
        "packages": tagmap.MODEL_PACKAGES_LOAD,
        "performance": tagmap.MODEL_PERFORMANCE_LOAD,
        "owner-benefits": tagmap.OWNERSHIP_OWNER_BENEFITS_LOAD,
        "select-trim": tagmap.COMPARE_SELECT_STYLE_LOAD,

        // Lead formsead
        "newsletter": tagmap.LEAD_FORM_SIGN_UP_FOR_NEWS_LOAD,
        "brochure": tagmap.LEAD_FORM_REQUEST_A_BROCHURE_LOAD,
        "upcoming": tagmap.LEAD_FORM_FUTURE_VEHICLE_NEWS_LOAD,

        "financing": tagmap.CPO_PAGE_LOAD,
        "certificate-warranty": tagmap.CPO_PAGE_LOAD,
        "compare": tagmap.CPO_PAGE_LOAD,
        "cpo-overview": tagmap.CPO_PAGE_LOAD,
        "inventory": tagmap.CPO_PAGE_LOAD,

        // For testing only
        "qunit": tagmap.QUNIT

        // Loading tags that are implemented manually in analytics-helper.js
        // "home": tagmap.HOME_PAGE_LOAD,
        // "dealer-locator": tagmap.FIND_A_DEALER_SEARCH_LOAD,
        // "specifications": tagmap.MODEL_SPECS_LOAD,
        // "all-models": tagmap.ALL_MODELS_SHOWCASE_LOAD,
        // "landing": tagmap.COMPARE_SELECT_MODEL_LOAD,
        // "current-offers": tagmap.MODEL_SECTION_CURRENT_OFFERS_LOAD,
        // "details": tagmap.FIND_A_DEALER_DEALER_DETAIL_LOAD,
        // "select-competitor": tagmap.COMPARE_SELECT_COMPETITOR_LOAD,
        // "side-by-side": tagmap.COMPARE_RESULTS_SIDE_BY_SIDE_LOAD,

    };
});
