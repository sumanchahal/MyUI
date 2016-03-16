/**
 * Created by mwright on 5/20/14.
 */
define([], function() {
    return {

        /**
         * If a string is found in the map, replaces it with the mapped value.
         *
         *
         * @param inputString {String} Input string to check.
         * @param map {Object} String map.
         * @param caseSensitive {Boolean} If false, ignores case. False by default.
         * @returns {*}
         */
        replaceStringWithMap: function(inputString, map, caseSensitive) {
            if (typeof(inputString) !== "string") {
                return inputString;
            }
            var lookupString = caseSensitive ? inputString : inputString.toLowerCase();
            lookupString.replace("%20", " ");
            if (map[lookupString]) {
                return map[lookupString];
            }
            return inputString;
        },


        /**
         * Replaces all strings within the object with the values in the map.
         *
         * @param obj {Object} Input object. All children will be run through the filter.
         * @param map {Object} Map of values to check against.
         * @param caseSensitive {Boolean} If false, ignores case. False by default.
         * @param {Object} a new object with values remapped.
         */
        replaceAllStringsInObjectWithMap: function(obj, map, caseSensitive) {
            var output = {};
            for (var element in obj) {
                if (obj.hasOwnProperty(element)) {
                    output[element] = this.replaceStringWithMap(obj[element], map, caseSensitive);
                }
            }
            return output;
        },

        /**
         * Capitalizes a string but keeps hybrid 'h' as lowercase.
         *
         * @param inputString {String}
         * @returns {String}
         */
        capitalizeWithoutChangingTrimName: function(inputString) {
            var HYBRID_PATTERN = /(\d)H(\s|$)/g;
            var outputString = inputString.toUpperCase();
            return outputString.replace(HYBRID_PATTERN, "$1h$2");
        },

        /**
         * Wraps the hybrid h in a span tag.
         * @param inputString {String}
         * @returns {String}
         */
        wrapHybridHWithLowercaseSpan: function(inputString) {
            // Quick hack - don't do this for anything in what might be an HTML tag, and gotta do it for T's also for NX
            var HYBRID_PATTERN = /(\d)h(?!((?![<>]).)*\))(\s|$)/g;
            var outputString = inputString;
            outputString = outputString.replace(HYBRID_PATTERN, "$1<span class='hybrid-h'>h</span>$3");
            var T_PATTERN = /(\d)t(?!((?![<>]).)*\))(\s|$)/g;
            outputString = outputString.replace(T_PATTERN, "$1<span class='hybrid-h'>t</span>$3");

            /*
                will schoenberger: [LIM-3273] We had to take this a step
                further. When this function was run on text that has a
                disclaimer in it the html in the disclaimer data attribute
                needed to be escaped with html entities, while text outside the
                data attribute needed to not be escaped.

                This should handle:
                 - any number of disclaimers in the string.
                 - replacing html characters only in the data-disclaimer
                   attribute with html entities.
                 - it should not modify the string if no disclaimers are found.

                If anyone is a regex wiz and wants to improve on this please
                feel free if it makes it faster or more bullet proof.
            */

            var broke = outputString.split("<span class='tooltip-trigger disclaimer' data-disclaimers="),
                disclaimers = [],
                part,
                re;

            for (var i = 0; i < broke.length; i++) {
                part = broke[i].split('"body":"')[1];
                if (part) {
                    disclaimers.push(part.split("\"}]'><span class='asterisk'>*</span></span>")[0]);
                }
            }

            if (disclaimers.length > 0) {
                for (var j = 0; j < disclaimers.length; j++) {
                    re = new RegExp(disclaimers[j], 'g');
                    outputString = outputString.replace(re, this.escapeHtml(disclaimers[j]));
                }

            }

            return outputString;
        },

        entityMap: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;'
        },

        escapeHtml: function(inputString) {
            var emap = this.entityMap;
            return String(inputString).replace(/[&<>"']/g, function(s) {
                return emap[s];
            });
        }


    };
});
