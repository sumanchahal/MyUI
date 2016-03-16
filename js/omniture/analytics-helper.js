/**
 * Abstracts the firing of tags so that the developer can use more
 * intuitive language.
 *
 * @author Mims Wright
 */
define(
    [
        "omniture/tms/analytics-framework",
        "omniture/global-metrics",
        "omniture/tagmap",
        "omniture/pageloadmap",
        "omniture/stringReplacementMap",
        "util/stringUtil",
        "PointBreak",
        "jquery",
        "lexus"
    ],
    function(
        analyticsFramework,
        globalMetrics,
        tagmap,
        pageLoadMap,
        stringReplacementMap,
        stringUtil,
        PointBreak,
        $,
        LEXUS
    ) {

        var pointBreak = new PointBreak();
        var global = globalMetrics.getGlobalVariable;


        /**
         * Wrapper for the anlyticsFramework.fireTag().
         * Replaces text in the objects before firing the tag to ensure correct casing / spelling.
         *
         * @param id
         * @param obj
         */

        function fireTag(id, obj) {

            // LIM 148 omniture fix
            if (LEXUS.ComparatorDealerCode && window.omni_page_var) {
                obj = $.extend(window.omni_page_var, obj);
            }


            obj = stringUtil.replaceAllStringsInObjectWithMap(obj, stringReplacementMap);

            if (obj.hasOwnProperty('<content_title>') && obj['<content_title>']) {
                obj['<content_title>'] = getFilteredTitle(obj['<content_title>']);
            }

            analyticsFramework.fireTag(id, obj);
        }


        /**
         * @private
         * Returns a new object with default values defined for things like breakpoints.
         *
         * @param object {object} The object you want to extend.
         * @returns {object} Your object extended with default values.
         */

        function createTagObject(object) {
            var page = LEXUS.page || {};
            return $.extend({
                "<subsection>": global("subsection"),
                "<page>": global("page"),
                "<break_point>": pointBreak.getCurrentBreakpoint(),
                "<orientation>": pointBreak.getCurrentOrientation()
            }, object);
        }

        function getFilteredTitle(s) {
            var $clean = $('<div>' + s + '</div>');
            $clean.find('span').remove();
            return $clean.text();
        }


        /**
         * @module analyticsHelper
         */
        return {



            //////////////// GLOBAL


            /**
             * Shortcut reference to fireTag().
             */
            fireTag: fireTag,


            /**
             * Adds a listener that is fired when the analytics successfully fires.
             * @param handler {AnalyticsHandler}
             */

            addAnalyticsSuccessListener: function(handler) {
                window.addEventListener("message", handler);
            },


            /**
             * Fires a tag for a page load.
             *
             * @param [pageId] {String} The page-id string defined in the page.tag. This is optional
             *                          and if not provided, the function will attempt to find the
             *                          value in the global LEXUS.page object.
             * @returns {String|null} If no mapping was found, returns null. Otherwise, returns the tagId.
             */
            firePageLoad: function(pageId) {
                var tagId, obj;

                if (pageId === undefined) {
                    if (LEXUS && LEXUS.page && LEXUS.page.pageId) {
                        pageId = LEXUS.page.pageId;
                    }
                }

                tagId = this.getTagForPageLoad(pageId);
                obj = createTagObject({});
                if (tagId === "2551.3" && LEXUS.ComparatorDealerCode) {
                    tagId = "2868.3";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;

                }

                if (tagId) {

                    fireTag(tagId, obj);
                    return tagId;
                }
                return null;
            },

            /**
             * @private
             * Uses 'pageloadmap' to get the tagId associated with the pageId.
             *
             * @param pageId {String} The page-id string defined in the page.tag
             * @returns {String|null} If no mapping was found, returns null. Otherwise, returns the tagId.
             */
            getTagForPageLoad: function(pageId) {
                if (pageLoadMap.hasOwnProperty(pageId)) {
                    return pageLoadMap[pageId];
                }
                return null;
            },


            /**
             * Fires when a generic MS:3.3 is fired
             * this event is used in many pages
             *
             * @param module {String}
             * @param contentTitle {String} title of item clicked on
             * @param container {String} name of container
             *
             * @return {object} Configuration object passed to omniture
             */
            fireGenericModuleClick: function(module, contentTitle, container) {
                var obj = createTagObject({
                    "<module>": module,
                    "<content_title>": contentTitle,
                    "<container>": container
                });

                fireTag(tagmap.MODEL_SECTION_MODULE_ACTION_MS33_CLICK, obj);

                return obj;
            },


            /**
             * Fires when accolade is clicked.
             * this event is used in many pages
             *
             * @param section {String} name of secondary navigation item current page is on
             * @param action {String} name of the action links
             * @param contentTitle {String} title of item clicked on
             *
             * @return {object} Configuration object passed to omniture
             */
            fireAccoladeClick: function(section, action, contentTitle) {
                var obj = createTagObject({
                    "<section>": section,
                    "<module>": "Accolade",
                    "<action>": action,
                    "<content_title>": contentTitle,
                    "<container>": "Accolade Module"
                });
                if (LEXUS.seriesName) {
                    obj["<model_name>"] = LEXUS.seriesName;
                }

                fireTag(tagmap.GLOBAL_ELEMENT_ACCOLADES_MODULE_CLICK, obj);

                return obj;
            },


            /**
             * Fires when accolade is clicked on compare page.
             *
             *
             * @param section {String} name of secondary navigation item current page is on
             * @param action {String} name of the action links
             * @param contentTitle {String} title of item clicked on
             *
             * @return {object} Configuration object passed to omniture
             */
            fireCompareAccoladeClick: function(section, action, contentTitle, modelName) {
                var obj = createTagObject({
                    "<section>": section,
                    "<module>": "Accolade",
                    "<action>": action,
                    "<content_title>": contentTitle,
                    "<container>": "Accolade Module",
                    "<model_name>": modelName
                });

                fireTag(tagmap.GLOBAL_ELEMENT_ACCOLADES_MODULE_CLICK, obj);

                return obj;
            },


            /**
             * Fires when the back to top button is clicked.
             */
            fireBackToTopClick: function() {
                var obj = createTagObject({
                    "<container>": "Right Edge"
                });
                fireTag(tagmap.GLOBAL_ELEMENT_BACK_TO_TOP_CLICK, obj);
                return obj;
            },

            /**
             * GE:1.2 Styles compare button click tag
             */
            fireCompareBtnClick: function(container) {
                var obj = createTagObject({
                    "<container>": container
                });


                fireTag(tagmap.GLOBAL_ELEMENT_COMPARE_BUTTON_CLICK, obj);

                return obj;
            },

            /**
             * Fires when legal terms, details and disclaimer links are clicked.
             */
            fireLegalDisclosuresClick: function(disclaimer) {
                var obj = createTagObject({
                    "<disclaimer>": disclaimer,
                    "<container>": "Terms Details"
                });

                fireTag(tagmap.GLOBAL_ELEMENT_LEGAL_DISCLOSURES_CLICK, obj);

                return obj;
            },

            /**
             * Fires on click of share link
             *
             * @param container {String}
             * @param shareLink {String}
             * @param shareContent {String}
             * @return {Object}
             */
            fireGlobalElementShareClick: function(container, shareLink, shareContent) {
                var obj = createTagObject({
                    "<container>": container,
                    "<share_link>": shareLink,
                    "<share_content>": shareContent
                });

                fireTag(tagmap.GLOBAL_ELEMENT_SHARE_CLICK, obj);

                return obj;
            },

            /////////////// GLOBAL - GALLERY OVERLAY

            /**
             * Called when the gallery overlay loads.
             *
             * @param type {String}
             * @param item {obj}
             */
            fireOverlayLoad: function(type, item) {
                var tag,
                    obj = createTagObject({});
                if (type === 'dealer') {
                    $.extend(obj, {
                        "<dealer_name>": item.dealerName,
                        "<dealer_code>": item.dealerCode,
                        "<content_title>": "View Gallery", // item.id,
                        "<zip_code>": item.dealerZipCode,
                        "<page>": "Dealer Overlay"
                    });

                    tag = tagmap.FIND_A_DEALER_DEALER_OVERLAY_LOAD;
                } else if ((type === 'feature') || (type === 'technology')) {
                    $.extend(obj, {
                        "<content_title>": item.title,
                        "<page>": "Features Overlay"
                    });

                    tag = tagmap.MODEL_SECTION_FEATURES_OVERLAY_LOAD;
                } else if (type === 'cpo') {
                    $.extend(obj, {
                        "<content_title>": item.title,
                        "<page>": "Video Overlay"
                    });

                    tag = tagmap.CPO_OVERLAY_LOAD;
                } else {
                    $.extend(obj, {
                        "<content_title>": item.title,
                        "<subsection>": "Gallery Overlay"
                    });

                    tag = tagmap.MODEL_SECTION_GALLERY_OVERLAY_LOAD;
                }

                fireTag(tag, obj);
            },

            /**
             * Called when share button within an overlay is clicked
             *
             * @param type {String}
             * @param item {obj}
             * @param shareUrl {string} The url to share.
             */
            fireOverlayShareClick: function(type, item, shareUrl) {
                var tag,
                    obj = createTagObject({
                        "<share_content>": item.title,
                        "<container>": "Overlay"
                    });

                if (shareUrl) {
                    obj["<share_link>"] = shareUrl;
                }
                //                else {
                //                    // throw new Error("Share URL is missing from analytics call.");
                //                }


                if (type === 'dealer') {
                    $.extend(obj, {
                        "<share_link>": window.location.pathname,
                        "<dealer_code>": item.dealerCode,
                        "<dealer_name>": item.dealerName,
                        "<content_title>": item.id
                    });

                    tag = tagmap.FIND_A_DEALER_DEALER_DETAIL_SHARE_CLICK;
                } else {
                    tag = tagmap.GLOBAL_ELEMENT_SHARE_CLICK;
                }

                fireTag(tag, obj);
            },



            /**
             * Generic function for overlay actions.
             * @param action {String} action that was performed.
             * @param type {String}
             * @param item {obj}
             */
            fireOverlayActionClick: function(action, type, item) {
                var tag,
                    obj = createTagObject({
                        "<action>": action,
                        "<container>": "Overlay"
                    });

                if (type === 'dealer') {
                    $.extend(obj, {
                        "<dealer_name>": item.dealerName,
                        "<dealer_code>": item.dealerCode
                    });

                    tag = tagmap.FIND_A_DEALER_DEALER_OVERLAY_CLICK;
                } else if (type === 'feature') {
                    $.extend(obj, {
                        "<content_title>": item.title
                    });
                    tag = tagmap.MODEL_SECTION_FEATURES_OVERLAY_CLICK;

                } else {
                    tag = tagmap.MODEL_SECTION_GALLERY_OVERLAY_ACTION_CLICK;
                }
                fireTag(tag, obj);
            },

            /**
             * Fired when user clicks next image button or presses right key.
             */
            fireOverlayNextClick: function(type, item) {
                this.fireOverlayActionClick("Toggle Right", type, item);
            },

            /**
             * Fired when user clicks previous image button or presses left key.
             */
            fireOverlayPreviousClick: function(type, item) {
                this.fireOverlayActionClick("Toggle Left", type, item);
            },

            /**
             * Fired when the user selects a wallpaper from the download list.
             */
            fireOverlayDownloadLinkClick: function(title, size) {
                var obj = createTagObject({
                    "<content_title>": title,
                    "<content_size>": size,
                    "<container>": "Overlay"
                });
                this.fireTag(tagmap.MODEL_SECTION_GALLERY_WALLPAPER_DOWNLOAD_CLICK, obj);
            },



            /////////////// HOMEPAGE

            /**
             * Fires a tag for home page load.
             *
             * @param gridSize {String} size of the page grid, WxH, e.g. 4x4
             */
            fireHomePageLoad: function(gridSize) {
                var obj;
                if ($('.grid-sema').length > 0) {
                    // Fire FCV tag instead
                    obj = createTagObject({
                        "<section>": "SEMA 2015 - Main",
                        "<model_name>": "All Models",
                        "<page>": "Landing Page"
                    });
                    fireTag(tagmap.FCV_LOAD, obj);
                    return;
                }
                if ($('.grid-performance').length > 0) {
                    obj = createTagObject({
                        "<section>": "Lexus Home Page",
                        "<subsection>": "Campaign Landing",
                        "<grid_size>": gridSize,
                        "<page>": "Performance"
                    });
                    fireTag(tagmap.CAMPAIGN_HOME_LOAD, obj);
                    return;
                }
                obj = createTagObject({
                    "<grid_size>": gridSize
                });
                fireTag(tagmap.HOME_PAGE_LOAD, obj);
            },

            //  LIM 154 changes
            /**
             * Fires the tag for homepage tile click.
             *
             * @param gridSize {String} <grid_size> value "WxH"
             * @param tileSize {String} <tile_size> value "WxH"
             * @param tilePosition {String} <tile_position> value "COLxROW"
             *
             * @return {object} Configuration object passed to omniture
             */
            fireRecentBuildPresent: function(gridSize, tileSize, tilePosition) {
                var obj = createTagObject({
                    "<container>": "Home Page Tile",
                    "<tile_name>": "Recent Build Present",
                    "<grid_size>": gridSize,
                    "<tile_size>": tileSize,
                    "<tile_position>": tilePosition
                });
                fireTag(tagmap.HOME_PAGE_RECENTBUILD_EXISTS, obj);

            },


            /**
             * Fires the tag for homepage tile click.
             *
             * @param $tile {object} tile clicked
             * @param tileText {String} text on the tile.
             * @param gridSize {String} <grid_size> value "WxH"
             * @param tileSize {String} <tile_size> value "WxH"
             * @param tilePosition {String} <tile_position> value "COLxROW"
             *
             * @return {object} Configuration object passed to omniture
             */
            fireHomepageTileClick: function($tile, tileText, gridSize, tileSize, tilePosition) {
                if ($('.grid-sema').length > 0) {
                    // Fire FCV tag instead
                    var title = "";
                    if ($tile[0].id === "tile-1") {
                        title = "Press Room";
                    } else if ($tile[0].id === "tile-4") {
                        title = "F Performance";
                    } else {
                        title = $tile.find(".title").text();
                    }
                    obj = createTagObject({
                        "<section>": "SEMA 2015 - Main",
                        "<module>": "Hero",
                        "<action>": "Hero Image",
                        "<model_name>": title,
                        "<content_title>": title,
                        "<page>": "Landing Page"
                    });
                    fireTag(tagmap.FCV_CLICK, obj);
                    return;
                }
                if ($('.grid-performance').length > 0) {
                    // Fire Performance tag instead
                    obj = createTagObject({
                        "<container>": "Home Page Tile",
                        "<grid_size>": gridSize,
                        "<tile_name>": tileText,
                        "<page>": "Performance",
                        "<tile_size>": tileSize,
                        "<tile_position>": tilePosition
                    });
                    fireTag(tagmap.CAMPAIGN_TILE_CLICK, obj);
                    return;
                }
                var obj = createTagObject({
                    "<container>": "Home Page Tile",
                    "<tile_name>": tileText,
                    "<grid_size>": gridSize,
                    "<tile_size>": tileSize,
                    "<tile_position>": tilePosition
                });
                // LIM 154 changes
                if (LEXUS.recentbuildType && ($tile.hasClass("recentbuild-0") || $tile.hasClass("recentbuild-1"))) {
                    obj["<tile_name>"] = "BYL Recent Build";
                }
                fireTag(tagmap.HOME_PAGE_TILE_CLICK, obj);

                return obj;
            },


            /**
             * Fires the tag for the homepage alert message click.
             *
             * @param message {string} The alert message title.
             * @param container {string} The container, either header or footer.
             * @returns {Object}
             */
            fireHomepageAlertClick: function(message, container) {
                var obj = createTagObject({
                    "<category>": "Alert",
                    "<message>": message,
                    "<container>": container
                });
                fireTag(tagmap.HOME_PAGE_ALERT_MESSAGE_CLICK, obj);
                return obj;
            },

            /////////////// SPECIFICATIONS

            /**
             * Fires a tag for specifications page load.
             *
             */
            fireSpecificationsPageLoad: function() {
                fireTag(tagmap.MODEL_SPECS_LOAD);
            },


            ////////////// ALL MODELS

            /**
             * Fired when the all models page loads.
             *
             * @param viewType {String} either "Grid" or "List"
             */
            fireAllModelsPageLoad: function(viewType) {
                var obj = createTagObject({
                    "<view_type>": viewType
                });
                fireTag(tagmap.ALL_MODELS_SHOWCASE_LOAD, obj);
            },

            /**
             * Fires the tag for all models click when clicking on a model
             *
             * @param action {String} CTA on element
             * @param viewType {String} current View Type
             * @param container {String} name of Container
             *
             * @return {object} Configuration object passed to omniture
             */
            fireAllModelsModelClick: function(modelName, action, viewType, container) {
                var obj = createTagObject({
                    "<model_name>": modelName,
                    "<action>": action,
                    "<view_type>": viewType,
                    "<container>": container
                });

                fireTag(tagmap.ALL_MODELS_LEARN_MORE_DETAILS_CLICK, obj);

                return obj;
            },

            /**
             * Fires the tag when view type is changed in all models page
             *
             * @param viewType {String} Selected view
             * @param container {String} name of container
             *
             * @return {object} Configuration object passed to omniture
             */
            fireAllModelsViewChange: function(viewType, container) {
                var obj = createTagObject({
                    "<view_type>": viewType,
                    "<container>": container
                });

                fireTag(tagmap.ALL_MODELS_CHANGE_VIEW_CLICK, obj);

                return obj;
            },

            /**
             * GN:1.1 Clicking high level links (non-model) in the header/footer
             *
             * @param viewType
             * @param container
             * @returns {Object}
             */
            headerFooterClick: function(container, category, label) {
                var obj = createTagObject({
                    "<container>": container,
                    "<category>": category,
                    "<label>": label
                });
                console.log("NOT CALLED");
                fireTag(tagmap.HEADER_FOOTER_LINK, obj);

                return obj;
            },

            /**
             * GN:1.2 Header flyout model and model sublinks (build/inventory)
             *
             * @param viewType
             * @param container
             * @returns {Object}
             */
            headerFlyoutModelClick: function(container, category, label, action, modelName) {
                var obj = createTagObject({
                    "<container>": container,
                    "<category>": category,
                    "<label>": label,
                    "<action>": action,
                    "<model_name>": modelName
                });

                fireTag(tagmap.HEADER_FLYOUT_MODEL_CLICK, obj);

                return obj;
            },

            /**
             * SP:1.1 Clicking high level links (non-model) in the header/footer
             *
             * @param viewType
             * @param container
             * @returns {Object}
             */
            searchPageLoad: function(page, keyword) {
                var obj = createTagObject({
                    "<section>": "Search",
                    "<subsection>": "Results",
                    "<page>": page,
                    "<keyword>": keyword
                });

                fireTag(tagmap.SEARCH_PAGE_LOAD, obj);

                return obj;
            },

            /**
             * SP:1.2 Clicking high level links (non-model) in the header/footer
             *
             * @param viewType
             * @param container
             * @returns {Object}
             */
            searchPageClick: function(page, container, category, label, keyword) {
                var obj = createTagObject({
                    "<section>": "Search",
                    "<subsection>": "Results",
                    "<page>": page,
                    "<container>": container,
                    "<category>": category,
                    "<label>": label,
                    "<keyword>": keyword
                });

                fireTag(tagmap.SEARCH_PAGE_CLICK, obj);

                return obj;
            },


            /**
             * SP:1.3 Search results search instead/support (Extra items)
             *
             * @param viewType
             * @param container
             * @returns {Object}
             */
            searchPageClickExtras: function(container, category, label, keyword) {
                var obj = createTagObject({
                    "<section>": "Search",
                    "<subsection>": "Results",
                    "<container>": container,
                    "<category>": category,
                    "<label>": label,
                    "<keyword>": keyword
                });

                fireTag(tagmap.SEARCH_PAGE_CLICK_EXTRA, obj);

                return obj;
            },



            //////////////// MODEL SHOWCASE (aka Model Category Page)
            /**
             * MC:1.1 Model Showcase Page Load
             * */
            modelShowCasePageLoad: function(page) {
                var obj = createTagObject({
                    "<section>": "Model Showcase",
                    "<page>": page
                });


                fireTag(tagmap.MODEL_CATEGORY_LOAD, obj);

                return obj;
            },

            /**
             * MC:1.2 Model Showcase Click
             * */
            modelShowCaseClick: function(page, category, label, model_name) {
                var obj = createTagObject({
                    "<section>": "Model Showcase",
                    "<page>": page,
                    "<category>": category,
                    "<label>": label,
                    "<model_name>": model_name
                });

                fireTag(tagmap.MODEL_CATEGORY_CLICK, obj);

                return obj;
            },



            //////////////// TERTIARY NAV
            /**
             * GE:1.10 Dealer Locator Find A Lexus click
             * */
            fireTertiaryNavClick: function(container, category, label) {
                var obj = createTagObject({
                    "<container>": container,
                    "<category>": category,
                    "<label>": label
                });


                fireTag(tagmap.GLOBAL_ELEMENT_TERTIARY_NAV_CLICK, obj);

                return obj;
            },

            //////////////// SECONDARY NAV
            /**
             * GE:1.9 Secondary Nav Link Click
             *
             * @param container {String}
             * @param category {String}
             * @param label {String}
             * @return obj {Object}
             * */
            fireSecondaryNavClick: function(container, category, label) {
                var obj = createTagObject({
                    "<container>": container,
                    "<category>": category,
                    "<label>": label
                });

                fireTag(tagmap.GLOBAL_ELEMENT_SECONDARY_NAV_CLICK, obj);

                return obj;
            },

            /**
             * GE:1.2 Secondary Nav Compare Link Click
             * */
            fireCompareClick: function(container) {
                var obj = createTagObject({
                    "<container>": container
                });

                fireTag(tagmap.GLOBAL_ELEMENT_COMPARE_BUTTON_CLICK, obj);

                return obj;
            },

            /**
             * GE:1.3 Build Yours Link Click
             * */
            fireBuildYoursNavClick: function(container) {
                var obj = createTagObject({
                    "<container>": container
                });

                fireTag(tagmap.GLOBAL_ELEMENT_BUILD_YOURS_BUTTON_CLICK, obj);

                return obj;
            },



            //////////////// MODEL OVERVIEW

            /**
             * Fires when the overview hero is clicked.
             */
            fireHeroClick: function(module, action, container) {
                var obj = createTagObject({
                    "<module>": module,
                    "<action>": action,
                    "<container>": container
                });

                fireTag(tagmap.MODEL_SECTION_MODULE_ACTION_MS12_CLICK, obj);

                return obj;
            },

            /**
             * Fires when the the stay informed bar is clicked
             */
            fireToolbarClick: function(model) {
                var obj = createTagObject({
                    "<model_name>": model,
                    "<container>": "Banner"
                });

                fireTag(tagmap.OVERVIEW_STAY_INFORMED_CLICK, obj);

                return obj;
            },

            /**
             * GE:1.3 Build Yours CTA click tag
             */
            fireBuildYoursBtnClick: function(container) {
                var obj = createTagObject({
                    "<container>": container
                });

                fireTag(tagmap.GLOBAL_ELEMENT_BUILD_YOURS_BUTTON_CLICK, obj);

                return obj;
            },


            // VISUALIZER

            /**
             * MS:1.2 Trim group select click tag
             *
             * @param module {String}
             * @param action {String}
             * @param container {String}
             * @return {Object}
             */
            fireModelSectionActionClick: function(module, action, container) {
                var obj = createTagObject({
                    "<module>": module,
                    "<action>": action,
                    "<container>": container
                });

                fireTag(tagmap.MODEL_SECTION_MODULE_ACTION_MS12_CLICK, obj);

                return obj;
            },

            /**
             * MS:1.3 Trim group select click tag
             * MS:1.3 Visualizer carousel click
             *
             * @param module {String}
             * @param category {String}
             * @param label {String}
             * @param container {String}
             * @return {Object}
             */
            fireModelSectionVisualizerClick: function(module, category, label, container) {
                var obj = createTagObject({
                    "<module>": module,
                    "<category>": category,
                    "<label>": label,
                    "<container>": container
                });

                fireTag(tagmap.MODEL_SECTION_VISUALIZER_CLICK, obj);

                return obj;
            },

            // GALLERY
            // see GALLERY section below.


            // FIND A DEALER

            /**
             * Fires the tag for the Global Element - Find this Lexus button.
             *
             * @param trim {string}
             * @param offerType {string}
             * @param zipCode {string}
             * @param monthlyPayment {string}
             * @param leaseMonths {string}
             * @param dueAtSigning {string}
             * @param apr {string}
             * @param aprMonths {string}
             * @param container {string}
             * @returns {Object}
             */
            fireFindThisLexusClick: function(trim, offerType, zipCode, monthlyPayment, leaseMonths, dueAtSigning, apr, aprMonths, container) {
                var obj = createTagObject({
                    "<trim>": trim,
                    "<offer_type>": offerType,
                    "<monthly_payment>": monthlyPayment,
                    "<lease_months>": leaseMonths,
                    "<due_at_signing>": dueAtSigning,
                    "<apr>": apr,
                    "<apr_months>": aprMonths,
                    "<container>": container
                });

                fireTag(tagmap.GLOBAL_ELEMENT_FIND_THIS_LEXUS_BUTTON_CLICK, obj);

                return obj;
            },

            fireFindThisLexusDealerClick: function(trim, offerType, zipCode, monthlyPayment, leaseMonths, dueAtSigning, apr, aprMonths, container) {
                var obj = createTagObject({
                    "<trim>": trim,
                    "<offer_type>": offerType,
                    "<monthly_payment>": monthlyPayment,
                    "<lease_months>": leaseMonths,
                    "<due_at_signing>": dueAtSigning,
                    "<apr>": apr,
                    "<apr_months>": aprMonths,
                    "<container>": container,
                    "<model_name>": trim
                });

                fireTag(tagmap.GLOBAL_ELEMENT_FIND_THIS_LEXUS_BUTTON_CLICK, obj);

                return obj;
            },

            fireFindADealerLoad: function(page) {
                var obj = createTagObject({
                    "<section>": "Find A Dealer",
                    "<sub_section>": "Search"
                });

                obj["<page>"] = page;

                fireTag(tagmap.FIND_A_DEALER_SEARCH_LOAD, obj);

                return obj;
            },

            fireFindADealerResultsLoad: function(page, zip, eliteDealer) {
                var obj = createTagObject({
                    "<section>": "Find A Dealer",
                    "<sub_section>": "Search",
                    "<elite_dealer>": eliteDealer
                });

                obj["<page>"] = page;
                obj["<zip_code>"] = zip;

                fireTag(tagmap.FIND_A_DEALER_SEARCH_RESULTS_LOAD, obj);

                return obj;
            },

            /**
             * Fires the tag on the Find a Dealer landing when 'See More'
             * dealers is clicked
             *
             * @returns {Object}
             */
            fireFindADealerSeeMoreClick: function(action) {
                var obj = createTagObject({
                    "<container>": "Dealer Search Module",
                    "<action>": action
                });

                fireTag(tagmap.FIND_A_DEALER_MORE_DEALERS_CLICK, obj);

                return obj;
            },

            /**
             * Fires the tag on the Find a Dealer landing when 'Elite'
             * dealers is clicked
             *
             * @returns {Object}
             */
            fireFindADealerEliteClick: function(action) {
                var obj = createTagObject({
                    "<container>": "Dealer Search Module",
                    "<action>": action
                });

                fireTag(tagmap.FIND_A_DEALER_MORE_DEALERS_CLICK, obj);

                return obj;
            },

            /**
             * Fires the tag for the Find a Dealer click.
             *
             * @param container {string} The container.
             * @returns {Object}
             */
            fireFindADealerClick: function(container) {
                var obj = createTagObject({
                    "<container>": container
                });

                fireTag(tagmap.GLOBAL_ELEMENT_FIND_A_DEALER_BUTTON_CLICK, obj);

                return obj;
            },

            /**
             * Fires the tag for dealer locator module clicks.
             *
             * @param action {string} Dealer Infobox, Dealer Pin
             * @param dealerCode {string} Dealer code
             * @param dealerName {string} Dealer name
             * @returns {Object}
             */
            fireFindADealerModuleClick: function(action, dealerCode, dealerName, eliteDealer) {
                var obj = createTagObject({
                    "<container>": "Map",
                    "<action>": action,
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<elite_dealer>": eliteDealer
                });

                fireTag(tagmap.FIND_A_DEALER_MODULE_ACTION_CLICK, obj);

                return obj;
            },

            /**
             * Fires a tag for dealer detail share links.
             *
             * @param container {String} Returns name of container module
             * @param action {String} Dealer Infobox, Dealer Pin, Dealer Info Button
             * @param eliteDealer {String} Whether elite dealer or not
             */
            fireDealerDetailsClick: function(container, action, eliteDealer, dealerCode, dealerName) {
                var obj = createTagObject({
                    "<container>": container,
                    "<action>": action,
                    "<elite_dealer>": eliteDealer,
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                });

                fireTag(tagmap.FIND_A_DEALER_MODULE_ACTION_CLICK, obj);
            },

            /**
             * Fires the tag for dealer search submit.
             *
             * @param searchTerm {string}
             * @param searchType {string}
             * @param container {string} The container.
             *
             * @returns {Object}
             */
            fireFindADealerSearchSubmitClick: function(searchTerm, searchType, container) {
                var obj = createTagObject({
                    "<search_term>": searchTerm,
                    "<search_type>": searchType,
                    "<container>": container
                });

                fireTag(tagmap.FIND_A_DEALER_SEARCH_SUBMIT_CLICK, obj);

                return obj;
            },

            /**
             * Fires the tag on dealer locator error load.
             *
             * @param page {string}
             * @param zipCode {string}
             *
             * @returns {Object}
             */
            fireFindADealerErrorPageLoad: function(page, zipCode) {
                var originalPage = page;

                var obj = createTagObject({
                    "<section>": "Find A Dealer",
                    "<page>": page,
                    "<zip_code>": zipCode
                });
                obj["<subsection>"] = "Search";
                obj["<page>"] = "Error Overlay";

                fireTag(tagmap.FIND_A_DEALER_ERROR_PAGE_LOAD, obj);

                globalMetrics.addGlobalVariable('page', originalPage);

                return obj;
            },

            /////////////// GALLERY

            // for GALLERY OVERLAY, see GLOBAL section above

            /**
             * MS:2.1 Gallery image click tag (2.2?)
             *
             * @param category {String} The category of teh image or video (usually interior or exterior)
             * @param contentTitle {String} The image title
             * @param contentType {String} Image or video
             * @param numberOfImages {int} Number of images in the list (filtered)
             * @param indexOfSelectedImage {int} offset of the image in teh list (filtered) (1-based)
             */
            fireGalleryModuleClick: function(category, contentTitle, contentType, numberOfImages, indexOfSelectedImage) {
                var obj = createTagObject({
                    "<category>": category,
                    "<content_title>": contentTitle,
                    "<content_type>": contentType,
                    "<grid_size>": numberOfImages,
                    "<tile_position>": indexOfSelectedImage,
                    "<container>": "Gallery Module"
                });

                fireTag(tagmap.MODEL_SECTION_GALLERY_MODULE_CLICK, obj);

                return obj;
            },

            /**
             * MS:1.2 Gallery tab category click tag
             *
             * @param buttonLabel {String} The label of the clicked button.
             */
            fireGalleryTabFilterClick: function(buttonLabel) {
                var obj = createTagObject({
                    "<module>": "Gallery",
                    "<action>": buttonLabel,
                    "<container>": "Gallery Module"
                });


                fireTag(tagmap.MODEL_SECTION_MODULE_ACTION_MS12_CLICK, obj);

                return obj;
            },

            /////////////// PERFORMANCE PAGE

            /**
             * MS:3.3 - Fired the first time the user interacts with the slider on the performance page.
             */
            firePerformanceStylingSliderClick: function() {
                this.fireGenericModuleClick("F Performance Styling", "F Performance Styling", "F Performance Slider");
            },

            /**
             * MS:3.3 - Fired when the user clicks on the packages module.
             * @param packageTitle {String} the title of the clicked package
             */
            firePerformancePackageClick: function(packageTitle) {
                this.fireGenericModuleClick("Featured Package", packageTitle, "Featured Package Module");
            },


            /**
             * MS:3.3 - Fired when a feature is clicked in the performance page.
             *
             * @param module {String} What received the click
             * @param featureTitle {String} The title of the feature.
             */
            firePerformanceFeatureClick: function(module, featureTitle, container) {
                this.fireGenericModuleClick(featureTitle, container, module + " Module");
            },

            /////////////// OWNER BENEFITS PAGE

            /**
             * Fires when owner benefit tile is clicked.
             *
             * @param contentTitle {String} title of the module
             */
            fireOwnerBenefitsTilesClick: function(contentTitle) {
                var obj = createTagObject({
                    "<content_title>": contentTitle,
                    "<container>": "Owner Benefits Tile"
                });

                fireTag(tagmap.OWNERSHIP_OWNER_BENEFITS_TILES_CLICK, obj);
            },

            /**
             * Fires when owner benefit accolade is clicked.
             *
             * @param action {String} Toggle, Carousel
             */
            fireOwnerBenefitsAccoladesClick: function(action) {
                var obj = createTagObject({
                    "<container>": "Accolade Module",
                    "<module>": "Accolade",
                    "<action>": action
                });

                fireTag(tagmap.OWNERSHIP_OWNER_BENEFITS_ACCOLADES_CLICK, obj);
            },
            /////////////// DEALER DETAILS

            /**
             * Fires a tag for dealer detail page load.
             *
             * @param dealerCode {String} Dealer code
             * @param dealerName {String} Dealer name
             * @param zipCode {String} Dealer ZIP
             */
            fireDealerDetailsPageLoad: function(dealerCode, dealerName, zipCode, eliteStatus) {
                var obj = createTagObject({
                    "<section>": "Find A Dealer",
                    "<sub_section>": "Dealer",
                    "<page>": "Details Page",
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<elite_dealer>": eliteStatus,
                    "<zip_code>": zipCode
                });
                fireTag(tagmap.FIND_A_DEALER_DEALER_DETAIL_LOAD, obj);
            },

            /**
             * Fires a tag for dealer detail utility links.
             *
             * @param dealerCode {String} Dealer code
             * @param dealerName {String} Dealer name
             * @param action {String} name of action links (Search for other dealers/Print)
             * @param events {String} return event12 for print only
             */
            fireDealerUtilityLinksClick: function(dealerCode, dealerName, action, events) {
                var obj = createTagObject({
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<action>": action,
                    "<container>": "Header",
                    "<events>": events
                });
                fireTag(tagmap.FIND_A_DEALER_UTILITY_LINKS_CLICK, obj);
            },

            /**
             * Fires a tag for dealer detail share links.
             *
             * @param dealerCode {String} Dealer code
             * @param dealerName {String} Dealer name
             * @param shareLink {String} Returns current page URL
             * @param container {String} Returns 'Header' or 'Body'
             * @param contentTitle {String} Returns page title
             */
            fireDealerDetailShareClick: function(dealerCode, dealerName, shareLink, container, contentTitle) {
                var obj = createTagObject({
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<share_link>": shareLink,
                    "<container>": container,
                    "<content_title>": contentTitle
                });
                fireTag(tagmap.FIND_A_DEALER_DEALER_DETAIL_SHARE_CLICK, obj);
            },

            /**
             * Fires a tag for dealer detail share links.
             *
             * @param dealerCode {String} Dealer code
             * @param dealerName {String} Dealer name
             * @param dealerButton {String} Returns text of element clicked
             * @param container {String} Returns name of container module
             * @param events {String} Returns event code event5/event9
             */
            fireDealerModuleLinksClick: function(dealerCode, dealerName, dealerButton, container, events, eliteDealer) {
                var obj = createTagObject({
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<dealer_button>": dealerButton,
                    "<container>": container,
                    "<events>": events,
                    "<elite_dealer>": eliteDealer
                });

                fireTag(tagmap.FIND_A_DEALER_MODULE_LINKS_CLICK, obj);
            },

            /**
             * Fires a tag for dealer detail carousel click
             *
             * @param dealerCode {String} Dealer code
             * @param dealerName {String} Dealer name
             * @param action {String} Returns text of element clicked
             * @param container {String} Returns name of container module
             */
            fireDealerDetailsCarouselClick: function(dealerCode, dealerName, action, container) {
                var obj = createTagObject({
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<action>": action,
                    "<container>": container
                });
                fireTag(tagmap.FIND_A_DEALER_UTILITY_LINKS_CLICK, obj);
            },

            /**
             * Fires a tag on dealer overlay load.
             *
             * @param section {String}
             * @param subsection {String}
             * @param page {String}
             * @param dealerCode {String} Returns dealer code
             * @param dealerName {String} Returns dealer name
             * @param zipCode {String} Returns ZIP code
             * @param contentTitle {String} Returns content title
             */
            fireDealerOverlayLoad: function(section, subsection, page, dealerCode, dealerName, zipCode, contentTitle) {
                var obj = createTagObject({
                    "<section>": section,
                    "<subsection>": subsection,
                    "<page>": page,
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<zip_code>": zipCode,
                    "<content_title>": contentTitle
                });
                fireTag(tagmap.FIND_A_DEALER_DEALER_OVERLAY_LOAD, obj);
            },

            /**
             * Fires a tag on Search for Other Dealers click.
             *
             * @param dealerCode {String} Returns dealer code
             * @param dealerName {String} Returns dealer name
             * @param action {String} Returns toggle left/toggle right
             * @param contentTitle {String} Returns content title
             */
            fireDealerOverlayClick: function(dealerCode, dealerName, action, contentTitle) {
                var obj = createTagObject({
                    "<dealer_code>": dealerCode,
                    "<dealer_name>": dealerName,
                    "<action>": action,
                    "<content_title>": contentTitle,
                    "<container>": "Overlay"
                });
                fireTag(tagmap.FIND_A_DEALER_DEALER_OVERLAY_CLICK, obj);
            },


            /////////////// CURRENT OFFERS

            /**
             * Fires a tag on Current Offers load.
             *
             * @param availability {String} ex: returns "No Offers Available/Offers Available"
             */
            fireCurrentOffersLoad: function(availability) {
                var obj = createTagObject({
                    "<availability>": availability
                });
                fireTag(tagmap.MODEL_SECTION_CURRENT_OFFERS_LOAD, obj);
            },

            /**
             * Fires a tag on Current Offers search submit click.
             *
             * @param zipCode {String} returns ZIP code
             */
            fireCurrentOffersSearchSubmitClick: function(zipCode) {
                var obj = createTagObject({
                    "<zip_code>": zipCode,
                    "<container>": "Current Offers Module"
                });
                fireTag(tagmap.CURRENT_OFFERS_SEARCH_SUBMIT_CLICK, obj);
            },

            /**
             * Fires a tag on Current Offers click.
             *
             * @param action {String} ex: returns "Carousel"
             */
            fireCurrentOffersClick: function(action) {
                var obj = createTagObject({
                    "<action>": action,
                    "<container>": "Current Offers Module"
                });
                fireTag(tagmap.CURRENT_OFFERS_ACTION_CLICK, obj);
            },

            /////////////// COMPARE

            /**
             * Fires a tag on on select model load.
             */
            fireCompareSelectModelLoad: function() {
                var obj = createTagObject({});
                obj["<subsection>"] = "Select";

                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_SELECT_MODEL_LOAD = "2868.1";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }

                fireTag(tagmap.COMPARE_SELECT_MODEL_LOAD, obj);
            },

            /**
             * Fires a tag on on selection of model click.
             *
             * @param modelName {String}
             * @param action {String}
             * @param container {String}
             */
            fireCompareSelectModelClick: function(modelName, action, container) {
                var obj = createTagObject({
                    "<action>": action,
                    "<container>": container
                });
                obj["<model_name>"] = modelName;

                /***LIM 148 Start***/
                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_SELECT_MODEL_CLICK = "2868.2";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }

                fireTag(tagmap.COMPARE_SELECT_MODEL_CLICK, obj);
            },


            /**
             * CM:1.4
             *
             * Fired when user selects a trim.
             * @param trim {String} The vehicle trim selected by the user.
             */
            fireCompareSelectTrimClick: function(trim) {
                var obj = createTagObject({
                    "<action>": "Select Style",
                    "<container>": "Select Style",
                    "<trim>": trim
                });

                /***LIM 148 Start***/
                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_SELECT_STYLE_CLICK = "2868.4";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }

                fireTag(tagmap.COMPARE_SELECT_STYLE_CLICK, obj);
            },

            /**
             * Fires a tag on on selection of competitor load.
             *
             * @param trim {String}
             */
            fireCompareSelectCompetitorLoad: function(modelName, trim) {
                var obj = createTagObject({
                    "<model_name>": modelName,
                    "<trim>": trim
                });

                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_SELECT_COMPETITOR_LOAD = "2868.5";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }

                fireTag(tagmap.COMPARE_SELECT_COMPETITOR_LOAD, obj);
            },

            /**
             * Fires a tag on add vehicle click.
             * CM:1.6
             *
             * @param action {String}
             * @param container {String}
             */
            fireCompareAddVehicleClick: function(action, container) {
                var obj = createTagObject({
                    "<action>": action,
                    "<container>": container
                });
                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_ADD_VEHICLE_CLICK = "2868.6";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }
                fireTag(tagmap.COMPARE_ADD_VEHICLE_CLICK, obj);
            },

            /**
             * Fires a tag on on selection of competitor click.
             * CM:1.7
             */
            fireCompareVehicleClick: function() {
                var obj = createTagObject({
                    "<container>": "Select Competitor"
                });
                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_SELECT_COMPETITOR_CLICK = "2868.7";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }
                fireTag(tagmap.COMPARE_SELECT_COMPETITOR_CLICK, obj);
            },

            /**
             * Fires a tag on load of compare results page.
             *
             * @param competitorVehicles {Array.<String>} Array containing 1 to 3 vehicles.
             * @param modelName {String}
             * @param trim {String}
             */
            fireCompareSideBySideLoad: function(competitorVehicles, modelName, trim) {
                var obj = createTagObject({
                    "<compare1>": competitorVehicles[0],
                    "<compare2>": competitorVehicles[1] ? competitorVehicles[1] : "",
                    "<compare3>": competitorVehicles[2] ? competitorVehicles[2] : "",
                    "<model_name>": modelName,
                    "<trim>": trim
                });

                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_RESULTS_SIDE_BY_SIDE_LOAD = "2868.8";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }

                fireTag(tagmap.COMPARE_RESULTS_SIDE_BY_SIDE_LOAD, obj);
            },

            /**
             * Fires a tag on load of compare results page.
             *
             * @param container {String}
             * @param action {String}
             * @param modelName {String}
             * @param trim {String}
             */
            fireCompareResultsLinkClick: function(container, action, modelName, trim) {
                var obj = createTagObject({
                    "<container>": container,
                    "<action>": action,
                    "<model_name>": modelName,
                    "<trim>": trim
                });
                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_RESULTS_LINK_CLICK = "2868.9";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }
                fireTag(tagmap.COMPARE_RESULTS_LINK_CLICK, obj);
            },

            /**
             * Fires a tag on load of compare results page.
             *
             * @param container {String}
             * @param action {String}
             * @param modelName {String}
             * @param trim {String}
             * @param events {String}
             */
            fireCompareResultsUtilityNavClick: function(container, action, modelName, trim, events) {
                var obj = createTagObject({
                    "<container>": container,
                    "<action>": action,
                    "<model_name>": modelName,
                    "<trim>": trim,
                    "<events>": events
                });
                /***LIM 148 Start***/
                if (LEXUS.ComparatorDealerCode) {
                    tagmap.COMPARE_RESULTS_UTILITY_NAV_CLICK = "2868.9";
                    obj["<dealer_code>"] = LEXUS.ComparatorDealerCode;
                }
                fireTag(tagmap.COMPARE_RESULTS_UTILITY_NAV_CLICK, obj);
            },


            /**
             * GE:1.9
             * Click on scroll link in compare side by side.
             *
             * @param linkName {String} The label on the clicked link.
             */
            fireCompareScrollLink: function(linkName) {
                this.fireSecondaryNavClick("Secondary Nav", linkName, "");
            },

            /////////////// THIRD PARTY INTERSTITIAL

            /**
             * Fires a tag on third party interstitial load.
             */
            fireThirdPartyInterstitialLoad: function() {
                var tagObj = createTagObject(),
                    obj = $.extend(tagObj, {
                        "<section>": "Third Party Interstitial",
                        "<subsection>": "Outlink",
                        "<page>": "Overlay"
                    });

                fireTag(tagmap.THIRD_PARTY_INTERSTITIAL_LOAD, obj);
            },

            /**
             * Fires a tag on third party interstitial click.
             *
             * @param action {String} Cancel, Continue
             */
            fireThirdPartyInterstitialClick: function(action) {
                var obj = createTagObject({
                    "<action>": action,
                    "<container>": "Outlink"
                });
                fireTag(tagmap.THIRD_PARTY_INTERSTITIAL_CLICK, obj);
            },

            /** LIM 195 START**/
            ///////////////// FAVORITES

            fireFavoritesBuildYoursButtonClick: function() {
                var obj = createTagObject({
                    "<container>": "Overlay"
                });
                fireTag(tagmap.FAVORITES_BUILD_YOURS_BUTTON, obj);
            },

            fireFavoritesSendToDealerButtonClick: function() {
                var obj = createTagObject({
                    "<container>": "Overlay"
                });
                fireTag(tagmap.FAVORITES_SEND_TO_DEALER_BUTTON, obj);
            },

            fireFavoritesToggle: function(action, detail) {
                var obj = createTagObject({
                    "<container>": "Module",
                    "<action>": action,
                    "<favorites_details>": detail
                });
                fireTag(tagmap.FAVORITES_TOGGLE, obj);
            },

            fireFavoritesCounterClick: function() {
                var obj = createTagObject({
                    "<container>": "Saved Favorites",
                    "<action>": "Show"
                });
                fireTag(tagmap.FAVORITES_COUNTER, obj);
            },

            fireFavoritesOverlayLoaded: function() {
                var obj = createTagObject({});

                obj["<section>"] = "Favorites";
                obj["<subsection>"] = "Saved Favorites";
                obj["<page>"] = "Overlay";

                fireTag(tagmap.FAVORITES_LOAD_OVERLAY, obj);
            },
            /** LIM 195 END**/


            ///////////////// LEAD FORMS

            fireLeadFormValidationError: function(errorType, errorMessage) {
                var obj = createTagObject({
                    "<error_type>": errorType,
                    "<error_message>": errorMessage
                });
                obj["<page>"] = "Error Overlay";
                fireTag(tagmap.LEAD_FORM_VALIDATION_ERROR_MESSAGE, obj);
            },

            fireLeadFormZipCodeError: function(zip, errorMessage) {
                var obj = createTagObject({
                    "<zip_code>": zip,
                    "<error_message>": errorMessage,
                    "<error_type>": "Zip Code Error"
                });
                obj["<page>"] = "Error Overlay";
                fireTag(tagmap.LEAD_FORM_ZIPCODE_ERROR_MESSAGE, obj);
            },

            fireLeadFormConfirmationLinkClick: function() {
                var obj = createTagObject({
                    "<link>": "Lexus Home"
                });
                fireTag(tagmap.LEAD_FORM_CONFIRMATION_LINK_CLICK, obj);

            },

            /**
             * Fired when a lead form confirmation is received.
             *
             * @param data {LeadFormAnalyticsBundle}
             */
            fireLeadFormConfirmationLoad: function(data) {

                var events = [],
                    ALL_LEAD_FORMS_EVENT_11 = "event11",
                    ALL_LEAD_FORMS_EVENT_68 = "event68",
                    SIGN_UP_FOR_NEWS_EVENT = "event4",
                    REQUEST_BROCHURE_EVENT = "event18",
                    SIGN_UP_FOR_NEWS_OR_UPCOMING_VEHICLE_EVENT = "event34",
                    ALLOW_DEALERS_TO_CONTACT_ME_DIRECTLY_EVENT = "event21",
                    SEND_ME_CPO_INFORMATION_EVENT = "event17",
                    SEND_ME_LEXUS_FINANCIAL_SERVICES_INFORMATION_EVENT = "event25",
                    pageId = data.pageId,
                    VEHICLE_OF_INTEREST = "event19",
                    NEWSLETTER_ID = "newsletter",
                    BROCHURE_ID = "brochure",
                    UPCOMING_ID = "upcoming";

                if (data.didCheckAllowDealerToContact) {
                    events.push(ALLOW_DEALERS_TO_CONTACT_ME_DIRECTLY_EVENT);
                }
                if (data.didCheckSendMeCPO) {
                    events.push(SEND_ME_CPO_INFORMATION_EVENT);
                }
                if (data.didCheckSendMeFinancialInfo) {
                    events.push(SEND_ME_LEXUS_FINANCIAL_SERVICES_INFORMATION_EVENT);
                }

                if (pageId === NEWSLETTER_ID) {
                    events.push(SIGN_UP_FOR_NEWS_EVENT);
                    // LIM 496 change
                    if (data.vehicleOfInterestSelected) {
                        events.push(VEHICLE_OF_INTEREST);
                    }
                    events.push(SIGN_UP_FOR_NEWS_OR_UPCOMING_VEHICLE_EVENT);
                }
                if (pageId === UPCOMING_ID) {
                    if (data.vehicleOfInterestSelected) {
                        events.push(VEHICLE_OF_INTEREST);
                    }
                    events.push(SIGN_UP_FOR_NEWS_OR_UPCOMING_VEHICLE_EVENT);
                }
                if (pageId === BROCHURE_ID) {
                    events.push(REQUEST_BROCHURE_EVENT);
                }

                events.push(ALL_LEAD_FORMS_EVENT_11);
                events.push(ALL_LEAD_FORMS_EVENT_68);

                var obj = createTagObject({
                    "<dealer_name>": data.dealerName || "",
                    "<events>": events.join(","),
                    "<zip_code>": data.zip,
                    "<model_name>": data.modelName
                });
                // LIM 496 change

                if (data.modelNamesVOE) {
                    if (data.modelNamesVOE[0]) {
                        obj["<interest_vehicle1>"] = data.modelNamesVOE[0];
                    } else {
                        obj["<interest_vehicle1>"] = "";
                    }
                    if (data.modelNamesVOE[1]) {
                        obj["<interest_vehicle2>"] = data.modelNamesVOE[1];
                    } else {
                        obj["<interest_vehicle2>"] = "";
                    }
                    if (data.modelNamesVOE[2]) {
                        obj["<interest_vehicle3>"] = data.modelNamesVOE[2];
                    } else {
                        obj["<interest_vehicle3>"] = "";
                    }
                }



                // add confirmation to the page name.
                globalMetrics.addGlobalVariable("name", globalMetrics.getGlobalVariable("name") + " Confirmation");

                switch (pageId) {
                    case NEWSLETTER_ID:
                        this.fireLeadFormNewsletterConfirmationLoad(obj);
                        break;
                    case BROCHURE_ID:
                        this.fireLeadFormBrochureConfirmationLoad(obj);
                        break;
                    case UPCOMING_ID:
                        this.fireLeadFormUpcomingConfirmationLoad(obj);
                        break;
                    default:
                        // do nothing.
                        break;
                }

            },

            fireLeadFormNewsletterConfirmationLoad: function(obj) {
                obj["<page>"] = "Lead Confirmation";
                fireTag(tagmap.LEAD_FORM_SIGN_UP_FOR_NEWS_CONFIRMATION_LOAD, obj);
            },

            fireLeadFormBrochureConfirmationLoad: function(obj) {
                obj["<page>"] = "Lead Confirmation";
                fireTag(tagmap.LEAD_FORM_REQUEST_A_BROCHURE_CONFIRMATION_LOAD, obj);
            },
            fireLeadFormUpcomingConfirmationLoad: function(obj) {
                obj["<page>"] = "Lead Confirmation Overlay";
                fireTag(tagmap.LEAD_FORM_FUTURE_VEHICLE_NEWS_CONFIRMATION_LOAD, obj);
            },

            // CPO Tagging

            fireLeadCPOButtons: function(module, category, label) {
                obj = createTagObject({
                    "<module>": module,
                    "<category>": category,
                    "<label>": label
                });
                fireTag(tagmap.CPO_BUTTON_CLICK, obj);
            },

            fireCPOModelLoad: function(model_name, model_year, model_line) {
                obj = createTagObject({
                    "<model_name>": model_name,
                    "<model_year>": model_year,
                    "<model_line>": model_line
                });
                fireTag(tagmap.CPO_MODEL_PAGE_LOAD, obj);
            },

            fireCPOModelClick: function(model_name, model_year, model_line, module, label) {
                obj = createTagObject({
                    "<module>": module,
                    "<label>": label,
                    "<model_name>": model_name,
                    "<model_year>": model_year,
                    "<model_line>": model_line
                });
                fireTag(tagmap.CPO_MODEL_CLICK, obj);
            },

            fireCPOToolClick: function(container, label) {
                obj = createTagObject({
                    "<container>": container,
                    "<label>": label
                });
                fireTag(tagmap.CPO_TOOLS_CLICK, obj);
            },

            fireCPOSocialClick: function(label, share_content) {
                obj = createTagObject({
                    "<container>": "Share Icon Overlay",
                    "<label>": label,
                    "<share_content>": share_content
                });
                fireTag(tagmap.CPO_SOCIAL_CLICK, obj);
            },

        };
    });
