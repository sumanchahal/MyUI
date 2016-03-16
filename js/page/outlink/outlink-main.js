/**
 * @file Behaviors for the compare landing
 */
define([
    "jquery"
], function(
    $
) {

    function init() {
        populateContinueHref();
        bindCancelBtn();
    }

    /**
     * Bind the cancel button to go button's back event
     */

    function bindCancelBtn() {
        $(".btn-cancel").on("click", onCancelClick);
    }

    /**
     * Gets url param from querystring and populate
     * continue button with value
     */

    function populateContinueHref() {
        $(".btn-continue").attr("href", getQueryParam("url"));
    }

    /**
     * Gets a querystring parameter by name, ported from
     * lexus.com/outlink
     */

    function getQueryParam(name) {
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);

        if (results === null) {
            return "http://www.lexus.com/";
        } else {
            return results[1].replace("%3f", "?", "g");
        }
    }

    /**
     * Executed when the cancel button is clicked
     */

    function onCancelClick(e) {
        e.preventDefault();
        if (window.history.length === 1) {
            window.close();
        }
        window.history.back();
    }

    init();
});
