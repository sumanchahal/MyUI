require([
    "lexus",
    "jquery",
    "PointBreak",
    "component/Carousel",
    "component/ResponsiveImages",
    "analytics",
    "waypoints",
    "waypoints-sticky",
    "model-cookie"
], function(
    LEXUS,
    $,
    PointBreak,
    Carousel,
    ResponsiveImages,
    analytics
) {

    // Create a new instance of breakpoint helper.
    var pointbreak = new PointBreak();
    var defaultSettings;
    var carouselItems = [];
    var noBorderClass = 'no-border';
    var analyticsFlag = true;

    function init() {

        initDropdown();
        initSpecBorderFix();
        initSpecBoxSize();
        initCarousel();
        setCutoutFix();
        replaceSpecChars();
        // setup responsive images
        var responsiveImages = new ResponsiveImages();
        initAnalytics();

        pointbreak.addChangeListener(onBreakpointChange);

        // fix for ie9 not loading the page at the correct location
        $(document).ready(function() {
            if (document.location.hash.search("#") !== -1) {
                document.location = document.location.hash;
            }
        });

    }

    /**
     * matchSpecialChars
     * @param str
     * @returns {*}
     */

    function replaceSpecChars() {
        $('.key-specs-container .key-spec .value').each(function() {
            var value = $(this).text(),
                html, regEx, match, temp_s;
            if (value) {
                regEx = /[@°]+/;
                match = regEx.exec(value);
                temp_s = value.split(match);
                html = temp_s.join('<small class="tiny">' + match + '</small>');
                $(this).html(html);
            }
        });
    }

    /**
     * Gets the dimensions of an image by extracting the AAAAxBBBB value from the formatted string passed in.
     * Ex format: /cm-img/specifications/LS-performance-background-specs-1084x375-L461166dark-2014-Lexus.jpg
     * @param String
     * @return Object
     */

    function getImageDimensionsFromPath(str) {
        if (!str) {
            return false;
        }

        var regEx = /[\d]+[x][\d]+/,
            match = regEx.exec(str),
            result = match ? match[0].split('x') : [0, 0],
            dimensions = {
                "width": result[0],
                "height": result[1]
            };
        return dimensions;
    }

    /**
     * Gets the small image dimensions from the JSON response and calculates the container size.
     * We just need to have the dimensions set to 100% when dealing with mobile versions.
     * @returns Object
     */

    function getSmallImageDimensions() {
        return {
            "width": "100%",
            "height": "100%"
        };
    }

    /**
     * Gets the small large dimensions from the JSON response and calculates the container size.
     * @param Object -- images
     * @returns Object
     */

    function getStandardImageDimensions(images) {
        var foreground_image_dimensions = {},
            main_image_dimensions = {},
            dimensions = {};
        if (images.foregroundImage.src.length > 1) {
            foreground_image_dimensions = getImageDimensionsFromPath(images.foregroundImage.src);
            main_image_dimensions = getImageDimensionsFromPath(images.backgroundImage.src);
            dimensions = {
                "width": main_image_dimensions.width,
                "height": parseInt(main_image_dimensions.height, 10) + parseInt(foreground_image_dimensions.height, 10)
            };
        } else {
            dimensions = getImageDimensionsFromPath(images.backgroundImage.src);
        }
        return dimensions;
    }

    /**
     * Gets the image dimensions that will be used for the container images.
     * @param Object -- images
     * @returns Object
     */

    function getImageContainerDimensions(images) {
        var dimensions = {};
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            dimensions = getSmallImageDimensions();
        } else {
            dimensions = getStandardImageDimensions(images);
        }
        return dimensions;
    }



    function onBreakpointChange() {
        /**
         * reset key specs carousel settings based on breakpointchange event
         */
        $.each(carouselItems, function(key, value) {
            defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
            carouselItems[key].resetSlides(defaultSettings);
        });

        initSpecBorderFix();
        initSpecBoxSize();
        setCutoutFix();
    }

    /**
     *
     */

    function setCutoutFix() {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            return false;
        }
        var selector = '.specifications-category.chassis > .bottom-specs-container > .spec',
            $spec = $(selector),
            $targetDiv = '',
            loc = 0,
            offsetTop = 0;

        if ($spec.hasClass('cutout')) {
            // See if there is a spec above the image, which means we want the 3rd to last item.
            // If there is only 1 spec then just assume the cutout is next to the spec.
            loc = ($spec.length > 1) ? ($spec.length - 3) : $spec.length - 1;
            $targetDiv = $spec.eq(loc);
            // +10 to account for the 10px transparency padding on the top of the image
            offsetTop = -1 * ($('.spec-wrapper', $targetDiv).height() - $('.description', $targetDiv).height() - 10);
            //$(selector + '.cutout > img').css('top', offsetTop);
            $('.bottom-specs-container', $('.specifications-category.chassis')).css({
                'margin-bottom': '100px'
            });
        }
    }

    /**
     * used to remove border from the last .spec item within each .specifications-category
     */

    function initSpecBorderFix() {
        $('.specifications-category').each(function(key, value) {
            var numberOfSpecItems = $('.spec', $(value)).length - 1;
            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT) && $(value).hasClass('engine')) {
                return true;
            }
            //determine if there are an even number of specItems and then remove the border of the second to last element
            if (numberOfSpecItems % 2) {
                $('.spec', $(value)).eq(numberOfSpecItems - 1).addClass(noBorderClass);
            } else {
                $('.spec', $(value)).eq(numberOfSpecItems).addClass('centered');
            }

            //always remove border from last element
            $('.spec', $(value)).eq(numberOfSpecItems).addClass(noBorderClass);

        });
        // Hack to fix centering/borders on mobile devices
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            $('.specifications-category.engine > .bottom-specs-container .spec').removeClass('centered');
            $('.specifications-category.engine > .bottom-specs-container .spec').removeClass(noBorderClass);
        }
    }

    /**
     * used to make all the boxes the same size to keep them aligned
     */

    function initSpecBoxSize() {
        function updateSpecBoxSize() {
            var $target = $('.specifications-category');
            $('.spec-wrapper').height("auto");

            if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
                $target = $('.specifications-category.performance,.specifications-category.drive-train');
            }

            $target.each(function(key, value) {
                var height = 0;

                $('.spec-wrapper', $(value)).each(function() {
                    if ($(this).parent().hasClass("centered")) {
                        return;
                    }
                    if ($(this).height() > height) {
                        height = $(this).height();
                    }
                });
                $('.spec-wrapper', $(value)).height(height);
                $('.centered .spec-wrapper', $(value)).height("auto");
            });
        }

        window.addEventListener("resize", function(e) {
            updateSpecBoxSize();
        });
        updateSpecBoxSize();
    }


    function initDropdown() {
        /* Determine if we can show the dropdown, it will be disabled (along with the dropdown button) if only 1 style/dimension is available */
        if (LEXUS.specifications.trimNav.hasOwnProperty('length') && LEXUS.specifications.trimNav.length <= 1) {
            $('.selected-trim > .dropdown-btn').hide();
            $('.selected-trim').css('cursor', 'default');
            return false;
        }

        var animationDuration = 300;
        var $dropdownParent = $('.specifications-dropdown');
        var $dropdownHeading = $('.dropdown-heading', $dropdownParent);


        /**
         * show / hide dropdown on click of the selected
         */
        $dropdownHeading.on('click', '.selected-trim', function() {
            var $targetDiv = $(this).closest('.dropdown-heading');
            if ($targetDiv.parent().hasClass('open')) {
                hideDropdown($targetDiv, true);
            } else {
                showDropdown($targetDiv);
                handleGenericModuleClickEvent($targetDiv);
            }
        });

        /**
         *  hide dropdown on click out
         */
        $(document).on('click', function(e) {
            var $target = $(e.target);
            if (!$target.parents().hasClass('specifications-dropdown') || $target.attr('class') === 'dropdown-hit-area') {
                hideDropdown($('.specifications-dropdown.open .dropdown-heading'), false);
            }
        });


        function showDropdown(element) {
            var $element = $(element),
                $dropdownOptionsContainer = $element.siblings('.dropdown-options-container'),
                listLength,
                next = -1;

            hideDropdown($('.specifications-dropdown.open .dropdown-heading'), false);
            $element.parent().addClass('open');

            $dropdownOptionsContainer.css({
                'display': 'block',
                marginLeft: ($dropdownOptionsContainer.width() / 2) * -1
            }).stop(true, true).transition({
                duration: animationDuration,
                opacity: '1',
                marginTop: '28px',
                zIndex: '10',
                display: 'block'
            }, function() {
                var ind = 0;
                next = 0;
                listLength = $dropdownOptionsContainer.find("li").length - 1;

                $(document).on('keydown', function(e) {
                    ind = $dropdownOptionsContainer.find("li:focus").index();

                    switch (e.keyCode) {
                        case 13:
                            e.preventDefault();
                            if (ind !== 0) {
                                $dropdownOptionsContainer.find("li").eq(ind).find("a")[0].click();
                            }
                            return true;
                        case 38:
                            e.preventDefault();
                            next = (next - 1 < 1) ? listLength : (next - 1);
                            break;
                        case 40:
                            e.preventDefault();
                            next = (next + 1 > listLength) ? 1 : (next + 1);
                            break;
                        default:
                            return true;
                    }
                    $dropdownOptionsContainer.find("li").eq(next).trigger("focus");
                });
            });

        }

        function hideDropdown(element, flag) {
            if (flag) {
                var $element = $(element);
                handleGenericModuleClickEvent($element);
            }
            $(element).parent().removeClass('open');
            $(element).siblings('.dropdown-options-container').stop(true, true).transition({
                duration: animationDuration,
                opacity: '0',
                marginTop: '-10px',
                zIndex: '0',
                complete: function() {
                    $(element).siblings('.dropdown-options-container').css({
                        'display': 'none'
                    });
                    $(document).off("keydown");
                }
            });
        }
    }

    function getBreakpointSettings() {
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            return {
                slidesPerPage: 1,
                showNextPrev: false,
                showIndicators: true,
                animationDuration: 300
            };
        } else {
            return {
                slidesPerPage: 4,
                showNextPrev: false,
                showIndicators: false
            };
        }
    }

    function initCarousel() {
        var carousel;

        $('.key-specs-container').each(function(key, value) {
            // Initialize carousel
            defaultSettings = {
                instance: $(value),
                slideSelector: ".key-spec"
            };

            defaultSettings = $.extend(defaultSettings, getBreakpointSettings());
            carousel = new Carousel(defaultSettings);

            //save carousel items in array so we can loop through them later to change their properties on resizes
            carouselItems.push(carousel);

        });

    }

    function initAnalytics() {
        //Manual page load check
        var previousPage = document.referrer,
            match = previousPage.match(/\/specifications\/?(.*)?/);

        // Previous url is a non specs page, fire page load tag
        if (match === null) {
            analytics.helper.fireSpecificationsPageLoad();
        }

        // Vehicle style expanded selection
        $('.dropdown-options li').on('click touchstart', function(event) {
            if (analyticsFlag) {
                var $element = $(event.currentTarget);

                handleGenericModuleClickEvent($element);
                analyticsFlag = false;
            } else {
                analyticsFlag = true;
            }

        });
    }

    function handleGenericModuleClickEvent(element) {
        var $dropdownListItem = element,
            contentTitle = $dropdownListItem.find('.trim-name').text(),
            module = $dropdownListItem.closest('.specifications-category').attr('data-category') + ' Specs',
            container = 'Specs Module';

        analytics.helper.fireGenericModuleClick(module, contentTitle, container);

    }

    init();
});
