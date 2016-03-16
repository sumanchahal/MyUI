define([], function() {

    /**
     * An object with the ability to dispatch events.
     *
     * @author Mims Wright
     * @constructor
     * @class Observable
     */
    var Observable = function() {
        this._listeners = {};
    };

    Observable.prototype = {
        _listeners: null,

        /**
         * Add an event listener to this object.
         *
         * @param {String} eventType - The identifier for the event to listen for.
         * @param {listener} listener - the function to call when the event is triggered.
         * @param {Object} [scope] - An optional parameter that sets the scope in which to call the listener.
         */
        on: function(eventType, listener, scope) {
            var listenerList = this._listeners[eventType] = this._listeners[eventType] || [];

            var i = listenerList.length - 1;
            for (; i >= 0; i -= 1) {
                if (listener === listenerList[i].listener && scope === listenerList[i].scope) {
                    // don't add listeners that already exist.
                    return;
                }
            }

            listenerList.push({
                listener: listener,
                scope: scope
            });
        },

        /**
         * Removes a previously added event listener.
         *
         * @param {String} eventType - The identifier for the event to stop listening for.
         * @param {Function} listener - The listener function to remove.
         * @param {Object} scope - the scope in which to call the listener.
         */
        off: function(eventType, listener, scope) {
            var listenerList = this._listeners[eventType];
            if (listenerList) {
                var i = listenerList.length - 1;
                for (; i >= 0; i -= 1) {
                    var l = listenerList[i];
                    if (l.listener === listener && l.scope === scope) {
                        listenerList.splice(i, 1);
                        return;
                    }
                }
            }
        },

        /**
         * Dispatches an event to all listeners.
         *
         * @param {String} eventType - an identifier for this event.
         * @param {Array} [args] - An array of optional arguments to pass to event listeners.
         */
        trigger: function(eventType, args) {
            var listenerList = this._listeners[eventType];
            if (listenerList) {
                var l = listenerList.length,
                    i = 0;
                for (; i < l; i += 1) {
                    var listener = listenerList[i].listener;
                    var scope = listenerList[i].scope;
                    listener.apply(scope, args);
                }
            }
        },

        /**
         * Returns true if the eventType has a listener registered for the scope.
         */
        hasListeners: function(eventType, scope) {
            return this.getListeners(eventType, scope).length > 0;
        },

        /**
         * Returns any listeners for an event. If scope is provided, matches by scope.
         */
        getListeners: function(eventType, scope) {
            var listenerList = this._listeners[eventType];
            var matches = [];
            if (listenerList && listenerList.length > 0) {
                if (!scope) {
                    matches = listenerList.concat([]);
                } else {
                    var i = listenerList.length - 1,
                        listener;
                    for (; i >= 0; i -= 1) {
                        listener = listenerList[i];
                        if (listener.scope === scope) {
                            matches.push(listener);
                        }
                    }
                }
            }
            return matches;
        }
    };
    return Observable;
});
