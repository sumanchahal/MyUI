define(['jquery'], function($) {

    /**
     * Takes a set of HTML and turns it into tabs which
     * can be toggled.
     *
     * @class TabSwitcher
     * @typedef  {config}  configuration parameters.
     * @property {jquery}  instance - (required) jQuery object containing module wrapper
     */

    var TabSwitcher = function(params) {

        var opts = $.extend({}, params),
            $module = opts.instance,
            tabs = $module.find(".tabs li"),
            sets = $module.find(".set"),
            SELECTED_CLASS = "selected";

        this.tabs = tabs;

        /**
         * @constructor
         */

        function init() {
            bindTabListeners();
        }

        /**
         * Attaches click events to the wrapper object
         *
         * @private
         */

        function bindTabListeners() {

            tabs.each(function(index, tab) {
                var $tab = $(tab);
                $tab.click(function(event) {
                    tabs.removeClass(SELECTED_CLASS);
                    $tab.addClass(SELECTED_CLASS);
                    sets.removeClass(SELECTED_CLASS);
                    $(sets[index]).addClass(SELECTED_CLASS);
                });
            });
        }

        init();

        return;
    };

    return TabSwitcher;
});
