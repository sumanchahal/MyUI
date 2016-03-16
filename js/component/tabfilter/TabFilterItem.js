define(["mvc/SelectableListItem"], function(SelectableListItem) {

    /**
     * An item that appears in a tab filter list.
     *
     * @class TabFilterItem
     * @extends SelectableListItem
     *
     * @constructor
     * @param id {String} A unique identifier for this filter item.
     * @param label {String} A human readable label for this item.
     */

    function TabFilterItem(id, label) {
        SelectableListItem.call(this, id);
        this._label = null;

        if (!label) {
            label = id;
        }
        this.setLabel(label);
    }

    TabFilterItem.prototype = new SelectableListItem();
    TabFilterItem.prototype.parent = SelectableListItem.prototype;
    TabFilterItem.prototype.constructor = TabFilterItem;

    $.extend(TabFilterItem.prototype, {

        /**
         * @returns {string} human-readable label.
         * @public
         */
        getLabel: function() {
            return this._label;
        },

        /**
         * @public
         */
        setLabel: function(label) {
            this._label = label;
            return label;
        }
    });

    return TabFilterItem;
});
