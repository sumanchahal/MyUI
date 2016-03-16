/**
 * Sets Column Equal Heights
 *
 * @class equal-heights
 * @uses jQuery
 */
define(["jquery"], function($) {
    return {
        /**
         * Sets Column Equal Heights
         *
         * @method setColumnEqualHeights
         * @param selectorClass A Column Css Class.
         * @public
         */
        setColumnEqualHeights: function($container, columnSelectorClass) {
            var maxHeight = 0,
                $this = $(this);

            $container.find(columnSelectorClass).each(function() {
                $(this).attr("style", "");
                var height = $(this).height();

                if (height > maxHeight) {
                    maxHeight = height;
                }
            });

            $container.find(columnSelectorClass).css('height', maxHeight);
        },

        removeColumnEqualHeights: function($container, columnSelectorClass) {
            $container.find(columnSelectorClass).each(function() {
                $(this).attr("style", "");
            });
        }
    };
});
