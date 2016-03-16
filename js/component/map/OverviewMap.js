define(['jquery', "analytics", "PointBreak", "component/map/mapAPIKey", "util/smartResize"], function($, analytics, PointBreak, API_KEY) {

    /**
     * Decorator for Bing Maps, adds helpers for setting sizes
     * recentering map etc...
     *
     * @class Map
     * @param {jquery} element
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
     * @property {Function} onResize - resize callback
     * @property {Function} onReady - map is initialzed callback
     * @property {Function} onPinMouseover - mouseover callback
     * @property {Function} onPinMouseout - mouseout callback
     * @property {Function} onPinClick - click callback
     */
    var Map = function(element, params) {

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
                icon: "/assets/img/global/bing-map-pin-dark.png",
                width: 35,
                height: 48
            },
            pinIconHover: {
                icon: "/assets/img/dealer-locator/icon-marker-gold-hightlighted.png",
                width: 35,
                height: 48
            },
            pins: [],
            onResize: $.noop,
            onPinMouseover: $.noop,
            onPinMouseout: $.noop,
            onPinClick: $.noop,
            onReady: $.noop
        }, params),
            $win = $(window),
            map,
            locations = [],
            microsoftMap,
            infobox,
            pins = [],
            dealerPinZindexOld,
            pinZIndex = 100,
            self = this,
            pointbreak = new PointBreak(),
            el = element,
            elParent = $(el).parent(),
            // default lat if no value is provided
            CENTER_DEFAULT_LAT = opts.center[0] ? opts.center[0] : "42.24497",
            // default lng if no value is provided
            CENTER_DEFAULT_LNG = opts.center[1] ? opts.center[1] : "-96.3917904";

        /**
         * Initialize Module, wait for Map Theme callback
         * @constructor
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
            create();

            if (opts.center[0] !== "" && opts.center[1] !== "" && !pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                addCurrentLocationPin(opts.center);
            }
            addPins(opts.pins);
            initInfoBox();
        }

        /**
         * Create the Map
         *
         * @private
         */

        function create() {
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
                microsoftMap = $(el).find(".MicrosoftMap");
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
                Microsoft.Maps.Events.addHandler(map, 'dblclick', onMouseDblClick);
            }

            Microsoft.Maps.Events.addHandler(map, 'click', onMouseClick);

            opts.onReady(this);
        }

        /**
         * Bind Events
         *
         * @private
         */

        function bindEvents() {

            $(window).on("resize.map", (function() {
                if (typeof(map) !== 'undefined' && map !== null) {
                    opts.onResize.call();
                    setDimensions();
                    if (opts.autoResize) {
                        autoResize();
                    }
                }
            }));
        }

        /**
         * Reset Map
         *
         * @public
         */

        function reset() {
            removePins();
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
         * @param {Number} width
         * @param {Number} height
         * @public
         */

        //function setDimensions(width, height) {

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
         * @param {Array} location
         * @public
         */

        function setCenter(location) {
            var center = new Microsoft.Maps.Location(location[0], location[1]);

            if (typeof(map) !== 'undefined' && map !== null) {
                map.setView({
                    center: center
                });
            }
        }

        /**
         * Calculate the best viewport based on the number of markers
         *
         * @private
         */

        function setBestView(zoom) {

            var bestview = Microsoft.Maps.LocationRect.fromLocations(locations);

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
            if (map !== null) {
                return true;
            }

            return false;
        }


        /**
         * Init Info Box
         *
         * @private
         */

        function initInfoBox(dealerID) {
            infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), {
                visible: false,
                offset: new Microsoft.Maps.Point(-120, 75),
                width: 240,
                showPointer: false,
                showCloseButton: false
            });

            Microsoft.Maps.Events.addHandler(infobox, 'click', onInfoBoxClick);

            map.entities.push(infobox);
        }

        function onInfoBoxClick() {
            document.location = $(".map-tooltip a").eq(0).attr("href");

            // analytics
            var action = "Dealer Infobox",
                $dealerUrlSplit = $(".map-tooltip a").eq(0).attr("href").split("/dealers/"),
                dealerCode = $dealerUrlSplit[1],
                dealerName = $(".map-tooltip a").eq(0).find("h3").text();
            analytics.helper.fireFindADealerModuleClick(action, dealerCode, dealerName);
        }

        /**
         * Show Info Box
         *
         * @param {Event} e
         * @private
         */

        function displayInfobox(e) {
            var target;
            if (e.target === undefined) {
                target = e;
            } else {
                target = e.target;
            }

            var locationId = target.dealerId,
                selectedLocation = target.getLocation(),
                $selectedDealerInResults = $(".search-results").find("li[data-dealer-id='" + locationId + "']"),
                $address = $selectedDealerInResults.find("address"),
                dealerDetailHref = "/dealers/" + locationId + "-" + target.dealerSlugUrl, //$selectedDealerInResults.find(".link-hours").eq(0).attr("href") || ('/dealers/' + locationId),
                tooltipContent = '<div class="map-tooltip"><a href="' + dealerDetailHref + '"><div class="dealer-locator-tooltip-top"><h3>' + target.Title + ' <span class="dealer-locator-tooltip-arrow"></span></h3><address>' + $address.html() + '</address></div><div class="dealer-locator-tooltip-bottom"></div></a></div>',
                location = [target.getLocation().latitude, target.getLocation().longitude];


            //center map around pin long/lat
            setCenter(location);

            infobox.setLocation(selectedLocation);

            infobox.setOptions({
                visible: true,
                htmlContent: tooltipContent
            });

            // analytics
            var action = "Dealer Pin",
                dealerCode = locationId,
                dealerName = $(".map-tooltip a").eq(0).find("h3").text();
            analytics.helper.fireFindADealerModuleClick(action, dealerCode, dealerName);

            if (opts && opts.onPinClick) {
                opts.onPinClick(e);
            }
        }


        /**
         * Show Info Box
         *
         * @param {number} dealerId
         * @public
         */

        function showInfobox(dealerId) {
            $.each(pins, function(index, key) {
                if (Number(key.dealerId) === Number(dealerId)) {
                    displayInfobox(pins[index]);
                    return;
                }
            });
        }

        /**
         * Hide Info Box
         *
         * @param {Event} e
         * @public
         */

        function hideInfoBox(e) {
            if (infobox !== null && infobox !== undefined) {
                infobox.setOptions({
                    visible: false
                });
            }
        }

        /**
         * Add Multiple Pins to the Map
         *
         * @param {Array} locations
         * @public
         */

        function addPins(locations) {
            if (locations.length === 0) {
                return;
            }

            locations.forEach(function(location) {
                pinZIndex += 10;
                addPin(location);
            });

            pinZIndex = 100;

            if (locations.length === 1) {
                setBestView(14);
            } else {
                setBestView();
            }
        }

        /**
         * Add Single Pin to the Map
         *
         * @param {Array} locations
         * @private
         */

        function addPin(location) {

            var loc = new Microsoft.Maps.Location(location.lat, location.lng);
            var pin = new Microsoft.Maps.Pushpin(loc, {
                icon: opts.pinIcon.icon,
                height: opts.pinIcon.height,
                width: opts.pinIcon.width,
                typeName: "dealer-" + location.dealerId,
                dealerDetailSlug: location.dealerDetailSlug,
                zIndex: pinZIndex
            });

            pin.Title = location.dealerName;
            pin.dealerId = location.dealerId;
            pin.dealerSlugUrl = location.dealerDetailSlug;
            pin.marketName = location.marketName;

            if (map === null || map === undefined) {
                return;
            }

            map.entities.push(pin);
            locations.push(loc); //add loc to temp array to calculate the best view
            pins.push(pin);

            Microsoft.Maps.Events.addHandler(pin, 'mouseover', pinMouseOver);
            Microsoft.Maps.Events.addHandler(pin, 'mouseout', pinMouseOut);
            Microsoft.Maps.Events.addHandler(pin, 'click', displayInfobox);

            if (opts.disableClickZoom) {
                Microsoft.Maps.Events.addHandler(pin, 'dblclick', onMouseDblClick);
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

            for (x = 0; x <= 360; x += 5) {
                var p2 = new Microsoft.Maps.Location(0, 0);
                brng = x * Math.PI / 180;
                p2.latitude = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng));

                p2.longitude = ((lon + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat),
                    Math.cos(d) - Math.sin(lat) * Math.sin(p2.latitude))) * 180) / Math.PI;
                p2.latitude = (p2.latitude * 180) / Math.PI;
                circlePoints.push(p2);
            }

            var polygon = new Microsoft.Maps.Polygon(circlePoints, {
                fillColor: backgroundColor,
                strokeColor: borderColor,
                strokeThickness: strokeThickness
            });

            return polygon;
        }

        /**
         * Add Current Location Marker
         *
         * @param {Array} locations
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
         * @param {Event} e
         * @private
         */

        function pinMouseOver(e) {
            dealerPinZindexOld = e.target._zIndex;
            e.target._icon = opts.pinIconHover.icon;
            e.target._zIndex = 10000;
            if (opts && opts.onPinMouseover) {
                opts.onPinMouseover(e);
            }
        }

        /**
         * Push Pin Mouseout
         *
         * @param {Event} e
         * @private
         */

        function pinMouseOut(e) {
            e.target._icon = opts.pinIcon.icon;
            e.target._zIndex = dealerPinZindexOld;
            if (opts && opts.onPinMouseout) {
                opts.onPinMouseout(e);
            }
        }

        /**
         * Prevent Zooming on DblClick
         *
         * @param {Event} e
         * @private
         */

        function onMouseDblClick(e) {
            e.handled = true;
        }

        /**
         * Capture Mouse Click Events
         *
         * @param {Event} e
         * @private
         */

        function onMouseClick(e) {
            if (infobox !== null) {
                hideInfoBox(e);
            }
        }

        /**
         * Highlight Pin based on Pin ID
         *
         * @param {String} id
         * @public
         */

        function highlightPin(id) {
            var dealer = microsoftMap.find(".dealer-" + id);
            dealer.find("img").attr("src", opts.pinIconHover.icon);
            dealer.css("zIndex", 9999);
        }

        /**
         * Remove Highlight State from Pin
         *
         * @param {String} id
         * @public
         */

        function unHighlightPin(id) {
            var dealer = microsoftMap.find(".dealer-" + id);
            dealer.find("img").attr("src", opts.pinIcon.icon);
            dealer.css("zIndex", "auto");
        }

        /**
         * Remove Highlight State from Pins
         *
         * @param {String} id
         * @public
         */

        function unHighlightAllPins() {
            var $pins = $("a.MapPushpinBase");

            $pins.each(function() {
                var dealerID = $(this).attr('class').split(' ')[0].split('-')[1];
                unHighlightPin(dealerID);
            });
        }

        /**
         * Remove all Pins
         *
         * @public
         */

        function removePins() {
            locations = [];
            hideInfoBox();
            if (map === null || map === undefined) {
                return;
            }

            for (var i = map.entities.getLength() - 1; i >= 0; i--) {
                var pushpin = map.entities.get(i);
                if (pushpin instanceof Microsoft.Maps.Pushpin && pushpin._typeName !== "current-location") {
                    map.entities.removeAt(i);
                }
            }
        }

        init();

        return {
            setDimensions: setDimensions,
            setZoom: setZoom,
            destroy: destroy,
            addPins: addPins,
            removePins: removePins,
            setCenter: setCenter,
            addCurrentLocationPin: addCurrentLocationPin,
            reset: reset,
            autoResize: autoResize,
            highlightPin: highlightPin,
            unHighlightPin: unHighlightPin,
            showInfobox: showInfobox,
            hideInfoBox: hideInfoBox,
            isReady: isReady,
            setBestView: setBestView
        };

    };

    return Map;
});
