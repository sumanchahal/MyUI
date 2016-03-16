/**
 * @file All utilities for assiting with debugging
 */
define(["lexus", "component/DebugInfo"], function(LEXUS, DebugInfo) {
    var debugInfo = new DebugInfo();

    // Gets ip from querystring so it can be passed into geolocationHelper->fetch
    LEXUS.ipOverride = {
        data: {
            ip: getQueryStringParam("ip")
        }
    };

    /**
     * Receives the name of a key in the querystring, and grabs it's value
     *
     * @param {String?} qsName - Name of the querystring value to access
     */

    function getQueryStringParam(qsName) {
        /** @type {String} */
        var pageURL = window.location.search.substring(1),
            /** @type {Array.<String>} */
            urlVars = pageURL.split('&');

        for (var i = 0; i < urlVars.length; i++) {
            var paramName = urlVars[i].split('=');

            if (paramName[0] === qsName) {
                return paramName[1];
            }
        }
        return null;
    }
});
