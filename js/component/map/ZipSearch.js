 define([
         "modernizr",
         "lexus",
         "jquery",
         "PointBreak",
         "util/cookie",
         "util/placeholderFix",
         "analytics",
         "dropkick",
         "util/smartResize"
     ],
     function(
         Modernizr,
         LEXUS,
         $,
         PointBreak,
         cookie,
         placeholderFix,
         analytics
     ) {
         /**
          * Search for Nearby Dealers
          *
          * @class ZipSearch
          * @param {jquery} element
          * @typedef  {config}  configuration parameters.
          * @property {String} zipCode
          * @property {htmlElement} ajaxLoader
          * @property {jquery} stateSelect
          * @property {Object} stateSelectWrapper
          * @property {jquery} geolocationIcon
          * @property {jquery} searchResults
          * @property {jquery} ajaxError
          * @property {Boolean} isFirstTimeVisitor - handle first time visitor overlay states
          * @property {Object} geolocation
          * @property {Boolean} getDealers
          * @property {Function} onFirstTimeVisitorClose - trigger callback when closing the first time visitor window
          * @property {Function} onSuccess - getDealers() result callback
          * @property {Function} onAjaxBeforeSend - callback to show custom ajax loading animation
          * @property {Function} onAjaxComplete
          * @property {Function} onAjaxError
          * @property {Function} onError
          */

         var ZipSearch = function ZipSearch(element, params) {

             var opts = $.extend({
                 zipCode: "",
                 ajaxLoader: '<div class="loading animation" id="ajaxLoader"></div><script>LEXUS.loadingAnimation.register(ajaxLoader);</script>',
                 stateSelect: $(".form-zip-search").find(".select-state"),
                 stateSelectWrapper: {},
                 geolocationIcon: $(".geolocation-icon"),
                 subCopy: $(".sub"),
                 zipContainer: $(".zip-tooltip-container"),
                 searchResults: $(".search-results"),
                 ajaxError: $(".ajax-error"),
                 isFirstTimeVisitor: false,
                 overlayOver: false,
                 $disErrorMobileContainer: $(".mobile-map-error-container"),
                 geolocation: {},
                 getDealers: true,
                 hasStateDropDown: true,
                 maxResults: false,
                 fireTags: true,
                 onFirstTimeVisitorClose: function() {},
                 onSuccess: function() {},
                 onAjaxBeforeSend: function() {},
                 onAjaxComplete: function() {},
                 onAjaxError: function() {},
                 onValidationError: function() {},
                 onSearchTypeChange: function() {}
             }, params),
                 $disError = $(".dis-error"),
                 $disErrorBorder = $(".dis-error-border"),
                 FORM_ACTIVE_STATE = "dealerZip",
                 ajaxSubmit,
                 doc = $(document),
                 lastSearch,
                 xhrRequest, //get dealers request
                 pointbreak = new PointBreak();
             IEVersion = navigator.appVersion.indexOf("MSIE") !== -1 ? parseFloat(navigator.appVersion.split("MSIE")[1]) : false;

             var $win = $(window),
                 self = this,

                 TOOL_TIP_WIDTH_FIRST_TIME = 350,
                 TOOL_TIP_WIDTH_SIDEBAR = 275,
                 TOOL_TIP_LEFT_SIDEBAR = 20,
                 onDealerPage = $('#dealer-locator').length;

             self.zipSearch = $(element);
             self.formSearch = self.zipSearch.find(".form-zip-search");
             self.inputSearchGroup = self.zipSearch.find(".input-search-group");
             self.btnSearch = self.formSearch.find(".btn-search");
             self.inputSearch = self.formSearch.find(".input-search");
             self.zipToolTipContainer = self.formSearch.find(".zip-tooltip-container");
             self.locationTooltip = $(".location-tooltip");
             self.jsToolTipShow = self.formSearch.find(".js-tooltip-show");

             /**
              * Init
              *
              * @public
              */

             function init() {

                 //initialize events
                 bindEvents();

                 //search by state dropdown
                 if (opts.hasStateDropDown) {
                     bindStateDropdown();
                 }

                 //LRT-7425 preset zip input field with cookied zip code on page load regardless of last search
                 if (opts.zipCode !== "") {
                     //self.inputSearch.val(opts.zipCode);
                     $(".search-by").find("[data-form-active-state='dealerZip']").data("data-form-current-value", opts.zipCode);
                 }

                 //check if there is a recent search query and trigger ui view
                 lastSearch = getLastSearch();


                 if (typeof lastSearch === 'object' && lastSearch.query !== "null" && lastSearch.query !== "00000") {
                     if ($(".search-by").length !== 0) {
                         $(".search-by")
                             .find("[data-form-active-state='" + lastSearch.ui + "']")
                             .data("data-form-current-value", lastSearch.query)
                             .trigger("click.zs");
                     } else {
                         self.inputSearch.val(lastSearch.query);
                         self.btnSearch.trigger("click");
                     }
                 } else {
                     //preset input field with zip code
                     if (opts.zipCode !== "") {
                         self.inputSearch.val(opts.zipCode);
                         self.btnSearch.trigger("click");
                     }

                     initUISearchByZip();
                 }

                 //show geolocation pin marker
                 opts.geolocationIcon.addClass("active");

                 //set placeholder for ie9
                 placeholderFix.setPlaceHolder();
             }

             /**
              * Bind Events
              *
              * @private
              */

             function bindEvents() {

                 //input field validation on keystroke
                 self.inputSearch.on("keypress.zs", onSearchFieldKeyPress);
                 self.inputSearch.on("keyup.zs", onSearchFieldKeyUp);

                 //user paste
                 self.formSearch.on("paste.zs", ".input-search", function(e) {
                     onPaste(e);
                 });

                 //show geolocation tooltip
                 self.formSearch.on("click.zs", ".js-tooltip-show", function(e) {
                     e.preventDefault();
                     var tooltipPosition = $(this).data("tooltip-position");
                     showGeoLocationTooltip(tooltipPosition);
                 });

                 //capture next/go keyboard event on touch devices
                 if (Modernizr.touch) {
                     self.formSearch.find('.input-search').on('keydown', function(e) {
                         if (e.which === 9) {
                             $(this).blur();
                             onFormSubmit(e);
                         }
                     });
                 }

                 //close geolocation tooltip
                 doc.on("click.zs", ".js-tooltip-close", hideGeoLocationTooltip);

                 //capture page wide click event to close the location tooltip
                 doc.on("click.zs", function(e) {
                     $target = $(e.target);

                     if ($(e.target).closest(".location-tooltip").length === 0 && !$target.hasClass("js-tooltip-show")) {
                         hideGeoLocationTooltip();
                     }
                 });

                 //capture android 'next' keyboard event
                 doc.on("keydown.zs", function(e) {
                     if (e.keyCode === 61) {
                         e.preventDefault();
                         onFormSubmit(e);
                     }
                 });

                 //change UI when clicking on "zip-code | dealer name | state" titles
                 self.formSearch.on("click.zs", ".js-search-by", onSearchTypeChange);

                 //magnifying glass search icon click
                 self.formSearch.on("click.zs", ".btn-search", onFormSubmit);

                 $win.smartresize(onWindowResize);

                 pointbreak.addChangeListener(onBreakPointChange);
             }

             /**
              * Validate pasted values
              *
              * @param {Event} e
              * @private
              */

             function onPaste(e) {

                 self.formSearch.removeClass("error");
                 self.formSearch.find(".invalid-zip").hide();

                 if (FORM_ACTIVE_STATE === "dealerZip") {

                     var zipCode = self.inputSearch.val();
                     var isValidZip = validateZipCode(zipCode);

                     if (!isValidZip) {
                         self.formSearch.addClass("error");
                         self.formSearch.find(".invalid-zip").show();
                         opts.onValidationError("invalid-zip");
                         self.inputSearch.val('');
                         analytics.helper.fireFindADealerErrorPageLoad("Error Overlay", zipCode);
                     }
                 }
             }

             /**
              * Destroy ZipSearch / Unbind Events
              *
              * @private
              */

             function destroy() {
                 self.formSearch.off(".zs");
             }

             /**
              * Window Resize Event
              *
              * @private
              */

             function onWindowResize() {
                 hideGeoLocationTooltip();
             }

             /**
              * Select A State Dropdown
              *
              * @private
              */

             function bindStateDropdown() {
                 opts.stateSelect.dropkick({
                     autoWidth: false,
                     change: function(value, label) {
                         if (value !== "" || value !== null) {
                             $(".search-by").find("[data-form-active-state='" + FORM_ACTIVE_STATE + "']").data("data-form-current-value", value);

                             cookie.set("dealer-last-search-" + FORM_ACTIVE_STATE, value);
                             cookie.set("last-search-type", FORM_ACTIVE_STATE);
                             getDealers("/" + value, "");
                             if (opts.fireTags) {
                                 analytics.helper.fireFindADealerSearchSubmitClick(value, "State", "Dealer Search Module");
                             }

                         }
                     }
                 });

                 opts.stateSelectWrapper = $("#dk_container_state");
                 opts.stateSelectWrapper.attr("style", "").hide();
             }

             /**
              * Based on the Search Type define the input search state
              *
              * @param {Event} e
              * @private
              */

             function onSearchTypeChange(e) {
                 e.preventDefault();

                 //cancel running xhr request
                 if (xhrRequest !== undefined) {
                     xhrRequest.abort();
                     xhrRequest = undefined;
                 }

                 var target = $(e.target),
                     formUrl = target.data("search-url"),
                     defaultValue = target.data("default-value");

                 //remove form error state if exists
                 removeAllFormErrors();

                 //set active state
                 $(".js-search-by").removeClass("active");
                 target.addClass("active");

                 //set form action url
                 self.formSearch.attr("action", formUrl);

                 //hide zip code tooltip link
                 opts.zipContainer.css("visibility", "hidden");

                 //change ui based on search type
                 FORM_ACTIVE_STATE = target.data("form-active-state");

                 // This was causing problems in iOS7 and sometimes 8
                 //if (FORM_ACTIVE_STATE !== "dealerState") {
                 //    self.inputSearch.focus();
                 //}

                 //hide the "more dealers" button, will break if pressed on state/name view
                 $('.js-btn-see-more-dealers').hide();
                 $('.js-btn-elite-dealers').hide();
                 $(".elite-message").hide();
                 $(".no-elite-message").hide();
                 // initialize UI based on user selection (zip,dealer name, state)
                 switch (FORM_ACTIVE_STATE) {
                     case "dealerZip":
                         initUISearchByZip();
                         break;
                     case "dealerName":
                         initUISearchByDealerName();
                         break;
                     case "dealerState":
                         initUISearchByDealerState();
                         break;
                 }

                 opts.onSearchTypeChange(FORM_ACTIVE_STATE);
             }

             function isIE() {
                 return ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) !== null)));
             }
             /**
              * Change UI View To ZipSearch
              *
              * @private
              */

             function initUISearchByZip() {

                 var inputSearchValue;

                 self.zipToolTipContainer.removeClass("hidden");

                 if (!Modernizr.touch) {
                     setSearchInputFieldType("text");
                 } else {
                     setSearchInputFieldType("tel");
                 }

                 //set input field focus
                 self.inputSearch
                     .attr("placeholder", "Enter Zip")
                 //.attr("maxlength", "9") //CRITICAL THIS BREAKS IN IE 11, ENTIRE BROWSER CRASHES
                 .val(self.inputSearch.data("default-value"));

                 if (!isIE()) {
                     self.inputSearch.attr('maxlength', '9');
                 }

                 //show zip code tooltip link
                 opts.zipContainer.css("visibility", "visible");

                 //set geolocation
                 if (!$.isEmptyObject(opts.geolocation)) {
                     if (opts.geolocation.zipCode === "00000" && opts.zipCode === "") {
                         self.inputSearch.val("");
                     } else {
                         //on mobile set zip only, on desktop zip and area
                         if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                             inputSearchValue = opts.zipCode !== "" ? opts.zipCode : opts.geolocation.zipCode;
                             self.inputSearch.val(inputSearchValue);
                         } else {
                             var marketArea = ""; // (" + opts.geolocation.city + " Area)";

                             if (typeof opts.geolocation.city === "object" || opts.geolocation.city === null) {
                                 marketArea = "";
                             }

                             inputSearchValue = opts.zipCode !== "" ? opts.zipCode : opts.geolocation.zipCode + marketArea;
                             self.inputSearch.val(inputSearchValue);
                         }

                         //store value of the most current search
                         $(".js-search-by.active").data("default-value", inputSearchValue);
                     }
                 }

                 //prepopulate input field with last used search value
                 var currentValue = getCurrentValue();
                 if (currentValue) {
                     self.inputSearch.val(currentValue);

                     self.btnSearch.trigger("click");

                 }

                 self.inputSearchGroup.show();

                 if (opts.hasStateDropDown) {
                     opts.stateSelectWrapper.attr("style", "").hide();
                     $(".dk_container").hide();
                 }

                 if ($("#dealer-locator").length !== 0 && IEVersion > 9) {
                     self.inputSearch.focus();
                 }

                 self.inputSearch.on("keypress.zs", onSearchFieldKeyPress);
             }

             /**
              * Change UI View To Search by Dealer Name
              *
              * @private
              */

             function initUISearchByDealerName() {
                 self.inputSearchGroup.show();
                 self.zipToolTipContainer.addClass("hidden");

                 if (opts.hasStateDropDown) {
                     $("#dk_container_state").attr("style", "").hide();
                 }

                 //WARNING!! DO NOT ADJUST MAXLENGTH ATTRIBUTE, IT CRASHES IE...YES CRASHES
                 //Possible solution would be to show and hide two different inputs.
                 self.inputSearch
                     .attr("placeholder", "Enter Dealer Name")
                     .off("keypress.zs")
                     .val("")
                     .attr("type", "text");

                 if (!isIE()) {
                     self.inputSearch.removeAttr('maxlength');
                 }


                 //get last search from switching between uis
                 var currentValue = getCurrentValue();
                 if (currentValue !== undefined) {
                     self.inputSearch.val(currentValue);
                     self.btnSearch.trigger("click");
                 }

                 //set focus
                 self.inputSearch.focus();
                 self.inputSearch.on("keypress.zs", onDealerNameSearchFieldKeyUp);

                 //Style the dealers in canada link.
                 $(".cahip-message .link-arrow").css("margin-left", "25px");
                 $(".cahip-message .link-arrow").css("margin-top", "0px");
             }

             /**
              * Check if user already performed a search. If yes fetch
              * that value from the DOM data element
              *
              * @private
              */

             function getCurrentValue() {
                 return $(".search-by").find("[data-form-active-state='" + FORM_ACTIVE_STATE + "']").data("data-form-current-value");
             }

             /**
              * Change UI View To Search by Dealer State
              *
              * @private
              */

             function initUISearchByDealerState() {
                 self.inputSearchGroup.hide();
                 self.zipToolTipContainer.addClass("hidden");
                 $(".cahip-message .link-arrow").css("margin-left", "25px");
                 $(".cahip-message .link-arrow").css("margin-top", "0px");
                 if (opts.hasStateDropDown) {
                     opts.stateSelectWrapper.show();

                     var currentValue = getCurrentValue();

                     if (currentValue) {
                         //Different way of selecting the current value, was causing an error on safari.
                         // $(".select-state option[value='" + currentValue + "']").attr('selected', 'selected');
                         $(opts.stateSelect).dropkick('setValue', currentValue);
                         $(opts.stateSelect).dropkick('refresh');
                         opts.stateSelect.change();
                     }
                 }
             }

             /**
              * On Resize change input field type
              *
              * @param {Event} e
              * @private
              */

             function onBreakPointChange(e) {

                 if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT) && FORM_ACTIVE_STATE === "dealerZip") {
                     var zip = extractZipCode(self.inputSearch.val());
                     setSearchInputFieldType("tel");
                 } else {
                     setSearchInputFieldType("text");
                 }
             }

             /**
              * Show Geo Location Tooltip
              *
              * @param {String} toolTipPosition - token describing where tooltip sits bottom/top/right/left
              * @private
              */

             function showGeoLocationTooltip(toolTipPosition) {
                 var containerOffset;

                 if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                     return;
                 }

                 if (self.locationTooltip.hasClass("active")) {
                     return;
                 }

                 //find a dealer page
                 if ($("#dealer-locator .page-wrap").offset() !== undefined) {
                     containerOffset = $("#dealer-locator .page-wrap").offset().top;
                 } else {
                     //model/is page
                     containerOffset = $("#wrapper").offset().top;
                 }

                 if (toolTipPosition === undefined) {
                     //if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                     //    toolTipPosition = "bottom";
                     //} else {
                     toolTipPosition = "right";
                     //}
                 }



                 //get container to set tooltip position
                 var searchFormContainer = $(".form-zip-search .input-group");



                 var tooltipWidth,
                     tooltipPosLeft;
                 if (!getLastSearch()) {
                     // if first time
                     tooltipWidth = TOOL_TIP_WIDTH_FIRST_TIME;
                     tooltipPosLeft = (self.jsToolTipShow.offset().left + self.jsToolTipShow.outerWidth()) - self.locationTooltip.outerWidth();
                 } else {

                     //Dealer page shows tooltip differently than Current Offers
                     if (onDealerPage) {
                         tooltipWidth = TOOL_TIP_WIDTH_SIDEBAR;
                         tooltipPosLeft = TOOL_TIP_LEFT_SIDEBAR;
                     } else {
                         tooltipWidth = TOOL_TIP_WIDTH_FIRST_TIME;
                         tooltipPosLeft = (self.jsToolTipShow.offset().left + self.jsToolTipShow.outerWidth()) - self.locationTooltip.outerWidth();
                     }
                 }

                 if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT) || pointbreak.isCurrentBreakpoint(PointBreak.MEDIUM_BREAKPOINT)) {
                     tooltipWidth = searchFormContainer.outerWidth();
                     tooltipPosLeft = searchFormContainer.offset().left;
                 }

                 //set tooltip position
                 switch (toolTipPosition) {
                     case "bottom":
                         self.locationTooltip.css({
                             "top": (self.jsToolTipShow.offset().top + self.jsToolTipShow.outerHeight() - 12) - containerOffset,
                             "left": tooltipPosLeft,
                             "margin": 0,
                             "width": tooltipWidth + "px"
                         }).fadeIn();
                         break;
                     case "right":
                         self.locationTooltip.css({
                             "top": (self.jsToolTipShow.offset().top + 32 - self.locationTooltip.outerHeight()) - containerOffset,
                             "left": self.jsToolTipShow.outerWidth() + 15 + self.jsToolTipShow.offset().left
                         }).fadeIn();
                         break;
                 }


                 //set arrow position
                 self.locationTooltip
                     .addClass("active")
                     .find(".tooltip-arrow")
                     .removeAttr("class")
                     .addClass("tooltip-arrow tooltip-arrow-" + toolTipPosition);

                 if (opts.fireTags) {
                     analytics.helper.fireLegalDisclosuresClick("Zip Code Details");
                 }
             }

             /**
              * Hide Geo Location Tooltip
              *
              * @private
              */

             function hideGeoLocationTooltip() {
                 self.locationTooltip
                     .removeClass("active")
                     .hide();
             }

             /**
              * Allow only numbers for zip code search
              *
              * @param {Event} e
              * @private
              */

             function onSearchFieldKeyPress(e) {
                 var keyCode = window.event ? e.keyCode : e.which,
                     KEY_0 = 48,
                     KEY_9 = 57,
                     KEY_BACKSPACE = 0,
                     KEY_DELETE = 8,
                     KEY_ENTER = 13;

                 removeAllFormErrors();

                 //trigger paste event for safari and firefox
                 if (keyCode === 118) {
                     onPaste(e);
                     return;
                 }

                 //codes for 0-9
                 if (keyCode < KEY_0 || keyCode > KEY_9) {
                     if (keyCode !== KEY_BACKSPACE && keyCode !== KEY_DELETE && keyCode !== KEY_ENTER && !e.ctrlKey) {
                         e.preventDefault();
                     }
                 }
             }

             function onSearchFieldKeyUp(e) {
                 //store query to preset field when toggling between dealer name and dealer zip saearch
                 $(".search-by").find("[data-form-active-state='" + FORM_ACTIVE_STATE + "']").data("data-form-current-value", self.inputSearch.val());
             }

             /**
              * Capture Dealer Name Search
              *
              * @param {Event} e
              * @private
              */

             function onDealerNameSearchFieldKeyUp(e) {
                 removeAllFormErrors();
             }

             /**
              * Remove All Form Errors
              *
              * @private
              */

             function removeAllFormErrors() {
                 self.formSearch.removeClass("error");
                 self.formSearch.find(".error-message").hide();
             }

             /**
              * Get Dealers
              *
              * @param {String} params - query string params to be passed along to 'get dealers' ajax call
              * @param {String} query - value being searched, can be zip, state, or dealer name depending on form action
              * @public
              */

             function getDealers(params, query) {
                 clearResults();

                 //close keyboard on mobile devices
                 if (Modernizr.touch) {
                     self.inputSearch.blur();
                 }

                 //if no query parameter is provided try to get it from
                 //the search Field
                 if (FORM_ACTIVE_STATE === "dealerZip") {
                     if (query === "") {
                         query = getInputSearchZipCode();

                         if (query === "") {
                             return;
                         }

                     } else {
                         query = extractZipCode(query);
                     }
                 } else {
                     //remove any special characters
                     query = query.replace(/[^a-zA-Z0-9]/g, " ");
                 }

                 if (opts.maxResults) {
                     query += "?maxResults=" + opts.maxResults;
                 }

                 //get dealers
                 xhrRequest = $.ajax({
                     url: self.formSearch.attr("action") + params + "/" + query,
                     beforeSend: function() {
                         ajaxSubmit = true;
                         opts.ajaxError.hide();
                         opts.searchResults.show();
                         opts.onAjaxBeforeSend();
                         opts.searchResults.find(".loader").remove();
                         opts.searchResults.prepend(opts.ajaxLoader);
                         //This is put here so that the messages dont appear while the ajax 
                         //call is being made.
                         $(".elite-message").hide();
                         $(".no-elite-message").hide();
                         $(".cahip-message .link-arrow").css("margin-left", "25px");
                         $(".cahip-message .link-arrow").css("margin-top", "0px");

                         if (params !== "AndPma" && $(".error-message").is(":visible")) {


                             self.formSearch.find(".no-dealers-found").hide();
                             self.formSearch.find(".invalid-zip").hide();
                         }

                         $disError.hide();
                         $disErrorBorder.hide();
                     }
                 }).done(function(result) {
                     //server response OK but no dealers found
                     if (result.data.length === 0) {
                         self.formSearch.addClass("error");
                         self.formSearch.find(".no-dealers-found").show();
                         self.formSearch.find(".invalid-zip").hide();
                         opts.ajaxError.show();
                         $(".elite-message").hide();
                         $(".no-elite-message").hide();
                         $(".js-btn-elite-dealers").hide();

                         if (opts.fireTags) {
                             analytics.helper.fireFindADealerErrorPageLoad("Dealer Page", query);
                         }
                     } else {
                         $(".elite-message").show();
                         $(".no-elite-message").show();
                     }
                     opts.onSuccess(FORM_ACTIVE_STATE, result, getInputSearchZipCode());


                 }).error(function(data, error, errorThrown) {

                     if (error !== "abort") {
                         opts.onAjaxError(data, error, errorThrown);
                         self.formSearch.addClass("error");

                         if (data.status === 400 || data.status === 404) {
                             self.formSearch.find(".no-dealers-found").show();
                             self.formSearch.find(".invalid-zip").hide();
                             opts.ajaxError.show();
                         } else {
                             $disError.show();
                             $disErrorBorder.show();
                         }

                         opts.searchResults.hide();

                         //store last search
                         cookie.set("dealer-last-search-type", "");
                     }

                 }).complete(function() {
                     ajaxSubmit = false;
                     opts.onAjaxComplete();
                     opts.searchResults.find('#ajaxLoader').remove();
                     LEXUS.loadingAnimation.unregister(opts.ajaxLoader);
                 });
             }

             /**
              * Generate MarketName output
              *
              * @public
              */

             function getMarketName(marketNames) {
                 if (marketNames.length > 1) {
                     return marketNames.join(', ');
                 } else if (marketNames.length === 1) {
                     return marketNames[0];
                 }

                 return "";
             }

             /**
              * Removes all results
              *
              * @private
              */

             function clearResults() {
                 opts.searchResults.find("li").remove();
                 opts.searchResults.find("ul").append("<li />");
             }

             /**
              * Get Input Search Zip Code
              *
              * @private
              */

             function getInputSearchZipCode() {
                 return extractZipCode(self.inputSearch.val());
             }

             /**
              * For Mobile devices set input field to a number field.
              *
              * @private
              */

             function setSearchInputFieldType(type) {
                 self.inputSearch.attr("type", type);
             }

             /**
              * Extract Zip Code from Input Field which might contain the Area Name
              *
              * @param {String} zip - input field text which gets sanitized
              * @private
              */

             function extractZipCode(zip) {
                 return zip.replace(/\(.*?\)/g, "");
             }

             /**
              * Zipcode Validation
              *
              * @private
              */

             function validateZipCode(zip) {
                 zip = zip.replace(/\(.*?\)/g, "").replace(/ /gi, "");
                 if (!zip.match(/^\d+$/)) {
                     return false;
                 }
                 if (zip.length !== 5) {
                     return false;
                 }
                 return true;
             }

             /**
              * Dis Zipcode Validation
              *
              * @param {String} zip - zip code that will be validated
              * @private
              */

             function validateDisZipCode(zip) {

                 var isValidZip = false;

                 $.ajax({
                     async: false,
                     url: self.formSearch.attr("action") + "/" + zip,
                     beforeSend: function() {
                         self.formSearch.removeClass("error");
                         $disError.hide();
                         $disErrorBorder.hide();
                     }
                 }).done(function(result) {
                     isValidZip = true;
                 }).error(function(data, textStatus, jqXHR) {
                     self.formSearch.addClass("error");
                     $disError.show();
                     $disErrorBorder.show();
                 });

                 if (!isValidZip && opts.isFirstTimeVisitor) {
                     if (opts.fireTags) {
                         analytics.helper.fireFindADealerErrorPageLoad("Dealer Overlay", zip);
                     }
                 }

                 if (!isValidZip && !opts.isFirstTimeVisitor) {
                     if (opts.fireTags) {
                         analytics.helper.fireFindADealerErrorPageLoad("Dealer Page", zip);
                     }
                 }

                 return isValidZip;

             }

             /**
              * Checks if DIS is down
              *
              * @returns {Boolean}
              * @public
              */

             function isDISDown(callback) {

                 $.ajax({
                     url: self.formSearch.attr("action") + "/11201",
                 }).done(function(result) {
                     callback(false);
                 }).error(function(data, textStatus, jqXHR) {
                     callback(true);
                 });
             }

             /**
              * Returns the last executed search query, stored in a cookie
              *
              * @private
              * @returns {Array} query
              */

             function getLastSearch() {
                 var lastSearchQuery,
                     lastSearchType;

                 //check if zip search is multi ui (zip/name/state) or simple ui (zip)
                 if ($(".search-by").length !== 0) {
                     lastSearchQuery = cookie.get("dealer-last-search-" + cookie.get("last-search-type"));
                     lastSearchType = cookie.get("last-search-type");
                 } else {
                     lastSearchQuery = cookie.get("dealer-last-search-dealerZip");
                     lastSearchType = "dealerZip";

                     if (lastSearchQuery === "") {
                         lastSearchQuery = undefined;
                     }
                 }

                 if (lastSearchQuery !== undefined && lastSearchQuery !== "") {
                     var ui = {
                         ui: lastSearchType,
                         query: lastSearchQuery
                     };

                     return ui;
                 }

                 return false;
             }

             /**
              * Validate Form on Submit
              *
              * @private
              * @returns {Event} e
              */

             function onFormSubmit(e) {
                 e.preventDefault();

                 //prevent dblclick
                 if (ajaxSubmit) {
                     return;
                 }

                 var query = self.inputSearch.val(),
                     zipCode = extractZipCode(query);

                 //store query to preset field when toggling between dealer name and dealer zip saearch
                 $(".search-by").find("[data-form-active-state='" + FORM_ACTIVE_STATE + "']").data("data-form-current-value", query);

                 //store last search in cookie
                 if (FORM_ACTIVE_STATE !== "dealerZip") {
                     cookie.set("dealer-last-search-" + FORM_ACTIVE_STATE, zipCode);
                     cookie.set("last-search-type", FORM_ACTIVE_STATE);
                 }

                 //validate zipCode
                 if (FORM_ACTIVE_STATE === "dealerZip") {
                     var isValidZip = validateZipCode(query);

                     /* validate dis zip code */
                     var isValidDisZip = validateDisZipCode(zipCode);

                     //get zip code and close first time visitor window
                     if (isValidZip && opts.isFirstTimeVisitor) {

                         if (!isValidDisZip) {
                             return;
                         }

                         cookie.set("dealer-last-search-" + FORM_ACTIVE_STATE, zipCode);
                         cookie.set("last-search-type", FORM_ACTIVE_STATE);

                         //unbind all events
                         destroy();
                         hideGeoLocationTooltip();

                         opts.onFirstTimeVisitorClose(zipCode, opts.geolocation);
                         opts.isFirstTimeVisitor = false;

                         return;
                     } else {
                         //analytics
                         dealerAnalytics(opts.overlayOver, zipCode);
                         opts.overlayOver = true;
                     }

                     if (!isValidZip) {
                         self.formSearch.addClass("error");
                         self.formSearch.find(".invalid-zip").show();
                         self.formSearch.find(".no-dealers-found").hide();
                         $disError.hide();
                         opts.onValidationError("invalid-zip");
                         $('.js-btn-see-more-dealers').hide();
                         $('.js-btn-elite-dealers').hide();

                         // fire analytics tag
                         if (opts.fireTags) {
                             analytics.helper.fireFindADealerErrorPageLoad("Error Overlay", zipCode);
                         }

                         return;

                     } else {
                         if (isValidDisZip) {
                             cookie.set("dealer-last-search-" + FORM_ACTIVE_STATE, zipCode);
                         }
                         cookie.set("last-search-type", FORM_ACTIVE_STATE);
                     }
                 }

                 //set cookie to hide it next time
                 cookie.set("isFirstTimeVisitor", false, 1000);

                 //either get dealers or just return the valid zip code
                 if (opts.getDealers) {
                     if (FORM_ACTIVE_STATE === "dealerName") {
                         opts.overlayOver = true;
                         dealerAnalytics(opts.overlayOver, zipCode);
                     }
                     getDealers("", query);
                 } else {
                     opts.onSuccess(zipCode);
                 }

             }

             function dealerAnalytics(overlayOver, zipCode) {
                 // analytics
                 var pageId = LEXUS.page.pageId;
                 var searchTerm = zipCode;
                 var container = "Dealer Search Module";
                 var searchType = "Zip Code";

                 if (FORM_ACTIVE_STATE === "dealerName") {
                     searchType = "Dealer Name";
                 }

                 // fires analytics based on page id
                 if (pageId === "current-offers") {
                     if (opts.fireTags) {
                         analytics.helper.fireCurrentOffersSearchSubmitClick(zipCode);
                     }
                 } else {
                     // fires analytics based on overlay or not
                     if (!overlayOver) {
                         if (opts.fireTags) {
                             analytics.helper.fireFindADealerSearchSubmitClick(zipCode, "Zip Code", "Overlay");
                         }
                     } else {
                         if (opts.fireTags) {
                             analytics.helper.fireFindADealerSearchSubmitClick(searchTerm, searchType, container);
                         }
                     }
                 }
             }

             init();

             return {
                 getDealers: getDealers,
                 isDISDown: isDISDown,
                 getLastSearch: getLastSearch,
                 getInputSearchZipCode: getInputSearchZipCode,
                 getMarketName: getMarketName,
                 getCurrentValue: getCurrentValue
             };
         };

         return ZipSearch;
     });
