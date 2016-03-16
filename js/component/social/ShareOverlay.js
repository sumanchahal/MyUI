define(['jquery', "component/social/ShareManager"], function($, shareManager) {
    var DURATION = 300;

    /**
     * Social Share Overlay
     *
     * @see component/social/ShareManager
     * @class ShareOverlay
     *
     * @param $overlayContext {jquery} The overlay dom element.
     * @param $shareButton {jquery} The button that triggers this share overlay.
     * @param socialContent {SocialContent} a model object for social sharing data.
     */
    var ShareOverlay = function($overlayContext, $shareButton, socialContent) {
        this.$shareButton = $shareButton;
        this.$overlayContext = $overlayContext;
        this.setSocialContent(socialContent);

        this.init($overlayContext, $shareButton);
    };

    $.extend(ShareOverlay.prototype, {
        init: function($overlayContext, $shareButton) {
            //            this.$shareOverlay = $('.share-overlay', $($overlayContext));

            //show the share
            $shareButton.on('click', $.proxy(this.showShareOverlay, this));

            // set up the listeners
            $overlayContext
                .on('click touchend', $.proxy(this.fadeAndCloseShareOverlay, this))
                .on('click touchend', '.close-btn', $.proxy(this.fadeAndCloseShareOverlay, this))
                .on('click touchend', '.facebook', $.proxy(this.onFacebookShare, this))
                .on('click touchend', '.twitter', $.proxy(this.onTwitterShare, this))
                .on('click touchend', '.google', $.proxy(this.onGoogleShare, this))
                .on('click touchend', '.email', $.proxy(this.onEmailShare, this));
        },

        destroy: function() {
            // Individually turn off events to prevent shared-context issues
            this.$shareButton.off('click', '.share-btn');
            this.$overlayContext
                .off('click touchend', '.close-btn')
                .off('click touchend', '.share-overlay')
                .off('click touchend', '.facebook')
                .off('click touchend', '.twitter')
                .off('click touchend', '.google')
                .off('click touchend', '.email');
        },


        setSocialContent: function(item) {
            this._socialContent = item;
        },

        getSocialContent: function() {
            return this._socialContent;
        },

        setOpenCallback: function(callback) {
            this._openCallback = callback;
        },

        setCloseCallback: function(callback) {
            this._closeCallback = callback;
        },

        onFacebookShare: function(event) {
            event.preventDefault();
            var data = this.getSocialContent();
            if (data) {
                shareManager.shareToFacebook(data);
            }
        },
        onTwitterShare: function(event) {
            event.preventDefault();
            var data = this.getSocialContent();
            if (data) {
                shareManager.shareToTwitter(data);
            }
        },
        onGoogleShare: function(event) {
            event.preventDefault();
            var data = this.getSocialContent();
            if (data) {
                shareManager.shareToGooglePlus(data);
            }
        },
        onEmailShare: function(event) {
            event.preventDefault();
            var data = this.getSocialContent();
            if (data) {
                shareManager.shareToEmail(data);
            }
        },


        fadeAndCloseShareOverlay: function(event) {
            event.preventDefault();

            var targetIsChildOfShareContent = $(event.target).parents('.share-content').length;
            if (!targetIsChildOfShareContent) {
                this.$overlayContext.transition({
                    duration: DURATION,
                    opacity: 0,
                    zIndex: 0
                }, $.proxy(this.closeShare, this));
            }
        },


        /**
         * Opens the share overlay.
         *
         * @param event
         */
        showShareOverlay: function(event) {
            var DURATION = 1000;
            event.preventDefault();
            //fade In
            this.$overlayContext.show().css({
                zIndex: 200
            }).stop().animate({
                speed: DURATION,
                opacity: 1
            });

            if (LEXUS.ComparatorDealerCode) {
                $(".share-content-wrapper").css("top", "5%");
            }
            $(document).on('keyup', $.proxy(this.onEscapeKeyup, this));

            if ($.isFunction(this._openCallback)) {
                this._openCallback();
            }
        },

        /**
         * Binds the ESC key to close the share
         */
        onEscapeKeyup: function(event) {
            if (event.keyCode === 27) {
                this.closeShare();
            }
        },

        /**
         * Closes the share overlay if it is open.
         */
        closeShare: function() {
            if (this.shareOverlayIsOpen()) {
                this.$overlayContext.hide();
            }
            $(document).off('keyup', $.proxy(this.onEscapeKeyup, this));
            if ($.isFunction(this._closeCallback)) {
                this._closeCallback();
            }
        },

        /**
         * Checks to see if the share overlay is open.
         * @returns {Boolean|*}
         */
        shareOverlayIsOpen: function() {
            return this.$overlayContext.is(':visible');
        }

    });

    return ShareOverlay;

});
