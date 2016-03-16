define(["jquery", "mvc/AbstractModel"], function($, AbstractModel) {

    /**
     * An item in a selectable list.
     * (SelectableList doesn't require you to use this item type)
     *
     * @see SelectableList
     * @class SelectableListItem
     * @param id {String}
     * @constructor
     */

    function SelectableListItem(id) {
        AbstractModel.call(this);
        this._id = null;

        this.setId(id);
    }

    SelectableListItem.prototype = new AbstractModel();
    SelectableListItem.prototype.parent = AbstractModel.prototype;
    SelectableListItem.prototype.constructor = SelectableListItem;

    $.extend(SelectableListItem.prototype, {
        /**
         * @public
         * @returns {string} ID for the list item
         */
        getId: function() {
            return this._id;
        },

        /** @public */
        setId: function(id) {
            this._id = id;
            return id;
        },

        /**
         * @public
         * @returns {string} type for item
         */
        getContentType: function() {
            return this.type;
        },

        /**
         * @public
         * @returns {string} category for item
         */
        getCategory: function() {
            return this.category;
        }
    });

    return SelectableListItem;
});
