/**
 * Shrinks a text element until the size is small enough to fit in the width.
 *
 * @class util-fitText
 * @uses jQuery
 */
define(["jquery"], function($) {
    return {
        /**
         * Takes an array of sizes that will be used to try to shrink the text.
         *
         * @method resize
         * @returns minSize - smallest fontSize applied to selected elements
         * @param selector A JQuery style selector to use for the input.
         * @param width The maximum width that the text must fit inside.
         * @param sizes An array of sizes that will be used for the text.
         *              This array must be sorted from biggest to smallest.
         *              When the array is exhauseted, the size will be reduced by a percentage.
         * @public
         */
        resize: function(selector, width, sizes, resetTo) {
            var element,
                elements = $(selector),
                i = 0,
                l = elements.length,
                iterations, fontSize, elementWidth,
                oldFloat, oldPosition, oldSize, oldLetterSpacing, oldWidth, minSize;
            for (; i < l; i += 1) {
                element = $(elements[i]);

                oldFloat = element.css("float");
                oldPosition = element.css("position");
                oldSize = parseInt(element.css("font-size"), 10);
                oldLetterSpacing = parseInt(element.css("letter-spacing"), 10);

                if (!sizes || sizes.length < 1) {
                    sizes = [oldSize];
                }

                element.css("float", "left").css("position", "absolute");

                iterations = 0;
                do {
                    if (iterations >= sizes.length) {
                        fontSize *= 0.8; // shrink the text by 80% if there are no sizes left.
                    } else {
                        fontSize = sizes[iterations];
                    }

                    if (typeof minSize === 'undefined' || fontSize < minSize) {
                        minSize = fontSize;
                    }

                    element.css("letter-spacing", fontSize / oldSize * oldLetterSpacing);
                    element.css("font-size", fontSize);
                    elementWidth = element.width();
                    iterations++;
                } while (elementWidth > width && iterations < 15);
                element.css("float", oldFloat).css("position", oldPosition);
            }

            return minSize;
        }
    };
});
