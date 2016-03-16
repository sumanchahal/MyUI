/**
 * @fileOverview Behaviors for the packages page:
 * Expanded packages state
 */


require(["jquery", "PointBreak", "analytics", "favorites", "favorites-lfr"], function($, PointBreak, analytics, Favorite) { /** LIM 195**/

    var pointbreak = new PointBreak();

    /**
     * On load initializes all page level methods
     * @method init
     * @private
     */

    function init() {
        pointbreak.addChangeListener(setExpandControls);
        /** LIM 195 START**/
        if (window.favoritesActive) {
            /*LIM 3199*/
            if (!window.lfrActive) {
                updateFavoritesView();
            }
        }
        /** LIM 195 END**/
        // Initialize all open/close package states
        expandedState();
        autoExpandDeepLinkedItem();
        initAnalytics();
    }
    /** LIM 195 START**/

    function updateFavoritesView() {
        var favPackages = document.querySelectorAll('.favorite-listener.package');
        var favOptions = document.querySelectorAll('.favorite-listener.option');
        var i = 0;

        //This assumes every 'Packages' page will always have packages AND options.
        if (!favPackages) {
            return;
        }

        for (i = 0; i < favPackages.length; i++) {
            if (Favorite.getFavObject.isFavorite('Package', favPackages[i].getAttribute('data-code'))) {
                favPackages[i].textContent = "Remove Package";
                favPackages[i].setAttribute('data-action', 'removeFavorite');
            }
        }

        for (i = 0; i < favOptions.length; i++) {
            if (Favorite.getFavObject.isFavorite('Option', favOptions[i].getAttribute('data-code'))) {
                favOptions[i].textContent = "Remove Option";
                favOptions[i].setAttribute('data-action', 'removeFavorite');
            }
        }
        Favorite.getFavObject.bindFavorites();
    }
    /** LIM 195 END**/

    function setExpandControls() {
        pointbreak.removeChangeListener();
        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            expandedState();
        }
    }

    /**
     * Show/hide extra package information
     * @method expandedState
     * @private
     */

    function expandedState() {
        var $expandControls = {};

        if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            $expandControls = $('.package-item');

        } else {
            $expandControls = $('.expand-icon, .package-close');
        }

        // On click toggle content view
        $expandControls.unbind().on('touchStart click', function(event) {
            var $expandPackageParent = {};
            var $target = $(event.target);

            // Kind of delegating right here...
            if ($target.hasClass('asterisk')) {
                return;
            }

            $expandPackageParent = determineExpandPackageParent($target);

            var $expandPackage = $expandPackageParent.find('.package-expanded');

            // Hide the extended content
            if ($expandPackageParent.hasClass('open')) {
                hidePackageOptions($expandPackage, $expandPackageParent);

            } else { // Show extended content
                var $currentTarget = $(event.currentTarget);
                showPackageOptions($expandPackage, $expandPackageParent, $currentTarget);

                // Analytics - Capture Packages module click
                var $packageItem = $currentTarget.parents('.package-item'),
                    module = 'Packages',
                    contentTitle = $packageItem.find('.package-title').text(),
                    container = 'Packages Module';
                if ($packageItem.hasClass('featured')) {
                    module = 'Featured Package';
                    container = 'Featured Package Module';
                }
                analytics.helper.fireGenericModuleClick(module, contentTitle, container);

            }

            event.stopPropagation();
        });
    }


    function determineExpandPackageParent($target) {
        var $expandPackageParent;

        // Open/close buttons take priority regardless of viewport
        if ($target.hasClass('expand-icon') || $target.hasClass('package-close')) {
            $expandPackageParent = $target.parent();

        } else if (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) {
            $expandPackageParent = $('.package-item-wrapper', this);
        }

        return $expandPackageParent;
    }

    /**
     * hides the content for the selected package options
     *
     * @method hidePackageOptions
     */

    function hidePackageOptions($expandPackage, $expandPackageParent) {
        $expandPackageParent.removeClass('open');
        // Scroll to each individual headline, account for wrapper padding as well as sticky nav height if in mobile view.
        var padding_top = (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) ?
            parseInt($expandPackageParent.css('padding-top'), 10) + parseInt($('.small-nav-wrapper').height(), 10) : parseInt($expandPackageParent.css('padding-top'), 10);

        $('html, body').animate({
            scrollTop: $('.package-title', $expandPackageParent).offset().top - padding_top
        }, 400);
        $expandPackage.slideUp(400);
    }

    /**
     * Shows the content for the selected package options
     *
     * @method showPackageOptions
     */

    function showPackageOptions($expandPackage, $expandPackageParent, $currentTarget) {
        $expandPackageParent.addClass('open');
        $expandPackage.slideDown(400);
    }

    /**
     * Determines whether this page came from a deep link url
     * then triggers it to open
     * @method autoExpandEepLinkedItem
     * @private
     */

    function autoExpandDeepLinkedItem() {
        var hash = window.location.hash;

        if (hash) {
            location.hash = hash;
            // Trigger the scroll event to make the secondary nav show up on mobile when deep linking.
            $(document.body).animate({
                scrollTop: (pointbreak.isCurrentBreakpoint(PointBreak.SMALL_BREAKPOINT)) ? $(hash).offset().top - $('#subnav').height() : $(hash).offset().top
            });
            $hashElement = $(hash);
            //$('.expand-icon', $hashElement).trigger('click touchStart');

            var $expandPackageParent = determineExpandPackageParent($('.expand-icon', $hashElement));

            var $expandPackage = $expandPackageParent.find('.package-expanded');

            showPackageOptions($expandPackage, $expandPackageParent, $('.expand-icon', $hashElement));
        }

    }

    /**
     * Analytics
     * @private
     */

    function initAnalytics() {
        // Capture Find a Dealer click
        var findDealerBtn = $('.button-wrapper .button');
        findDealerBtn.on('click touchStart', function() {
            var container = 'End Cap Module';
            analytics.helper.fireFindADealerClick(container);
        });
    }

    init();
});
