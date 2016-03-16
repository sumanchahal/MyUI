/**
 * This is the main entry-point for using omniture analytics tools.
 * Loads all files related to analytics.Includes global values, JSON tag definitions.
 *
 * @typedef {Object} analytics
 * @module analytics
 * @property {Object} framework - A reference to the TMS analytics framework files.
 * @property {Object} global - A reference to the global TMS tag vars.
 * @property {Object} analyticsHelper - A simple library for streamlining calls.
 * @property {Object} tagmap - An enumeration of tags used in the site.
 */
define([
        "lexus",
        "omniture/tms/analytics-framework",
        "omniture/global-metrics",
        "omniture/analytics-helper",
        "omniture/tagmap"
    ],

    function(LEXUS, tmsAnalyticsFramework, global, analyticsHelper, tagmap) {
        LEXUS.analytics = {
            framework: tmsAnalyticsFramework,
            global: global,
            helper: analyticsHelper,
            tagmap: tagmap
        };
        return LEXUS.analytics;
    }
);
