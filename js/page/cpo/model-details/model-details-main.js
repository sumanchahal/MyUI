require([
    "jquery",
    "modernizr",
    "PointBreak",
    "component/ResponsiveImages",
    "util/geolocationHelper",
    "util/cookie",
    "component/social/ShareOverlay",
    "component/ZipSearchView",
    "analytics",
    "dropkick",
    "page/cpo/cpoNav"
], function($,
    Modernizr,
    PointBreak,
    ResponsiveImages,
    geolocationHelper,
    Cookie,
    ShareOverlay,
    ZipSearchView,
    analytics,
    dropkick,
    cpoNav
) {

    var $selectYear,
        thisYear,
        responsiveImages,
        zipApi,
        ZipSearch,
        pointbreak,
        pageModel, pageYear, initZipTimeout;

    function init() {
        //get the year without any alpha or whitespace characters
        thisYear = pageYear = $('.badge .top-line').text().replace(/\D*/g, "");
        pageModel = LEXUS.cpoModel.vehicle.model;
        //thisModel = $('.badge .model-name').text();
        $selectYear = $('.select-years');
        $selectYear.dropkick({
            autoWidth: false
        });
        $selectYear.on("change", changeYear);
        analytics.helper.fireCPOModelLoad(pageModel, pageYear, pageModel + " Line");
        initSearch();
        initPointBreak();

        responsiveImages = new ResponsiveImages();
        responsiveImages.update();
        var nav = new cpoNav();
        initShareOverlay();
        $(".backToAll").on("click touch", function() {
            analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Model Nav", "Back to All Models");
        });
        $(".specifications-category .button").on("click touch", function() {
            analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Main", "Download");
        });
        $(".search-results ul").on("click", 'a.btn', function() {
            analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Dealer Info", $(this).text());
        });
        $(".search-results ul").on("click", '.phone a', function() {
            analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Dealer Info", "Click to Call");
        });
    }
    window.onresize = resizeHandler;
    resizeHandler();

    function resizeHandler(evt) {
        var element = document.getElementsByClassName('hero-bg-img')[0];
        var image = document.getElementsByClassName('responsive-image')[0];

        var w = window.innerWidth;


        if (w <= 640) {
            element.style.height = 0;
            return;
        }

        var h = window.innerHeight;
        var ar = w / h;
        var available = h - getHeight();
        var a = w / available;
        var minRatio = 16 / 9;
        var maxRatio = 3;
        var maxHeight = 0.85;
        if (w < 1024) {
            maxHeight = 0.8;
        }

        var navHeight = Math.round(available * maxHeight);
        var otherHeight = navHeight;


        var _min = a;
        if (a < minRatio) {
            _min = minRatio - a;
            _min = 1 - _min;
            otherHeight *= _min;
            if (h * maxHeight > otherHeight) {
                otherHeight = window.innerWidth * (9 / 16) * maxHeight;
            }
        } else if (a >= maxRatio) {
            otherHeight = w * 0.2775;

        }

        element.style.height = otherHeight.toString() + 'px';

    }

    function getHeight() {
        var top = document.getElementsByClassName('page-wrap')[0].offsetTop;
        var padding = Math.round(window.innerWidth * 0.006);
        var nav = document.getElementById('cpoNav').offsetHeight;
        var height = top + padding + nav;
        return height;
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

    function initSearch() {
        $('#zip-field').on('keypress', onZipKeyPress);
        $('#desktop-zip-field').on('keypress', onZipKeyPress);
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
        clearTimeout(initZipTimeout);
        if (!pointbreak.isCurrentBreakpoint("small", "medium")) {
            return;
        }
        /*
        if (pointbreak.isCurrentBreakpoint("small")) {
            $('.subnav .nav-wrapper').height(60);
            heroWrap();
        }
        */
        initZipTimeout = setTimeout(initZipSearch, 1000);
    }

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
            $('#desktop-zip-field').val(zipCode);
        }
    }

    function onZipButtonClick(evt) {
        if (!pointbreak.isCurrentBreakpoint("small", "medium")) {
            onZipSearchSubmit();
            evt.stopImmediatePropagation();
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
        $('#desktop-zip-field').val(zipCode);
        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }
        analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Model Nav", "Use my Location");
    }

    function onZipSearchSubmit() {
        if (!pointbreak.isCurrentBreakpoint("small", "medium")) {
            var url = 'http://www.lcpo.com/VehicleSearchResults?search=certified';

            url += '&zipCode=' + $('#desktop-zip-field').val();
            url += '&model=' + LEXUS.cpoModel.vehicle.cpoTrim.join(',').replace(' ', '+');
            url += '&minYear=' + thisYear;
            url += '&maxYear=' + thisYear;
            //console.log(url);
            //window.open(url, '_self');
            Cookie.set("dealer-last-search-dealerZip", $('#desktop-zip-field').val());
            window.location.assign(url);
        }
        analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Model Nav", "Search Inventory");
    }

    function changeYear() {
        var year = $selectYear.val();
        var url = window.location.href.replace(/\d{4}/, year);
        window.location.assign(url);
        analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Model Nav", year);
    }

    function onMobileSearch(results) {
        analytics.helper.fireCPOModelClick(pageModel, pageYear, pageModel + " Line", "Find Dealer", "Dealer Search");
    }
    init();
});
