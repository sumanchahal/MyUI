/**
 * @file All Models functionality for both List and Grid View
 *
 */
require([
    "lexus",
    "jquery",
    "PointBreak",
    "component/ResponsiveImages",
    "component/social/ShareOverlay",
    "analytics",
    "page/cpo/cpoNav",
    "component/gallery/Gallery",
    "component/gallery/GalleryOverlayViewController"
], function(
    LEXUS,
    $,
    PointBreak,
    ResponsiveImages,
    ShareOverlay,
    analytics,
    cpoNav,
    Gallery,
    GalleryOverlayViewController
) {

    var pointbreak = new PointBreak();
    var SMALL_BREAKPOINT = 'sml',
        LARGE_BREAKPOINT = 'lrg',
        previousBreakPoint,
        $gallery = $(".gallery-target"),
        $galleryOverlayContext = $('#overlay-container');

    function init() {
        var responsiveImages = new ResponsiveImages(),
            nav = new cpoNav(),
            icon = $('.expand-icon');

        var textnodes = getTextNodesIn($(".service-item")[0]);
        for (var i = 0; i < textnodes.length; i++) {
            if ($(textnodes[i]).parent().is("#demo")) {
                $(textnodes[i]).wrap("<p>");
            }
        }
        $(".expand-icon").on("click touch", function() {
            var $parent = $(this).parent();
            toggleAccordian($parent);
        });
        $(".service-item label").on("click touch", function() {
            var $parent = $(this).parent();
            toggleAccordian($parent);
        });

        pointbreak.addChangeListener(onBreakpointChange);

        responsiveImages.update();
        initShareOverlay();
        initAnalytics();
        initVideoCTAs();
        // Move it up slightly to account for sticky subnav
        setTimeout(function() {
            if (location.hash) {
                $(window).scrollTop($(location.hash).offset().top - $("#subnav").height() - 20);
            }
        }, 500);
        // Give accordians the right cursor
        $(".service-item input").each(function() {
            $(this).parent().find("label").css({
                cursor: "pointer"
            });
        });
    }

    function initVideoCTAs() {
        if (!$galleryOverlayContext.length) {
            throw new Error("There is no element with id #overlay-container in this page. Cannot create GalleryOverlayViewController");
        }
        // add click listeners to the features
        $(".gallery-item").on("click", onClickFeature);
        $(".openMedia").on("click", onClickMediaCTA);
        if (LEXUS.selectedId) {
            openOverlay(LEXUS.selectedId);
        }
    }

    function onClickFeature(e) {
        // Because this isan't an actual gallery, we'll build the gallery data as we need it
        e.preventDefault();
        // Get the media ID, and open the overlay with it
        var media_id = $(this).find("img").data("media-id");
        openOverlay(media_id);
    }

    function onClickMediaCTA(e) {
        // Because this isan't an actual gallery, we'll build the gallery data as we need it
        e.preventDefault();
        // Get the media ID, and open the overlay with it
        var media_id = $(this).data("media-ref");
        openOverlay(media_id);
    }

    function openOverlay(media_id) {
        var media = LEXUS.media[media_id],
            galleryItem = {
                "thumbImage": "",
                "fullImage": {
                    src: ""
                },
                "title": ""
            };
        // galleryItem preloaded with some empty content, otherwise GalleryItem.js throws a fit
        if (media === undefined) {
            return;
        }
        if (media.mediaType === "video") {
            galleryItem.tileType = "video";
            galleryItem.video = media.video.brightcove.url; // Overlay only supports brightcove at the moment
        } else {
            galleryItem.tileType = "image";
            galleryItem.fullImage = {};
            galleryItem.fullImage.src = media.src;
        }
        galleryItem.social = media.social;
        galleryItem.id = media_id;
        var galleryData = {
            "items": [galleryItem]
        };

        galleryModel = new Gallery(galleryData);
        galleryOverlayView = new GalleryOverlayViewController(galleryModel, $galleryOverlayContext, "cpo");


        galleryModel.getOverlayItems().selectFirstItem();
    }

    function toggleAccordian($accordian) {
        if (!$accordian.hasClass("open")) {
            analytics.helper.fireLeadCPOButtons("Main", $accordian.find("h2").text(), "Expand");
        }
        $accordian.toggleClass("open");
        $accordian.find(".collapsible").slideToggle(400);
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

    function getTextNodesIn(node, includeWhitespaceNodes) {
        var textNodes = [],
            whitespace = /^\s*$/;

        function getTextNodes(node) {
            if (node.nodeType === 3) {
                if (includeWhitespaceNodes || !whitespace.test(node.nodeValue)) {
                    textNodes.push(node);
                }
            } else {
                for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                    getTextNodes(node.childNodes[i]);
                }
            }
        }

        getTextNodes(node);
        return textNodes;
    }



    function onBreakpointChange() {
        var viewport = getCurrentBreakPoint();

        if (viewport === SMALL_BREAKPOINT) {
            previousBreakPoint = SMALL_BREAKPOINT;
        }
        if (viewport !== SMALL_BREAKPOINT) {
            previousBreakPoint = getCurrentBreakPoint();
        }
    }

    function getCurrentBreakPoint() {
        var currentBreakPoint;

        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            currentBreakPoint = SMALL_BREAKPOINT;
        } else {
            currentBreakPoint = LARGE_BREAKPOINT;
        }
        return currentBreakPoint;
    }

    function initAnalytics() {
        $(".service-item .button").on("click touch", function(e) {
            e.stopPropagation();
            analytics.helper.fireLeadCPOButtons("Main", $(this).parents(".service-item").find("h2").text(), $(this).text().replace(/\r?\n|\r/, ""));
        });
    }

    init();
});
