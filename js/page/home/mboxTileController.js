/* global mboxRecipe,mboxRecipeManualOverride */

define(["jquery"], function($) {
    return {

        /**
         * Initializes the owner benefits mbox tile.
         *
         *
         * @author mwright
         */
        init: function() {
            //mboxCreate("homepageOwnerBenefits");

            var mboxJSON = null,
                opts = null;

            // mbox recipe is loaded from the Adobe Target service.
            if (typeof mboxRecipe !== "undefined") {
                opts = mboxRecipe[0].options;
                for (var i = 0, mBoxCount = mboxRecipe.length; i < mBoxCount; ++i) {
                    for (var j = 0, optionCount = mboxRecipe[i].options.length; j < optionCount; ++j) {
                        if (mboxRecipe[i].options[j].hasOwnProperty("id") && mboxRecipe[i].options[j].hasOwnProperty("image") && mboxRecipe[i].options[j].hasOwnProperty("caption") && mboxRecipe[i].options[j].hasOwnProperty("button")) {
                            this.swapTile(mboxRecipe[i].options[j]);
                        }
                    }
                }
            }
        },

        swapTile: function(options) {
            $tile = $("#" + options.id);
            $tile.addClass("mboxTile");
            var $image = $tile.find(".background");
            $image.data("squareSrc", options.image.srcSquare);
            $image.data("rectSrc", options.image.srcRect);
            if ($tile.hasClass("square")) {
                $image.attr("src", options.image.srcSquare);
            } else {
                $image.attr("src", options.image.srcRect);
            }
            $image.attr("title", options.image.title);

            var $caption = $tile.find(".caption");
            $caption.find(".title").text(options.caption.title);
            $caption.find(".description").text(options.caption.description);
            $caption.find(".btn").text(options.button.text);
            if (options.caption.darkOnLight) {
                $caption.addClass("inverted");
            }
            $tile.find(".hit-area").attr("href", options.button.url);
            $tile.find(".caption-inner>a").attr("href", options.button.url);
            var disclaimers = $tile.find(".image-disclaimer");
            if (disclaimers.length === 0) {
                $tile.find(".caption-inner").append('<div class="image-disclaimer "><ul></ul></div>');
            }
            disclaimers = $tile.find(".image-disclaimer ul");
            console.log(options.disclaimers);
            if (options.disclaimers && options.disclaimers.length > 0) {
                disclaimers.append("<li>" + options.disclaimers.join("</li><li>") + "</li>");
            } else {
                disclaimers.empty();
            }
            $image.load(function() {
                if (!Modernizr.cssanimations) {
                    $tile.animate({
                        opacity: 1
                    }, 1000);
                    // if css3 animations are supported add a class to set opacity: 1
                } else {
                    $tile.addClass('loaded');
                }
                // used by tile-video to make sure video doesnt play before image loads.
                $tile.addClass('img-loaded');
            });
        }
    };
});
