/**
 * @file Behaviors for the compare select competitor page
 */
define([
    "lexus",
    "jquery",
    "component/TrimSelector",
    "component/Carousel",
    "component/FullPageLoader",
    "PointBreak",
    "analytics"
], function(
    LEXUS,
    $,
    TrimSelector,
    Carousel,
    FullPageLoader,
    PointBreak,
    analytics
) {

    var pointbreak = new PointBreak();
    pointbreak.breakpoints.small = 700;

    var $vehicleContainer = $('.vehicle-container'),
        selectedVehicleHeight = $('.selected-vehicle').outerHeight(),
        ON_CLASS = "on",
        VEHICLE_TOP_OFFSET = -65,
        WAYPOINT_OFFSET = 20,
        ANIMATION_WAIT = 300,
        VEHICLE_MARGIN = 0;

    function init() {
        backButtonLoad();
        setupTrimSelector();
        setupReviewCarousel();
        LEXUS.loadingAnimation.stop();
        FullPageLoader.init();


        $(window).load(function() {

            // only sets sticky vehicle if it will fit inside the window
            if (selectedVehicleHeight <= $(window).height()) {
                refreshMinimumHeight();
                setUpStickyVehicle();
            }
        });


        initAnalytics();
    }

    /**
     * instantiates trim selector module
     */

    function setupTrimSelector() {
        var trimSelector = new TrimSelector({
            instance: $(".module.trim-selector").eq(0),
            pointbreak: pointbreak,
            onCompareTraySubmit: showLoadingState,
            onCompareTrayFull: refreshWaypoints
        });
    }


    /**
     * Ensures that compare tray is at least as tall as the selected vehicle, so that selected vehicle doesn't end up cut off
     */

    function refreshMinimumHeight() {
        selectedVehicleHeight = $('.selected-vehicle').outerHeight();
        $('.trim-selector').css('min-height', selectedVehicleHeight + WAYPOINT_OFFSET + VEHICLE_MARGIN);
    }

    /**
     * Ensures that compare tray is at least as tall as the selected vehicle, so that selected vehicle doesn't end up cut off
     */

    function refreshWaypoints() {
        $vehicleContainer.removeClass('stuck');
        setTimeout(function() {
            $.waypoints('refresh');
        }, ANIMATION_WAIT / 2);
    }

    /**
     * Displays a greyed out overlay with a loading
     * animation so the user knows something is happening
     * while the compare report is generated.
     */

    function showLoadingState() {
        LEXUS.loadingAnimation.start();
        FullPageLoader.open();
    }

    /**
     * If there are more than 1 reviews, they need to
     * appear in a carousel
     */

    function setupReviewCarousel(isSingle) {
        if ($(".reviews").get(0) !== null) {
            var reviewCarousel = new Carousel({
                instance: $(".reviews").eq(0),
                slideSelector: ".review",
                slidesPerPage: 1,
                showNextPrev: true,
                showIndicators: true
            });

            // If window resizes horizontally, carousel gets reset.
            var $thisWindow = $(window),
                windowWidth = $thisWindow.width();

        }

        // Accolade click analytics
        var accoladeModule = $(".reviews");
        accoladeModule.on("click touch", function(event) {
            var $clickTarget = $(event.target),
                section = "Compare",
                module = "Accolade",
                action = "Read More",
                contentTitle,
                container = "Accolade Module",
                modelName = LEXUS.seriesName;
            if (isSingle) {
                contentTitle = $('.description').text().trim();
            } else {
                contentTitle = $('.slide.active .description').text().trim();
            }
            if ($clickTarget.hasClass('indicators') || $clickTarget.hasClass('control') || $clickTarget.hasClass('indicator')) {
                action = 'Carousel';
            }
            analytics.helper.fireAccoladeClick(section, module, action, contentTitle, container, modelName);
        });
    }

    /**
     * When iOS has the back button hit, it doesn't reload the page
     * this is a fix to make sure the correct state is set
     */

    function backButtonLoad() {
        $(window).on('pageshow', function(e) {
            if (e.originalEvent.persisted) {
                window.location.reload();
            }
        });
    }


    /**
     * Set up Lexus vehicle to be sticky on scroll
     *
     */

    function setUpStickyVehicle() {
        setUpVehicleTopWaypoint();
        setUpFooterWaypoint();
    }

    /**
     * Set up selected vehicle top waypoint
     *
     */

    function setUpVehicleTopWaypoint() {
        $vehicleContainer.waypoint("sticky", {
            offset: VEHICLE_TOP_OFFSET,
            handler: function() {
                if (typeof LEXUS.globalNav !== "undefined") {
                    LEXUS.globalNav.closeAllMenus();
                }
            }
        });
    }

    /**
     * Set up selected vehicle bottom waypoint
     *
     */

    function setUpFooterWaypoint() {
        var $productContainer = $(".product-container"),
            $stickyWrapper = $productContainer.find(".sticky-wrapper");

        $('footer').waypoint(function(direction) {
            if (direction === "down") {
                var bottom = $('footer').outerHeight() + $('.footer-disclaimer-container').outerHeight() + $('.selected-vehicle').outerHeight() + WAYPOINT_OFFSET;
                $vehicleContainer.addClass("unsticky");
                $stickyWrapper.css({
                    bottom: bottom,
                    height: $('.trim-selector').height()
                });
            } else {
                $vehicleContainer.removeClass("unsticky");
                $stickyWrapper.css('bottom', 'auto');
            }
        }, {
            offset: selectedVehicleHeight + WAYPOINT_OFFSET
        });
    }

    /**
     * Initialize analytics
     *
     */

    function initAnalytics() {
        var modelName = LEXUS.seriesName,
            trim = LEXUS.trimName;
        analytics.helper.fireCompareSelectCompetitorLoad(modelName, trim);


        //carousel indicators / arrows
        var $genericCarousel = $('.accolade-wrapper');

        $('body').on('click', '.indicator, .control', $genericCarousel.find('.indicators'), function(event) {
            var $parentCarousel = $(event.currentTarget).parents('.carousel'),
                $slide = $('.slide.active', $parentCarousel),
                section = $('body').data('section'),
                action = 'Carousel',
                contentTitle = $.trim($('.attribution', $slide).text()),
                modelName = LEXUS.seriesName;

            analytics.helper.fireCompareAccoladeClick(section, action, contentTitle, modelName);

        });
    }

    init();
});
