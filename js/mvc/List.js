define([
        "jquery",
        "mvc/AbstractModel",
        "mvc/ListIterator"
    ],
    function(
        $,
        AbstractModel,
        ListIterator
    ) {

        /**
         * A base class for lists of objects.
         *
         * @abstract
         * @class List
         * @extends AbstractModel
         *
         * @constructor
         * @param {*} data initial data to start with.
         * @param {function} type The data type expected by this instance of List.
         * @template T
         */

        function List(data, type) {
            AbstractModel.apply(this);
            this._items = null;
            this._type = null;
            this.init(data, type);
        }

        List.prototype = new AbstractModel();
        List.prototype.parent = AbstractModel.prototype;
        List.prototype.constructor = List;

        $.extend(List.prototype, {

            TYPE_ERROR: "The value you're trying to add must be an instance of ",

            /**
             * Using init instead of a constructor.
             * @param {Object} data - Some data used to prime the model.
             * @param {function} type - The data type expected by this instance of List.
             */
            init: function(data, type) {
                /**
                 * @protected
                 * @property _items Holds the items in the list
                 * @type {Array.<T>}
                 */
                this._items = [];

                /**
                 * @protected
                 * @property _type Holds the expected type of items in the list.
                 * @type {*}
                 */
                this._type = Object;


                if (type !== null && type !== undefined) {
                    this._type = type;
                }
                if (data !== null && data instanceof Array) {
                    for (var i = 0; i < data.length; i++) {
                        this.addItem(data[i]);
                    }
                }

            },

            /**
             * @private
             * Returns true if the instance matches the type.
             * @param value {*}
             */
            isValidType: function(value) {
                if (value === null) {
                    return true;
                }
                if (this._type === String) {
                    return typeof(value) === 'string' || value instanceof String;
                }
                if (this._type === Boolean) {
                    return typeof(value) === 'boolean' || value instanceof Boolean;
                }
                if (this._type === Number) {
                    return typeof(value) === 'number' || value instanceof Number;
                }
                return (value instanceof this._type);
            },

            /**
             * Returns a string of list items.
             *
             * @see List#toArray()
             * @returns {string}
             */
            toString: function() {
                return this.toArray().join(", ");
            },

            /**
             * Converts the List into an array.
             *
             * @returns {Array.<T>}
             */
            toArray: function() {
                return this._items.slice(0);
            },

            /**
             * @returns {Int} The length of the list.
             */
            getLength: function() {
                return this._items.length;
            },

            /**
             * @param index {Int}
             * @returns {T} The item at the specified index.
             */
            getItemAtIndex: function(index) {
                return this._items[index];
            },

            /**
             * Sets the value of an item at a certain index.
             *
             * @param index {Int}
             * @param value {T}
             *
             * @throws {Error} If type doesn't match.
             */
            setItemAtIndex: function(index, value) {
                if (this.isValidType(value)) {
                    this._items[index] = value;
                } else {
                    throw new Error(this.TYPE_ERROR + this._type);
                }
            },


            /**
             * Add a new item to the end of the list.
             *
             * @param value {T}
             *
             * @throws {Error} If type doesn't match.
             */
            addItem: function(value) {
                if (this.isValidType(value)) {
                    this.addItemAtIndex(this._items.length, value);
                } else {
                    throw new Error(this.TYPE_ERROR + this._type);
                }
            },


            /**
             * Add an item at a specific index. Similar to Array.splice().
             * @param index {Int}
             * @param value {T}
             *
             * @throws {Error} If type doesn't match.
             */
            addItemAtIndex: function(index, value) {
                if (this.isValidType(value)) {
                    this._items.splice(index, 0, value);
                } else {
                    throw new Error(this.TYPE_ERROR + this._type);
                }
            },

            /**
             * Remove an item from the list if it exists.
             * Removes the first instance found.
             *
             * @param value {T} The item to remove.
             * @returns {T|null} The removed item if it was found or null.
             */
            removeItem: function(value) {
                for (var i = 0; i < this._items.length; i++) {
                    if (this._items[i] === value) {
                        this._items.splice(i, 1);
                        return value;
                    }
                }
                return null;
            },

            /**
             * Removes the item at the index specified.
             *
             * @param index {Int}
             * @returns {T} The removed item.
             */
            removeItemAtIndex: function(index) {
                var item = this.getItemAtIndex(index);
                this._items.splice(index, 1);
                return item;
            },

            /**
             * Returns the index of the first copy of the item if it is in the list.
             * Returns -1 if it isn't found.
             *
             * @param itemToFind {T} The item to get the index of.
             * @returns {int} index or -1.
             */
            getIndexOfItem: function(itemToFind) {
                var i = 0,
                    l = this._items.length;
                for (; i < l; i += 1) {
                    if (this._items[i] === itemToFind) {
                        return i;
                    }
                }
                return -1;
            },

            /**
             * Returns true if the item exists in the list.
             * @param item {T} Item to find.
             * @returns {boolean}
             */
            hasItem: function(item) {
                return this.getIndexOfItem(item) >= 0;
            },

            /**
             * Returns an iterator for this list.
             *
             * @returns {ListIterator}
             */
            getListIterator: function() {
                return new ListIterator(this);
            }
        });

        return List;
    });
