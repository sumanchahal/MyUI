var LEXUS = LEXUS || {};

/**
 * Custom tooltip displays the contents of data-contents
 * Tooltip JS file is already included globally.
 * Add the class "tooltip-trigger" to the element you want the tooltip to show up on when it's clicked.
 * For example:
 * <span class="tooltip-trigger">*</span>
 *
 * Use a data attribute to specify what should show up. You have 2 options:
 *
 * 1)   data-element - will specify the selector of an existing element in the DOM that will be inserted into the tooltip.
 *      In this case the default style is removed from the tooltip and you can do whatever you want to the style.
 *      Ex. <span class="tooltip-trigger" data-element="myClass">*</span>
 *
 * 2)   data-content - specifies the content to be inserted into the tooltip, and uses default styles.
 *      Ex. <span class="tooltip-trigger" data-content="Lorem ipsum my content">*</span>
 *
 * 3)   data-disclaimers - specifies the disclaimer to be inserted into the tooltip, and uses default styles.
 *      Ex. <span class="tooltip-trigger disclaimer" data-disclaimers="Lorem ipsum my content">dis<span class="asterisk">*</span></span>
 *
 * Note: this module does not use AMD-style since it is part of the partner nav.
 *
 * DEPENDENCIES:
 *    "jquery"
 *    "component/Disclaimers"
 *    "jscrollpane"
 *    "mousewheel"
 *
 * @class AttachedTooltip
 */

