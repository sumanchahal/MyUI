define(["jquery", "component/TrimSelector", "transit"], function($, TrimSelector) {
    /**
     * Opens the trim selector in a drawer that slides out from the side
     *
     * @class TrimSelectorDrawer
     * @param {Object}      params Configuration parameters.
     * @param {Object}      params.instance (required) jQuery object containing module wrapper
     * @param {Function}    params.hideCallback - method called when the drawer is hidden
     * @param {Function}    params.beforeShowCallback - method called before the drawer is shown
     */
    var TrimSelectorDrawer = function(params) {
        var opts = $.extend({
            instance: null,
            hideCallback: $.noop,
            beforeShowCallback: $.noop,
            onCompareTraySubmit: $.noop,
            onCompareTrayFull: $.noop,
        }, params),
            $body = $("body"),
            $window = $(window),
            $dimmer = $(".dimmer"),
            $module = opts.instance,
            ON_CLASS = "on",
            OPEN_CLASS = "open",
            STUCK_CLASS = "stuck",
            TRIM_SELECTOR_OPEN_CLASS = "trim-selector-open",
            trimSelector;


        /**
         * @constructor
         */

        function init() {
            // Delegate .transition() calls to .animate()
            // if the browser can't do CSS transitions.
            if (!$.support.transition) {
                $.fn.transition = $.fn.animate;
            }

            if ($module !== null) {
                trimSelector = new TrimSelector({
                    instance: $module.find(".trim-selector"),
                    onCompareTraySubmit: opts.onCompareTraySubmit,
                    onCompareTrayFull: opts.onCompareTrayFull
                });
                bindCloseButton();
                bindDimmerClick();

                $module.fadeOut(0);
                $dimmer.fadeOut(0);
            } else {
                throw new Error("Trim Selector Drawer instance not found!");
            }
        }

        /**
         * Close the drawer if the dimmer is clicked
         *
         * @method bindDimmerClick
         * @private
         */

        function bindDimmerClick() {
            $dimmer.click(function() {
                hide();
                opts.hideCallback();
            });
        }

        /**
         * Bind the 'x' button
         *
         * @method bindCloseButton
         * @private
         */

        function bindCloseButton() {
            $module.find(".compare-tray-heading .close").click(function(e) {
                e.preventDefault();
                hide();
                opts.hideCallback();
            });
        }

        /**
         * Shows trim selector
         *
         * @method show
         * @public
         */

        function show() {
            opts.beforeShowCallback();
            $body.addClass(TRIM_SELECTOR_OPEN_CLASS);

            $module.fadeIn(600)
                .addClass(OPEN_CLASS)
                .css({
                    'z-index': 100
                });

            $dimmer.fadeTo(400, 0.6)
                .addClass(ON_CLASS);

            trimSelector.adjustStickyHeaderWidth();
            trimSelector.resetStickyHeader();
        }

        /**
         * Hides trim selector
         *
         * @method hide
         * @public
         */

        function hide() {
            $module.fadeOut(400,
                function() {
                    $body.removeClass(TRIM_SELECTOR_OPEN_CLASS);
                    $module.removeClass(OPEN_CLASS)
                        .css({
                            'z-index': 1
                        })
                        .find(".compare-tray-heading").removeClass(STUCK_CLASS);
                }
            );

            $dimmer.fadeOut(400)
                .removeClass(ON_CLASS);

            opts.hideCallback();
        }

        /**
         * Helper for adjusting the height of the drawer
         *
         * @method setHeight
         * @param {Number} height - pixel value for desired drawer height
         * @public
         */

        function setHeight(height) {
            $module.css("min-height", height);
        }

        /**
         * Helper for adjusting the top position of the drawer
         *
         * @method setOffsetTop
         * @param {Number} top - pixel value for desired drawer offset top position
         * @public
         */

        function setOffsetTop(offsetTop) {
            $module.css({
                top: offsetTop
            });
        }

        init();

        return {
            hide: hide,
            show: show,
            setHeight: setHeight,
            setOffsetTop: setOffsetTop
        };
    };

    return TrimSelectorDrawer;

});
