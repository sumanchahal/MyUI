/**
 * @file Behaviors for the compare select trim page
 */
define([
    "jquery",
    "page/compare/landing/ModelListing",
    "PointBreak",
    "analytics",
    "waypoints",
    "waypoints-sticky"
], function(
    $,
    ModelListing,
    PointBreak,
    analytics
) {

    var smallInstantiated = false;
    var pointbreak = new PointBreak();
    var thisWindow = $(window),
        stickyVehicleSet = false,
        windowInterval;
    pointbreak.breakpoints.small = 700;
    var vehicleContainer = $('.vehicle-container'),
        selectedVehicleHeight = $('.selected-vehicle').outerHeight(),
        WAYPOINT_OFFSET = 20,
        SELECTED_VEHICLE_WAYPOINT_OFFSET = -65;

    /**
     * Kicks off the page-level logic
     */

    function init() {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            setupSmallExperience();
        } else {
            pointbreak.addChangeListener(onBreakpointChange);
        }
        getWindowDimensions();

        // only sets sticky vehicle if it will fit inside the window
        if (selectedVehicleHeight <= $(window).height()) {
            setUpStickyVehicle();
        }
        setUpWindowResize();
        initAnalytics();
    }

    /**
     * Callback executed when the viewport changes between breakpoints
     */

    function onBreakpointChange(e) {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            setupSmallExperience();
            disableStickyVehicle();
        } else if (pointbreak.isCurrentBreakpoint("medium")) {
            if (!stickyVehicleSet) {
                enableStickyVehicle();
            }
        }
    }

    /**
     * Instantiates model listing component and jumps to
     * model id if present
     */

    function setupSmallExperience() {
        if (smallInstantiated === false) {
            setupModelListing();
            smallInstantiated = true;
        }
    }

    /**
     * Instantiates model listing component and jumps to
     * model id if present
     */

    function setupModelListing() {
        var modelId = getModelId(),
            modelListing = new ModelListing({
                pointbreak: pointbreak
            });

        modelListing.jumpToModel(modelId);
    }

    /**
     * Returns the current model id of the page, parses from URL
     *
     * @returns modelId
     */

    function getModelId() {
        var pathValues = document.location.href.split("/"),
            modelId = pathValues[pathValues.length - 1];

        return modelId;
    }

    /**
     * Set up Lexus vehicle to be sticky on scroll
     *
     */

    function setUpStickyVehicle() {
        vehicleContainer.waypoint("sticky", {
            offset: SELECTED_VEHICLE_WAYPOINT_OFFSET
        });

        // if the top element of the footer is the disclaimers container, use this to set the waypoint instead of the footer
        var $footerTopElement,
            optionalDisclaimersHeight = 0,
            $optionalDisclaimers = $('.optional-disclaimers-container');

        if ($optionalDisclaimers.css('display') === 'block') {
            $footerTopElement = $optionalDisclaimers;
            optionalDisclaimersHeight = $optionalDisclaimers.outerHeight();
        } else {
            $footerTopElement = $('footer');
            optionalDisclaimersHeight = 0;
        }

        $footerTopElement.waypoint(function(direction) {
            if (direction === "down") {
                vehicleContainer.addClass("unsticky");
                $('.sticky-wrapper').css('top', $(document).height() - $('.selected-vehicle').outerHeight() - $('footer').outerHeight() - $('.footer-disclaimer-container').outerHeight() - optionalDisclaimersHeight - WAYPOINT_OFFSET); //$('.selected-vehicle').outerHeight() + $('footer').outerHeight() + $('.footer-disclaimer-container').outerHeight() + $('.optional-disclaimers-container').outerHeight() + WAYPOINT_OFFSET);
            } else {
                vehicleContainer.removeClass("unsticky");
                $('.sticky-wrapper').css('top', 'auto');
            }
        }, {
            offset: selectedVehicleHeight + WAYPOINT_OFFSET
        });
    }

    /**
     * Remove stickiness on selected vehicle
     *
     */

    function disableStickyVehicle() {
        clearInterval(windowInterval);
        thisWindow.off('resize');
        stickyVehicleSet = false;
        $.waypoints('disable');
        vehicleContainer.removeClass("unsticky");
        $('.sticky-wrapper').css('bottom', 'auto');
    }

    /**
     * Enable stickiness on selected vehicle
     *
     */

    function enableStickyVehicle() {
        $.waypoints('enable');
        $.waypoints('refresh');
        getWindowDimensions();
        setUpWindowResize();
    }

    /**
     * Get current window dimensions
     *
     */

    function getWindowDimensions() {
        windowHeight = thisWindow.outerHeight();
        windowWidth = thisWindow.outerWidth();
    }

    /**
     * Waypoints are refreshed after a window resize
     *
     */

    function setUpWindowResize() {
        stickyVehicleSet = true;
        thisWindow.on('resize', function() {
            thisWindow.off('resize');
            windowInterval = setInterval(function() {
                if (thisWindow.outerHeight() === windowHeight && thisWindow.outerWidth() === windowWidth) {
                    clearInterval(windowInterval);
                    $.waypoints('refresh');
                    selectedVehicleHeight = $('.selected-vehicle').outerHeight();
                    setUpWindowResize();
                }
                getWindowDimensions();
            }, 200);
        });
    }

    /**
     * Analytics tracking
     *
     */

    function initAnalytics() {
        // capture model selection click
        var $trim = $('.lexus-trim');
        $trim.on('click touch', function(event) {
            var modelTrimName = $(event.currentTarget).find('.trim-name').text().trim();
            analytics.helper.fireCompareSelectTrimClick(modelTrimName);
        });
    }

    init();

});
