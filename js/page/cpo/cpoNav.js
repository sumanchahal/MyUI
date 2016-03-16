define(["jquery", "analytics", "PointBreak"], function($, analytics, PointBreak) {
    var CpoNav = function() {
        var SLIDE_DURATION = 350,
            OPEN_CLASS = "open",
            NAV_OPEN_CLASS = "nav-open",
            ACTIVE_CLASS = "active",
            ACTIVE_SELECTOR = "." + ACTIVE_CLASS,
            SMALL_BREAKPOINT = 'sml',
            MEDIUM_BREAKPOINT = 'med',
            LARGE_BREAKPOINT = 'lrg',
            $cpoMenuTrigger = $('#cpoMenuButton'),
            $cpoMenuDropdown = $('#cpoMenuList'),
            navModelSelect = $('#navModelSelect'),
            $header = $(".header-wrapper"),
            subNavShown = false,
            pointbreak;

        function init() {
            bindEvents();
            initAnalytics();
            pointbreak = new PointBreak();

            $(".subnav a").on("click touch", function() {
                $(".subnav .heading").trigger("click");
            });
            $("a[href^=#]").on("click touch", function(e) {
                e.preventDefault();
                var href = $(this).attr("href");
                if (href === "#") {
                    return;
                }
                setTimeout(function() {
                    location.hash = href;
                    $(window).scrollTop($(location.hash).offset().top - $("#subnav").height() - 20);
                }, 500);
            });
        }

        function getCurrentBreakPoint() {
            var currentBreakPoint;

            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                currentBreakPoint = SMALL_BREAKPOINT;
            } else if (pointbreak.isCurrentBreakpoint(PointBreak.MED_BREAKPOINT)) {
                currentBreakPoint = MEDIUM_BREAKPOINT;
            } else {
                currentBreakPoint = LARGE_BREAKPOINT;
            }

            return currentBreakPoint;
        }

        function bindEvents() {
            $cpoMenuTrigger.on('click', onCpoNavClick);
            $('.subnav-item.menu-opener').on('click', onMenuOpen);
            //$header.on('mouseleave', hideCategoryNav);
        }

        function onMenuOpen(e) {
            subNavShown = true;
            $cpoMenuDropdown.slideToggle(SLIDE_DURATION);
            $(".sub-nav-models").slideToggle();
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            e.stopImmediatePropagation();
        }

        function closeSubNav() {
            subNavShown = false;
            $(".sub-nav-models").slideToggle(SLIDE_DURATION);
            $cpoMenuDropdown.toggleClass(OPEN_CLASS);
        }

        function onCpoNavClick(e) {
            if (subNavShown) {
                closeSubNav();
                return;
            }
            var extra = 0;
            if ($cpoMenuDropdown.hasClass(OPEN_CLASS)) {
                if ($(e.target).hasClass('subnav-item')) {
                    return;
                }
                hideCategoryNav();
            } else {
                extra = 20;
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }

            var breakpoint = getCurrentBreakPoint();

            if (breakpoint === SMALL_BREAKPOINT) {
                $cpoMenuDropdown.slideToggle(SLIDE_DURATION, function() {
                    $(".small-nav-wrapper").css({
                        'height': $('.subnav.small ul').outerHeight() + ($('#subnav .heading').outerHeight() + extra),
                    });
                }).toggleClass(OPEN_CLASS);
            }
        }

        function hideCategoryNav() {
            var $tooltipBackground = $('.tooltip-background');

            if ($tooltipBackground.length <= 0 || $tooltipBackground.is(':hidden')) {
                navModelSelect.removeClass(NAV_OPEN_CLASS);
                navModelSelect.find(ACTIVE_SELECTOR).removeClass(ACTIVE_CLASS).stop(true, true).slideUp(SLIDE_DURATION);
            }
        }

        function initAnalytics() {
            $("#cpoTools a").on("touch click", function() {
                analytics.helper.fireCPOToolClick("Tools Widget", $(this).find('[itemprop=name]').text().replace(/\r?\n|\r/, ""));
            });
        }

        init();

        return;
    };
    return CpoNav;
});
