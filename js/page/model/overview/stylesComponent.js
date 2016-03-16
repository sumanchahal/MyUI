define(["jquery", "PointBreak", "component/Carousel", "transit", "TweenMax"], function($, PointBreak, Carousel, Transit, TweenMax) {
    var defaultSettings = {
        instance: $('.cars-container'),
        slideSelector: '.style',
        showIndicators: true,
        slidesPerPage: 4,
        showNextPrev: true
    };
    var $compareBtn = $('#styles-container .compare-btn');

    // Create a new instance of breakpoint helper.
    var pointbreak = new PointBreak();
    var carousel;

    var currentIndex = 0;
    var totalModels = ($('.image-place-holder').find('.image-container').length) - 1;
    var totalModelsNotZeroIndex = ($('.image-place-holder').find('.image-container').length);
    var carsPerPage = 4;

    var disableAnimations = false;
    var isMobile = false;
    var isTouch = false;
    var trimHeight;

    var carStyles;
    var compareLinks = [];
    var trimDividers = [];




    var currentStyleView;

    return {

        /* styles component */

        initStylesComponent: function(stylesContainer) {

            var scope = this;
            var $style = $('.style');
            // animation duration in ms
            var T = 500;
            var breakpointAtLoad = pointbreak.getCurrentBreakpoint();

            pointbreak.addSmallListener(onSmallBreakpoint);
            pointbreak.addMediumListener(onMediumBreakpoint);
            pointbreak.addLargeListener(onLargeBreakpoint);
            pointbreak.addMaxListener(onMaxBreakpoint);

            // See if we need to show the expanded during setup.
            if (pointbreak.getCurrentBreakpoint() === PointBreak.SMALL_BREAKPOINT && $style.length === 1) {
                setExpandedMenu();
            }

            carStyles = $(".trims-container, .cars-container").children();
            removeCompareLinks();

            //Checking upon load to see if animations need to be disabled
            if (breakpointAtLoad === PointBreak.SMALL_BREAKPOINT) {
                disableAnimations = true;
                $("#pointer").css("z-index", 0);
                $("#pointer").css("opacity", 0);
                isMobile = true;
                $(".trims-container").css("width", "100%");

                $(".product-image").css("margin-left", "auto");
                $(".product-image").css("margin-right", "auto");

                addCompareLinks();
            }
            //Checking upon load to see if animations need to be disabled
            if ($("html").hasClass("no-touch") && $("html").hasClass("no-mstouch") && breakpointAtLoad === PointBreak.MED_BREAKPOINT) {
                carsPerPage = 4;
                disableAnimations = false;
                $("#pointer").css("z-index", 10);
                $("#pointer").css("opacity", 1);
                isMobile = false;

                $(".product-image").css("margin-left", "20px");
                $(".product-image").css("margin-right", "20px");

                $("#next-arrow").hide();
                $("#prev-arrow").hide();

            }
            if (($("html").hasClass("touch") || $("html").hasClass("mstouch")) && (breakpointAtLoad === PointBreak.MED_BREAKPOINT || breakpointAtLoad === PointBreak.LARGE_BREAKPOINT)) {
                carsPerPage = 3.5;
                disableAnimations = true;
                $("#pointer").css("z-index", 10);
                $("#pointer").css("opacity", 1);

                $(".trim-options").css("overflow", "hidden");
                $(".trim-options").css("-webkit-overflow-scrolling", "touch");

                $("#scroll-wrapper").css("overflow-x", "scroll");
                $("#scroll-wrapper").css("padding-bottom", "15px");

                isTouch = true;

                $("#next-arrow").hide();
                $("#prev-arrow").hide();

                $(".product-image").css("margin-left", "20px");
                $(".product-image").css("margin-right", "20px");
            }

            //Checking upon load to see if animations need to be disabled
            if ($("html").hasClass("no-touch") && $("html").hasClass("no-mstouch") && (breakpointAtLoad === PointBreak.MAX_BREAKPOINT || breakpointAtLoad === PointBreak.LARGE_BREAKPOINT)) {
                carsPerPage = 4;
                disableAnimations = false;
                $("#pointer").css("z-index", 10);
                $("#pointer").css("opacity", 1);
                isMobile = false;

                $(".product-image").css("margin-left", "auto");
                $(".product-image").css("margin-right", "auto");

                $("#next-arrow").show();
                $("#prev-arrow").show();
            }


            /* events */
            $('.style', stylesContainer).on('click', function(e) {
                var compareID = $(this).find('.product').data('compare-url').split("/");
                compareID = compareID[compareID.length - 1];
                currentStyleView = $(this);
                if (compareID === "0") {
                    $compareBtn.addClass("noButton");
                } else {
                    $compareBtn.removeClass("noButton");
                }
                if (pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) {
                    var selectedIndex = $(this).index() + ($(this).parent().index() * 4);
                    currentIndex = selectedIndex;
                    showStyle(selectedIndex, $('.product', $(this)));
                    $compareBtn.attr('href', $(this).find('.product').data('compare-url'));
                } else { //small size
                    $compareBtn.attr('href', $(this).find('.product').data('compare-url'));
                    showStyleSmall($('.product', $(this)));
                }

                //LIM 3199 
                if (window.lfrActive) {
                    var baseUrl = window.location.protocol + "//" + window.location.host;
                    //LIM 3199 - Update trim name in vehicleinfo object
                    window.LexusPlusPageInfo.lfrVehicleInfo.modelTrimName = $(this).find('.details .model').text();
                    window.LexusPlusPageInfo.lfrVehicleInfo.vehicleImg = baseUrl + $(this).find('.product-image-container img').attr('data-original');
                    window.LexusPlusPageInfo.lfrVehicleInfo.price = parseInt($(this).find('.details .price').attr('data-msrp'));
                }
            });

            //ARROW EVENTS

            $(".image-container, #next-arrow, #prev-arrow").on("mouseover", function() {
                TweenMax.to($("#prev-arrow"), 0.2, {
                    opacity: 1
                });
                TweenMax.to($("#next-arrow"), 0.2, {
                    opacity: 1
                });
            });

            $(".image-container, #next-arrow, #prev-arrow").on("mouseout", function() {
                TweenMax.to($("#prev-arrow"), 0.2, {
                    opacity: 0.3
                });
                TweenMax.to($("#next-arrow"), 0.2, {
                    opacity: 0.3
                });
            });

            $("#next-arrow").on("click", nextCar);
            $("#prev-arrow").on("click", prevCar);

            $(".style").on("mouseover", rollBox);
            $(".style").on("mouseout", setZoomedCar);

            //STYLES CAROUSEL EVENTS
            $(".trim-options").on("mousemove", mousePan);
            $(".trim-options").on("mouseleave", mousePanSnap);

            $(".product-image img").one("load", function() {
                $(".trims-container").hide().show(0);
                $(window).trigger("lazyload");
                if (isTouch) {
                    trimHeight = $("#scroll-wrapper").height();
                    $(".trim-options").css("height", (trimHeight - 10));
                }
            });
            $("#scroll-wrapper").on("scroll", function() {
                $(".product-image img").trigger("lazyload");
            });

            //Potential fix for the styles not loading
            $("#scroll-wrapper").on("mouseover", function() {
                $(".product-image img").trigger("lazyload");
            });

            $(window).resize(adjustStyleCarousel);

            ///////////////////////////////////////////////////////////////////////
            // ROLL BOX
            ///////////////////////////////////////////////////////////////////////

            function rollBox(event) {
                var img = $(this).find('img');
                TweenMax.to(img, 0.2, {
                    scale: 1.2
                });
            }

            ///////////////////////////////////////////////////////////////////////
            // SET ZOOMED CAR
            ///////////////////////////////////////////////////////////////////////

            function setZoomedCar() {
                var product = $(this).find(".product");
                var img = $(this).find("img");
                if (product.hasClass("selected")) {
                    TweenMax.to(img, 0.2, {
                        scale: 1.2
                    });
                } else {
                    TweenMax.to(img, 0.2, {
                        scale: 1.0
                    });
                }
            }

            ///////////////////////////////////////////////////////////////////////
            // NEXT CLICK BTN
            ///////////////////////////////////////////////////////////////////////

            function nextCar(event) {
                currentIndex = currentIndex + 1;
                currentIndex = currentIndex % totalModelsNotZeroIndex;
                var nextCarModel = stylesContainer.find('.product')[currentIndex];
                showStyle(currentIndex, nextCarModel);
                //We are looping and going back to the beginning, therefore we should be snapping left
                if (currentIndex === 0) {
                    autoSnap("left");
                } else {
                    autoSnap("right");
                }
            }
            ///////////////////////////////////////////////////////////////////////
            // PREV CLICK BTN
            ///////////////////////////////////////////////////////////////////////

            function prevCar(event) {
                currentIndex = currentIndex - 1;
                currentIndex = ((currentIndex % totalModelsNotZeroIndex) + totalModelsNotZeroIndex) % totalModelsNotZeroIndex;
                var nextCarModel = stylesContainer.find('.product')[currentIndex];
                showStyle(currentIndex, nextCarModel);
                autoSnap("left");
            }

            ///////////////////////////////////////////////////////////////////////
            // CHECK ARROWS
            ///////////////////////////////////////////////////////////////////////

            function checkArrows() {
                if (totalModelsNotZeroIndex <= 1) {
                    $("#prev-arrow").css("zIndex", -1);
                    $("#next-arrow").css("zIndex", -1);
                }
            }

            ///////////////////////////////////////////////////////////////////////
            // MOUSE PAN SNAP
            ///////////////////////////////////////////////////////////////////////

            function autoSnap(dir) {
                var currentStyle = stylesContainer.find('.product.selected');

                var containerWidth = $(".trim-options").width();
                var styleWidth = $(".style").width();
                var widthOffset = containerWidth - styleWidth;
                var _x = $(".trim-options").scrollLeft();
                var min = $(currentStyle).position().left - widthOffset;
                var max = $(currentStyle).position().left + widthOffset;
                if (dir === "left") {
                    min = $(currentStyle).position().left;
                    max = $(currentStyle).position().left - widthOffset;
                }
                _x = Math.min(min, Math.max(max, _x));
                TweenMax.to($(".trim-options"), 0.7, {
                    scrollLeft: _x,
                    ease: Expo.easeOut,
                    overwrite: true
                });
            }

            ///////////////////////////////////////////////////////////////////////
            // MOUSE PAN
            ///////////////////////////////////////////////////////////////////////

            function mousePan(event) {
                if (!disableAnimations) {
                    var X = event.originalEvent.clientX / $(".image-wrapper").width();
                    var maxScrollLeft = ($(".trim-options")[0].scrollWidth - ($(".trim-options")[0].clientWidth) / 3) - ($(".trim-options")[0].clientWidth / 2);
                    var offset = (($(window).width() - $(".image-wrapper").width()) / 2);
                    TweenMax.to($(".trim-options"), 0.5, {
                        scrollLeft: (X * maxScrollLeft) - offset,
                        ease: Sine.easeOut,
                        overwrite: "auto"
                    });
                }
            }

            ///////////////////////////////////////////////////////////////////////
            // MOUSE PAN SNAP
            ///////////////////////////////////////////////////////////////////////

            function mousePanSnap(event) {
                if (!disableAnimations) {
                    var X = event.originalEvent.clientX / $(".image-wrapper").width();
                    var maxScrollLeft = ($(".trim-options")[0].scrollWidth - ($(".trim-options")[0].clientWidth) / 3) - ($(".trim-options")[0].clientWidth / 2);
                    var offset = (($(window).width() - $(".image-wrapper").width()) / 2);
                    var carStyleWidth = $(".style").width();
                    var _x = Math.round(((X * maxScrollLeft) - offset) / carStyleWidth) * carStyleWidth;
                    TweenMax.to($(".trim-options"), 0.7, {
                        scrollLeft: _x,
                        ease: Expo.easeOut,
                        overwrite: "auto"
                    });
                }
            }

            //Adjusts the styles carousel to make it responsive, upon load.
            $(adjustStyleCarousel);

            //Figures out whether there are less than 4 models and styles acdordingly
            if (totalModelsNotZeroIndex < 4) {
                $(".trims-container").css("margin", "0 auto");
            }
            /*
             *    Adjusts the style carousel width so it acts responsively
             *
             */

            function adjustStyleCarousel() {
                if (!isMobile) {
                    var getW = $(".trim-options").width();
                    $(".trims-container").width((getW / carsPerPage) * totalModelsNotZeroIndex);
                    var carStyleWidth = $(".style").width();
                    var L = ((((currentIndex + 1) * 1) * carStyleWidth) - ((carStyleWidth / 2) + 11));
                    TweenMax.to($("#pointer"), 0.7, {
                        left: L,
                        ease: Expo.easeInOut
                    });
                }

                if (isTouch) {
                    trimHeight = $("#scroll-wrapper").height();
                }
            }

            /*
             * shows the detailed view for the element selected (element)
             * in large and medium
             */

            function showStyle(index, element) {
                //CHECK ARROWS FUNCTION FOR THE IMAGE CAROUSEL
                checkArrows();

                //When a car is changed it should show the current index - Adding 1 to currentIndex because it is zero indexed
                $("#style-counter").html("STYLES: " + (currentIndex + 1) + " OF " + totalModelsNotZeroIndex);

                //Arrow Animation for the cars styles
                var carStyleWidth = $(".style").width();
                var L = ((((index + 1) * 1) * carStyleWidth) - ((carStyleWidth / 2) + 11));
                TweenMax.to($("#pointer"), 0.7, {
                    left: L,
                    ease: Expo.easeInOut
                });

                if (!$(element).hasClass('selected')) {


                    stylesContainer.find('.product.selected').removeClass('selected'); //remove old arrow
                    $(element).addClass('selected'); //add new arrow

                    //hide previously selected image
                    stylesContainer.find('.image-container.selected').removeClass('selected').css({
                        'height': 'auto',
                        'opacity': 1

                    }).stop(true, true).transition({
                        'opacity': 0,
                        duration: T
                    });

                    //show selected image
                    $('.image-place-holder', stylesContainer).find('.image-container').eq(index).css({
                        'height': 'auto',
                        'opacity': 0
                    }).stop(true, true).transition({
                        'opacity': 1,
                        duration: T
                    }).addClass('selected');

                    //Making sure the selected style is zoomed in
                    var img = $(element).find("img");
                    TweenMax.to(img, 0.2, {
                        scale: 1.2
                    });

                    //Ensuring the non-selected styles stay zoomed out
                    stylesContainer.find('.product').each(function() {
                        var productImg = $(this).find("img");
                        if (!($(this).hasClass("selected"))) {
                            TweenMax.to(productImg, 0.2, {
                                scale: 1.0
                            });
                        }
                    });

                }
            }

            function showStyleSmall(element) {

                if (!$(element).hasClass('selected')) {
                    //stylesContainer.find('.product.selected').removeClass('selected'); //remove old arrow

                    $(element).addClass('selected'); //add new arrow

                    $(element).siblings().css('opacity', 1).transition({
                        'height': calculateSmallStyleHeight(element.siblings('.image-container')),
                        duration: T / 2
                    }).addClass('selected');

                } else {
                    $(element).removeClass('selected'); //add new arrow
                    $(element).siblings().css('opacity', 1).stop(true, true).transition({
                        'height': 0,
                        duration: T / 2
                    }).removeClass('selected');
                    if (stylesContainer.find('.product.selected').html() === undefined) {

                        $compareBtn.attr('href', $('.cars-container').data('compare-series-url'));
                    }
                }
            }

            function calculateSmallStyleHeight(element) {
                var height;
                var descriptionHeight = element.find('.description').outerHeight();
                var statsHeight = element.find('.stats').outerHeight();
                var padding = 120;

                height = descriptionHeight + statsHeight + padding;

                return height;
            }

            function onSmallBreakpoint(event) {
                disableAnimations = true;
                $("#pointer").css("z-index", 0);
                $("#pointer").css("opacity", 0);
                isMobile = true;
                $(".trims-container").width("100%");
                $(".trims-container").css("display", "block");

                $(".trim-options").css("overflow", "inherit");

                $(".product-image").css("margin-left", "auto");
                $(".product-image").css("margin-right", "auto");

                // Remove any previous 'selected' states
                // $('.product', $style).removeClass('selected');
                // if ($style.length === 1) {
                //     setExpandedMenu();
                // }
                // var settings = $.extend(defaultSettings, {
                //     slidesPerPage: 100
                // });
                // scope.setupCarousel(settings);
                // $compareBtn.attr('href', $('.cars-container').data('compare-series-url'));
                $('.product.selected').removeClass('selected');
                $('.product').removeClass('selected');
                $('.product').siblings().css("height", "0px");

                // var compareLink = compareLinks[0];

                addCompareLinks();

            }

            function onMediumBreakpoint(event) {
                removeCompareLinks();
                disableAnimations = false;
                isMobile = false;
                $("#pointer").css("z-index", 10);
                $("#pointer").css("opacity", 1);
                $(".trims-container").css("display", "table");

                $(".product-image").css("margin-left", "20px");
                $(".product-image").css("margin-right", "20px");

                $(".trim-options").css("overflow", "hidden");

                $("#next-arrow").hide();
                $("#prev-arrow").hide();

                //SHOULD BE TRIGGERED ON RESIZE/ORIENTATION CHANGE
                if ($("html").hasClass("touch") || $("html").hasClass("mstouch")) {
                    carsPerPage = 3.5;
                    disableAnimations = true;
                    $("#pointer").css("z-index", 10);
                    $("#pointer").css("opacity", 1);
                    $(".trim-options").css("overflow-x", "hidden");
                    $(".trim-options").css("-webkit-overflow-scrolling", "touch");
                    trimHeight = $("#scroll-wrapper").height();
                    $(".trim-options").css("height", trimHeight);

                    $("#scroll-wrapper").css("overflow-x", "scroll");
                    $("#scroll-wrapper").css("padding-bottom", "15px");

                    $("#next-arrow").hide();
                    $("#prev-arrow").hide();
                }

                if (event.oldBreakpoint === PointBreak.SMALL_BREAKPOINT) {
                    $('.product', stylesContainer).removeClass('selected');
                    $('.product', stylesContainer).first().trigger('click');

                    // settings = $.extend(defaultSettings, {
                    //     slidesPerPage: 4
                    // });
                    // scope.setupCarousel(settings);
                }
            }

            function onLargeBreakpoint(event) {
                removeCompareLinks();
                disableAnimations = false;
                isMobile = false;
                $("#pointer").css("z-index", 10);
                $("#pointer").css("opacity", 1);
                $(".trims-container").css("display", "table");

                $(".product-image").css("margin-left", "auto");
                $(".product-image").css("margin-right", "auto");

                $(".trim-options").css("overflow", "hidden");

                //SHOULD BE TRIGGERED ON RESIZE/ORIENTATION CHANGE
                if ($("html").hasClass("touch") || $("html").hasClass("mstouch")) {
                    carsPerPage = 3.5;
                    disableAnimations = true;
                    $("#pointer").css("z-index", 10);

                    $(".trim-options").css("overflow-x", "hidden");
                    $(".trim-options").css("-webkit-overflow-scrolling", "touch");
                    trimHeight = $("#scroll-wrapper").height();
                    $(".trim-options").css("height", (trimHeight - 10));


                    $("#scroll-wrapper").css("overflow-x", "scroll");
                    $("#scroll-wrapper").css("padding-bottom", "15px");

                    $("#next-arrow").hide();
                    $("#prev-arrow").hide();
                } else {
                    $("#next-arrow").show();
                    $("#prev-arrow").show();
                }


                if (event.oldBreakpoint === PointBreak.SMALL_BREAKPOINT) {
                    console.log("ignore");
                    $('.product', stylesContainer).removeClass('selected');
                    $('.product', stylesContainer).first().trigger('click');

                    // settings = $.extend(defaultSettings, {
                    //     slidesPerPage: 4
                    // });
                    // scope.setupCarousel(settings);
                }
            }

            function onMaxBreakpoint(event) {
                removeCompareLinks();
                disableAnimations = false;
                isMobile = false;
                $("#pointer").css("z-index", 10);
                $("#pointer").css("opacity", 1);
                //$(".product-image").css("margin", "0 auto");
                // $('.product', stylesContainer).first().trigger('click');
                $(".trims-container").css("display", "table");

                $(".product-image").css("margin-left", "auto");
                $(".product-image").css("margin-right", "auto");

                $(".trim-options").css("overflow", "hidden");

                $("#next-arrow").show();
                $("#prev-arrow").show();

                if (event.oldBreakpoint === PointBreak.SMALL_BREAKPOINT) {
                    console.log("ignore");
                    $('.product', stylesContainer).removeClass('selected');
                    $('.product', stylesContainer).first().trigger('click');

                    // settings = $.extend(defaultSettings, {
                    //     slidesPerPage: 4
                    // });
                    // scope.setupCarousel(settings);
                }
            }

            /**
             * Sets the expanded state of the styles information menu. Adds an 'updated' class to determine
             * if you want to expand a specific element, pass in an index
             * @param Integer -- index to expand
             */

            function setExpandedMenu(index) {
                var clean_index = index || 0;
                showStyleSmall($('.product', $style).eq(clean_index));
            }

            // On init trigger a click on the 1st element unless it's the small viewport.
            if (pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) {
                $('.product', stylesContainer).first().trigger('click');
            }

            /**
             *
             * Removing the compare links for medium and larger breakpoints so that they
             * don't interfere with the carousel.
             *
             */

            function removeCompareLinks() {
                carStyles.each(function() {
                    if ($(this).hasClass("compare-link")) {
                        $(this).detach();
                        compareLinks.push(this);
                    }
                    if ($(this).hasClass("trim-divider")) {
                        $(this).detach();
                        trimDividers.push(this);
                    }
                });
            }

            /**
             *
             * Adding the compare links as per LIM 1535, this should only be called
             * in mobile sizes.
             *
             */

            function addCompareLinks() {
                $(".trims-container, .cars-container").children().each(function(idx, value) {
                    if ($(value).hasClass('style')) {
                        var compareLink = compareLinks[idx];
                        var trimDivider = trimDividers[idx];
                        $(value).before(compareLink);
                        $(value).after(trimDivider);
                    }
                });
            }
        },

        setupCarousel: function(settings) {
            if (!carousel) {
                if ($('.cars-container .style').length > 4 && pointbreak.getCurrentBreakpoint() !== PointBreak.SMALL_BREAKPOINT) {
                    carousel = new Carousel(defaultSettings);
                }
            } else {
                if ($('.cars-container .style').length > 4) {
                    carousel.resetSlides(settings);
                }
            }
        }


    };
});
