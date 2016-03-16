var LEXUS = LEXUS || {};

/**
 * Displays a modal asking the user to confirm leaving the site or not
 * If the user confirms, the current browser tab redirects the user
 * to the corresponding page.
 *
 * Note: this module does not use AMD-style since it is part of the partner nav.
 *
 * DEPENDENCIES:
 *    "jquery"
 *    "analytics"
 *    "colorbox"
 *
 * @class ThirdPartyInterstitial
 */

function defineThirdPartyInterstitial($, analytics) {
    var ThirdPartyInterstitial = function() {
        var $body = $("body"),
            $window = $(window),
            modalContent = "",
            resizeThrottle = null,
            outboundHref = "",
            THROTTLE_TIMEOUT = 200,
            LEXUS_DOT_COM_PATTERN = /\/\/(www\.)?lexus\.com/,
            INTERSTITIAL_CLASS = "third-party-interstitial",
            whitelist = LEXUS.outlinkWhitelist || [],
            currentWidth = $window.width(),
            currentPosition = 0,
            isPartnerMode = $(".pn").length === 2 ? true : false,
            isMobile = navigator.userAgent.match(/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/) ? true : false;

        var colorboxSettings = {
            opacity: 0.2,
            width: '100%',
            maxWidth: '700px',
            reposition: true,
            closeButton: false,
            overlayClose: false,
            fadeOut: 0,
            onOpen: onColorboxOpen,
            onComplete: onColorboxComplete,
            onClosed: onColorboxClose
        };

        /**
         * @constructor
         */

        function init() {
            $body.on("click", "a", onLinkClick);
            $body.on("click", "#outbound-link .btn-cancel", hideModal);
            $body.on("click", "#outbound-link .btn-continue", function() {
                fireClickTag("Continue");

                // Hide modal when link is opened in new tab
                $.colorbox.close();
            });
        }

        /**
         * Event called on any link on the site that is clicked
         * to see if it needs to show the modal.
         *
         * @param {Event}
         * @private
         */

        function onLinkClick(e) {
            var $this = $(e.currentTarget),
                link = $this.attr("href");

            // if we don't have a whitelist available, open in new tab
            if (typeof whitelist !== "undefined" && whitelist.length > 0) {
                if (typeof link !== "undefined" && isUrlAbsolute(link)) { // Check for outbound link
                    if (isLinkWhitelisted(link, whitelist)) {
                        // whitelisted URLs open in a new tab
                        if (isOutboundLink(link)) {

                            //iPad does not do window.open
                            if (!/ipad/gi.test(navigator.userAgent)) {
                                e.preventDefault();
                                window.open(link, "_blank");
                            }
                        } else {
                            e.preventDefault();
                            if (this.target === "_blank") {
                                window.open(link, "_blank");
                            } else {
                                document.location = link;
                            }
                        }
                    } else {
                        // link is not whitelisted
                        if (!$this.is(".btn-continue") && !$this.is(".inlink")) {
                            // If it's partner mode, ensure the link is in the header or footer
                            if (!isPartnerMode || (isPartnerMode && $(this).parents(".pn").length > 0)) {
                                e.preventDefault();
                                outboundHref = link;
                                showModal();
                            }
                        }
                    }
                }
            }
        }

        /**
         * Checks the clicked href matches the format for an outgoing link.
         *
         * @param {String} href - The link url
         * @returns {Boolean} whether or not the link is going to a 3rd party site
         * @public
         */

        function isOutboundLink(href) {
            // if link isn't invalid and is absolute
            if (typeof href !== "undefined" && isUrlAbsolute(href) === true) {

                // and if it's not in the current domain...
                if (href.search(LEXUS_DOT_COM_PATTERN) < 0) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Returns true if the link is in the whitelist.
         * @param href
         * @param whitelist
         * @returns {boolean}
         */

        function isLinkWhitelisted(href, whitelist) {
            for (var i = 0; i < whitelist.length; i++) {
                if (href.search(whitelist[i]) >= 0) {
                    return true;
                }
            }
            return false;
        }


        /**
         * Checks to see if a given url is absolute, that's the
         * first hint as to whether or not a link is outbound
         *
         * @param {String} - href
         * @returns {Boolean} - whether or not the given href is absolute
         * @public
         */

        function isUrlAbsolute(href) {
            var linkIsAbsolute = false;

            if (href.search(/^http/) !== -1) {
                linkIsAbsolute = true;
            }

            return linkIsAbsolute;
        }

        /**
         * Loads modal content via Ajax, and displays to user
         *
         * @public
         */

        function showModal() {
            if ($("#outbound-link").length > 0) {
                modalContent = $("#outbound-link")[0].outerHTML;

                $.colorbox($.extend(colorboxSettings, {
                    html: modalContent,
                    transition: getModalTransitionType(),
                    fixed: isModalFixed()
                }));
            } else {
                $.colorbox($.extend(colorboxSettings, {
                    href: "/outlink/modal",
                    transition: getModalTransitionType(),
                    fixed: isModalFixed()
                }));
            }
        }

        /**
         * Determines whether or not the modal should be fixed position
         *
         * @returns {Boolean} - fixed position status
         * @private
         */

        function isModalFixed() {
            if (isMobile) {
                var minHeight = 400,
                    windowHeight = $window.height();

                return (windowHeight > minHeight) ? true : false;
            } else {
                return true;
            }
        }

        /**
         * Determines the optimal transition type
         *
         * @returns {String} - type of transition
         * @public
         */

        function getModalTransitionType() {
            if (typeof Modernizr.touch !== "undefined") {
                return (Modernizr.touch) ? "none" : "fade";
            } else {
                return "fade";
            }
        }

        /**
         * Repositions colorbox on resize with a throttle
         * added so the overlay will react more responsively
         *
         * @private
         */

        function onWindowResize() {
            if (currentWidth !== $window.width()) {

                currentWidth = $window.width();

                if (resizeThrottle !== null) {
                    clearTimeout(resizeThrottle);
                }

                resizeThrottle = setTimeout(function() {
                    $.colorbox($.extend(colorboxSettings, {
                        html: modalContent,
                        transition: "none",
                        fixed: isModalFixed()
                    }));

                }, THROTTLE_TIMEOUT);
            }
        }

        /**
         * Binds the ESC key to close the overlay
         */

        function onEscapeKeyup(event) {
            if (event.keyCode === 27) {
                hideModal();
            }
        }

        /**
         * Binds resize event and body applies body class
         *
         * @private
         */

        function onColorboxOpen() {
            fireLoadTag();

            currentPosition = $body.scrollTop();
            $body.addClass(INTERSTITIAL_CLASS);
            $window.on("resize", onWindowResize);
            $(document).on('keyup', onEscapeKeyup);

        }

        /**
         * Executed once the ajax data is available
         *
         * @private
         */

        function onColorboxComplete() {
            $("#outbound-link .btn-continue").attr("href", outboundHref);
            $("#outbound-link .btn-continue").attr("target", "_blank");
            modalContent = $("#cboxLoadedContent").html();
            forceBodyRepaint();
        }

        /**
         * Forces the body to re-render. Used to fix an iOS issue
         * when colorbox opens
         *
         *  @public
         */

        function forceBodyRepaint() {
            if ($('#cboxOverlay').css('opacity') === '1') {
                $body.hide();
                setTimeout(function() {
                    $body.show();
                }, 5);
            }
        }

        /**
         * Scrolls back to the original position on mobile
         * when colorbox closes
         *
         *  @public
         */

        function scrollBackToPosition() {
            if ($('#cboxOverlay').css('opacity') === '1' && isMobile === true) {
                $body.scrollTop(currentPosition);
            }
        }


        /**
         * Cleans up resize event and body class applied
         * when colorbox opens
         *
         *  @public
         */

        function onColorboxClose() {
            $body.removeClass(INTERSTITIAL_CLASS);
            $window.off("resize", onWindowResize);
            $(document).off('keyup', onEscapeKeyup);

            scrollBackToPosition();
        }

        /**
         * Hides modal
         *
         * @param {Event} e
         * @public
         */

        function hideModal(e) {
            if (typeof e !== "undefined") {
                e.preventDefault();
            }

            // analytics
            fireClickTag("Cancel");

            $.colorbox.close();
        }

        /**
         * Reassigns the whitelist
         *
         * @public
         */

        function setWhitelist(newWhitelist) {
            whitelist = newWhitelist;
        }

        /**
         * Triggers analytics event when analytics are loaded
         *
         * @public
         */

        function fireLoadTag() {
            if (isHelperAvailable()) {
                analytics.helper.fireThirdPartyInterstitialLoad();
            } else if (isFireTagAvailable()) {
                // Manually fire this if the anlytics framework isn't provided.
                var obj = {
                    "<section>": "Third Party Interstitial",
                    "<subsection>": "Outlink",
                    "<page>": "Overlay"
                };
                fireTag("2553.1", obj);
            }
        }

        /**
         * Triggers analytics event when analytics are loaded
         *
         * @private
         */

        function fireClickTag(action) {
            if (isHelperAvailable()) {
                analytics.helper.fireThirdPartyInterstitialClick(action);
            } else if (isFireTagAvailable()) {
                // Manually fire this if the anlytics framework isn't provided.
                var obj = {
                    "<action>": action,
                    "<container>": "Outlink"
                };
                fireTag("2553.2", obj);
            }
        }

        /**
         * Determines if analytics helper is present
         * in situations where Third Parties are using
         * this class, it's likely it won't be available
         *
         * @private
         */

        function isHelperAvailable() {
            return (analytics && analytics.helper);
        }

        /**
         * Determines whether or not TMS analytics
         * framework is included based on the presence
         * of the fireTag function
         *
         * @private
         */

        function isFireTagAvailable() {
            return typeof fireTag === "function";
        }

        init();

        return {
            isOutboundLink: isOutboundLink,
            isLinkWhitelisted: isLinkWhitelisted,
            isUrlAbsolute: isUrlAbsolute,
            showModal: showModal,
            hideModal: hideModal,
            setWhitelist: setWhitelist
        };

    };

    return ThirdPartyInterstitial;
}

if (typeof define === "function" && define.amd) {
    define(["jquery", "analytics", "colorbox"], function($, analytics) {
        LEXUS.ThirdPartyInterstitial = defineThirdPartyInterstitial($, analytics);
        return LEXUS.ThirdPartyInterstitial;
    });
} else {
    LEXUS.ThirdPartyInterstitial = defineThirdPartyInterstitial(jQuery, (LEXUS.analytics ? LEXUS.analytics : null));
}
