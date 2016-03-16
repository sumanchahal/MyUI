/* global Microsoft, */

define([
    "async!//ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0!OnScriptLoad",
    "jquery",
    "analytics",
    "PointBreak",
    "component/map/mapAPIKey",
    "util/renderTemplate",
    "util/smartResize"
], function(
    BingAPI,
    $,
    analytics,
    PointBreak,
    API_KEY,
    renderTemplate
) {

    /**
     * Decorator for Bing Maps, adds helpers for setting sizes
     * recentering map etc...
     *
     * @class Map
     * @param {jquery} el
     * @param {Object} params - configuration prameters
     * @typedef  {config} params - configuration parameters.
     * @property {Number} zoom - default zoom
     * @property {Number} width - default width
     * @property {Number} height - default height
     * @property {Array} center - map center point
     * @property {Boolean} showScalebar
     * @property {Boolean} disableClickZoom - prevent zooming on DblClick
     * @property {Boolean} disableBirdseye
     * @property {Boolean} autoResize - resize map based on parent $el
     * @property {Boolean} showCopyright - bing maps copyright info
     * @property {Boolean} disableKeyboardInput - A boolean value indicating whether to disable the map’s response to keyboard input. The default value is false.
     * @property {Boolean} disableUserInput
     * @property {Boolean} showDashboard
     * @property {Boolean} disableMouseWheel
     * @property {Boolean} showMapTypeSelector - switch between map types
     * @property {String} theme
     * @property {Boolean} enableSearchLogo - bing maps logo
     * @property {String} mapType
     * @property {Object} pinIcon
     * @property {Object} pinIconHover
     * @property {Array} pins
     * @property {string} tooltipTemplate
     * @property {Function} onResize - resize callback
     * @property {Function} onReady - map is initialzed callback
     * @property {Function} onPinMouseover - mouseover callback
     * @property {Function} onPinMouseout - mouseout callback
     * @property {Function} onInfoboxClick - infobox click callback
     * @property {Boolean} supressInfoboxAnalytics
     */
    var Map = function(el, params) {


        var DEFAULT_TOOLTIP_TEMPLATE = '' +
            '<div class="map-tooltip">' +
            '<a href="{{url}}">' +
            '<div class="dealer-locator-tooltip-top">' +
            '<h3>{{name}}<span class="dealer-locator-tooltip-arrow"></span></h3>' +
            '{{address}}' +
            '</div>' +
            '<div class="dealer-locator-tooltip-bottom"></div>' +
            '</a>' +
            '</div>';


        var opts = $.extend({
            zoom: 7,
            width: 600,
            height: 600,
            center: [],
            showScalebar: false,
            disableBirdseye: true,
            autoResize: false,
            disableClickZoom: true,
            showCopyright: false,
            disableUserInput: false,
            disableKeyboardInput: true,
            showDashboard: true,
            disableMouseWheel: true,
            showMapTypeSelector: false,
            theme: 'Microsoft.Maps.Themes.BingTheme',
            enableSearchLogo: false,
            mapType: Microsoft.Maps.MapTypeId.road,
            pinIcon: {
                icon: "/assets/img/dealer-locator/icon-marker-black.png",
                width: 35,
                height: 48
            },
            pinIconElite: {
                icon: "/assets/img/dealer-locator/icon-marker-gold-hightlighted.png",
                width: 35,
                height: 48
            },
            pinIconHover: {
                icon: "/assets/img/dealer-locator/lexus-pin-offstate.png",
                width: 35,
                height: 48
            },
            pins: [],
            tooltipTemplate: DEFAULT_TOOLTIP_TEMPLATE,
            supressInfoboxAnalytics: false,
            onResize: $.noop,
            onReady: $.noop,
            onPinMouseover: $.noop

        }, params);

        var $win = $(window),
            $microsoftMap,

            map,
            infobox,

            activeDealer = null,
            previousActiveDealer = null,
            activeDealerMapClick = false,
            hoveredDealer = null,
            previousHoveredDealer = null,

            /** @type {Array.<Location>} */
            locationObjects = [],
            /** @type {Array.<Object>} */
            microsoftMapPins = [],

            delayedHighlightId = 0,
            pinZIndex = 100,
            pointbreak = new PointBreak(),
            elParent = $(el).parent(),

            MAX_Z_INDEX = 10000,
            // default lat if no value is provided
            CENTER_DEFAULT_LAT = opts.center[0] ? opts.center[0] : "42.24497",
            // default lng if no value is provided
            CENTER_DEFAULT_LNG = opts.center[1] ? opts.center[1] : "-96.3917904",

            tooltipTemplate = opts.tooltipTemplate;

        /**
         * Add Multiple Pins to the Map
         *
         * @param {Array.<Location>} locations
         * @public
         */

        function addLocations(locations) {

            if (locations.length === 0) {
                return;
            }

            locations.forEach(function(location) {
                pinZIndex += 10;
                addLocation(location, pinZIndex);
            });

            pinZIndex = 100;

            if (locations.length === 1) {
                setBestView(14);
            } else {
                setBestView();
            }
        }

        /**
         * Initialize Module, wait for Map Theme callback
         */

        function init() {
            Microsoft.Maps.loadModule(opts.theme, {
                callback: initMap
            });
        }

        /**
         * Initialze the Map
         *
         * @private
         */

        function initMap() {

            bindEvents();

            createMicrosoftMap();


            if (opts.center[0] !== "" && opts.center[1] !== "" && !pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                addCurrentLocationPin(opts.center);
            }

            addLocations(opts.pins);

            initInfoBox();

        }

        /**
         * Create the Map
         *
         * @private
         */

        function createMicrosoftMap() {
            //if no lng/lat provided use default location

            if (opts.center[0] === "" || opts.center[0] === undefined && opts.center[1] === "" || opts.center[1] === undefined) {
                opts.zoom = 5;
                opts.center = [CENTER_DEFAULT_LAT, CENTER_DEFAULT_LNG];
            }

            map = new Microsoft.Maps.Map(el, {
                credentials: API_KEY,
                center: new Microsoft.Maps.Location(opts.center[0], opts.center[1]),
                mapTypeId: opts.mapType,
                zoom: opts.zoom,
                width: opts.width,
                disableUserInput: opts.disableUserInput,
                disableKeyboardInput: opts.disableKeyboardInput,
                height: opts.height,
                showAccuracyCircle: true,
                showScalebar: opts.showScalebar,
                disableBirdseye: opts.disableBirdseye,
                showCopyright: opts.showCopyright,
                showMapTypeSelector: opts.showMapTypeSelector,
                enableSearchLogo: opts.enableSearchLogo
            });

            //a reference to the newly created map

            if (map !== undefined) {
                $microsoftMap = $(el).find(".MicrosoftMap");
            }

            if (opts.autoResize) {
                autoResize();
            }

            if (opts.disableMouseWheel) {
                Microsoft.Maps.Events.addHandler(map, 'mousewheel', function(e) {
                    if (e.targetType === 'map' || e.targetType === 'polygon' || e.targetType === 'pushpin') {
                        e.handled = true;
                    }
                });
            }

            //catch map dblClick
            if (opts.disableClickZoom) {
                Microsoft.Maps.Events.addHandler(map, 'dblclick', onDoubleClickPin);
            }

            Microsoft.Maps.Events.addHandler(map, 'click', onMapClick);

            if (opts.onReady) {
                opts.onReady();
            }

            // fires when map view changes
            Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function(e) {
                if (delayedHighlightId !== 0) {
                    highlightPin(delayedHighlightId);
                    delayedHighlightId = 0;
                }
            });
        }

        /**
         * Bind Events
         *
         * @private
         */

        function bindEvents() {

            $(window).on("resize.map", function() {
                if (typeof(map) !== 'undefined' && map !== null) {
                    opts.onResize.call();
                    setDimensions();
                    if (opts.autoResize) {
                        autoResize();
                    }
                }
            });
        }

        /**
         * @public
         */

        function destroy() {
            if (typeof(map) !== 'undefined' && map !== null) {
                map.dispose();
                map = null;
                $(window).off("resize.map");
            }
        }

        /**
         * Auto Resize based on Parent Element
         *
         * @public
         */

        function autoResize() {
            if (typeof(map) !== 'undefined' || map !== null) {
                map.setView({
                    width: elParent.width(),
                    height: elParent.height()
                });
            }
        }

        /**
         * Set Dimensions
         *
         * @param {Number?} width
         * @param {Number?} height
         * @public
         */

        function setDimensions(width, height) {

            if (width === "" && height === "") {
                width = $(el).width();
                height = $win.height() - $(el).offset().top;
            }

            map.setView({
                height: height,
                width: width
            });
        }

        /**
         * Set the Map Zoom level
         *
         * @param {Number} zoom
         * @public
         */

        function setZoom(zoom) {
            if (typeof(map) !== 'undefined' && map !== null) {
                map.setView({
                    zoom: zoom
                });
            }
        }

        /**
         * Set the Map center point
         *
         * @param {Array.<Number>} location
         * @public
         */

        function setMapCenter(location) {
            var center = new Microsoft.Maps.Location(location[0], location[1]);

            if (typeof(map) !== 'undefined' && map !== null) {
                map.setView({
                    center: center
                });
            }
        }

        /**
         * Centers the map on the pin with given id.
         * @param id {String}
         */

        function centerMapOnDealer(id) {
            var location = getLocationDataById(id);

            if (location) {
                setMapCenter([location.getLatitude(), location.getLongitude()]);
            }
        }

        /**
         * Calculate the best viewport based on the number of markers
         *
         * @private
         */

        function setBestView(zoom) {

            var bestview = Microsoft.Maps.LocationRect.fromLocations(locationObjects);

            if (zoom !== "") {
                setZoom(zoom);
            } else {
                setZoom(opts.zoom);
            }

            if (typeof(map) !== 'undefined' && map !== null) {

                map.setView({
                    bounds: bestview,
                    padding: 50
                });
            }
        }

        function isReady() {
            return (map !== null);
        }


        /**
         * Init Info Box
         *
         * @private
         */

        function initInfoBox() {
            /**
             * type {Microsoft.Maps.InfoboxOptions}
             */
            var infoboxOptions = {
                visible: false,
                offset: new Microsoft.Maps.Point(-120, 75),
                width: 240,
                showPointer: false,
                showCloseButton: false
            };

            /**
             * type {Microsoft.Maps.Infobox}
             */
            infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), infoboxOptions);

            Microsoft.Maps.Events.addHandler(infobox, 'click', onInfoboxClick);

            map.entities.push(infobox);
        }

        function getInfobox() {
            return infobox;
        }

        /**
         * Called when the infobox element is clicked.
         *
         * @param {Object} MS Event
         */

        function onInfoboxClick(event) {
            // analytics
            if (params.supressInfoboxAnalytics !== true) {
                var location = infobox.getLocation();
                var action = "Dealer Infobox";
                analytics.helper.fireFindADealerModuleClick(action, location.getId(), location.getName());
            }
            if (params.onInfoboxClick) {
                params.onInfoboxClick(event, event.target._location);
            }
        }


        /**
         * Show Info Box
         *
         * @param {String} dealerId
         * @public
         */

        function showInfobox(dealerId) {

            var pin = getMicrosoftMapPinById(dealerId);
            var location = getLocationDataById(dealerId);
            if (pin && location) {

                var tooltipData = {
                    url: location.getDetailUrl(),
                    name: location.getName(),
                    address: location.getAddressAsHTML(),
                    dealerId: location.getId()
                };

                var tooltipHTML = renderTemplate(tooltipTemplate, tooltipData);

                infobox.setLocation(location);

                infobox.setOptions({
                    visible: true,
                    htmlContent: tooltipHTML
                });

                var $infobox = $(".map-tooltip");
                $infobox.parent().parent().css("z-index", 99999);
            }
        }

        /**
         * Hide Info Box
         *
         * @public
         */

        function hideInfoBox() {
            if (infobox) {
                infobox.setOptions({
                    visible: false
                });
            }
        }

        /**
         * Add Single Pin to the Map
         *
         * @param location {Location}
         * @param pinZIndex {Int}
         * @private
         */

        function addLocation(location, pinZIndex) {
            var ms_location = new Microsoft.Maps.Location(location.getLatitude(), location.getLongitude());
            var pinIcon = location.hasEliteStatus ? opts.pinIconElite.icon : opts.pinIcon.icon;
            var pin = new Microsoft.Maps.Pushpin(
                ms_location, {
                    icon: pinIcon,
                    height: opts.pinIcon.height,
                    width: opts.pinIcon.width,
                    typeName: "dealer-" + location.getId(),
                    zIndex: pinZIndex
                }
            );
            pin.dealerData = location;

            bindEventsForPin(pin, opts.disableClickZoom);

            // Store data in arrays
            // store location data for later.
            locationObjects.push(location);
            // store pushpins for later.
            microsoftMapPins.push(pin);

            if (map && map.entities) {
                map.entities.push(pin);
            }
        }

        /**
         * Adds event listeners to Pushpin.
         *
         * @param pin {Object} Pushpin
         * @param disableClickZoom {Boolean}
         */

        function bindEventsForPin(pin, disableClickZoom) {
            // add pin events
            Microsoft.Maps.Events.addHandler(pin, 'mouseover', onMouseOverPin);
            Microsoft.Maps.Events.addHandler(pin, 'mouseout', onMouseOutPin);
            Microsoft.Maps.Events.addHandler(pin, 'click', onClickPin);
            if (disableClickZoom) {
                Microsoft.Maps.Events.addHandler(pin, 'dblclick', onDoubleClickPin);
            }
        }

        /**
         * Location Marker for users current position
         *
         * @param location
         * @param radius
         * @param backgroundColor
         * @param borderColor
         * @param strokeThickness
         * @returns {Object}
         * @private
         */

        function createUserLocationMarker(location, radius, backgroundColor, borderColor, strokeThickness) {
            var R = 6371;
            var lat = (location[0] * Math.PI) / 180;
            var lon = (location[1] * Math.PI) / 180;
            var d = parseFloat(radius) / R;
            var circlePoints = [];
            var x;
            var brng;

            for (x = 0; x <= 360; x += 5) {
                var p2 = new Microsoft.Maps.Location(0, 0);
                brng = x * Math.PI / 180;
                p2.latitude = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng));

                p2.longitude = ((lon + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat),
                    Math.cos(d) - Math.sin(lat) * Math.sin(p2.latitude))) * 180) / Math.PI;
                p2.latitude = (p2.latitude * 180) / Math.PI;
                circlePoints.push(p2);
            }

            return new Microsoft.Maps.Polygon(circlePoints, {
                fillColor: backgroundColor,
                strokeColor: borderColor,
                strokeThickness: strokeThickness
            });
        }

        /**
         * Add Current Location Marker
         *
         * @param {Location} location
         * @public
         */

        function addCurrentLocationPin(location) {
            var colorBlack = new Microsoft.Maps.Color(100, 0, 0, 0);
            var colorWhite = new Microsoft.Maps.Color(255, 255, 255, 255);
            var radius = "0.5"; //marker size
            var backgroundColor = colorBlack;
            var borderColor = colorBlack;
            var strokeThickness = 0;
            var outerPin = createUserLocationMarker(location, radius, backgroundColor, borderColor, strokeThickness);

            radius = "0.1";

            backgroundColor = colorWhite;
            borderColor = colorWhite;

            var innerPin = createUserLocationMarker(location, radius, backgroundColor, borderColor, strokeThickness);

            map.entities.push(outerPin);
            map.entities.push(innerPin);
        }

        /**
         * Push Pin Mouseover
         *
         * @param {Event} event
         * @private
         */

        function onMouseOverPin(event) {
            if (event && event.target && event.target.dealerData) {
                var id = event.target.dealerData.getId();
                if (id) {
                    setHoveredDealer(id);
                }
            }
        }

        /**
         * Push Pin Mouseout
         *
         * @param {Event} event
         * @private
         */

        function onMouseOutPin(event) {
            if (event && event.target && event.target.dealerData) {
                var id = event.target.dealerData.getId();
                if (id === hoveredDealer) {
                    setHoveredDealer(null);
                }
            }
        }

        /**
         * Triggered by clicking on a pushpin.
         *
         * @param {Event} event
         */

        function onClickPin(event) {
            if (event && event.target && event.target.dealerData) {
                var id = event.target.dealerData.getId();
                if (id) {
                    activeDealerMapClick = true;
                    setActiveDealer(id);

                    //Analytics
                    var location = getLocationDataById(id);
                    var eliteStatus = location.hasEliteStatus ? "Elite" : "Non Elite";
                    analytics.helper.fireFindADealerModuleClick("Dealer Pin", location.getId(), location.getName(), eliteStatus);
                }
            }
        }

        /**
         * Prevent Zooming on DblClick
         *
         * @param {Event} e
         * @private
         */

        function onDoubleClickPin(e) {
            e.handled = true;
        }

        /**
         * Capture Mouse Click Events on the map itself
         *
         * @param {Event} e
         * @private
         */

        function onMapClick(e) {
            if (e && e.target && e.target.dealerData) {
                // todo: can this be removed? yes it can
                // onClickPin(e);
                return;
            }
            if (infobox !== null) {
                // todo: should we hide the infobox when you click the map or not or should the pin become inactive?
                hideInfoBox(e);
                unhighlightPin(activeDealer);
                setActiveDealer(null);
            }
        }



        /**
         * Returns a dealer location object that matches the dealer Id.
         * @param dealerId {String}
         * @returns {Location|null}
         */

        function getLocationDataById(dealerId) {
            var i = 0,
                l = locationObjects.length,
                item;

            dealerId = dealerId.toString();

            for (; i < l; i += 1) {
                item = locationObjects[i];
                if (item.getId() === dealerId) {
                    return item;
                }
            }
            return null;
        }

        /**
         * Returns the ms pushpin object with the matching dealer ID.
         * @param dealerId {String}
         * @returns {Object} Microsoft.Map.Pushpin
         */

        function getMicrosoftMapPinById(dealerId) {
            var i = 0,
                l = microsoftMapPins.length,
                pin;

            dealerId = dealerId.toString();

            for (; i < l; i += 1) {
                pin = microsoftMapPins[i];
                if (pin && pin.dealerData.getId() === dealerId) {
                    return pin;
                }
            }
            throw new Error("The pin you're trying to select doesn't exist.");
        }

        /**
         * Sets the selected dealer to the id provided.
         * @param id {String} The dealer id for the pin.
         */

        function setActiveDealer(id) {
            if (id) {
                id = id.toString();
            }
            // if there was no previous active dealer, just use the current one.
            previousActiveDealer = activeDealer ? activeDealer : id;
            if (id !== activeDealer) {
                activeDealer = id;
            }
            updateView();
        }

        function getActiveDealer() {
            return activeDealer;
        }

        /**
         * Set to the id that the user last hovered over.
         * @param id
         */

        function setHoveredDealer(id) {
            if (id) {
                id = id.toString();
            }
            // only change if the hovered id is different
            if (hoveredDealer !== id) {
                previousHoveredDealer = hoveredDealer;
                hoveredDealer = id;
                updateView();
            }
        }

        function getHoveredDealer() {
            return hoveredDealer;
        }

        /**
         * Redraws the state of the pins to match the active pin.
         */

        function updateView() {
            if (opts.onViewDirty) {
                opts.onViewDirty(activeDealer, hoveredDealer, activeDealerMapClick);
            }

            if (previousActiveDealer && previousActiveDealer !== hoveredDealer) {
                unhighlightPin(previousActiveDealer);
            }

            if (previousHoveredDealer && previousHoveredDealer !== activeDealer) {
                unhighlightPin(previousHoveredDealer);
            }

            // update active state (only if state has changed)
            if (activeDealer) {
                if (previousActiveDealer) {
                    showInfobox(activeDealer);
                    centerMapOnDealer(activeDealer);
                    highlightPin(activeDealer);
                }
            }

            // update hover state (only if state has changed)
            if (hoveredDealer) {
                highlightPin(hoveredDealer);
            }

            activeDealerMapClick = false;
            previousActiveDealer = null;
            previousHoveredDealer = null;
        }

        /**
         * Highlight Pin based on Pin ID
         * 9/30/15 Everardo Barriga - added code to change the higlight color of the pin
         * @param {String} id
         * @private
         */

        function highlightPin(id) {
            var $dealer = $microsoftMap.find(".dealer-" + id);
            var $sidebarDealer = $(".search-results").find("#sidebar-dealer-" + id);

            if ($dealer.length === 1) {
                $dealer.css("z-index", MAX_Z_INDEX);
                $dealer.find("img").attr("src", opts.pinIconHover.icon);
                $dealer.find(".marker").addClass("active");

                $sidebarDealer.find(".marker").removeClass("elite");
                $sidebarDealer.find(".marker").removeClass("non-elite");
                $sidebarDealer.css("z-index", MAX_Z_INDEX);
                // removed since on most browsers it was not being applied because of the smi-colon
                // in the styles. On IE10 however this style was getting applied and overriding the
                // css that should be styling this.
                // $sidebarDealer.find(".marker").css("background-image", "url(" + opts.pinIconHover.icon + ");");
                $sidebarDealer.find(".marker").addClass("active");

            } else {
                // if the pin isn't ready yet, try again once the view 
                // change event has completed.
                delayedHighlightId = id;
            }
        }

        /**
         * Remove Highlight State from Pin
         * 9/30/15 Everardo Barriga - added logic to change the color of the pin
         *  depending on elite status.
         * @param {String} id
         * @private
         */

        function unhighlightPin(id) {
            var $dealer = $microsoftMap.find(".dealer-" + id);
            var $sidebarDealer = $(".search-results").find("#sidebar-dealer-" + id);
            $dealer.css("z-index", "auto");
            // For R4 there is now a distinction between elite and non-elite dealers and so we need to 
            // set the icon accordingly. Need to find a better way of distinguishing between the two
            var eliteStatus = false;
            locationObjects.forEach(function(dealer) {
                if (dealer.id === id) {
                    eliteStatus = dealer.hasEliteStatus;
                }
            });
            if (eliteStatus) {
                $dealer.find("img").attr("src", opts.pinIconElite.icon);
                $sidebarDealer.find(".marker").addClass("elite");
            } else {
                $dealer.find("img").attr("src", opts.pinIcon.icon);
                $sidebarDealer.find(".marker").addClass("non-elite");
            }
            $dealer.find(".marker").removeClass("active");
            $sidebarDealer.find(".marker").removeClass("active");
        }


        /**
         * Remove all Pins
         *
         * @public
         */

        function removeAllPins() {
            locationObjects = [];
            microsoftMapPins = [];
            setActiveDealer(null);
            setHoveredDealer(null);

            if (!map) {
                return;
            }
            hideInfoBox();
            for (var i = map.entities.getLength() - 1; i >= 0; i--) {
                var pushpin = map.entities.get(i);
                if (pushpin instanceof Microsoft.Maps.Pushpin && pushpin._typeName !== "current-location") {
                    map.entities.removeAt(i);
                }
            }
        }

        /**
         * Resets the map back to its starting position.
         */

        function reset() {
            removeAllPins();
        }


        init();

        return {
            reset: reset,
            setDimensions: setDimensions,
            setZoom: setZoom,
            destroy: destroy,
            addLocations: addLocations,
            addCurrentLocationPin: addCurrentLocationPin,
            setActiveDealer: setActiveDealer,
            getActiveDealer: getActiveDealer,
            setHoveredDealer: setHoveredDealer,
            getHoveredDealer: getHoveredDealer,
            centerMapOnDealer: centerMapOnDealer,
            setMapCenter: setMapCenter,
            autoResize: autoResize,
            isReady: isReady,
            setBestView: setBestView,
            getInfobox: getInfobox
        };

    };

    return Map;
});
