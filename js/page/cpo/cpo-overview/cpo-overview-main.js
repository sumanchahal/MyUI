/**
 * @file All Models functionality for both List and Grid View
 *
 */
require([
    "lexus",
    "jquery",
    "modernizr",
    "util/cookie",
    "util/geolocationHelper",
    "PointBreak",
    "component/Carousel",
    "component/ZipSearchView",
    "component/social/ShareOverlay",
    "component/ResponsiveImages",
    "analytics",
    "util/fitText",
    "page/cpo/cpoNav",
    "component/gallery/Gallery",
    "component/gallery/GalleryOverlayViewController",
    "waypoints-sticky",
    "transit",
    "touchSwipe",
    "component/mobileSecondaryTertiaryNav"
], function(
    LEXUS,
    $,
    Modernizr,
    Cookie,
    geolocationHelper,
    PointBreak,
    Carousel,
    ZipSearchView,
    ShareOverlay,
    ResponsiveImages,
    analytics,
    fitText,
    cpoNav,
    Gallery,
    GalleryOverlayViewController
) {

    var pointbreak,
        ZipSearch,
        SUB_NAV_SELECTOR = '#cpoNav',
        spinSpeed = 4000,
        spinTimeout,
        heroCarousel,
        $carousel = $('#carousel'),
        $gallery = $(".gallery-target"),
        $galleryOverlayContext = $('#overlay-container');


    function initOverview() {
        //resize();
        //$.fn.swipe.defaults.excludedElements = [];
        var responsiveImages = new ResponsiveImages();
        initPointBreak();
        initSearch();
        initImageCarousel();
        initModelCarousels();
        initShareOverlay();
        initVideo();
        var nav = new cpoNav();
        $(".owner-benefits-wrapper .button").on("click touch", function() {
            analytics.helper.fireLeadCPOButtons("Why Lexus CPO", "Why Lexus CPO", $(this).text().replace(/\r?\n|\r/, ""));
        });
        $("#cpoModelsSelector li").on("click touch", function() {
            analytics.helper.fireLeadCPOButtons("CPO Models", "Models Selector", $(this).text().replace(/\r?\n|\r/, ""));
        });
        $(".cpo-models").on("click touch", ".indicators a", function() {
            analytics.helper.fireLeadCPOButtons("CPO Models", $(this).parents("section").attr("id"), "Pagination");
        });
        $(".owner-benefits-item a").on("click touch", function(e) {
            if (!pointbreak.isCurrentBreakpoint("small")) {
                analytics.helper.fireLeadCPOButtons("Why Lexus CPO", $(this).find("h2").text(), "Learn More");
                return;
            }
            if ($(e.target).is(".learn-more")) {
                analytics.helper.fireLeadCPOButtons("Why Lexus CPO", $(this).find("h2").text(), "Learn More");
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            var $parent = $(this).parent();
            if ($parent.hasClass("expanded")) {
                $parent.removeClass("expanded");
                return;
            }
            analytics.helper.fireLeadCPOButtons("Why Lexus CPO", $(this).find("h2").text(), "Expand");
            $(".owner-benefits-item").removeClass("expanded");
            $parent.addClass("expanded");
        });
    }

    function initVideo() {
        if (!$galleryOverlayContext.length) {
            throw new Error("There is no element with id #overlay-container in this page. Cannot create GalleryOverlayViewController");
        }
        // add click listeners to the features
        $(".gallery-item").on("click", onClickFeature);
        if (LEXUS.selectedId) {
            openOverlay(LEXUS.selectedId);
        }
    }

    function onClickFeature(e) {
        // Because this isn't an actual gallery, we'll build the gallery data as we need it
        e.preventDefault();
        // Get the media ID, and open the overlay with it
        var media_id = $(this).find("img").data("media-id");
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

    function initSearch() {
        $('#zip-field').on('keypress', onZipKeyPress);
        $('.get-api-zip').click(onZipRefresh);
        $('.form-zip-search .btn-search').click(onZipButtonClick);
        geolocationHelper.fetchData(onZipData, this);
    }

    function initZipSearch() {
        if (ZipSearch === undefined) {
            ZipSearch = new ZipSearchView("#zip-wrapper", {
                // ajaxLoader: false, // Turn off ajaxLoader
            }, {
                onSuccess: onMobileSearch
            });
            ZipSearch.setSearchTemplate(['<li data-dealer-id="{{id}}" data-lng="{{dealerLongitude}}" data-lat="{{dealerLatitude}}">',
                '<span class="marker"></span>',
                '<h2 class="sub-heading">{{dealerName}}</h2>',
                '{{showDealerDistance}}',
                '{{eliteStatus}}',
                '<address>',
                '<span class="street">{{address1}}</span>',
                '<span class="city">{{city}}</span>, <span class="state">{{state}}</span>&nbsp;<span class="zip">{{zipCode}}</span>',
                '<span class="phone"><a href="tel://{{mobilePhone}}">{{phone}}</a></span>',
                '</address>',
                '<p><a href="{{dealerPreOwnedInventoryUrl}}" class="btn inlink btn-stroke" target="_blank">View Inventory</a></p>',
                '</li>'
            ]);
        }
    }

    function initImageCarousel() {
        var $context = $('#carousel'),
            settings = {
                instance: $context,
                slideSelector: '.item',
                showIndicators: true,
                animationDuration: 650,
                showNextPrev: false,
                autoHeight: false,
                preventAllPadding: true
            };
        heroCarousel = new Carousel(settings);

        // Start up the timeout to swap images

        // Show the images when the first one loads
        //$('.cpo-hero-carousel .slide:first-child img').on("load",
        setTimeout(function() {
            $('.cpo-hero-carousel img').animate({
                opacity: 1
            }, 400);
            nextImage();
        }, 1000);
        // In case of browsers not loading the images, make them load it.
        var imageLoad;
        $('.cpo-hero-carousel .slide img').each(function() {
            imageLoad = new Image();
            imageLoad.src = $(this).attr("src");
        });
        $('.cpo-hero-carousel').on('click touch', '.indicator', function(evt) {
            nextImage();
            pauseCarousel(Modernizr.touch);
            analytics.helper.fireLeadCPOButtons("Promotional", "Promotional Image", $(this).parents(".carousel").find(".slide.active img").attr("alt"));
        });

        $carousel.hover(pauseCarousel, resumeCarousel);
        $('.cpo-hero-carousel').swipe({
            swipe: function(event, direction, distance, duration, fingerCount) {
                if ((direction === "left") || (direction === "right")) {
                    pauseCarousel();
                }
            },
            allowPageScroll: "vertical"
        });
    }

    function nextImage() {
        clearTimeout(spinTimeout);
        spinTimeout = setTimeout(function() {
            heroCarousel.next();
            nextImage();
        }, spinSpeed);
    }

    function pauseCarousel(eventuallyResume) {
        clearTimeout(spinTimeout);
        if (eventuallyResume) {
            setTimeout(function() {
                nextImage();
            }, 10000);
        }
    }

    function resumeCarousel() {
        nextImage();
    }

    function initModelCarousels() {
        var $context, settings,
            models = $('#cpoModelsSelector').find('li').map(function() {
                return $.trim($(this).text().toLowerCase());
            }).get();
        for (var i = 0; i < models.length; i++) {
            $context = $('section#' + models[i]);
            settings = {
                instance: $context,
                slideSelector: '.product',
                showIndicators: true,
                showNextPrev: true,
                slidesPerPage: 4,
                autoHeight: true
            };
            Carousel(settings);
        }
        $(".model-carousel-wrapper .product a").on("click touch", function() {
            analytics.helper.fireLeadCPOButtons("CPO Models", $(this).parents("section").attr("id"), $(this).find(".name .model").text());
        });
        $(".cpo-models .button").on("click touch", function() {
            analytics.helper.fireLeadCPOButtons("CPO Models", "CPO Models", "CPO Models");
        });
        $(".search-results ul").on("click", 'a.btn', function() {
            analytics.helper.fireLeadCPOButtons("Promotional", "Dealer Info", $(this).text());
        });
        $(".search-results ul").on("click", '.phone a', function() {
            analytics.helper.fireLeadCPOButtons("Promotional", "Dealer Info", "Click to Call");
        });

        $('#cpoModelsSelector').find('li').bind('click', function() {
            var t = $(this);
            var index = t.index();
            $('#cpoModelsSelector').find('li').removeClass('active');
            t.toggleClass('active');
            $('.cpo-models section.active').removeClass('active');
            $('.cpo-models section:eq(' + index + ')').toggleClass('active');
        });
    }



    /**
     * @function initPointBreak;
     */

    function initPointBreak() {
        pointbreak = new PointBreak();
        pointbreak.addChangeListener(onBreakpointChange);
        if (pointbreak.isCurrentBreakpoint("small", "medium")) {
            initZipSearch();
        }
    }

    function onBreakpointChange(e) {
        if (!pointbreak.isCurrentBreakpoint("small", "medium")) {


            return;
        }
        if (pointbreak.isCurrentBreakpoint("small")) {
            $('.subnav .nav-wrapper').height(60);
            heroWrap();
        }
        setTimeout(initZipSearch, 1000);
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

    function heroWrap() {
        var herosection = document.getElementsByTagName('.hero section');
        $(herosection).addClass('block');
    }

    /** watching for enter key press **/

    function onZipKeyPress(evt) {
        var keyCode = window.event ? evt.keyCode : evt.which,
            KEY_0 = 48,
            KEY_9 = 57,
            KEY_BACKSPACE = 0,
            KEY_DELETE = 8,

            KEY_ENTER = 13;

        if ((keyCode === KEY_ENTER) && (!pointbreak.isCurrentBreakpoint("small", "medium"))) {
            onZipSearchSubmit();
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        } else if (keyCode < KEY_0 || keyCode > KEY_9) {
            if (keyCode !== KEY_BACKSPACE && keyCode !== KEY_DELETE && !evt.ctrlKey) {
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
        }
    }

    function onZipData(api) {
        zipApi = api;
        var zipCode, cookiedZipCode = Cookie.get("dealer-last-search-dealerZip");
        if (cookiedZipCode !== undefined && cookiedZipCode !== "") {
            zipCode = cookiedZipCode;
        } else {
            zipCode = api.getZip();
        }
        if (zipCode !== "00000") {
            $('#zip-field').val(zipCode);
        }
    }

    function onZipButtonClick(evt) {
        if (!pointbreak.isCurrentBreakpoint("small", "medium")) {
            onZipSearchSubmit();
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        }
    }

    function onZipRefresh(evt) {
        var zipCode = zipApi.getZip();
        $('#zip-field').val(zipCode);
        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }
        analytics.helper.fireLeadCPOButtons("Promotional", "Inventory Search", "Use my Location");
    }

    function onZipSearchSubmit() {
        analytics.helper.fireLeadCPOButtons("Promotional", "Inventory Search", "Inventory Search");
        if (!pointbreak.isCurrentBreakpoint("small", "medium")) {
            var url = 'http://www.lcpo.com/VehicleSearchResults?search=certified';
            url += '&zipCode=' + $('#zip-field').val();
            Cookie.set("dealer-last-search-dealerZip", $('#zip-field').val());
            window.location.assign(url);
        }
    }

    function onMobileSearch(results) {
        analytics.helper.fireLeadCPOButtons("Promotional", "Inventory Search", "Inventory Search");
    }

    initOverview();

});
