// js-hint globals
/*global define,window,document*/
/*exported PointBreak*/
define([], function() {
    "use strict";

    /**
     * Sets up a system for dispatching events when breakpoints change.
     * @class PointBreak
     * @constructor
     * @param {BreakpointObject} [breakpointsToAdd] A set of breakpoints to register when PointBreak initializes.
     */
    var PointBreak = function(breakpointsToAdd) {
        var that = this,
            name;


        // Create the hash that holds the breakpoints
        this.breakpoints = {};
        this.listeners = {};

        // Automatically register a breakpoint at Infinity pixels.
        this.registerBreakpoint(PointBreak.MAX_BREAKPOINT, PointBreak.MAX_BREAKPOINT_WIDTH);

        // Register any default breakpoints.
        if (PointBreak.defaultBreakpoints !== null) {
            this.registerBreakpoint(PointBreak.defaultBreakpoints);
        }

        if (breakpointsToAdd !== undefined && breakpointsToAdd !== null) {
            this.registerBreakpoint(breakpointsToAdd);
        }

        /** @prop lastSize {int} */
        this.lastSize = this.getWidth();

        window.addEventListener("resize", function(e) {
            that.onResize(e);
        });
        document.addEventListener("load", function(e) {
            that.onResize(e);
        });
    };

    /**
     * @private
     * Adds an event listener to this object as if it were a dom element.
     * @param type {string} The type of event to listen for.
     * @param listener {function} A function to call when the event is dispatched.
     */
    PointBreak.prototype.addEventListener = function(type, listener) {
        if (!listener || typeof listener !== "function") {
            throw new Error("listener parameter must be defined and be a function.");
        }
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(listener);
    };

    /**
     * @private
     * Removes a registered listener for an event.
     *
     * @param type {string} The type of event to remove the listener for.
     * @param listener {function} The function to remove.
     */
    PointBreak.prototype.removeEventListener = function(type, listener) {
        var typeListeners = this.listeners[type],
            index;

        if (typeListeners) {
            index = typeListeners.indexOf(listener);
        } else {
            return;
        }
        if (index >= 0) {
            typeListeners.splice(index, 1);
        }
    };

    /**
     * Dispatches an event.
     *
     * @param event {Event} An event object.
     */
    PointBreak.prototype.dispatchEvent = function(event) {
        var typeListeners = this.listeners[event.type],
            i = 0,
            l,
            listener;

        if (typeListeners) {
            l = typeListeners.length;
        } else {
            return;
        }

        for (; i < l; i += 1) {
            listener = typeListeners[i];
            listener.call(window, event);
        }
    };

    /**
     * Shortcut for listening to the BREAKPOINT_CHANGE_EVENT on the window
     *
     * @param {BreakpointChangeHandler} handler
     */
    PointBreak.prototype.addChangeListener = function(handler) {
        this.addEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /**
     * Shortcut for un-listening to the BREAKPOINT_CHANGE_EVENT on the window
     *
     * @param {BreakpointChangeHandler} handler
     */
    PointBreak.prototype.removeChangeListener = function(handler) {
        this.removeEventListener(PointBreak.BREAKPOINT_CHANGE_EVENT, handler);
    };

    /**
     * Returns the current width of the screen
     * by creating and appending an element on the fly then
     * subtracting the clientWidth from the offsetWidth gives the scrollbar size
     *
     * @return {number} width of screen.
     */
    PointBreak.prototype.getWidth = function() {

        var w = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;

        return w;
    };

    /**
     * Called when the window resizes.
     */
    PointBreak.prototype.onResize = function() {
        var newWidth = this.getWidth(),
            currentBreakpoint = this.getBreakpointForSize(newWidth),
            lastBreakpoint = this.getBreakpointForSize(this.lastSize),
            breakpointChangeEvent,
            specificBreakpointEvent;

        if (lastBreakpoint !== currentBreakpoint) {
            // Dispatch a generic event for this breakpoint change.
            breakpointChangeEvent = document.createEvent("Event");
            breakpointChangeEvent.initEvent(PointBreak.BREAKPOINT_CHANGE_EVENT, true, true);
            breakpointChangeEvent.oldBreakpoint = lastBreakpoint;
            breakpointChangeEvent.newBreakpoint = currentBreakpoint;
            breakpointChangeEvent.width = newWidth;
            this.dispatchEvent(breakpointChangeEvent);

            // Dispatch a special event type for this breakpoint name
            // e.g. "smallBreakpoint"
            specificBreakpointEvent = document.createEvent("Event");
            specificBreakpointEvent.initEvent(currentBreakpoint + "Breakpoint", true, true);
            specificBreakpointEvent.oldBreakpoint = lastBreakpoint;
            specificBreakpointEvent.newBreakpoint = currentBreakpoint;
            specificBreakpointEvent.width = newWidth;
            this.dispatchEvent(specificBreakpointEvent);

            // attempt to call the onXyz function for this breakpoint.
            var capitalizedName = currentBreakpoint.charAt(0).toUpperCase() + currentBreakpoint.slice(1),
                callbackName = "on" + capitalizedName,
                callbackLowerCase = "on" + currentBreakpoint;
            if (this.hasOwnProperty(callbackName) && typeof this[callbackName] === "function") {
                this[callbackName].call(this, lastBreakpoint, currentBreakpoint);
            }

            if (this.hasOwnProperty(callbackLowerCase) && typeof this[callbackLowerCase] === "function") {
                this[callbackLowerCase].call(this, lastBreakpoint, currentBreakpoint);
            }

            this.lastSize = newWidth;
        }
    };

    /**
     * Returns the array of registered breakpoints.
     *
     * @return {BreakpointObject} breakpoints.
     */
    PointBreak.prototype.getBreakpoints = function() {
        return this.breakpoints;
    };

    /**
     * Returns the name for the width.
     *
     * @param {number} width Any width number to check the name of.
     * @return {string} Breakpoint title for width.
     */
    PointBreak.prototype.getBreakpointForSize = function(width) {
        var lowestBreakpointValue = PointBreak.MAX_BREAKPOINT_WIDTH,
            lowestBreakpointName = PointBreak.MAX_BREAKPOINT,
            breakpointName,
            breakpoint;

        if (isNaN(width) || width < 0) {
            return null;
        }

        for (breakpointName in this.breakpoints) {
            if (this.breakpoints.hasOwnProperty(breakpointName)) {
                breakpoint = this.breakpoints[breakpointName];
                if (width <= breakpoint && breakpoint <= lowestBreakpointValue) {
                    lowestBreakpointValue = breakpoint;
                    lowestBreakpointName = breakpointName;
                }
            }
        }
        return lowestBreakpointName;
    };

    /**
     * Returns all registered breakpoint sizes in order as an array.
     *
     * @return {Array} All breakpoint sizes sorted.
     */
    PointBreak.prototype.getSizes = function() {
        var sizes = [];
        for (var breakpoint in this.breakpoints) {
            if (this.breakpoints.hasOwnProperty(breakpoint)) {
                sizes.push(this.breakpoints[breakpoint]);
            }
        }
        sizes.sort();
        return sizes;
    };

    /**
     * Returns the maximum width of the breakpoint with the specified name.
     *
     * @param {string} name Name of the breakpoint.
     * @returns {number} The maximum width of the breakpoint.
     */
    PointBreak.prototype.getSizeOfBreakpoint = function(name) {
        if (this.hasBreakpoint(name)) {
            return this.breakpoints[name];
        }
        return 0;
    };

    /**
     * Returns the name for the window's current breakpoint.
     *
     * @return {string} Name of the current breakpoint.
     */
    PointBreak.prototype.getCurrentBreakpoint = function() {
        return this.getBreakpointForSize(this.getWidth());
    };

    /**
     * Returns the current orientation of the window.
     *
     * @returns {string} Either "landscape" or "portrait". Square windows return "landscape".
     *
     * @see PointBreak.LANDSCAPE
     * @see PointBreak.PORTRAIT
     */
    PointBreak.prototype.getCurrentOrientation = function() {
        var w = window;
        if (w.innerWidth >= w.innerHeight) {
            return PointBreak.LANDSCAPE;
        }
        return PointBreak.PORTRAIT;
    };

    /**
     * Add a breakpoint with `name` at the specified `width`.
     *
     * @param {BreakpointObject|string} object_or_name If this value is a string, use it as the name
     *                                  along with the width to register the breakpoint.
     *                                  If this value is an object, inspect it as if it
     *                                  was a hash of breakpoint names and widths.
     * @param {number} [width] The maximum width of the breakpoint (if object_or_name was a string)
     */
    PointBreak.prototype.registerBreakpoint = function(object_or_name, width) {
        var obj, name;

        // check to see if the object_or_name was a string.
        // if so, convert it to an object format.
        if (typeof object_or_name === "string" && !isNaN(width)) {
            name = object_or_name;
            obj = {};
            obj[name] = width;
        } else {
            obj = object_or_name;
        }

        // loop through the object and register each breakpoint found.
        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                this.registerSingleBreakpoint(name, obj[name]);
            }
        }
    };

    /**
     * @private
     * Explicitly add a single breakpoint name / value pair.
     *
     * @param {string} name Name of the breakpoint.
     * @param {number} width Max width of the breakpoint.
     */
    PointBreak.prototype.registerSingleBreakpoint = function(name, width) {
        this.breakpoints[name] = width;

        this.addListenerFunctionsForBreakpoint(name);
    };

    /**
     * Remove the breakpoint called `name`.
     *
     * @param {string} name The name of the breakpoint to remove.
     */
    PointBreak.prototype.unregisterBreakpoint = function(name) {
        this.breakpoints[name] = null;
        this.removeListenerFunctionsForBreakpoint(name);
    };

    /**
     * @private
     * Creates two functions on the instance of PointBreak for adding and removing listeners.
     * They are addNameListener() and removeNameListener() where "Name" would be replaced with
     * the name of the breakpoint. E.g. addSmallListener()
     *
     * @param name The name of the breakpoint
     */
    PointBreak.prototype.addListenerFunctionsForBreakpoint = function(name) {
        // Add a new version of "on" for this breakpoint.
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] = function(handler) {
            this.addEventListener(name + "Breakpoint", handler);
        };
        this["remove" + capitalizedName + "Listener"] = function(handler) {
            this.removeEventListener(name + "Breakpoint", handler);
        };
    };

    /**
     * @private
     * Removes the listener functions added by addListenerFunctionsForBreakpoint().
     *
     * @param {string} name The name of the breakpoint to remove the listeners for.
     */
    PointBreak.prototype.removeListenerFunctionsForBreakpoint = function(name) {
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        this["add" + capitalizedName + "Listener"] =
            this["remove" + capitalizedName + "Listener"] = null;
    };

    /**
     * Returns true if the name of current breakpoint is registered.
     *
     * @param {string} name A breakpoint to check.
     */
    PointBreak.prototype.hasBreakpoint = function(name) {
        return !isNaN(this.getBreakpoints()[name]);
    };

    /**
     * Checks all parameters against the name of the current breakpoint.
     * Returns true if any of them match.
     *
     * @param {...string} name One or more breakpoint names.
     *
     * @example
     * // returns true if the window is in the small or medium breakpoint zone.
     * myPointBreak.isCurrentBreakpoint("small", "medium");
     */
    PointBreak.prototype.isCurrentBreakpoint = function(name) {
        var i = 0,
            l = arguments.length,
            result = false,
            nameToCheck;

        for (; i < l; i++) {
            nameToCheck = (arguments[i]);
            result = this.getCurrentBreakpoint() === nameToCheck;
            if (result) {
                break; // Stop checking if you find the right breakpoint
            }
        }
        return result;
    };

    /**
     * Checks if smaller or equal than current size
     * Returns true if current size is less than or equal to breakpoint
     *
     * @param {string} breakpoint breakpoint name.
     *
     * @example
     * // returns true if the window is smaller than or equal to medium
     * myPointBreak.isCurrentBreakpoint("medium");
     */
    PointBreak.prototype.isSmallerOrEqual = function(breakpoint) {
        return this.getWidth() <= this.getSizeOfBreakpoint(breakpoint);
    };

    /**
     * Checks if bigger than current size
     * Returns true current size is bigger than breakpoint
     *
     * @param {string} breakpoint breakpoint name.
     *
     * @example
     * // returns true if the window is bigger than large
     * myPointBreak.isCurrentBreakpoint("large");
     */
    PointBreak.prototype.isBigger = function(breakpoint) {
        return this.getWidth() > this.getSizeOfBreakpoint(breakpoint);
    };

    // You can add breakpoints to all instances of PointBreak by adding
    // values to PointBreak.defaultBreakpoints.
    PointBreak.defaultBreakpoints = {};

    PointBreak.BREAKPOINT_CHANGE_EVENT = "breakpointChange";
    PointBreak.MAX_BREAKPOINT = "max";
    PointBreak.MAX_BREAKPOINT_WIDTH = Infinity;

    // used by getCurrentOrientation()
    PointBreak.LANDSCAPE = "landscape";
    PointBreak.PORTRAIT = "portrait";

    return PointBreak;
});


/**
 * An object that maps names to breakpoint sizes.
 *
 * @typedef {Object.<string, number>} BreakpointObject
 */

/**
 * An event that is dispatched when a breakpoint changes.
 *
 * @typedef {Event} BreakpointChangeEvent
 * @prop {string} newBreakpoint
 * @prop {string} oldBreakpoint
 * @prop {int} width
 */

/**
 * An event handler for changes in breakpoint.
 * @typedef {Function} BreakpointChangeHandler
 * @param {BreakpointChangeEvent} event
 */
