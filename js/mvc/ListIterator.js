define([], function() {

    /**
     * A sequential iterator for a List.
     *
     * @class ListIterator
     *
     * @constructor
     * @param list {List.<*>}
     */

    function ListIterator(list) {
        this._list = list;
        this._position = -1;
    }

    ListIterator.prototype = {
        reset: function() {
            this._position = -1;
        },
        end: function() {
            this._position = this._list.getLength();
        },
        advanceBy: function(steps) {
            this._position += steps;
        },
        hasNext: function() {
            return this._position < (this._list.getLength() - 1);
        },
        next: function() {
            this._position += 1;
            return this._list.getItemAtIndex(this._position);
        },
        nextIndex: function() {
            return this._position + 1;
        },

        hasPrevious: function() {
            return this._position > 0;
        },
        previous: function() {
            this._position -= 1;
            return this._list.getItemAtIndex(this._position);
        },
        previousIndex: function() {
            return this._position - 1;
        },
        setItem: function(value) {
            this._list.setItemAtIndex(this._position, value);
        },
        getItem: function() {
            this._list.getItemAtIndex(this._position);
        },
        addItem: function() {
            this._list.addItemAtIndex(this._position);
        },
        removeItem: function() {
            this._list.removeItemAtIndex(this._position);
        }
    };

    return ListIterator;
});
