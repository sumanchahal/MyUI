require(["jquery",
        "modernizr",
        "PointBreak",
        "component/ResponsiveImages",
        "util/geolocationHelper",
        "util/cookie",
        "component/ZipSearchView",
        "component/social/ShareOverlay",
        "analytics",
        "dropkick",
        "page/cpo/cpoNav"
    ],
    function($,
        Modernizr,
        PointBreak,
        ResponsiveImages,
        geolocationHelper,
        Cookie,
        ZipSearchView,
        ShareOverlay,
        analytics,
        dropkick,
        cpoNav
    ) {

        var $selectPrice, $selectYearMin, $selectYearMax, $selectMiles, zipApi, ZipSearch, pointbreak, currentBreakPoint;

        function init() {
            //autoComplete();
            pointbreak = new PointBreak();
            var responsiveImages = new ResponsiveImages();
            var nav = new cpoNav();
            var $select = $('.form-box select');
            $selectPrice = $('.form-box #price');
            $selectYearMin = $('.form-box #yearrange');
            $selectYearMax = $('.form-box #yearrange-max');
            $selectMiles = $('.form-box #mileage');
            $select.dropkick({
                autoWidth: false
            });
            //geolocationHelper.on("dataReady", onZipData);
            geolocationHelper.fetchData(onZipData, this);

            initShareOverlay();

            $('.search-form .submit').click(onSearchSubmit);
            $('.product').each(function() {
                var $input = $(this).find('input');
                if ($input.prop('checked')) {
                    $(this).find('.fake-check').toggleClass('checked');
                }
            });
            if (allModelsCheck()) {
                $(".select-all-container").find(".fake-check").addClass("checked");
            }
            $('.product').click(function() {
                var $input = $(this).find('input');
                $input.prop('checked', !$input.prop('checked'));
                $(this).find('.fake-check').toggleClass('checked');
                if ($input.is(":checked")) {
                    analytics.helper.fireLeadCPOButtons("Select Model", $(this).data('category'), $(this).find(".model").text().replace(/\r?\n|\r/, ""));
                }
                if (allModelsCheck()) {
                    $(".select-all-container").find(".fake-check").addClass("checked");
                } else {
                    $(".select-all-container").find(".fake-check").removeClass("checked");
                }
            });
            $(".select-all-container label").on("click", onSelectAllClick);
            $(".select-all-container .fake-check").on("click", onSelectAllClick);
            $('.get-api-zip').click(onZipRefresh);
            $('#desktop-zip-field').on('keypress', onZipKeyPress);
            $('#zip-field').on('keypress', onZipKeyPress);
            $selectYearMin.on('change', changeMinYear);
            $selectYearMax.on('change', changeMaxYear);
            $('.form-box.yearrange a').on('click', onYearClick);
            //$selectPrice.on("change", changePrice);

            pointbreak.addChangeListener(onBreakpointChange);
            responsiveImages.update();
            if (pointbreak.isCurrentBreakpoint("small", "medium")) {
                initZipSearch();
            }
            initAnalytics();
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


        function initZipSearch() {
            ZipSearch = new ZipSearchView("#zip-wrapper", {
                // ajaxLoader: false, // Turn off ajaxLoader
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

        function initAnalytics() {
            $selectPrice.on("change", function() {
                analytics.helper.fireLeadCPOButtons("Search Filters", "Max Price", $(this).val());
            });
            $selectYearMin.on("change", function() {
                analytics.helper.fireLeadCPOButtons("Search Filters", "Min Year", $(this).val());
            });
            $selectYearMax.on("change", function() {
                analytics.helper.fireLeadCPOButtons("Search Filters", "Max Year", $(this).val());
            });
            $selectMiles.on("change", function() {
                analytics.helper.fireLeadCPOButtons("Search Filters", "Max Milage", $(this).val());
            });
            $('.form-zip-search .btn-search').click(function() {
                analytics.helper.fireLeadCPOButtons("Find Dealer", "", "Dealer Search");
            });
            $(".search-results ul").on("click", 'a.btn', function() {
                analytics.helper.fireLeadCPOButtons("Dealer Info", "", $(this).text());
            });
            $(".search-results ul").on("click", '.phone a', function() {
                analytics.helper.fireLeadCPOButtons("Dealer Info", "", "Click to Call");
            });
        }

        function allModelsCheck() {
            if ($('.product input').length === $('.product input:checked').length) {
                return true;
            }
            return false;
        }

        function onSelectAllClick() {
            var $fakeCheck = $(".select-all-container").find(".fake-check");
            if ($fakeCheck.hasClass("checked")) {
                $(".product input").prop('checked', false);
                $(".product .fake-check").removeClass('checked');
                $fakeCheck.removeClass("checked");
            } else {
                $(".product input").prop('checked', true);
                $(".product .fake-check").addClass('checked');
                $fakeCheck.addClass("checked");
                analytics.helper.fireLeadCPOButtons("Select Model", "", "Select All Models");
            }
        }

        function onZipKeyPress(evt) {
            var keyCode = window.event ? evt.keyCode : evt.which,
                KEY_0 = 48,
                KEY_9 = 57,
                KEY_BACKSPACE = 0,
                KEY_DELETE = 8,
                KEY_ENTER = 13;

            if (keyCode < KEY_0 || keyCode > KEY_9) {
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

        function onBreakpointChange(e) {
            if (!pointbreak.isCurrentBreakpoint("small", "medium")) {
                return;
            }
            /*
            if (pointbreak.isCurrentBreakpoint("small")) {
                $('.subnav .nav-wrapper').height(60);
                heroWrap();
            }
            */
            if (ZipSearch === undefined) {
                setTimeout(initZipSearch, 1000);
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

        function onZipRefresh(evt) {
            if ($(this).parent().is(".form-zip-search")) {
                // This is the desktop version of the tag
                analytics.helper.fireLeadCPOButtons("Search Filters", "", "Use My Location");
            } else {
                // Mobile use my location tag
                analytics.helper.fireLeadCPOButtons("Find Dealer", "", "Use My Location");
            }
            var zipCode = zipApi.getZip();
            $('#zip-field').val(zipCode);
            $('#desktop-zip-field').val(zipCode);
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        }

        function onSearchSubmit() {
            analytics.helper.fireLeadCPOButtons("Search Filters", "", "View Inventory");
            var url = 'http://www.lcpo.com/VehicleSearchResults?search=certified',
                checkedList = $('.product input:checked'),
                names = '';
            for (var i = 0, len = checkedList.length; i < len; i++) {
                names += $(checkedList[i]).val() + ',';
            }
            Cookie.set("dealer-last-search-dealerZip", $('#desktop-zip-field').val());
            url += '&zipCode=' + $('#desktop-zip-field').val();
            if (names.length) {
                if (allModelsCheck()) {
                    url += '&model=All';
                } else {
                    url += '&model=' + names.substring(0, names.length - 1);
                }
            }
            if ($selectPrice.val() > 0) {
                url += '&maxPrice=' + $selectPrice.val();
            }
            if ($selectYearMin.val() > 0) {
                url += '&minYear=' + $selectYearMin.val();
            }
            url += '&maxYear=' + $selectYearMax.val();
            if ($selectMiles.val() > 0) {
                url += '&maxMileage=' + $selectMiles.val();
            }
            //window.open(url, '_self');
            window.location.assign(url);
        }

        function changeMinYear() {
            var year = $selectYearMin.val(),
                maxYears = $('#dk_container_yearrange-max a[data-dk-dropdown-value]'),
                yearOptions = $('#yearrange-max option');
            for (var i = 0, len = maxYears.length; i < len; i++) {
                if (($(maxYears[i]).attr('data-dk-dropdown-value') < year) && year > 0) {
                    $(maxYears[i]).toggleClass('disable', true);
                    $(yearOptions[i]).attr("disabled", true);
                } else {
                    $(maxYears[i]).toggleClass('disable', false);
                    $(yearOptions[i]).attr("disabled", false);
                }
            }
        }

        function changeMaxYear() {
            var year = $selectYearMax.val(),
                minYears = $('#dk_container_yearrange a[data-dk-dropdown-value]'),
                yearOptions = $('#yearrange option');
            for (var i = 0, len = minYears.length; i < len; i++) {
                if (($(minYears[i]).attr('data-dk-dropdown-value') > year) && year > 0) {
                    $(minYears[i]).toggleClass('disable', true);
                    $(yearOptions[i]).attr("disabled", true);
                } else {
                    $(minYears[i]).toggleClass('disable', false);
                    $(yearOptions[i]).attr("disabled", false);
                }
            }
        }

        function onYearClick(evt) {
            if ($(evt.delegateTarget).hasClass('disable')) {
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                evt.stopImmediatePropagation();
            }
        }

        init();
    });
