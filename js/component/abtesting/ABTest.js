define(["jquery"], function($) {
    /**
     * ABTest module
     * @see init()
     */

    return {

        /**
         * Initialize the ABTest events.
         * @public
         */
        init: function() {
            // Add event listener for Maxymiser
            document.addEventListener("OptimizationEvent", this.ABTestStart.bind(this));
            return;
        },

        ABTestStart: function(event) {
            for (var i = 0; i < event.details.length; i++) {
                if (event.details[i].options.ignore === true) {
                    continue;
                }
                if (!event.details[i].options.updates) {
                    // Not a global test update
                    continue;
                }
                for (var j = 0; j < event.details[i].options.updates.length; j++) {
                    this.updateDOM(event.details[i].options.updates[j]);
                }
            }
        },

        updateDOM: function(update) {
            switch (update.type) {
                case "text":
                    $(update.selector).text(update.text);
                    break;
                case "attribute":
                    $(update.selector).attr(update.attribute, update.value);
                    break;
                default:
                    console.warn("Incorrect type mboxRecipe");
                    break;
            }
        }
    };
});
