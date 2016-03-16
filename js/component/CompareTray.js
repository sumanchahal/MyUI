define(['jquery', "PointBreak", "analytics"], function($, PointBreak, analytics) {

    /**
     * Lists trims that are currently added, and gives the ability to remove.
     * Keeps track of how many have been added, and links user to
     * side-by-side page when more than one trim is added.
     *
     * @class CompareTray
     * @typedef  {config}  configuration parameters.
     * @property {Function} onTrayChange - executed whenever the values in the tray are updated
     * @property {Function} onRemoveItem - executed when an item is removed from the tray
     * @property {Function} onFormSubmit- executed when form submit is initiated
     */
    var CompareTray = function(params) {
        var opts = $.extend({
            onTrayChange: $.noop,
            onRemoveItem: $.noop,
            onCompareTraySubmit: $.noop,
            onCompareTrayFull: $.noop
        }, params),
            pointbreak = params.pointbreak || new PointBreak(),
            onTrayChange = opts.onTrayChange,
            onRemoveItem = opts.onRemoveItem,
            currentCount = 0,
            MAX_ITEMS = 3,
            POPULATED_CLASS = "populated",
            $module = opts.instance,
            $compareTrayForm = $module.find(".compare-list"),
            $compareList = $compareTrayForm.find("ul");
        $stickyWrapper = $module.find('.sticky-wrapper');

        function init() {
            delegateRemoveBtn();
            bindTraySubmit();

            // If the list is already populated, count needs to be updated
            currentCount = $compareTrayForm.find("li").length;
        }

        /**
         * Binds submit method to compare tray form
         *
         * @method bindTraySubmit
         * @private
         */

        function bindTraySubmit() {
            $compareTrayForm.on("submit", submit);
        }

        /**
         * Scrolls the window back to the top of the screen
         *
         * @method scrollToTop
         * @private
         */

        function scrollToTop(callback) {
            $("html, body").stop().animate({
                scrollTop: 0
            }, 300);
        }

        /**
         * Adds a trim to the compare tray
         *
         * @method add
         * @param {JSON} data
         * @param {Function} cbf
         * @private
         */

        function add(data, cbf) {
            var callback = cbf || $.noop;
            var action, container;

            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                opts.onCompareTraySubmit();
                /** LIM 148 changes **/
                action = $compareTrayForm.attr("action") + data.id;
                if ($compareTrayForm.data('file')) {
                    action = action + "?parent=" + $compareTrayForm.data('file');
                }
                document.location = action;
                /** *LIM 148 End** */
                return;
            }

            if (currentCount < MAX_ITEMS && typeof data.id !== "undefined") {
                // Ensure you can't add the same id twice
                if (checkIfIdAlreadyExists(data.id)) {
                    return;
                }

                $compareList.append('<li>' + data.year + ' ' + data.make + ' <span>' + data.model + ' ' + data.trim + '</span><a data-id="' + data.id + '" href="#" class="remove global-btn-remove"></a></li>');

                if (currentCount === 0) {
                    show();
                }

                currentCount++;
                onTrayChange(currentCount, MAX_ITEMS);

                callback(true);
            } else {
                callback(false);
            }

            // analytics
            action = "Add Vehicle";
            container = "Select Competitor";
            analytics.helper.fireCompareAddVehicleClick(action, container);
        }

        /**
         * Removes trim from compare tray
         *
         * @method remove
         * @param {jquery} $item - item to remove
         * @public
         */

        function remove($item) {
            currentCount--;

            $item.remove();

            onTrayChange(currentCount, MAX_ITEMS);

            if (currentCount === 0) {
                hide();
            }

            onRemoveItem($item);
        }

        /**
         * Hides the entire compare tray
         *
         * @method hide
         * @public
         */

        function hide() {
            $compareTrayForm.removeClass(POPULATED_CLASS);
            scrollToTop();
        }

        /**
         * Shows the entire compare tray
         *
         * @method show
         * @public
         */

        function show() {
            $compareTrayForm.addClass(POPULATED_CLASS);
        }

        /**
         * Builds URL to the compare side-by-side page
         *
         * @method submit
         * @param {Event} e - jquery event object
         * @returns {Boolean} - whether or not submit was successful
         * @private
         */

        function submit(e) {

            opts.onCompareTraySubmit();

            // analytics
            var container = "SelectCompetitor";
            analytics.helper.fireCompareVehicleClick(container);

            var action = $compareTrayForm.attr("action"),
                $removeButtons = $compareTrayForm.find(".remove");

            if (currentCount > 0 && currentCount <= MAX_ITEMS) {
                $removeButtons.each(function(i) {
                    action += $(this).data("id");

                    if (i < $removeButtons.length - 1) {
                        action += ",";
                    }
                });
                /** LIM 148 changes **/
                if ($compareTrayForm.data('file')) {
                    action = action + "?parent=" + $compareTrayForm.data('file');
                }
                /** LIM 148 change end ***/
                location.href = action;

                return false;
            } else {
                return false;
            }
        }

        /**
         * Sets up action for all remove buttons
         *
         * @method delegateRemoveBtn
         * @private
         */

        function delegateRemoveBtn() {
            $module.on("click", ".remove", function(e) {
                e.preventDefault();
                remove($(e.target).parents("li"));
            });
        }

        /**
         * Get item ids
         *
         * @method getAllItemIds
         * @returns {Array} retrieves the available item ids
         * @private
         */

        function getAllItemIds() {
            var itemIds = [];

            // populates array by collecting ids off the remove buttons
            $module.find(".remove").each(function() {
                var $this = $(this),
                    itemId = $this.data("id");

                if (typeof itemId !== "undefined") {
                    itemIds.push(itemId + "");
                }
            });

            return itemIds;
        }

        /**
         * Check for existing id
         *
         * @method checkIfIdAlreadyExists
         * @param {Number} id - trim id that may or may not exist in tray
         * @returns {Boolean}
         * @private
         */

        function checkIfIdAlreadyExists(id) {
            var allIds = getAllItemIds(),
                numIds = allIds.length,
                i;

            for (i = 0; i < numIds; i++) {
                if (id === allIds[i]) {
                    return true;
                }
            }

            return false;
        }

        init();

        return {
            add: add,
            remove: remove,
            hide: hide
        };
    };

    return CompareTray;
});
