/**
 * Cookie keys
 * @readonly
 * @enum {String}
 */
var key = {
    LEAD_FORM_DATA_ANALYTICS_COOKIE: "leadFormConfirmationAnalytics"
};


// Extract the domain without the subdomain so lexus.com from www.lexus.com or ssl.lexus.com

function getDomain() {
    // get the last 2 segments of the hostname if the hostname ends with .com
    // this will ignore anyone connecting to a server via IP
    var match = /[^\.]+\.com$/.exec(location.hostname);
    return (match && match.length > 0 ? match[0] : location.hostname);
}

var domain = getDomain();

var cookie = {
    key: key,

    /**
     * Sets a cookie value by name
     * @method set
     * @param name {String}
     * @param value {String}
     * @public
     */
    /** LIM 195 START**/
    setWithExpiration: function(name, value, expiration) {
        var cookieString = "";
        if (value === undefined) {
            throw new Error("set() requires 2 parameters");
        }
        cookieString = encodeURIComponent(name) + "=" + value + "; path=/;domain=" + domain + ";max-age=" + expiration;
        document.cookie = cookieString;
    },
    /** LIM 195 END**/
    /**
     * Retrieves a cookie value by name
     * @method get
     * @param name {String}
     * @public
     * @return {String} values stored in the cookie. If cookie doesn't exist, return undefined.
     */
    get: function(name) {
        var namedCookies = document.cookie.split(";"),
            keyValuePair = null;

        for (var i = 0; i < namedCookies.length; i++) {
            keyValuePair = namedCookies[i].split("=");
            var trimmed = keyValuePair[0].replace(/^\s+|\s+$/gm, '');
            if (trimmed === name) {
                return decodeURIComponent(keyValuePair[1]);
            }
        }
        return undefined;
    }
};


if (typeof define === "function" && define.amd) {
    define([], function() {
        return LEXUS.cookie;
    });
}
