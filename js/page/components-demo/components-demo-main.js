require([
    "jquery",
    "component/Carousel",
    "PointBreak"
], function(
    $,
    Carousel,
    PointBreak
) {

    /**
     * Note: this could be encapulated into it's own component via composition,
     * but right now it's just splayed out
     */
    var pointbreak = new PointBreak(),
        carousel = null;

    $(function() {

        // Initialize carousel
        var defaultSettings = {
            instance: $(".vehicle-offers"),
            slideSelector: ".offer"
        };

        defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
        carousel = new Carousel(defaultSettings);

        pointbreak.addChangeListener(function() {
            defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
            carousel.resetSlides(defaultSettings);
        });

    });

    /**
     * returns carousel defaults based off breakpoints
     */

    function getBreakpointSettings() {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            return {
                slidesPerPage: 1,
                showNextPrev: false,
                showIndicators: true,
                animationDuration: 300
            };
        } else if (pointbreak.isCurrentBreakpoint(PointBreak.MED_BREAKPOINT)) {
            return {
                slidesPerPage: 2,
                showNextPrev: false,
                showIndicators: true
            };
        } else {
            return {
                slidesPerPage: 3,
                showNextPrev: true,
                showIndicators: true
            };
        }
    }

});
