/* global mboxRecipe,mboxRecipeManualOverride */

define(["jquery"], function($) {
    return {

        /**
         * Initializes the owner benefits mbox tile.
         *
         * @param tile{jquery|HTMLElement} A pointer to the tile element.
         * @author mwright
         */
        initMBox: function($tile) {
            //mboxCreate("homepageOwnerBenefits");

            // mock
            //            var mboxRecipe = {
            //                options: {
            //                    "image": {
            //                        "srcRect": "http://lorempixel.com/512/256/cats/1",
            //                        "srcSquare": "http://lorempixel.com/256/256/cats/1",
            //                        "title": "FPO Image"
            //                    },
            //                    "caption": {
            //                        "darkOnLight": false,
            //                        "title": "Mock mbox test",
            //                        "description": "This is a test. Lorem ipsum dolor sit amet?"
            //                    },
            //                    "button": {
            //                        "text": "Test Learn more",
            //                        "url": "http://testurl.com/"
            //                    }
            //                }
            //            };

            var mboxJSON = null,
                opts = null;

            // mbox recipe is loaded from the Adobe Target service.
            if (typeof mboxRecipe !== "undefined" && mboxRecipe && mboxRecipe.options) {
                opts = mboxRecipe.options;
                if (opts.hasOwnProperty("image") && opts.hasOwnProperty("caption") && opts.hasOwnProperty("button")) {
                    mboxJSON = opts;
                }

                // if
            }
            //            else {
            // Handle the case of no mboxRecipe being found.
            // Currently, nothing happens in this case but if it did,
            // it would go here.
            // e.g.: mboxJSON = mockData;
            //            }

            // If the recipe was manually added in the query string, this will override other methods.
            if (typeof mboxRecipeManualOverride !== "undefined") {
                opts = mboxRecipeManualOverride.options;
                if (opts && opts.hasOwnProperty("image") && opts.hasOwnProperty("caption") && opts.hasOwnProperty("button")) {
                    mboxJSON = opts;
                } else {
                    throw new Error("Your query string for the Owner Benefits mbox is not well-formed. Please ensure that it has an 'options' object containing 'image', 'caption' and 'button' objects.");
                }
            }

            // if json exists, inject data from mbox into tile.
            if (mboxJSON) {
                var $image = $tile.find(".background");
                $image.data("squareSrc", mboxJSON.image.srcSquare);
                $image.data("rectSrc", mboxJSON.image.srcRect);
                if ($tile.hasClass("square")) {
                    $image.attr("src", mboxJSON.image.srcSquare);
                } else {
                    $image.attr("src", mboxJSON.image.srcRect);
                }
                $image.attr("title", mboxJSON.image.title);

                var $caption = $tile.find(".caption");
                $caption.find(".title").text(mboxJSON.caption.title);
                $caption.find(".description").text(mboxJSON.caption.description);
                $caption.find(".btn").text(mboxJSON.button.text);
                if (mboxJSON.caption.darkOnLight) {
                    $caption.addClass("inverted");
                }
                $tile.find(".hit-area").attr("href", mboxJSON.button.url);
                $tile.find(".caption-inner>a").attr("href", mboxJSON.button.url);
            }
            //            else {
            // if no data is set, use the default values from the CMS.
            //            }
        }
    };
});
