define([
    "component/TrimDrillDown",
    "component/TabSwitcher",
    "component/CompareTray",
    "component/lazyLoadManager",
    "PointBreak",
    "waypoints-sticky"
], function(
    TrimDrillDown,
    TabSwitcher,
    CompareTray,
    lazyLoadManager,
    PointBreak
) {
    /**
     * Allows user to select a Lexus or competitor
     * trim so they can be compared
     *
     * @class TrimSelector
     * @typedef  {config}  configuration parameters.
     * @property {jquery}  instance - the container div for the module
     */
    var TrimSelector = function(params) {
        var opts = $.extend({
            instance: null,
            onCompareTraySubmit: $.noop,
            onCompareTrayFull: $.noop
        }, params),
            HIDDEN_CLASS = "hidden",
            OPEN_CLASS = "open",
            UNSTICKY_CLASS = "unsticky",
            AVAILABLE_CLASS = "available",
            INACTIVE_CLASS = "inactive",
            COMPARE_SCROLL_OFFSET = 20,
            compareTray = null,
            tabSwitcher = null,
            trimDrillDown = null,
            pointbreak = params.pointbreak || new PointBreak(),
            $module = opts.instance,
            $compareTrayHeading = $module.find(".compare-tray-heading"),
            $tabsContainer,
            $removeVehicleMessage;

        /**
         * @constructor
         */

        function init() {
            if ($module !== null) {
                if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                    initStickyHeader();
                    bindResize();
                }

                setCompareTray();
                setupCompetitorTabs();
                setupCompetitorAdd();
                setupTrimDrillDown();
                setupLexusTrimSelector();
            }
        }

        /**
         * Calculates when the header should stop scrolling and instead lock in place
         *
         * @method calculateStickyHeaderEndpoint
         * @private
         */

        function calculateStickyHeaderEndpoint() {
            var drawerHeight = $compareTrayHeading.height(),
                docHeight = $(document).height(),
                footerHeight = $('footer').outerHeight() + $('.footer-disclaimer-container').outerHeight();

            return docHeight - footerHeight - drawerHeight;
        }

        /**
         * sets up click interaction for clicking a lexus model
         * trim selector opens where user can then click on one
         * to add it to the compare tray.
         *
         * @method setupLexusTrimSelector
         * @private
         */

        function setupLexusTrimSelector() {
            var $lexusModels = $module.find(".lexus-models"),
                TRIM_CLASS = "trim";
            $lexusModels.on("click", ".trim", function(e) {
                var $this = $(e.target),
                    $trim = null;

                if (checkForDisclaimer($this)) {
                    return;
                }

                if (!$this.is("a")) {
                    if (!$this.hasClass(TRIM_CLASS)) {
                        $trim = $this.parents("." + TRIM_CLASS);
                    } else {
                        $trim = $this;
                    }

                    $trim.find("a").trigger("click");
                }
            });

            $lexusModels.on("click", ".trim a", function(e) {
                var $this = $(e.target),
                    trimData = {
                        id: $this.attr("id"),
                        year: $this.data("year"),
                        make: $this.data("make"),
                        model: $this.data("model"),
                        trim: $this.data("trim")
                    };

                e.preventDefault();

                if (checkForDisclaimer($this)) {
                    return;
                }

                if (!$this.parents(".trim-details").hasClass(INACTIVE_CLASS)) {
                    compareTray.add(trimData, function(addSuccess) {
                        if (addSuccess) {
                            $this.parents(".trim-details").addClass(INACTIVE_CLASS);
                        }
                    });
                }
            });

            /**
             * Handle Lexus competitor models click interaction
             *
             */
            $lexusModels.on("click", ".product", function(e) {
                e.preventDefault();

                // gets parent of clicked item. Needs to find out if a previous item was opened so that new page scroll position can be calculated accordingly
                var $modelAndTrims = $(this).parents(".model-and-trims"),
                    $prevTrim = $modelAndTrims.parents(".series").prevAll(".series").children(".model-and-trims.open").children(".trims").add($modelAndTrims.prevAll(".open").children(".trims")),
                    trimsHeight = 0;

                // if a disclaimer was clicked, no need to do anything
                if (checkForDisclaimer($(e.target))) {
                    return;
                }

                // gets height of any trims higher up the page that are about to be closed
                if ($prevTrim.length > 0) {
                    trimsHeight = $prevTrim.outerHeight();
                }

                // scrolls so that the top of the element comes into view and sits at the top of the compare tray
                $('html, body').animate({
                    scrollTop: $modelAndTrims.offset().top - $compareTrayHeading.outerHeight() - trimsHeight - COMPARE_SCROLL_OFFSET
                }, 200);

                if ($modelAndTrims.hasClass(OPEN_CLASS)) {
                    $modelAndTrims.removeClass(OPEN_CLASS);
                } else {
                    $(".model-and-trims").removeClass(OPEN_CLASS);
                    $modelAndTrims.addClass(OPEN_CLASS);
                }


            });

            $lexusModels.on("click", ".close", function(e) {
                e.preventDefault();
                $(this).parents(".model-and-trims").removeClass(OPEN_CLASS);
            });
        }

        /**
         * Checks to see if target is a disclaimer
         *
         * @param {jQuery} $target - element that needs to be checked
         * @returns {Boolean} - whether or not given element is a disclaimer target
         * @private
         */

        function checkForDisclaimer($target) {
            return $target.is(".disclaimer") || $target.is(".asterisk");
        }

        /**
         * On resize, re-init sticky header since the
         * size needs to be set explicitly for the fixed
         * position to work.
         *
         * @method bindResize
         * @private
         */

        function bindResize() {
            $(window).resize(adjustStickyHeaderWidth);
        }

        /**
         * Uses the waypoints sticky plugin to assign a class
         * when the compare-tray-heading is at the top of the
         * viewport
         *
         * @method initStickyHeader
         * @private
         */

        function initStickyHeader() {

            adjustStickyHeaderWidth();
            $compareTrayHeading.waypoint("sticky");

            $(window).on("scroll", function() {
                onStickyHeaderScroll();
            });

        }

        /**
         * Handles making the header un-sticky if a certain point is reached
         *
         * @method onStickyHeaderScroll
         * @private
         */

        function onStickyHeaderScroll() {
            var currentPos = $(window).scrollTop();

            if (currentPos >= calculateStickyHeaderEndpoint()) {
                $module.addClass(UNSTICKY_CLASS);
            } else {
                $module.removeClass(UNSTICKY_CLASS);
            }
        }

        /**
         * Adjusts width of sticky header based on compare tray width
         *
         * @method adjustStickyHeaderWidth
         * @public
         */

        function adjustStickyHeaderWidth() {
            $compareTrayHeading.width($module.width());
        }

        /**
         * Keeps track of what items have been add/removed
         * and displays to user so they can advance to the next
         * page in the compare flow
         *
         * @method setCompareTray
         * @private
         */

        function setCompareTray() {
            compareTray = new CompareTray({
                instance: $module,
                pointbreak: pointbreak,
                onCompareTraySubmit: opts.onCompareTraySubmit,
                onCompareTrayFull: opts.onCompareTrayFull,
                // When the tray is updated, hide or show the
                // competitors based on whether tray is full or not
                onTrayChange: function(count, max) {
                    if (count >= max) {
                        var scrollDuration = Math.ceil($(window).scrollTop() * 30) / 30;

                        $tabsContainer.addClass(HIDDEN_CLASS);
                        $tabsContainer.find('.model-and-trims').removeClass(OPEN_CLASS);
                        $removeVehicleMessage.removeClass(HIDDEN_CLASS);

                        $("html, body").stop().animate({
                            scrollTop: 0
                        }, function() {
                            opts.onCompareTrayFull();
                        });
                    } else {
                        $tabsContainer.removeClass(HIDDEN_CLASS);
                        $removeVehicleMessage.addClass(HIDDEN_CLASS);
                        trimDrillDown.resetForm();
                    }
                },
                // Make competitor available for selection when it is removed from the tray
                onRemoveItem: function($item) {
                    var id = $item.find('a').data('id');
                    enableTrimById(id);
                }
            });
        }

        /**
         * Add a competitor on click
         *
         * @method setupCompetitorAdd
         * @private
         */

        function setupCompetitorAdd() {
            var COMPETITOR_CLASS = "competitor",
                $competitors = $module.find("." + COMPETITOR_CLASS),
                $competitorBtns = $competitors.find("button");

            $competitors.on("click", function(e) {
                var $this = $(e.target),
                    $competitor = null;

                if (!$this.is("button")) {
                    if (!$this.hasClass(COMPETITOR_CLASS)) {
                        $competitor = $this.parents("." + COMPETITOR_CLASS);
                    } else {
                        $competitor = $this;
                    }

                    $competitor.find("button").trigger("click");
                }
            });

            $competitorBtns.on("click", function(e) {
                var $this = $(e.target),
                    trimData = {
                        id: $this.attr("id"),
                        year: $this.data("year"),
                        make: $this.data("make"),
                        model: $this.data("model"),
                        trim: $this.data("trim")
                    };

                e.preventDefault();

                compareTray.add(trimData, function(addSuccess) {
                    if (addSuccess) {
                        $this.parents(".competitor").removeClass(AVAILABLE_CLASS);
                    }
                });
            });
        }

        /**
         * Tabs to toggle between competitors and Lexus vehicles
         *
         * @method setupCompetitorTabs
         * @private
         */

        function setupCompetitorTabs() {
            $tabsContainer = $module.find(".model-types");
            $removeVehicleMessage = $module.find(".remove-vehicle-message");

            tabSwitcher = new TabSwitcher({
                instance: $tabsContainer
            });
            tabSwitcher.tabs.click(function() {
                lazyLoadManager.init();
            });
        }

        /**
         * A set of selectboxes which are used to drill down
         * to select a particular trim.
         *
         * @method setupTrimDrillDown
         * @private
         */

        function setupTrimDrillDown() {
            trimDrillDown = new TrimDrillDown({
                instance: $module.find(".trim-drill-down"),
                addCallback: function(data) {
                    var trimData = data || {};
                    compareTray.add(trimData);
                    disableTrimById(data.id);
                }
            });
        }

        /**
         * Disable selection of trim based on id
         *
         * @method disableTrimById
         * @param {Number} id - Chrome id of the trim to disable
         * @private
         */

        function disableTrimById(id) {
            // Competitors
            $module.find('#' + id).parents(".competitor").removeClass(AVAILABLE_CLASS);

            // Lexus models
            $module.find('#' + id).parents(".trim-details").addClass(INACTIVE_CLASS);
        }

        /**
         * Enable selection of trim based on id
         *
         * @method enableTrimById
         * @param {Number} id - Chrome id of the trim to enable
         * @private
         */

        function enableTrimById(id) {
            // Competitors
            $module.find('#' + id).parents(".competitor").addClass(AVAILABLE_CLASS);

            // Lexus models
            $module.find('#' + id).parents(".trim-details").removeClass(INACTIVE_CLASS);
        }

        /**
         * Resets the header's stickyness
         *
         * @method resetStickyHeader
         * @public
         */

        function resetStickyHeader() {
            // Check to see if it's sticky first, if not the
            // plugin unwraps whatever parent is present
            if ($compareTrayHeading.parent().hasClass("sticky-wrapper")) {
                $compareTrayHeading.waypoint('unsticky');
            }
            $compareTrayHeading.waypoint('sticky');
        }

        init();

        return {
            adjustStickyHeaderWidth: adjustStickyHeaderWidth,
            resetStickyHeader: resetStickyHeader
        };
    };

    return TrimSelector;

});
