var LEXUS = LEXUS || {};


LEXUS.browserDetector = (function() {

    var MIN_CHROME = 1,
        MIN_FIREFOX = 20,
        MIN_SAFARI = 5,
        MIN_IE = 9;


    /**
     * Determines browser and version then opens colorbox if a cookie is not present
     * @private
     */

    function isBrowserSupported() {

        var browserIsSupported = true,
            browserName = get_browser(),
            browserVersion = get_browser_version(),
            ieVersion = ie_ver(),
            isSupportedMobile = navigator.userAgent.match(/Android|iPhone|iPad|iPod/i) ? true : false;

        if (isSupportedMobile || ((browserName === 'Chrome' && browserVersion >= MIN_CHROME) || (browserName === 'Firefox' && browserVersion >= MIN_FIREFOX) || (browserName === 'Safari' && browserVersion >= MIN_SAFARI) || (ieVersion >= MIN_IE) && (isSupportedMobile === false))) {
            browserIsSupported = true;
        } else {
            browserIsSupported = false;
        }

        return browserIsSupported;
    }

    /**
     * Gets the browser name
     * @returns {String} browser name
     * @private
     */

    function get_browser() {
        var N = navigator.appName,
            ua = navigator.userAgent,
            tem;
        var M = ua.match(/(opera|chrome|safari|firefox)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (M && (tem = ua.match(/version\/([\.\d]+)/i)) !== null) {
            M[2] = tem[1];
        }
        M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];

        return M[0];
    }

    /**
     * Gets the browser version number
     * @returns {Integer} browser version number
     * @private
     */

    function get_browser_version() {
        var N = navigator.appName,
            ua = navigator.userAgent,
            tem;
        var M = ua.match(/(opera|chrome|safari|firefox)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (M && (tem = ua.match(/version\/([\.\d]+)/i)) !== null) {
            M[2] = tem[1];
        }
        M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];

        return parseInt(M[1], 10);
    }

    /**
     * IE browser detection is different, this gets the version number]
     * @returns {Integer} browser version number
     * @private
     */

    function ie_ver() {
        var iev = 0;
        var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
        var trident = !! navigator.userAgent.match(/Trident\/7.0/);
        var rv = navigator.userAgent.indexOf("rv:11.0");

        if (ieold) {
            iev = RegExp.$1;
        }
        if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
            iev = 10;
        }
        if (trident && rv !== -1) {
            iev = 11;
        }

        return parseInt(iev, 10);
    }

    return {
        isBrowserSupported: isBrowserSupported
    };

})();




/**
 * Global page browser not supported functionality.
 *
 * @module unsupportedBrowserDialog
 */
(function($, cookie, browserDetector) {

    var SUPRESS_DIALOG_FLAG = "supressUnsupportedBrowserDialog",
        $overlay;

    if (!$) {
        throw new Error("jQuery is not defined");
    }

    if (!cookie) {
        throw new Error("cookie util is not defined.");
    }

    showOverlayIfBrowserNotSupported();


    function showOverlayIfBrowserNotSupported() {
        if (browserDetector.isBrowserSupported() === false) {
            if (cookie.get(SUPRESS_DIALOG_FLAG) !== "true") {
                //Set cookie for first time users
                cookie.set(SUPRESS_DIALOG_FLAG, true);
                openOverlay();
            }
        }
    }

    /**
     * Opens the colorbox overlay.
     * @private
     */

    function openOverlay() {
        $overlay = $("#browser-not-supported");
        $overlay.find('.close-btn').on('click', function() {
            closeOverlay();
        });

        $overlay.find(".browser-not-supported-background").on('click', function() {
            closeOverlay();
        });

        $overlay.show();
    }

    /**
     * Closes the colorbox modal.
     * @private
     */

    function closeOverlay() {
        $overlay.hide();
    }




})(jQuery, LEXUS.cookie, LEXUS.browserDetector);
