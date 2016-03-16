define(['jquery'], function($) {

    /**
     * Dropdown menu for browsing. Clicking on a list item scrolls user to that section.
     *
     * @class ScrollSelectDropdown
     * @typedef  {config}  configuration parameters.
     * @property {jquery}  instance - (required) jQuery object containing module wrapper
     */

    var ScrollSelectDropdown = function(params) {

        var opts = $.extend({}, params),
            $module = opts.instance,
            $heading = $module.find('span.heading'),
            $dropdownList = $module.find('ul'),
            $listItems = $dropdownList.find('li'),
            $downArrow = $heading.find('span'),
            DROP_TIME = 150,
            ANIMATE_WAIT = 200,
            dropdownHeight;

        /**
         * @constructor
         */

        function init() {
            bindMenus();
        }

        /**
         * When heading is clicked, dropdown list toggles down. Using jquery for animation in this
         * case because the browser was jumpy when combining the scrolltop animation
         * in jquery with a dropdown animation in css.
         *
         * @private
         */

        function bindMenus() {

            $heading.click(function(event) {
                $dropdownList.slideToggle('fast');
                $downArrow.toggleClass('rotated');
            });

            $listItems.click(function(event) {
                $listItems.removeClass('active');
                $item = $(event.target);
                $item.addClass('active');
                newTarget = $.find("." + $item.data('group'));
                targetPosition = $(newTarget).offset().top;
                setTimeout(function() {
                    dropdownHeight = $dropdownList.height();
                    $listItems.removeClass('active');
                    $dropdownList.slideToggle('medium');
                    $("html, body").stop().animate({
                        scrollTop: targetPosition - dropdownHeight
                    }, DROP_TIME);
                }, ANIMATE_WAIT);

            });
        }

        init();

        return;
    };

    return ScrollSelectDropdown;
});
