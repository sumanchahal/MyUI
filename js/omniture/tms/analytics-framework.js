/**
 * Consolidates objects from the TMS Analytics Framework and Omniture.
 *
 * Note: these files are loaded in the head element of the page. See base-scripts-head.jsp
 *
 * @module analyticsFramework
 * @prop cod {Object}
 * @prop s_code {Object}
 * @prop tags {json} The omni55.json tag propeties file.
 * @prop fireTag {Function} A reference to the fireTag() function.
 */
define([], function () {
    return {
        cod: window.tmsomnixd,
        tmsomnixd: window.tmsomnixd,
        s_code: window.tmsomni,
        s: window.tmsomni,
        tags: window.taglist,
        fireTag: window.fireTag
    };
});