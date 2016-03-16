/**
 * @fileOverview Behaviors for the CPO financing page:
 * Expanded packages state
 */

require([
    "jquery",
    "PointBreak",
    "component/ResponsiveImages",
    "component/social/ShareOverlay",
    "analytics",
    "page/cpo/cpoNav"
], function(
    $,
    PointBreak,
    ResponsiveImages,
    ShareOverlay,
    analytics,
    cpoNav
) {

    var pointbreak = new PointBreak(),
        $financing_anchor,
        financing_correctURL,
        financing_mobileURL = "http://m.lexusfinancial.com/pub/home/",
        financing_URLS = [];

    /**
     * On load initializes all page level methods
     * @method init
     * @private
     */

    function init() {

        var responsiveImages = new ResponsiveImages();
        var nav = new cpoNav();

        // matches all anchor tags that contain lexus financial. we need to
        // replace these so they won't redirect to a broken page. we're 
        // assuming there's only one right now.
        //
        $financing_anchor = $('.button-wrapper a[href*="lexusfinancial"]');
        //LIM 3231 - Making copies of the original urls so that we can switch between
        //the mobile and the original urls depending on breakpoint.
        //
        $financing_anchor.each(function() {
            var urlClone = $(this).clone();
            financing_URLS.push(urlClone);
        });
        financing_correctURL = $financing_anchor.attr('href');
        pointbreak.addChangeListener(onBreakpointChange);
        onBreakpointChange();

        responsiveImages.update();

        initShareOverlay();
        initAnalytics();

    }

    function onBreakpointChange() {
        var h = $('.hero'),
            h1 = h.find('h1');

        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            h1.insertBefore(h.find('.description'));
            $financing_anchor.attr('href', financing_mobileURL);
        }
        if (!pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            h1.appendTo('.hero-bg-img');
            //LIM 3231 - Updating the urls on not mobile, need to use the original urls
            // we cloned .
            $financing_anchor.each(function(idx, anchor) {
                var originalURL = financing_URLS[idx].attr('href');
                // console.log(originalURL);
                $(anchor).attr('href', originalURL);
            });
            // $financing_anchor.attr('href', financing_correctURL);

        }
    }

    function initShareOverlay() {
        var $overlayContext = $("#nav-share-overlay"),
            $shareButton = $(".subnav a.share");
        var share = new ShareOverlay($overlayContext, $shareButton, LEXUS.social);
        var $secondaryNavShare = $('.nav-footer li a:contains("SHARE")');
        $secondaryNavShare.on('click', $.proxy(share.showShareOverlay, share));
        var $mobileNavShare = $('.small-nav-wrapper a.share');
        $mobileNavShare.on('click', $.proxy(share.showShareOverlay, share));
    }


    /**
     * Analytics
     * @private
     */

    function initAnalytics() {
        $(".feature-wrapper .button").on("click touch", function() {
            analytics.helper.fireLeadCPOButtons("Main", $(this).parents(".service-item").find("h2").text(), $(this).text().replace(/\r?\n|\r/, ""));
        });
    }

    init();
});
