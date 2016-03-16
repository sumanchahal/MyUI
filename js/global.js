/**
 * @file Global JS. Included in every page.
 */
define([
    "lexus",
    "jquery",
    "component/BackToTop",
    "component/mobileSecondaryTertiaryNav",
    "component/Disclaimers",
    "component/AttachedTooltip",
    "component/badgeManager",
    "component/lazyLoadManager",
    "component/ThirdPartyInterstitial",
    "component/abtesting/ABTest",
    "analytics",
    "modernizr", // 

    // Unused modules below this line. Included for concatenation purposes
    "PointBreak",
    "util/cookie",
    // "util/loadingAnimation",
    "colorbox",
    "dropkick",
    "jscrollpane",
    "lazyload",
    "mousewheel",
    "touchSwipe",
    "transit",
    "waypoints-sticky",
    "scrollTo"
], function(
    LEXUS,
    $,
    BackToTop,
    secondaryTertiaryNavigation,
    Disclaimers,
    AttachedTooltip,
    badgeManager,
    lazyload,
    ThirdPartyInterstitial,
    ABTest,
    analytics,
    Modernizr
) {

    if (!$.support.transition) {
        $.fn.transition = $.fn.animate;
    }

    // Initialize "Back to top" button
    BackToTop.init();

    // Init mobileNav functionality
    secondaryTertiaryNavigation.init();

    // init the badge if it is included in the page
    var $badge = $(".badge-container");
    if ($badge.length > 0) {
        badgeManager.watchBadge($badge);
    }

    // Init inline tooltip functionality
    var attachedTooltip = new AttachedTooltip();

    LEXUS.Disclaimers = Disclaimers;
    LEXUS.Disclaimers.init();


    // Track the page load.
    analytics.helper.firePageLoad();

    // Init lazyload
    lazyload.init();

    var thirdPartyInterstitial = new ThirdPartyInterstitial();
    // Preventing IE from clicking a hidden button
    $(".buttons-wrapper, .secondary").on("click", ".noButton", function(e) {
        e.preventDefault();
    });

    // Initialize AB Testing
    ABTest.init();

    // LIM-1628
    // Extend modernizr with user-agent match to define mobile devices.
    Modernizr.addTest('mobiledevice', function() {
        var regex = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
            userAgent = navigator.userAgent,
            result = regex.test(userAgent);
        return result;
    });

    // LIM-1628
    // Extend modernizr with user-agent match to define mobile devices.
    Modernizr.addTest('ipad', function() {
        var regex = /iPad/i,
            userAgent = navigator.userAgent,
            result = regex.test(userAgent);
        return result;
    });

    Modernizr.addTest('mstouch', function() {
        var msMaxTouchPoints = navigator.msMaxTouchPoints,
            result = (msMaxTouchPoints && msMaxTouchPoints > 0);
        return result;
    });

    //LIM 3175 - We are no longer supporting IE 10 and below. HOO-RAY!!!!!
    Modernizr.addTest('lte-ie10', function() {
        var ie_version = getIEVersion();
        var is_ie10_check = ie_version.major === "-1" ? Number.MAX_SAFE_INTEGER : Number(ie_version.major);
        var is_ie10 = is_ie10_check <= 10;
        return is_ie10;
    });

    function getIEVersion() {
        var agent = navigator.userAgent;
        var reg = /MSIE\s?(\d+)(?:\.(\d+))?/i;
        var matches = agent.match(reg);
        if (matches !== null) {
            return {
                major: matches[1],
                minor: matches[2]
            };
        }
        return {
            major: "-1",
            minor: "-1"
        };
    }

});