function defineAttachedTooltip(
    $,
    Disclaimers,
    Modernizr
) {
    var AttachedTooltip = function() {
        var $module = $('body'),
            // distance the tooltip will be from the element clicked
            distance = 10,
            $tooltipTrigger = $module.find(".tooltip-trigger"),
            $tooltip,
            $tooltipBackground,
            $tooltipClose,
            $tooltipContentField,
            targetLeftOffset,
            targetTopOffset,
            leftMargin,
            topMargin,
            scrollPane = null,
            RIGHT = 'right',
            LEFT = 'left',
            UP = 'up',
            DOWN = 'down',
            CONTENT = 'content',
            ELEMENT = 'element',
            DISCLAIMERS = 'disclaimers',
            DEFAULT = 'default',
            SHOWN_CLASS = 'shown',
            EXTRA_CLASS = 'extraClass',
            scrollPreventDist = 40,
            orientation = RIGHT,
            // makes sure that the tooltip doesn't go flush against the edge of the page
            SAFETY_MARGIN = 15,
            scrollbarOptions = {
                hideFocus: true,
                showArrows: true,
                verticalGutter: 18
            };

        /**
         * @constructor
         */

        function init() {
            appendTooltip();
            bindTooltipListener();
            bindPageResize();
            bindPageScroll();
        }

        /**
         * Add tooltip to the body of the document
         *
         * @method appendTooltip
         * @private
         */

        function appendTooltip() {
            $tooltip = $module.find(".tooltip");
            $tooltipBackground = $module.find(".tooltip-background");
            $tooltipClose = $module.find(".tooltip-close");
            $tooltipContentField = $module.find(".tooltip-content");
        }

        /**
         * Determines all events that are triggered a click on a tooltip link
         *
         * @method bindTooltipTrigger
         * @private
         */

        function bindTooltipTrigger() {
            $module.on("click touchstart", ".tooltip-trigger", function(event) {
                event.preventDefault();
                event.stopPropagation();

                thisEventTarget = $(event.target).closest('.tooltip-trigger');
                populateTooltip(thisEventTarget);
                setToolTipOrientation(thisEventTarget);
                setTooltipOffset(thisEventTarget);
                showTooltip();

                /**
                 * Sets the analytics tracking on all disclaimers.
                 * @param Object -- jQuery Object that targets the click area of the disclaimers.
                 * @public
                 */

                if (typeof fireTag === 'function') {
                    // Make sure the disclaimer data is coming from the proper source.
                    var disclaimerData = (thisEventTarget.hasClass('js-tooltip-show')) ? $('.tooltip-trigger', thisEventTarget).data('disclaimers') : thisEventTarget.data("disclaimers"),
                        disclaimer = disclaimerData[0].code;

                    if (disclaimer === 'offers') {
                        var objOffer = {
                            "<action>": "Offer Details",
                            "<container>": "Tool Tip"
                        };

                        fireTag("2546.3", objOffer);

                    } else {
                        var obj = {
                            "<disclaimer>": disclaimer,
                            "<container>": "Terms Details"
                        };

                        fireTag("2538.8", obj);
                    }
                }

            });
        }

        /**
         * Sets up events for tooltip overlay
         *
         * @method bindTooltipListener
         * @private
         */

        function bindTooltipListener() {

            bindTooltipTrigger();

            // Tooltip closes when user clicks anywhere else on the page, or on close button, or on a link
            $tooltipBackground.click(function(event) {
                hideTooltip();
            });

            $tooltipClose.click(function(event) {
                hideTooltip();
            });

            $tooltip.on('click', 'a', hideTooltip);

            $(window).bind("tooltip.close", function() {
                hideTooltip();
            });

            // Prevents page from scrolling and making tooltip disappear as soon as the
            // user has scrolled to the bottom or top of the tooltip content
            $('.scroll-container').bind('mousewheel DOMMouseScroll', function(e) {
                var scrollTo = null;

                if (e.type === 'mousewheel') {
                    scrollTo = (e.originalEvent.wheelDelta * -1);
                } else if (e.type === 'DOMMouseScroll') {
                    scrollTo = scrollPreventDist * e.originalEvent.detail;
                }

                if (scrollTo) {
                    e.preventDefault();
                    $(this).scrollTop(scrollTo + $(this).scrollTop());
                }
            });

        }

        /**
         * Populates tooltip with either content specified on the link, or with an element
         * specified on the link. Tooltip receives a class of 'default' if it does not
         * contain another element.
         *
         * @method populateTooltip
         * @param {jquery} $thisTrigger - element which gets clicked to show the tooltip
         * @private
         */

        function populateTooltip($thisTrigger) {
            // if the trigger has a 'content' data attribute (for default tooltip using default styles)
            if ($thisTrigger.data(CONTENT) && $thisTrigger.data(CONTENT).length !== 0) {
                $tooltipContentField.html($thisTrigger.data(CONTENT));
                $tooltip.addClass(DEFAULT);
                // if the trigger has a an 'element' data attribute, meaning that an element will be shown in the tooltip
            } else if ($thisTrigger.data(ELEMENT) && $thisTrigger.data(ELEMENT).length !== 0) {
                $tooltipContentField.html($("." + $thisTrigger.data(ELEMENT)));
                $tooltip.removeClass(DEFAULT);
                // if the trigger has a 'disclaimer' data attribute, meaning it's going to show a disclaimer as opposed to
                // a generic tooltip
            } else if ($thisTrigger.data(DISCLAIMERS) && $thisTrigger.data(DISCLAIMERS).length !== 0) {
                if ($.type($thisTrigger.data('disclaimers')) === 'array') {
                    $tooltipContentField.html(Disclaimers.disclaimersToMarkup(JSON.parse($thisTrigger.attr('data-disclaimers'))));
                } else {
                    $tooltipContentField.html($thisTrigger.data(DISCLAIMERS));
                }
                $tooltip.addClass(DEFAULT);
            }
            // add a class to the tooltip if that is passed in through the data attribute
            if ($thisTrigger.data(EXTRA_CLASS)) {
                $tooltip.addClass($thisTrigger.data(EXTRA_CLASS));
            }
        }


        /**
         * Default orientation is 'right.' Orientation can be right or left, or down.
         *
         * @method setToolTipOrientation
         * @param {jquery} $thisTrigger - element which gets clicked to show the tooltip
         * @private
         */

        function setToolTipOrientation($thisTrigger) {
            orientation = ($thisTrigger.data('orientation')) ? ($thisTrigger.data('orientation')) : RIGHT;
            var centerOfTarget = ($thisTrigger.outerWidth() * 0.5) + $thisTrigger.offset().left;
            var distanceFromTarget = ($thisTrigger.outerWidth() * 0.5) + distance + $tooltip.outerWidth() + SAFETY_MARGIN;

            // if the tooltip fits on the right, keep the orientation as right.
            // Otherwise, make it left
            if ($(document).innerWidth() - centerOfTarget - distanceFromTarget > 0) {
                orientation = RIGHT;
            } else if (centerOfTarget - distanceFromTarget - SAFETY_MARGIN > 0) {
                orientation = LEFT;
            } else {
                orientation = UP;
            }


        }

        /**
         * Determine position of tooltip and add class based on where it
         * is positioned in relation to the trigger
         *
         * @method setTooltipOffset
         * @param {jquery} $thisTrigger - element which gets clicked to show the tooltip
         * @private
         */

        function setTooltipOffset($thisTrigger) {
            targetTopOffset = $thisTrigger.offset().top - $(window).scrollTop();
            if (orientation === RIGHT) {
                targetLeftOffset = $thisTrigger.offset().left + $thisTrigger.outerWidth() + distance;
                removeClasses();
                $tooltip.addClass(RIGHT);
            } else if (orientation === LEFT) {
                targetLeftOffset = $thisTrigger.offset().left - $tooltip.outerWidth() - distance;
                removeClasses();
                $tooltip.addClass(LEFT);
            } else if (orientation === UP) {
                targetLeftOffset = '50%';
                targetTopOffset = targetTopOffset - ($tooltip.outerHeight() / 2) + distance;
                targetTopOffset = Math.max(targetTopOffset, 27);
                removeClasses();
                $tooltip.addClass(UP);
            }
        }

        function removeClasses() {
            $tooltip.removeClass(UP);
            $tooltip.removeClass(LEFT);
            $tooltip.removeClass(RIGHT);
        }

        /**
         * Reveal the tooltip and the background element that
         * keeps the user from clicking elsewhere
         *
         * @method showTooltip
         * @private
         */

        function showTooltip() {
            $tooltip.css(LEFT, targetLeftOffset);
            $tooltip.css('top', targetTopOffset);
            $tooltipBackground.show();
            $tooltip.css('display', 'block');
            setTimeout(function() {
                $tooltip.addClass(SHOWN_CLASS);
            }, 25);
            addCustomScroll();
        }

        /**
         * Hide the tooltip and the background element that
         * keeps the user from clicking elsewhere
         *
         * @method hideTooltip
         * @private
         */

        function hideTooltip() {
            $tooltip.removeClass(SHOWN_CLASS);
            setTimeout(function() {
                $tooltip.css('display', 'none');
            }, 300);
            $tooltipBackground.hide();
        }

        /**
         * On page resize, make the tooltip disappear
         *
         * @method bindPageResize
         * @private
         */

        function bindPageResize() {
            $(window).resize(function() {
                hideTooltip();
            });
            $(document).keydown(function(event) {
                if (event.keyCode === 37 || event.keyCode === 39) {
                    hideTooltip();
                }
            });
        }

        /**
         * On page scroll, make the tooltip disappear
         *
         * @method bindPageScroll
         * @private
         */

        function bindPageScroll() {
            window.addEventListener('scroll', function(event) {
                hideTooltip();
            });
        }

        /**
         * Adds custom scrollbar to the tooltip overlay
         *
         * @method addCustomScroll
         * @private
         */

        function addCustomScroll() {
            if (scrollPane !== null) {
                $('.scroll-pane').data('jsp').destroy();
            }
            scrollPane = $('.scroll-pane');
            scrollPane.jScrollPane();
            if (!Modernizr.touch) {
                scrollPane.on(
                    'mousewheel',
                    function(e) {
                        e.preventDefault();
                    }
                ).trigger('focus');
            }
        }

        init();

    };


    return AttachedTooltip;
}

if (typeof define === "function" && define.amd) {
    define(["jquery", "component/Disclaimers", "modernizr", "jscrollpane", "mousewheel"], function($, Disclaimers, Modernizr, analytics) {
        LEXUS.AttachedTooltip = defineAttachedTooltip($, Disclaimers, Modernizr);
        return LEXUS.AttachedTooltip;
    });
} else {
    LEXUS.AttachedTooltip = defineAttachedTooltip(jQuery, LEXUS.Disclaimers, Modernizr);
}
