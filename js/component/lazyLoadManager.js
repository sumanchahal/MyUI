/**
 * @module lazyload
 * Lazy loads images using lazyload jQuery plugin
 * http://www.appelsiini.net/projects/lazyload
 *
 * @author vramos
 * @author mwright
 */
define(
    [
        "jquery",
        "lazyload"
    ],
    function($) {

        var LOOK_AHEAD = 0, // how far ahead (in px) the plugin will load the pictures below the fold
            IMAGE_LIMIT = 50,
            EFFECT = "fadeIn",
            defaultOptions = {
                threshold: LOOK_AHEAD,
                skip_invisible: false,
                failure_limit: IMAGE_LIMIT,
                event: "scroll lazyload"
            };

        /**
         * Initializes lazy loading.
         * @param $selector {jquery} The jquery object to attach lazy loading to. Default is "$(img.lazy-load)"
         * @param options {object} An options object for configuring lazyload. Default is defaultOptions
         * @param noEffect {boolean} If true, there will be no fade in effect when the image loads. Default is false
         */

        function init($selector, options, noEffect) {
            var opts = $.extend({}, defaultOptions, options);

            // if you don't actively supress the effects, use the default.
            if (noEffect !== true) {
                opts.effect = EFFECT;
            }
            $selector = $selector || $("img.lazy-load");
            $selector.lazyload(opts);

        }

        return {
            init: init
        };

    }
);
