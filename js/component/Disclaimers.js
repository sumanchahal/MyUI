var LEXUS = LEXUS || {};

/**
 * Handles interaction with disclaimer, adds disclaimers to footer
 * to reset disclaimers on page after an ajax call, do Disclaimers.setUpDisclaimers
 * after the ajax call
 *
 * If you want to prevent an element's disclaimers from being included in the footer,
 * add the class 'ignore-disclaimer' to it
 *
 * Note: this module does not use AMD-style since it is part of the partner nav.
 *
 * @class Disclaimers
 *
 * DEPENDENCIES:
 *      "jquery"
 *      "analytics"
 */

function defineDisclaimers($, analytics) {

    var Disclaimers = {
        /**
         * Set up disclaimers if they exist in the page source
         *
         * @public
         */
        setUpDisclaimers: function() {
            if (this.doDisclaimersExist()) {
                this.disclaimersToFooter();
                this.setUpFooterDisclaimerInteraction();
            } else {
                $('.optional-disclaimers-container').addClass('hidden');
            }
        },

        /**
         * Refresh disclaimers after an ajax call
         *
         * @public
         */
        refreshDisclaimers: function() {

            if (this.doDisclaimersExist()) {
                $('.optional-disclaimers-container').removeClass('hidden');
                this.clearDisclaimersFooter();
                this.disclaimersToFooter();
                this.setUpFooterDisclaimerInteraction();
            }
        },

        /**
         * Determines if disclaimers exist
         *
         * @public
         */

        doDisclaimersExist: function() {
            var disclaimersExist = false;

            $.each($('.tooltip-trigger'), function(i, trigger) {
                var $thisTrigger = $(trigger);
                if ($thisTrigger.data('disclaimers') && $thisTrigger.data('disclaimers').length > 0) {
                    disclaimersExist = true;
                }
            });

            return disclaimersExist;
        },

        /**
         * AttachedTooltip.js uses this to parse the disclaimer and return it as a set of elements
         *
         * @returns {String} containing disclaimers rendered as HTML
         * @public
         */

        disclaimersToMarkup: function(data) {
            var dataParsed = data,
                disclaimerContent = "",
                displayTitle = false,
                disclaimerHeader = $('.optional-disclaimers-container .disclaimers-tooltip-title').html();

            $.each(dataParsed, function(i, disclaimer) {
                if (disclaimer.isTerms) {
                    displayTitle = true;
                }
            });

            // If one of the disclaimers needs to display a title, that title
            // will be shown for both of them in the same tooltip
            if (displayTitle) {
                disclaimerContent += "<h5 class='disclaimer-title'>" + disclaimerHeader + "</h5>";
            }

            $.each(dataParsed, function(i, disclaimer) {
                disclaimerContent += "<p class='disclaimer-body'>" + disclaimer.body + "</p>";
            });

            return disclaimerContent;
        },

        // Clears footer and numerical disclaimer indicators
        clearDisclaimersFooter: function() {
            $('.disclaimer-counters').remove();
            $('.optional-disclaimers-container .disclaimers').empty();
        },

        /**
         * If disclaimers exist on the page, they'll be copied into the Optional
         * Disclaimer Footer that's available on every page and can only be seen in
         * the small viewport
         *
         * @public
         */

        disclaimersToFooter: function() {

            var disclaimersList = {},
                disclaimersArray = [],
                disclaimerTitle = $('.disclaimer-tooltip-title').html(),
                disclaimersFooter = "",
                disclaimerCount = 0,

                appendToSelector = ":not(.ignore-disclaimer .tooltip-trigger)";


            $('.tooltip-trigger, .js-tooltip-show' + appendToSelector).each(function(i, trigger) {
                try {
                    var $trigger = $(trigger);

                    if ($trigger.data('disclaimers') && $trigger.data('disclaimers').length > 0) {

                        var dataParsed = $trigger.data('disclaimers');

                        if ($.isArray(dataParsed)) {
                            $.each(dataParsed, function(j, disclaimer) {
                                if (disclaimersList[disclaimer.code] === undefined) {
                                    disclaimersArray.push(disclaimer.code);
                                    disclaimersList[disclaimer.code] = disclaimer.body;
                                    disclaimersFooter += "<p id='footer-disclaimer-" + disclaimer.code + "'>";
                                    disclaimersFooter += "[" + (disclaimersArray.indexOf(disclaimer.code) + 1) + "] ";
                                    disclaimersFooter += disclaimer.body + "</p>";
                                }

                                var sep = ",";
                                if (dataParsed.length === 1 || j !== 0) {
                                    sep = "";
                                }

                                var supStr = '<sup class="disclaimer-counters">' + (disclaimersArray.indexOf(disclaimer.code) + 1) + sep + '</sup>';
                                if ($trigger.parent().html().indexOf(supStr) === -1) {
                                    if ($trigger.is("a") || $trigger.is("span.sub")) {
                                        $trigger.after(supStr);
                                    } else {
                                        $trigger.before(supStr);
                                    }
                                }
                            });
                        } else {
                            if (disclaimersArray.indexOf(dataParsed) === -1) {
                                disclaimersArray.push(dataParsed);
                                disclaimersFooter += "<p>[" + (disclaimersArray.indexOf(dataParsed) + 1) + "] " + dataParsed + "</p>";
                            }

                            var supStr = '<sup class="disclaimer-counters">' + (disclaimersArray.indexOf(dataParsed) + 1) + '</sup>';
                            if ($trigger.parent().html().indexOf(supStr) === -1) {
                                $trigger.after(supStr);
                            }
                        }
                    } else if (($trigger.data('disclaimers') && $trigger.data('disclaimers').length === 0) || ($trigger.data('disclaimers') && $trigger.data('disclaimers') === null)) {
                        $trigger.remove();
                    }

                } catch (e) {
                    console.warn(e);
                }

            });

            if (disclaimersFooter.length !== 0) {
                $('.optional-disclaimers-container').removeClass('never-show');
                $('.optional-disclaimers-container .disclaimers').html(disclaimersFooter);
            } else {
                $('.optional-disclaimers-container').addClass('never-show');
            }

        },

        /**
         * After disclaimers are set up in the small viewport footer, set up listener that
         * shows them interactively
         *
         * @public
         */

        setUpFooterDisclaimerInteraction: function() {

            var $showDisclaimers = $('.show-disclaimers'),
                $viewDisclaimers = $showDisclaimers.add($('.disclaimers-title')),
                $disclaimers = $('.disclaimers');

            $viewDisclaimers.off("click").on("click", function() {
                $disclaimers.toggleClass("shown");
                $showDisclaimers.toggleClass("close");
            });
        },

        /**
         * @constructor
         */

        init: function() {
            this.setUpDisclaimers();
        }
    };

    return Disclaimers;
}

if (typeof define === "function" && define.amd) {
    define(["jquery", "analytics"], function($) {
        LEXUS.Disclaimers = defineDisclaimers($);
        return LEXUS.Disclaimers;
    });
} else {
    LEXUS.Disclaimers = defineDisclaimers(jQuery);
}
