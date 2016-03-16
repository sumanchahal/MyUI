define(["jquery", "modernizr"], function($, Modernizr) {
    /**
     * Displays debugging info in top right corner of browser
     * Build number and build time
     *
     * @class DebugInfo
     */
    var DebugInfo = function() {
        var $alert = $("#debug-info"),
            SHOW_CLASS = "show";

        /**
         * @constructor
         */

        function init() {
            if ($alert.get(0) !== null) {
                show();
                setupInteractions();
            } else {
                return;
            }
        }

        /**
         * Event handlers for hiding the details
         *
         * @private
         */

        function setupInteractions() {
            if (Modernizr.touch === true) {
                $alert.click(hide);
            } else {
                $alert.mouseleave(hide);
            }
        }

        /**
         * transitions debug info into view
         *
         * @private
         */

        function show() {
            $alert.show();
            $alert.addClass(SHOW_CLASS);
        }

        /**
         * transitions debug info out of view
         * then removes node
         *
         * @public
         */

        function hide() {
            $alert.removeClass(SHOW_CLASS);

            // Hide so that it doesn't appear while scrolling on mobile
            setTimeout(function() {
                $alert.hide();
            }, 300);
        }

        init();

        return {
            hide: hide
        };
    };

    return DebugInfo;
});
