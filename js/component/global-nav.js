(function($) {
    /**
     * All behaviors for the global nav and footer
     * controls various dropdowns, and also binds analytics
     *
     * @class GlobalNav
     */

    var GlobalNav = function() {
        var SLIDE_DURATION = 350,
            FADE_DURATION = 200,
            NAV_OPEN_CLASS = "nav-open",
            OPEN_CLASS = "open",
            ACTIVE_CLASS = "active",
            ACTIVE_SELECTOR = "." + ACTIVE_CLASS,
            GLOBAL_ELEMENT_HEADER_FOOTER_CLICK = "2576.2",
            GLOBAL_ELEMENT_HEADER_MODEL_CLICK = "2576.3",
            GLOBAL_ELEMENT_MODEL_FLYOUT_COMPARE_CLICK = "2538.2",
            GLOBAL_ELEMENT_FIND_A_DEALER_BUTTON_CLICK = "2538.4",
            HOME_PAGE_ALERT_MESSAGE_CLICK = "2537.3",
            $mobileMenuTrigger = $('#mobileMenuButton'),
            $mobileMenuDropdown = $('#mobileMenuList'),
            navCategory = $('#categories .vehicleCategoryDropdown'),
            navModelSelect = $('#navModelSelect'),
            modelCategoryRow = '.modelCategoryRow',
            categoriesContainer = $('#categories'),
            $header = $(".header-wrapper"),
            $search = $(".search"),
            $searchMobileContainer = $('#searchMobileContainer'),
            $searchMobile = $('#searchMobileContainer .search'),
            $closeSearch = $(".close-search"),
            $footerHeadLinks = $('.footer.small h5'),
            istouch = ($('html').hasClass('touch') || $('html').hasClass('mstouch'));

        /**
         * @constructor
         */

        function init() {
            partnerNavTouch();
            if (!$('html').hasClass('lte-ie10')) {
                bindEvents();
            }
            initGlobalNavAnalytics();
        }

        /**
         * if we are in partner nav mode, and are on a touch device, wrap the nav and footer in a touch div, so that
         * selectors work right
         */

        function partnerNavTouch() {
            var $pn = $('.pn');

            // LIM-1628 Since partner nav does not use the global modernizr we need to add the custom test classes to it.
            // ismobile-device test
            var regex = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
                userAgent = navigator.userAgent,
                isMobileDevice = regex.test(userAgent);

            // Ipad Test
            regex = /iPad/i;
            var isIpad = regex.test(userAgent);

            //mstouch test
            var msMaxTouchPoints = navigator.msMaxTouchPoints,
                isMstouch = (msMaxTouchPoints && msMaxTouchPoints > 0);


            // Modernizr extraction to remove dependance on Partners having Modernizrs enabled and synced with our version and extensions.
            //
            var injectElementWithStyles = function(rule, callback, nodes, testnames) {

                var style, ret, node,
                    div = document.createElement('div'),
                    body = document.body,
                    fakeBody = body ? body : document.createElement('body');

                if (parseInt(nodes, 10)) {
                    while (nodes--) {
                        node = document.createElement('div');
                        node.id = testnames ? testnames[nodes] : 'modernizr' + (nodes + 1);
                        div.appendChild(node);
                    }
                }

                style = ['&#173;', '<style id="s', 'modernizr', '">', rule, '</style>'].join('');
                div.id = 'modernizr';
                (body ? div : fakeBody).innerHTML += style;
                fakeBody.appendChild(div);
                if (!body) {
                    fakeBody.style.background = "";
                    docElement.appendChild(fakeBody);
                }

                ret = callback(div, rule);
                if (!body) {
                    fakeBody.parentNode.removeChild(fakeBody);
                } else {
                    div.parentNode.removeChild(div);
                }

                return !!ret;

            };

            var isTouch,
                prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');


            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                isTouch = true;
            } else {
                injectElementWithStyles(['@media (', prefixes.join('touch-enabled),('), 'modernizr', ')', '{#modernizr{top:9px;position:absolute}}'].join(''), function(node) {
                    isTouch = node.offsetTop === 9;
                });
            }


            if ($pn.size() > 0) {
                $pn.each(function() {
                    var newdiv = document.createElement("div");
                    var newClass = (isMobileDevice ? "mobiledevice " : "no-mobiledevice ") + (isIpad ? "ipad " : "no-ipad ") + (isMstouch ? "mstouch " : "no-mstouch ") + (isTouch ? "touch " : "no-touch ");
                    newdiv.className = newClass;
                    $(this).children().prependTo(newdiv);
                    $(this).prepend(newdiv);
                });
            }
        }

        /**
         * Sets up the open/close events for the nav
         *
         * @private
         */

        function bindEvents() {
            navCategory.on("click", showCategoryNav);
            navCategory.on("mouseover", showCategoryNav);
            $mobileMenuTrigger.on('click', onHamburgerClick);
            //$document.on("mouseup", conditionallyCloseMenus);
            $header.on('mouseleave', hideCategoryNav);
            $search.on('click', expandSearch);
            $searchMobileContainer.on('click', expandSearch);
            $closeSearch.on('click', closeSearch);
            $footerHeadLinks.on('click', footerCategoryClick);

            window.addEventListener("pagehide", resetMobileNav, false);
        }


        /**
         * Clicking a footer category title will toggle open the menu below
         *
         * @private
         */

        function footerCategoryClick(e) {

            var $this = $(this);

            if ($this.hasClass("expanded")) {
                $this.removeClass("expanded");
                return true;
            }

            $footerHeadLinks.removeClass("expanded");
            $(this).addClass("expanded");

        }

        /**
         * In iPad and iPhone the backbutton will keep the search field open when back
         * is pressed, on unload (pagehide) reset this.
         */

        function resetMobileNav() {
            $('#searchMobileContainer').removeClass('expanded');
            $("#predictive-container-small").hide();
            $("#predictive-terms-small").html("");
            $("#mobileMenuList").hide();
        }

        /**
         * Expands the search bar (Large)
         *
         * @private
         */

        function expandSearch(e) {

            //e.preventDefault();
            e.stopPropagation();

            hideCategoryNav();

            $('#searchMobileContainer').removeClass('searchMobileTransition');

            if ($search.attr('id') === 'search-page-search') {
                return true;
            }

            $search.addClass('expanded'); //shows close button

            if (!$searchMobile.is(":focus")) {
                $searchMobile.focus();
            }

            $('#mobileMenuList').addClass('expanded');
        }


        /** LIM 18 Fix***/

        function closeHamBurgerClick(e) {
            var $target = $(e.target);
            if (!$target.parents('div#mobileMenu').length && $mobileMenuDropdown.hasClass('open')) {
                onHamburgerClick(e);
            }
        }

        /**
         * Closes the search bar (Large)
         *
         * @private
         */

        function closeSearch(e) {

            var size;

            e.preventDefault();
            e.stopPropagation();

            if ($(this).attr('id') === 'close-search-search') {
                document.getElementById('search-page-search').value = "";
                $("#predictive-container-search").hide();
                $("#predictive-terms-search").html("");
                return true;
            }

            $search.removeClass('expanded');
            $('#mobileMenuList').removeClass('expanded');

            size = istouch ? 'small' : window.innerWidth > 960 ? "large" : "small";

            if (size === 'small') {
                document.getElementById('search-mobile').value = "";
            } else {
                document.getElementById('search-desktop').value = "";
            }

            $("#predictive-container-" + size).hide();
            $("#predictive-terms-" + size).html("");
            $('#searchMobileContainer').addClass('searchMobileTransition');
        }



        /**
         * Toggles the mobile menu open/closed
         *
         * @private
         */

        function onHamburgerClick(e) {
            e.preventDefault();
            $mobileMenuDropdown.slideToggle(SLIDE_DURATION, /** LIM 18 Fix***/ function() {

                if ($mobileMenuDropdown.hasClass('open')) {
                    $('body').bind('click', closeHamBurgerClick);
                } else {
                    $('body').unbind('click', closeHamBurgerClick);
                }
                /** LIM 18 Fix***/
            }).toggleClass(OPEN_CLASS);
        }


        /**
         * Close all the header navs
         *
         * @public
         */

        function closeAllMenus() {
            hideCategoryNav();
            hideMobileMenuDropdown();
        }

        /**
         * When heading is clicked, go to respective model category page
         *
         * @private
         */

        function goToCategoryPage(e) {

            e.preventDefault();
            document.location.href = $(this).data('destination');

        }

        /**
         * When heading is hovered, slides open the category nav
         *
         * @private
         */

        function showCategoryNav(e) {
            e.preventDefault();

            var thisIndex = $(this).index();

            if ($(this).hasClass(ACTIVE_CLASS)) {
                //hideCategoryNav();
                return;
            }

            // determine if a fly-out is already showing
            if (navModelSelect.find(ACTIVE_SELECTOR).length) {
                navModelSelect.find(ACTIVE_SELECTOR).removeClass(ACTIVE_CLASS).hide();
                navModelSelect.removeClass('nav-open');
                navModelSelect.find(modelCategoryRow).eq(thisIndex).stop(true, true).fadeIn(FADE_DURATION, function() {
                    navModelSelect.addClass('nav-open');
                });
            } else {
                navModelSelect.addClass(NAV_OPEN_CLASS);
                navModelSelect.find(modelCategoryRow).stop(true, true).eq(thisIndex).slideDown(SLIDE_DURATION);
            }

            // mark the new fly-out as active
            categoriesContainer.find(ACTIVE_SELECTOR).removeClass(ACTIVE_CLASS);
            $(this).addClass(ACTIVE_CLASS);
            navModelSelect.find(modelCategoryRow).eq(thisIndex).addClass(ACTIVE_CLASS);
        }

        /**
         * Animates closed the category nav (the one that displays the models)
         *
         * @private
         */

        function hideCategoryNav() {
            var $tooltipBackground = $('.tooltip-background');
            // Check if a disclaimer is not open or if it doesn't exist
            if ($tooltipBackground.length <= 0 || $tooltipBackground.is(':hidden')) {
                navModelSelect.removeClass(NAV_OPEN_CLASS);
                navModelSelect.find(ACTIVE_SELECTOR).removeClass(ACTIVE_CLASS).stop(true, true).slideUp(SLIDE_DURATION);
                categoriesContainer.find(ACTIVE_SELECTOR).removeClass(ACTIVE_CLASS);
                document.getElementById("predictive-container-large").style.display = "none";
            }
        }

        /**
         * Listener for search submit event. Prevents event if field is empty/blank
         *
         * @private
         */

        function submitSearchQuery(e) {
            var searchNav = document.getElementById('nav_search_field');
            if ($.trim(searchNav.value).length === 0) {
                return false;
            }
        }

        /**
         * Closes the mobile menu dropdown
         *
         * @private
         */

        function hideMobileMenuDropdown() {
            $mobileMenuDropdown.slideUp(SLIDE_DURATION).removeClass(OPEN_CLASS);
        }


        /**
         * Binds header/footer analytics calls
         *
         * @private
         */

        function initGlobalNavAnalytics() {
            if (typeof fireTag === "function") {
                initHeaderAnalytics();
                initFooterAnalytics();
            }
        }

        /**
         * Sets up all the analytics calls for the global header
         *
         * @private
         */

        function initHeaderAnalytics() {
            var $header = $(".header-wrapper"),
                $logo = $header.find("#logo"),
                $searchInput = $header.find(".search"),
                $compare = $header.find(".model-flyout-compare"),
                $findADealer = $header.find(".find-a-dealer"),
                $cpo = $header.find(".certified-preowned"),
                $owners = $header.find(".owners-link"),
                $categoryLinks = $header.find(".navModel");

            // Logo
            $logo.click(function() {
                onGlobalNavClick("Header", "Home Link", "Lexus Logo");
            });

            // Search
            $searchInput.focus(function(e) {

                e.stopPropagation();

                var category = e.target.getAttribute("data-category") || "Search";
                onGlobalNavClick("Header", category, "Internal Search");
            });

            //Owners link
            $owners.click(function(e) {
                var category = e.target.getAttribute("data-category") || "",
                    label = e.target.getAttribute("data-label") || "";

                fireTag(GLOBAL_ELEMENT_HEADER_FOOTER_CLICK, {
                    "<container>": "Header",
                    "<category>": category,
                    "<label>": label,
                    "<break_point>": getBreakpoint(),
                    "<orientation>": getOrientation()
                });
            });

            // CPO link
            $cpo.click(function(e) {

                var category = e.target.getAttribute("data-category") || "",
                    label = e.target.getAttribute("data-label") || "";

                fireTag(GLOBAL_ELEMENT_HEADER_FOOTER_CLICK, {
                    "<container>": "Header",
                    "<category>": category,
                    "<label>": label,
                    "<break_point>": getBreakpoint(),
                    "<orientation>": getOrientation()
                });
            });

            // Find a dealer link
            $findADealer.click(function(e) {

                var container = e.target.getAttribute("data-container") || "Header";

                fireTag(GLOBAL_ELEMENT_FIND_A_DEALER_BUTTON_CLICK, {
                    "<container>": container,
                    "<break_point>": getBreakpoint(),
                    "<orientation>": getOrientation()
                });
            });

            // Compare from model flyout
            $compare.click(function() {
                fireTag(GLOBAL_ELEMENT_MODEL_FLYOUT_COMPARE_CLICK, {
                    "<container>": "Model Flyout",
                    "<break_point>": getBreakpoint(),
                    "<orientation>": getOrientation()
                });
            });

            // Model links from Model Flyout
            $categoryLinks.click(function(e) {

                var label, model;

                if (e.target.className === 'asterisk') {
                    return;
                }

                label = e.target.getAttribute("data-label") || $(e.target).closest("a").data("label") || "Category not found";
                model = e.target.getAttribute("data-model") || $(e.target).closest("a").data("model") || "Model data not found";

                onGlobalNavModelClick("Model Flyout", "Vehicle Click", label, "Select Model", model.toUpperCase().replace("-", " "));
            });

            // Mobile Nav
            $(".mobileMenuItem:not(.nonCategory) a").click(function(e) {
                var label = e.target.getAttribute("data-title") || $(e.target).data("title") || "Label not found";
                if (!($(this).hasClass("legacy-nav"))) {
                    onGlobalNavClick("Header", "Mobile Menu", label);
                }
            });
        }

        /**
         * All the footer links are in ULs, when clicked
         * finds the parent <ul>, extracts the section from
         * a data attribute, and then sends that along with link
         * name to the tracking library
         *
         * If the link has data-label then it uses that for the label
         * instead of the link text.
         *
         * @private
         */

        function initFooterAnalytics() {

            var category, label;

            //High Level Links
            $(".high-level-links a").click(function(e) {

                category = "Information";
                label = e.target.getAttribute("data-label");

                onGlobalNavClick("Footer", category, label);
            });

            //Secondary Links
            $(".secondary-links a, .secondary-links-footer a").click(function(e) {

                category = e.target.getAttribute("data-category") || $(e.target).closest("a").data("category") || "No Category Found";
                label = e.target.getAttribute("data-label") || $(e.target).closest("a").data("label") || "No Label Found";

                onGlobalNavClick("Footer", category, label);
            });

            //Social Links
            $("footer .social a").click(function(e) {

                category = "Social Links";
                label = e.target.getAttribute("data-label") || $(e.target).closest("a").data("label") || "No Label Found";

                onGlobalNavClick("Footer", category, label);
            });

            //Disclaimer
            $(".footer-disclaimer a").click(function(e) {
                fireTag(HOME_PAGE_ALERT_MESSAGE_CLICK, {
                    "<container>": "Footer",
                    "<message>": e.target.textContent,
                    "<break_point>": getBreakpoint(),
                    "<orientation>": getOrientation()
                });
            });
        }

        /**
         * Gets a jQuery dom element, extracts the text
         * and trims it
         *
         * @private
         * @param {jQuery} $link
         * @returns {String}
         */

        function getElementText($link) {
            return $.trim($link.text());
        }

        /**
         * Wrapper for header and footer fireTag calls: (GN:1.1)
         *
         * @private
         * @param {String} container
         * @param {String} category
         * @param {String} label
         */

        function onGlobalNavClick(container, category, label) {
            fireTag(GLOBAL_ELEMENT_HEADER_FOOTER_CLICK, {
                "<container>": container,
                "<category>": category,
                "<label>": label,
                "<break_point>": getBreakpoint(),
                "<orientation>": getOrientation()
            });
        }

        /**
         * Wrapper for header fireTag calls for model in header (GN:1.2)
         *
         * @private
         * @param {String} container
         * @param {String} category
         * @param {String} label
         */

        function onGlobalNavModelClick(container, category, label, action, modelName) {
            fireTag(GLOBAL_ELEMENT_HEADER_MODEL_CLICK, {
                "<container>": container,
                "<category>": category,
                "<label>": label,
                "<action>": action,
                "<model_name>": modelName,
                "<break_point>": getBreakpoint(),
                "<orientation>": getOrientation()
            });
        }

        /**
         * For third party header, supply a lighter version of pointbreak to
         * determine the breakpoint for the page.
         *
         * @returns {string}
         */

        function getBreakpoint() {
            if (window.innerWidth > 1204) {
                return "Max";
            }
            if (window.innerWidth > 959) {
                return "Large";
            }
            if (window.innerWidth > 640) {
                return "Medium";
            }
            return "Small";
        }

        /**
         * For third party header, supply a lighter version of pointbreak to
         * determine the orientation for the page.
         *
         * @returns {string}
         */

        function getOrientation() {

            if (window.innerWidth <= window.innerHeight) {
                return "Portrait";
            }
            return "Landscape";
        }

        /**
         * Multiple goals. Send client to desired page and track analytics.
         *
         * @param e - event
         * @param url - destination
         */

        function sendTo(e, url) {

            var label, text, model;

            e.preventDefault();
            e.stopPropagation();

            hideCategoryNav();

            text = /build/gi.test(e.target.textContent) ? "Build Your Lexus" : e.target.textContent;
            label = e.target.getAttribute("data-label") || "Category not found";
            model = e.target.getAttribute("data-model") || "Model data not found";

            if (typeof fireTag === "function") {
                onGlobalNavModelClick("Model Flyout", "CTA Click", label, text, model);
            }

            window.location.href = url;
        }

        init();

        return {
            closeAllMenus: closeAllMenus,
            sendTo: sendTo
        };
    };

    if (typeof jQuery === "function") {
        $(function() {
            window.LEXUS = window.LEXUS || {};
            window.LEXUS.globalNav = new GlobalNav();
        });
    } else {
        throw new Error("jQuery needs to be defined for the nav to work.");
    }

})(jQuery);
