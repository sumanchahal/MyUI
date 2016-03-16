define(["jquery", "mvc/List", "mvc/ListEvent"], function($, List, ListEvent) {

    /**
     * A base class for a lists of objects that can have a single selected
     * item.
     *
     * @class SelectableList
     * @extends List
     *
     * @param data {Array|Object} Initial data used to create the list items.
     * @param type {*} The expected type of the items in the list.
     */
    var SelectableList = function(data, type) {
        this._selectedItem = null;
        List.call(this, data, type);
    };


    SelectableList.prototype = new List();
    SelectableList.prototype.parent = List.prototype;
    SelectableList.prototype.constructor = SelectableList;

    $.extend(SelectableList.prototype, {

        /**
         * Shortcut function for adding a listener for the SELECTED_ITEM_CHANGED event.
         *
         * @param listener {SelectedItemChangedListener} A function to call when selected item changes.
         * @param scope {Object} The scope to call the function in.
         */
        addSelectionListener: function(listener, scope) {
            this.on(ListEvent.SELECTED_ITEM_CHANGED, listener, scope);
        },

        /**
         * Shortcut function for removing a listener for the SELECTED_ITEM_CHANGED event.
         *
         * @param listener {SelectedItemChangedListener} A function to call when selected item changes.
         * @param scope {Object} The scope to call the function in.
         */
        removeSelectionListener: function(listener, scope) {
            this.off(ListEvent.SELECTED_ITEM_CHANGED, listener, scope);
        },


        /**
         * Returns the selected item in the list or null.
         *
         * @returns {*|null}
         */
        getSelectedItem: function() {
            return this._selectedItem;
        },

        /**
         * Sets an item as the selected item.
         * If none exists, does nothing.
         *
         * @param item {*}
         * @returns {*} the selected item.
         */
        setSelectedItem: function(item) {
            var oldItem = this.getSelectedItem();
            if (oldItem !== item) {
                this._selectedItem = item;
                // console.log("Selected item: ", this._selectedItem);
                this.trigger(ListEvent.SELECTED_ITEM_CHANGED, [this._selectedItem, oldItem]);
            }
            return this._selectedItem;
        },

        /**
         * Sets selected item to null.
         */
        deselect: function() {
            this.setSelectedItem(null);
            return null;
        },

        /**
         * Returns the selected item's id.
         * @returns id {String} The id of the selected item.
         */
        getSelectedItemId: function() {
            var item = this.getSelectedItem();
            if (item) {
                return item.getId();
            }
            return null;
        },

        /**
         * Returns the (first) item with matching id.
         * @param id {String}
         * @returns {*}
         */
        getItemById: function(id) {
            var i = 0,
                l = this.getLength(),
                item;
            for (; i < l; i += 1) {
                item = this.getItemAtIndex(i);
                if (item.getId() === id) {
                    return item;
                }
            }
            return null;
        },

        /**
         * If the id exits in the list, selects the item with the matching id.
         *
         * @param id {String}
         * @returns {*} the selected item.
         */
        setSelectedItemId: function(id) {
            var item, iterator = this.getListIterator();

            while (iterator.hasNext()) {
                item = iterator.next();
                if (item.getId() === id) {
                    return this.setSelectedItem(item);
                }
            }
            return this.setSelectedItem(null);
        },

        /**
         * Selects the item at the index.
         * @param index {Int}
         * @returns selectedItem {*}
         */
        setSelectedItemIndex: function(index) {
            return this.setSelectedItem(this._items[index]);
        },

        /**
         * Get the selected items index.
         * @returns {Int}
         */
        getSelectedItemIndex: function() {
            var item = this.getSelectedItem();
            if (item) {
                return this._items.indexOf(item);
            } else {
                return -1;
            }
        },

        /**
         * Selects the first item in the list
         *
         * @returns {*} the selected item.
         */
        selectFirstItem: function() {
            return this.setSelectedItemIndex(0);
        },

        /**
         * Selects the item after the selected item.
         * Selects null if there is no item after the selected one.
         *
         * @returns {*} the selected item.
         */
        selectNextItem: function() {
            return this.setSelectedItem(this.getNextItem());
        },

        /**
         * Selects the item before the selected item.
         * Selects null if there is no item before the selected one.
         *
         * @returns {*} the selected item.
         */
        selectPreviousItem: function() {
            return this.setSelectedItem(this.getPreviousItem());
        },

        /**
         * Returns the item after the selected item.
         * Returns null if there is no item after the selected one.
         *
         * @returns {*}
         */
        getNextItem: function() {
            return this.getItemOffsetFromSelectedBy(+1);
        },

        /**
         * Returns the item before the selected item.
         * Returns null if there is no item before the selected one.
         *
         * @returns {*}
         */
        getPreviousItem: function() {
            return this.getItemOffsetFromSelectedBy(-1);
        },

        /**
         * Validates the state of the item list and shifts the index
         * by a specified amount.
         *
         * @private
         * @method getItemOffsetFromSelectedBy
         * @returns {*}
         */
        getItemOffsetFromSelectedBy: function(shiftAmount) {
            var items = this._items,
                length,
                index;
            if (items) {
                length = items.length;
                if (length > 0) {
                    index = this.getSelectedItemIndex();
                    if (index >= 0) {
                        return this.getItemAtIndex((index + length + shiftAmount) % length);
                    }
                }
            }
            return null;
        }
    });


    return SelectableList;
});
