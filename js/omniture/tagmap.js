/**
 * Mapping of tag ids to human readable titles or their PPT IDs
 */
define([], function() {

    /**
     * Tag map.
     *
     * @example tagmap.HOME_PAGE_LOAD == "2537.1"
     * @example tagmap["AM:1.2"] == "2539.2"
     *
     * @readonly
     * @enum {string}
     */
    return {
        // CLICK TAGS
        "GLOBAL_ELEMENT_HEADER_FOOTER_MODEL_FLYOUT_CLICK": "2538.1",
        "GLOBAL_ELEMENT_COMPARE_BUTTON_CLICK": "2538.2",
        "GLOBAL_ELEMENT_BUILD_YOURS_BUTTON_CLICK": "2538.3",
        "GLOBAL_ELEMENT_FIND_A_DEALER_BUTTON_CLICK": "2538.4",
        "GLOBAL_ELEMENT_FIND_THIS_LEXUS_BUTTON_CLICK": "2538.5",
        "GLOBAL_ELEMENT_BACK_TO_TOP_CLICK": "2538.6",
        "GLOBAL_ELEMENT_SHARE_CLICK": "2538.7",
        "GLOBAL_ELEMENT_LEGAL_DISCLOSURES_CLICK": "2538.8",
        "GLOBAL_ELEMENT_SECONDARY_NAV_CLICK": "2538.9",
        "GLOBAL_ELEMENT_TERTIARY_NAV_CLICK": "2538.11",
        "GLOBAL_ELEMENT_ACCOLADES_MODULE_CLICK": "2538.12",
        "HOME_PAGE_TILE_CLICK": "2537.2",
        "HOME_PAGE_ALERT_MESSAGE_CLICK": "2537.3",
        "HOME_PAGE_RECENTBUILD_EXISTS": "2537.4",
        "ALL_MODELS_CHANGE_VIEW_CLICK": "2539.2",
        "ALL_MODELS_LEARN_MORE_DETAILS_CLICK": "2539.3",
        "MODEL_SECTION_MODULE_ACTION_MS12_CLICK": "2540.2",
        "MODEL_SECTION_VISUALIZER_CLICK": "2540.3",
        "MODEL_SECTION_GALLERY_MODULE_CLICK": "2542.1",
        "MODEL_SECTION_GALLERY_OVERLAY_ACTION_CLICK": "2542.3",
        "MODEL_SECTION_GALLERY_WALLPAPER_DOWNLOAD_CLICK": "2542.4",
        "MODEL_SECTION_FEATURES_OVERLAY_CLICK": "2545.2",
        "MODEL_SECTION_MODULE_ACTION_MS33_CLICK": "2545.3",
        "CURRENT_OFFERS_SEARCH_SUBMIT_CLICK": "2546.2",
        "CURRENT_OFFERS_ACTION_CLICK": "2546.3",
        "FIND_A_DEALER_SEARCH_SUBMIT_CLICK": "2550.1",
        "FIND_A_DEALER_MODULE_ACTION_CLICK": "2550.3",
        "FIND_A_DEALER_UTILITY_LINKS_CLICK": "2550.8",
        "FIND_A_DEALER_MODULE_LINKS_CLICK": "2550.9",
        "FIND_A_DEALER_DEALER_DETAIL_SHARE_CLICK": "2550.11",
        "FIND_A_DEALER_DEALER_OVERLAY_CLICK": "2550.12",
        "FIND_A_DEALER_MORE_DEALERS_CLICK": "2550.13",
        "COMPARE_SELECT_MODEL_CLICK": "2551.2",
        "COMPARE_SELECT_STYLE_CLICK": "2551.4",
        "COMPARE_ADD_VEHICLE_CLICK": "2551.6",
        "COMPARE_SELECT_COMPETITOR_CLICK": "2551.7",
        "COMPARE_RESULTS_LINK_CLICK": "2551.9",
        "COMPARE_RESULTS_UTILITY_NAV_CLICK": "2551.11",
        "OWNERSHIP_OWNER_BENEFITS_TILES_CLICK": "2552.2",
        "OWNERSHIP_OWNER_BENEFITS_ACCOLADES_CLICK": "2552.3",
        "THIRD_PARTY_INTERSTITIAL_CLICK": "2553.2",
        "MODEL_CATEGORY_CLICK": "2583.2",

        // LEAD FORMS
        "LEAD_FORM_SIGN_UP_FOR_NEWS_LOAD": "2570.1",
        "LEAD_FORM_REQUEST_A_BROCHURE_LOAD": "2570.2",
        "LEAD_FORM_FUTURE_VEHICLE_NEWS_LOAD": "2570.3",
        "LEAD_FORM_SIGN_UP_FOR_NEWS_CONFIRMATION_LOAD": "2571.1",
        "LEAD_FORM_REQUEST_A_BROCHURE_CONFIRMATION_LOAD": "2571.2",
        "LEAD_FORM_FUTURE_VEHICLE_NEWS_CONFIRMATION_LOAD": "2571.3",
        "LEAD_FORM_CONFIRMATION_LINK_CLICK": "2571.4",
        "LEAD_FORM_VALIDATION_ERROR_MESSAGE": "2572.1",
        "LEAD_FORM_ZIPCODE_ERROR_MESSAGE": "2572.2",

        // LOAD TAGS
        "HOME_PAGE_LOAD": "2537.1",
        "ALL_MODELS_SHOWCASE_LOAD": "2539.1",
        "MODEL_LOAD": "2540.1",
        "MODEL_SECTION_SECTION_PAGES_LOAD": "2540.1",
        "MODEL_GALLERY_LOAD": "2540.1",
        "MODEL_PACKAGES_LOAD": "2540.1",
        "MODEL_PERFORMANCE_LOAD": "2540.1",
        "MODEL_SPECS_LOAD": "2540.1",
        "MODEL_SECTION_GALLERY_OVERLAY_LOAD": "2542.2",
        "MODEL_SECTION_FEATURES_OVERLAY_LOAD": "2545.1",
        "MODEL_SECTION_CURRENT_OFFERS_LOAD": "2546.1",
        "FIND_A_DEALER_ERROR_PAGE_LOAD": "2550.2",
        "FIND_A_DEALER_SEARCH_LOAD": "2550.4",
        "FIND_A_DEALER_SEARCH_RESULTS_LOAD": "2550.5",
        "FIND_A_DEALER_DEALER_DETAIL_LOAD": "2550.6",
        "FIND_A_DEALER_DEALER_OVERLAY_LOAD": "2550.7",
        "COMPARE_SELECT_MODEL_LOAD": "2551.1",
        "COMPARE_SELECT_STYLE_LOAD": "2551.3",
        "COMPARE_SELECT_COMPETITOR_LOAD": "2551.5",
        "COMPARE_RESULTS_SIDE_BY_SIDE_LOAD": "2551.8",
        "OWNERSHIP_OWNER_BENEFITS_LOAD": "2552.1",
        "THIRD_PARTY_INTERSTITIAL_LOAD": "2553.1",
        "MODEL_CATEGORY_LOAD": "2583.1",
        "FCV_LOAD": "2584.3",
        "FCV_CLICK": "2584.4",

        // HEADER AND FOOTER
        "HEADER_FOOTER_LINK": "2576.2",
        "HEADER_FLYOUT_MODEL_CLICK": "2576.3",
        "SEARCH_PAGE_LOAD": "2577.1",
        "SEARCH_PAGE_CLICK": "2577.2",
        "SEARCH_PAGE_CLICK_EXTRA": "2577.3",

        // FAVORITES  /** LIM 195 START**/
        "FAVORITES_BUILD_YOURS_BUTTON": "2538.3",
        "FAVORITES_TOGGLE": "2538.13",
        "FAVORITES_COUNTER": "2538.14",
        "FAVORITES_SEND_TO_DEALER_BUTTON": "2538.15",
        "FAVORITES_LOAD_OVERLAY": "2565.1",
        /** LIM 195 END**/

        // CPO TAGS
        "CPO_TOOLS_CLICK": "2579.2",
        "CPO_PAGE_LOAD": "2580.1",
        "CPO_BUTTON_CLICK": "2580.2",
        "CPO_MODEL_PAGE_LOAD": "2581.1",
        "CPO_MODEL_CLICK": "2581.2",
        "CPO_SOCIAL_CLICK": "2579.3",
        "CPO_OVERLAY_LOAD": "2582.1",

        // Campaign homepage
        "CAMPAIGN_HOME_LOAD": "2537.5",
        "CAMPAIGN_TILE_CLICK": "2537.6",

        // Stay informed bar
        "OVERVIEW_STAY_INFORMED_CLICK": "2538.21",

        // LIST THEM OUT BY THEIR ANNOTATIONS IDS (PPT ID)
        // note: these are duplicates.

        "GE:1.1": "2538.1",
        "GE:1.2": "2538.2",
        "GE:1.3": "2538.3",
        "GE:1.4": "2538.4",
        "GE:1.5": "2538.5",
        "GE:1.6": "2538.6",
        "GE:1.7": "2538.7",
        "GE:1.8": "2538.8",
        "GE:1.9": "2538.9",
        "GE:1.10": "2538.11",
        "GE:1.11": "2538.12",
        "HP:1.1": "2537.1",
        "HP:1.2": "2537.2",
        "HP:1.3": "2537.3",
        "AM:1.1": "2539.1",
        "AM:1.2": "2539.2",
        "AM:1.3": "2539.3",
        "MS:1.1": "2540.1",
        "MS:1.2": "2540.2",
        "MS:1.3": "2540.3",
        "MS:2.1": "2542.1",
        "MS:2.2": "2542.2",
        "MS:2.3": "2542.3",
        "MS:2.4": "2542.4",
        "MS:3.1": "2545.1",
        "MS:3.2": "2545.2",
        "MS:3.3": "2545.3",
        "MS:4.1": "2546.1",
        "CO:1.1": "2546.2",
        "CO:1.2": "2546.3",
        "FD:1.1": "2550.1",
        "FD:1.2": "2550.2",
        "FD:1.3": "2550.3",
        "FD:1.4": "2550.4",
        "FD:1.5": "2550.5",
        "FD:1.6": "2550.6",
        "FD:1.7": "2550.7",
        "FD:1.8": "2550.8",
        "FD:1.9": "2550.9",
        "FD:1.10": "2550.11",
        "FD:1.11": "2550.12",
        "FD:1.12": "2550.13",
        "CM:1.1": "2551.1",
        "CM:1.2": "2551.2",
        "CM:1.3": "2551.3",
        "CM:1.4": "2551.4",
        "CM:1.5": "2551.5",
        "CM:1.6": "2551.6",
        "CM:1.7": "2551.7",
        "CM:1.8": "2551.8",
        "CM:1.9": "2551.9",
        "CM:1.10": "2551.11",
        "OB:1.1": "2552.1",
        "OB:1.2": "2552.2",
        "OB:1.3": "2552.3",
        "TP:1.1": "2553.1",
        "TP:1.2": "2553.2",

        // Header
        "GN:1.1": "2576.2",
        "GN:1.2": "2576.3",
        "SP:1.1": "2577.1",
        "SP:1.2": "2577.2",

        // Lead forms
        "LF1.1": "2570.1",
        "LF1.2": "2570.2",
        "LF1.3": "2570.3",
        "LF1.4": "2571.1",
        "LF1.5": "2571.2",
        "LF1.6": "2571.3",
        "LF1.7": "2571.4",
        "LF1.8": "2572.1",
        "LF1.9": "2572.2",

        // for testing purposes only.
        QUNIT: "0000.0"
    };
});
