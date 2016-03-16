/**
 * Created by jsemko on 7/25/14.
 */
define(
    ["util/cookie", "analytics", "PointBreak"],
    function(cookie, analytics, PointBreak) {

        // If this feature is turned off do nothing
        if (!window.favoritesActive) {
            return false;
        }

        var count,

            pointbreak,

            /**
             * Publicly exposed object
             *
             * @type {object}
             */
            favObject,

            /**
             * Cookie name
             *
             * @type {string}
             */
            FAV_COOKIE_NAME = 'lexus-wishlist',

            /**
             * Car model and year to go into cookie as main key
             *
             * @type {string}
             */
            CAR_MODEL_AND_YEAR = favModelName + "-" + favModelYear,

            /**
             * Blank favorite (per model)
             *
             * @type Object
             */
            BLANK_FAVORITE = {
                'x': [],
                'i': [],
                'p': [],
                'a': []
            },

            /**
             * Opposing actions. For example, when 'addFavorite' is called,
             * toggle to removeFavorite
             *
             * @type Object
             */
            ACTIONS = {
                addFavorite: "removeFavorite",
                removeFavorite: "addFavorite"
            },

            /**
             * Two way readable category names
             *
             * @type Object
             */
            CATEGORIES = {
                x: "Exterior",
                i: "Interior",
                p: "Package",
                a: "Option",
                "Exterior": "x",
                "Interior": "i",
                "Package": "p",
                "Option": "a"
            },

            // Sidebar presentation values
            // TODO This could go in a hidden div and be used to pull
            // information from the CMS instead of being hardcoded here
            HUMAN_READABLE = {
                "Exterior": "Exterior Colors",
                "Interior": "Interiors",
                "Package": "Packages",
                "Option": "Options"
            };

        /**
         * Saves a cookie
         *
         * @protected
         */
        Favorite.prototype.saveCookie = function() {
            var c = cookie.get(FAV_COOKIE_NAME) ? JSON.parse(cookie.get(FAV_COOKIE_NAME)) : {};
            c[CAR_MODEL_AND_YEAR] = this.favorite;
            cookie.setWithExpiration(FAV_COOKIE_NAME, JSON.stringify(c), 60 * 60 * 24 * 30);
        };

        /**
         * Adds a favorite to cookie, local storage. Updates toggle
         * visually, fires analytics
         *
         * @protected
         * @param $item -
         *            button which holds all favorited item data
         */
        Favorite.prototype.addFavorite = function($item) {

            var type = $item.getAttribute('data-type'),
                title = $item.getAttribute('data-title'),
                url = $item
                    .getAttribute('data-url'),
                cleanTitle = $item.getAttribute('data-clean-title'),
                code = $item
                    .getAttribute('data-code');

            // Add favorited item to JS object
            this.favorite[CATEGORIES[type]].push(code);

            // Local Storage
            addToLocalStorage(code, title, url, cleanTitle);

            // Replace save/remove text
            $item.textContent = $item.textContent.toLowerCase().replace('save', 'remove', 'gi');

            // Analytics
            analytics.helper.fireFavoritesToggle("Save", cleanTitle);
        };

        /**
         * Removes a favorite from cookie, local storage. Updates toggle
         * visually, fires analytics
         *
         * @protected
         * @param $item
         */
        Favorite.prototype.removeFavorite = function($item) {
            var code = $item.getAttribute('data-code'),
                type = $item.getAttribute('data-type'),
                index;

            // Replace save/remove text
            $item.textContent = $item.textContent.toLowerCase().replace('remove', 'save', 'gi');

            // Find index of code in array and remove it
            index = this.favorite[CATEGORIES[type]].indexOf(code);
            this.favorite[CATEGORIES[type]].splice(index, 1);

            // Analytics
            analytics.helper.fireFavoritesToggle("Remove", $item.getAttribute('data-clean-title'));
        };

        /**
         * Binds event listeners
         *
         * @protected
         * @param type
         */

        Favorite.prototype.adjustContainer = function() {



            if (pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) {
                $('.favorite-count.desktop').show();
            } else {
                $('.favorite-count.desktop').hide();
            }



            //var fContainer = document.getElementById('favorite-container');
            var favcontainerlist = $('#fav-container-list');
            if (this.favContainerScope.scrollHeight > this.favContainerScope.clientHeight) {

                //$(fContainer).css('height', $(window).height());

                // $('#fav-container-list').addClass('fav-add-scroll');
                $('.build-send-btn').addClass('btnposition-fixed');
                $('#edit-favorites').css('padding-right', '10px');

                favcontainerlist.css('overflow-y', 'scroll');
                $('#favorite-container').css('height', "100%");
                favcontainerlist.css('height', $(window).height() - 250);

            } else {

                // $('#fav-container-list').addClass('fav-add-scroll');
                $('.build-send-btn').removeClass('btnposition-fixed');
                $('#edit-favorites').css('padding-right', '0px');

                favcontainerlist.css({
                    'overflow-y': 'hidden',
                    'height': 'auto'
                });
                // $('#fav-container-list').css('height', $(window).height()
                // - $('.build-send-btn').height());

            }
        };

        Favorite.prototype.bindEvents = function(type) {
            var that = this,
                $removeBtns, favContainer, favOverlay;

            // Binds favorite (save/remove) buttons
            that.bindFavorites();

            // If the favorite count is clicked to open the sidebar
            $('.favorite-count').off('click').on('click', function(e) {

                that.initList();

                favOverlay = $('#favorite-overlay');
                favContainer = $('#favorite-container');

                that.adjustContainer();

                $(window).on('resize orientationchange', function() {
                    that.adjustContainer();
                });

                // Refresh the disclaimers for small viewport
                LEXUS.Disclaimers.refreshDisclaimers();

                // Lock the window scrolling
                that.lockScroll(favContainer);

                // If more than 0 favorited items add listener for edit/save
                // button
                if (that.getFavoriteCount()) {

                    $('#edit-favorites').on('click', function(e) {
                        e.preventDefault();
                        $removeBtns = $('#favorite-container').find('span[data-action=removeFavorite]');

                        // Toggle the text for the edit/save button and
                        // display type
                        if (e.currentTarget.textContent.match(/(edit)/gi)) {
                            e.currentTarget.childNodes[0].textContent = 'save list';
                            $removeBtns.css('display', 'table-cell');
                        } else {
                            e.currentTarget.childNodes[0].textContent = 'edit list';
                            $removeBtns.css('display', 'none');
                        }

                        // Add event listeners for newly created remove
                        // buttons
                        that.activateRemoveBtnListeners();
                    });
                }

                // Open the sidebar
                that.toggleSidebar(favContainer, favOverlay, 'open');

                // If sidebar close button or overlay is clicked/touched
                // close sidebar
                $('#fav-close, #favorite-overlay').on('click', function(e) {
                    e.stopPropagation();
                    that.toggleSidebar(favContainer, favOverlay, 'close');
                });

                // Fire analytics for opening sidebar
                analytics.helper.fireFavoritesCounterClick();
                analytics.helper.fireFavoritesOverlayLoaded();
            });

            // bind analytics
            $('#fav-send-to-dealer').on('click', analytics.helper.fireFavoritesSendToDealerButtonClick);
            $('.fav-build-yours').on('click', analytics.helper.fireFavoritesBuildYoursButtonClick);
        };

        /**
         * Toggles the sidebar
         *
         * @param favContainer
         * @param favOverlay
         * @param status
         */
        Favorite.prototype.toggleSidebar = function(favContainer, favOverlay, status) {

            var position = status === 'close' ? "-100%" : "0px";

            // If transitions are supported use CSS3 otherwise javascript
            if (Modernizr.csstransitions) {
                if (status === 'close') {
                    favContainer.removeClass('tranny');
                } else {
                    favContainer.addClass('tranny');
                }
            } else {
                favContainer.animate({
                    "right": position
                });
            }

            // If closing fadeout Overlay and unlock scroll
            if (status === 'close') {
                favOverlay.fadeOut();
                document.querySelector('body').style.overflow = "auto";
                $(document).off('touchstart touchmove');
            } else {
                favOverlay.fadeIn();
            }

        };

        /**
         * Locks page scroll ability, extra work for iPad
         *
         * @param favContainer
         */
        Favorite.prototype.lockScroll = function(favContainer) {

            document.querySelector('body').style.overflow = "hidden";

            $(document).on('touchmove', function(e) {
                e.preventDefault();
            });

            // To prevent background scrolling on touch devices trick window
            // into believing it never reaches the top or bottom of the
            // favorites sidebar
            // by resetting to +1 or -1 pixel from top or bottom
            // respectively.
            favContainer.on('touchstart', function(e) {
                if (e.currentTarget.scrollTop === 0) {
                    e.currentTarget.scrollTop = 1;
                } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
                    e.currentTarget.scrollTop -= 1;
                }
            });

            favContainer.on('touchmove', function(e) {
                e.stopPropagation();
            });

        };

        /**
         * Activates the remove buttons in the sidebar
         *
         * @protected
         */
        Favorite.prototype.activateRemoveBtnListeners = function() {
            var that = this;

            // When a remove button in the side bar is clicked...
            $('#favorite-container').find('span[data-action=removeFavorite]').off("click").on("click", function(e) {

                var type = this.getAttribute('data-type').toLowerCase();

                // Remove item from the cookie/object
                that.removeFavorite(this);

                // Update the background page if needed
                that.updateViewForPage(this);

                // Remove the list item clicked
                $(this).closest("li").remove();

                // If the list is now empty, remove the title and container
                // surrounding it



                if (that.favContainerList.scrollHeight <= that.favContainerList.clientHeight) {

                    // $('#fav-container-list').addClass('fav-add-scroll');
                    $('.build-send-btn').removeClass('btnposition-fixed');
                    $('#edit-favorites').css('padding-right', '0px');

                    $('#fav-container-list').css({
                        'overflow-y': 'hidden',
                        'height': 'auto'
                    });
                    // $('#fav-container-list').css('height', $(window).height()
                    // - $('.build-send-btn').height());



                }
                var favoritecontainer = $('#favorite-container');
                favoritecontainer.css('height', "100%");

                that.adjustContainer();

                if (!$('.fav-list.' + type + ' li').length) {
                    favoritecontainer.find('.' + type).remove();
                }

                // Lastly, if the count is 0 show the empty state
                if (that.getFavoriteCount() === 0) {
                    that.favContainerScope.querySelector('#fav-populated-list').style.display = 'none';
                    that.favContainerScope.querySelector('#fav-empty-list').style.display = 'block';
                }

                // Update and Save the cookie
                that.updateCount();
                that.saveCookie();

            });
        };

        /**
         * In the instance an item is removed from the sidebar the page
         * needs to reflect the change
         *
         * @protected
         * @param item
         */
        Favorite.prototype.updateViewForPage = function(item) {

            // Determine the type of removal (ext, int) so it can be handled
            // properly
            var type = item.getAttribute('data-type').match(/(Exterior|Interior)/) ? "Color" : item
                .getAttribute('data-type'),
                onOverViewPage = (type === 'Color' && document
                    .getElementById('overview')),
                onPackagesPage = (type.match(/(Package|Option)/) && document
                    .getElementById('packages')),
                efcCode = item.getAttribute('data-code');

            // If the visualizer
            if (onOverViewPage) {
                updateOverviewPage(efcCode);
            }

            // If packages/options page
            if (onPackagesPage) {
                updatePackagesPage(efcCode, type);
            }
        };

        /**
         * Adds item to local storage
         *
         * @param code
         * @param title
         * @param url
         * @param cleanTitle
         */

        function addToLocalStorage(code, title, url, cleanTitle) {

            // If item is already in local storage skip this step
            if (!localStorage.getItem(code)) {
                localStorage.setItem(code, JSON.stringify({
                    title: title,
                    url: url,
                    cleanTitle: cleanTitle
                }));
            }
        }

        /**
         * Takes a recently removed item and visually updates the Visualizer
         * swatch
         *
         * @private
         * @param item
         */

        function updateOverviewPage(efcCode) {

            var selectedSwatch, selector;

            // Find the swatch that is being removed from favorites in the
            // visualizer and update
            selector = $('.swatch.thumb[data-code=' + efcCode + ']');
            selector.attr('data-action', 'addFavorite');

            // If the swatch removed was selected also update the text
            if (selector.hasClass('selected')) {
                selectedSwatch = document.getElementById('swatch-favorite').querySelector('.favorite-listener');
                selectedSwatch.setAttribute('data-action', 'addFavorite');
                selectedSwatch.textContent = "Save";
            }
        }

        /**
         * Private
         *
         * @param item
         */

        function updatePackagesPage(efcCode, type) {

            // Find the package or option based off EFC code and update to
            // 'save' mode
            var selector = document.getElementById('packages-container').querySelector(
                '.favorite-listener[data-code="' + efcCode + '"]');
            selector.textContent = "Save " + type;
            selector.setAttribute('data-action', 'addFavorite');
        }

        /**
         * Event that fires when a favorite is clicked, update the action
         * (add->remove), update count, cookie
         *
         * @param e -
         *            event target
         */

        Favorite.prototype.favoriteClicked = function(e) {
            var eventElement = e.currentTarget,
                action = eventElement.getAttribute('data-action'),
                visualizerScope = document
                    .getElementById('visualizerSwatchPicker'),
                selectedSwatch = visualizerScope ? visualizerScope
                    .querySelector(".swatch.selected") : null;

            // If on overview page and swatch is selected
            if (selectedSwatch) {
                selectedSwatch.setAttribute('data-action', ACTIONS[action]);
            }

            // action will be either removeFavorite or addFavorite
            Favorite.prototype[action].call(favObject, eventElement);

            // Reverse the action so next click opposite result will occur
            eventElement.setAttribute('data-action', ACTIONS[action]);

            // LIM 195 START
            if (action !== null && (action === "addFavorite" || action === "removeFavorite")) {
                var nothing = "";
                //favObject.favListCount();
            }
            // LIM 195 END
            // Update count and cookie
            favObject.updateCount();

            favObject.saveCookie();
        };

        /**
         * Bind all favorite buttons on the page
         *
         * @protected
         */
        Favorite.prototype.bindFavorites = function() {
            var that = this;
            $('.favorite-listener').each(function(index, value) {
                $(this).off("click").on('click', that.favoriteClicked);
            });
        };

        /**
         * Update count
         *
         * @protected
         */
        Favorite.prototype.updateCount = function() {
            for (var i = 0; i < this.countScope.length; i++) {
                this.countScope[i].textContent = this.getFavoriteCount();
            }
        };

        /**
         * Determines the amount of items favorited
         *
         * @returns {number}
         */
        Favorite.prototype.getFavoriteCount = function() {
            count = 0;
            for (var type in this.favorite) {
                if (this.favorite[type] !== null) {
                    count += this.favorite[type].length;
                }
            }
            return count;
        };

        /**
         * Protected
         */
        Favorite.prototype.initList = function() {
            var html = '',
                populatedList = this.favContainerScope.querySelector('#fav-populated-list'),
                emptyList = this.favContainerScope
                    .querySelector('#fav-empty-list'),
                title, url, removal, currentFavorite;

            // If no favorites have been selected show empty state sidebar,
            // otherwise continue
            if (this.getFavoriteCount() === 0) {
                populatedList.style.display = 'none';
                emptyList.style.display = 'block';
                return;
            }

            emptyList.style.display = 'none';
            populatedList.style.display = 'block';

            // Build a template for each favorite in the sidebar
            for (var j in this.favorite) {
                if (Object.keys(this.favorite[j]).length) {

                    // Generate section title
                    html += '<p class="sectiontitle ' + CATEGORIES[j].toLowerCase() + '">' + HUMAN_READABLE[CATEGORIES[j]] + '</p><ul class="fav-list ' + CATEGORIES[j].toLowerCase() + '">';

                    // Build HTML template for each favorite in the sidebar
                    for (var x = 0; x < this.favorite[j].length; x++) {

                        // Retrieve related localStorage details
                        currentFavorite = JSON.parse(localStorage.getItem(this.favorite[j][x]));

                        // Extract the title,url,remove button and build an
                        // HTML template out of it
                        title = (currentFavorite) ? this.unescapeTitle(currentFavorite.title) : "";
                        url = currentFavorite.url ? '<img src="' + currentFavorite.url + '" />' : '<span class="starticon"></span>';
                        removal = this.generateRemoveBtn(currentFavorite, this.favorite[j][x], j);

                        html += this.generateHTMLTemplate(title, url, removal);
                    }
                    html += '</ul>';
                }
            }
            html += '<span id="edit-favorites"><span>edit list</span></span>';

            this.listScope.innerHTML = html;
            this.favListScroll(); // added for fav-list scroll

        };

        /**
         * Using EFC code determine if item is favorited
         *
         * @param type
         * @param efcCode
         * @returns {number}
         */
        Favorite.prototype.isFavorite = function(type, efcCode) {
            return this.favorite[CATEGORIES[type]].indexOf(efcCode) === -1 ? 0 : 1;
        };

        /**
         * Unescapes disclaimers within an items title (anayltics does not
         * need disclaimer)
         *
         * @param title
         * @returns {*}
         */
        Favorite.prototype.unescapeTitle = function(title) {

            title = title.replace(/SINGLE_QUOTE/gi, "\'");
            title = title.replace(/DOUBLE_QUOTE/gi, "\"");
            title = title.replace(/_EQUALS_/g, "=");
            title = title.replace(/SEMI_COLON/g, ";");
            title = title.replace(/_REG_/, "&reg;");

            return title;
        };

        /**
         * Builds HTML template for a remove button
         *
         * @param currentFavorite
         * @param efcCode
         * @param type
         * @returns {string}
         */
        Favorite.prototype.generateRemoveBtn = function(currentFavorite, efcCode, type) {

            return '<span class="removeFavoriteListener" ' + 'data-code="' + efcCode + '"' + 'data-action="removeFavorite"' + 'data-type="' + CATEGORIES[type] + '"' + 'data-clean-title="' + currentFavorite.cleanTitle + '">' + document.getElementById('fav-remove-template').innerHTML + '</span>';
        };

        /**
         * HTML template in sidebar for showing a favorite item
         *
         * @param title
         * @param url
         * @param removal
         * @returns {string}
         */
        Favorite.prototype.generateHTMLTemplate = function(title, url, removal) {

            return '<li><div class="fav-swatch-container"><div class="fav-swatch"><span class="fav-indicator"></span>' + url + '</div></div><div class="fav-item-title">' + title + '</div><div class="removeFavorite">' + removal + '</div></div></li>';

        };

        /** LIM 195 * */
        Favorite.prototype.favListScroll = function() {
            // for exterior
            var favcontainerlist = $('#fav-container-list');
            if (favcontainerlist.find('ul.fav-list.exterior > li').length >= 3) {
                var nothing = "";
                // $('.fav-list.exterior').css('overflow-y', 'scroll');
            } else {
                $('.fav-list.exterior').css('overflow-y', 'hidden');
            }

            // for interior
            if (favcontainerlist.find('ul.fav-list.interior > li').length >= 3) {
                var nothing1 = "";
                // $('.fav-list.interior').css('overflow-y', 'scroll');
            } else {
                $('.fav-list.interior').css('overflow-y', 'hidden');
            }
        };

        Favorite.prototype.favListCount = function() {
            var favoritecountdesktop = $('.favorite-count.desktop');
            if (favoritecountdesktop.is(":visible")) {

                favoritecountdesktop.stop(true, true).fadeOut(1000, function() {
                    var e = $(this);
                    e.css('background-color', '#000000');
                    e.css('background-color', '#c19237');
                }).fadeIn();
            } else {
                $(".favorite-count.mobile").stop(true, true).fadeOut(1000, function() {
                    $(this).css('background-color', '#000000');
                }).fadeIn().fadeOut(2000, function() {
                    $(this).css('background-color', '#c19237');
                }).fadeIn();
            }
        };

        /** LIM 195 End* */
        /**
         * Builds a new Favorite object, uses present data or creates a
         * blank object depending on what exists in cookie
         *
         * @param data
         * @constructor
         */

        function Favorite(data) {
            this.favorite = data || BLANK_FAVORITE;
            this.countScope = document.querySelectorAll('.favorite-count');
            this.listScope = document.getElementById('fav-container-list');
            this.favContainerScope = document.getElementById('favorite-container');
            this.favContainerList = document.getElementById('fav-container-list');
        }

        /**
         * Initialize favorites
         *
         * @private
         */

        function initFavorites() {
            favObject = cookie.get(FAV_COOKIE_NAME) ? new Favorite(
                JSON.parse(cookie.get(FAV_COOKIE_NAME))[CAR_MODEL_AND_YEAR]) : new Favorite(null);

            favObject.updateCount();
            favObject.bindEvents();
            favObject.initList();
            pointbreak = new PointBreak();

        }

        initFavorites();

        /**
         * Expose the Favorite object methods and variables
         */
        return {
            getFavObject: favObject
        };

    });
