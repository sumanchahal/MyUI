define(["jquery", "component/Carousel", "analytics"], function($, Carousel, analytics) {
    /**
     * Controller for a carousel of accolades.
     * @see init()
     */

    return {

        /**
         * Initialize the accolade carousel.
         *
         * @param contextQuery {String} The selector for the location of the carousel in the dom.
         * @param slideQuery {String} The selector for a carousel slide in the dom.
         * @returns {Carousel} an instance of the carousel.
         * @public
         */
        init: function(contextQuery, slideQuery) {
            var $context = $(contextQuery),
                settings = {
                    instance: $context,
                    slideSelector: slideQuery,
                    showIndicators: true,
                    showNextPrev: true
                };
            this.carousel = new Carousel(settings);
            this.initAnalytics(false, this.carousel);
            return this.carousel;
        },

        /**
         * Initialize the accolade carousel with a single accolade (i.e. it doesn't use the carousel)
         * @public
         */
        initSingleAccolade: function() {
            this.initAnalytics(true);
        },

        /**
         * Set up the analytics for the accolades.
         * @param isSingle
         * @private
         */
        initAnalytics: function(isSingle, myCarousel) {
            var $accoladeElements = $(".accolade-wrapper");
            $accoladeElements.on("click touch", ".link, .control, .indicator", function(event) {
                var currentIndex = myCarousel.getCurrentIndex();
                //Getting the carousel length using Jquery, subtracting by 1 to account for indicators.
                var carouselLength = $(".accolade-container.carousel").children().length - 1;
                //Making sure we don't go past the number of accolades in a carousel.
                currentIndex = currentIndex % carouselLength;
                var nextAcollade = $(".accolade-container.carousel").children().eq(currentIndex);
                var $clickTarget = $(event.target),
                    $thisImageContainer = $clickTarget.closest(".accolade-item").find(".image"),
                    section = "Model Section",
                    action = "Learn More",
                    contentTitle;
                // set contentTitle
                // if single accolade
                if (isSingle) {
                    // if image exists
                    if ($thisImageContainer.has("img").length) {
                        contentTitle = $thisImageContainer.find("img").attr("title");
                    } else {
                        contentTitle = $thisImageContainer.text().trim();
                    }
                } else {
                    // if image exists
                    if ($thisImageContainer.has("img").length) {
                        contentTitle = nextAcollade.find(".accolade-item.single-slide").find(".image").find("img").attr("title");
                    } else {
                        contentTitle = nextAcollade.find(".accolade-item.single-slide").find(".image").text().trim();
                    }
                }

                // if carousel
                if ($clickTarget.hasClass("control") || $clickTarget.hasClass("indicator")) {
                    action = "Carousel";
                }
                analytics.helper.fireAccoladeClick(section, action, contentTitle);
            });

        }
    };
});
