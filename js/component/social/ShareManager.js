/**
 * Created by mwright on 4/22/14.
 */

define(["analytics"], function(analytics) {

    var FACEBOOK_URL = 'http://www.facebook.com/sharer.php?',
        TWITTER_URL = 'https://twitter.com/share',
        GOOGLE_PLUS_URL = 'https://plus.google.com/share',
        WINDOW_OPTIONS = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600';

    return {

        /**
         * Shares page via Facebook.
         * @param socialData {SocialContent}
         */
        shareToFacebook: function(socialData) {
            var openGraphData = socialData ? socialData.openGraph : null;

            //            if (!openGraphData) {
            //                throw new Error("Facebook share data not defined");
            //            }

            /**
             * openGraphData.url can be either a relative path to the page or an
             * absolute or bit.ly link, we'll use the presense of 'http' to
             * determine which
             */
            var sharePath;
            if ((openGraphData) && (String(openGraphData.url).indexOf('http') >= 0)) {
                sharePath = 'u=' + openGraphData.url;
            } else {
                sharePath = 'u=' + this.getSharePath(socialData);
            }

            window.open(encodeURI(FACEBOOK_URL + sharePath), 'facebookShare', WINDOW_OPTIONS);

            this.triggerShareAnalytics(socialData, 'Facebook');
        },

        /**
         * Shares page via twitter.
         * @param socialData {SocialContent}
         * @returns {boolean}
         */
        shareToTwitter: function(socialData) {
            /** @type TwitterContent */
            var twitterData = socialData ? socialData.twitter : null;

            //            if (!twitterData) {
            //                throw new Error("Twitter share data not defined");
            //            }
            /**
             * twitterData.url can be either a relative path to the page or an
             * absolute or bit.ly link, we'll use the presense of 'http' to
             * determine which
             */
            var sharePath;
            if ((twitterData) && (String(twitterData.url).indexOf('http') >= 0)) {
                sharePath = encodeURIComponent(twitterData.url);
            } else {
                sharePath = encodeURIComponent(this.getSharePath(socialData));
            }

            var twitterPath = TWITTER_URL + '?url=' + sharePath;
            /*
            if (twitterData) {
                twitterPath += "&text=" + twitterData.title + ' ' + twitterData.description;
            }
            */

            window.open(twitterPath, 'twitterShare', WINDOW_OPTIONS);

            this.triggerShareAnalytics(socialData, 'Twitter');
        },

        /**
         * Shares page via Google+.
         * @param socialData {SocialContent}
         */
        shareToGooglePlus: function(socialData) {
            var googlePlusData = socialData ? socialData.googlePlus : null;

            //            if (!googlePlusData) {
            //                throw new Error("Google Plus share data not defined");
            //            }

            var sharePath;
            if ((googlePlusData) && (String(googlePlusData.url).indexOf('http') >= 0)) {
                sharePath = '?url=' + googlePlusData.url;
            } else {
                sharePath = '?url=' + this.getSharePath(socialData);
            }

            window.open(encodeURI(GOOGLE_PLUS_URL + sharePath), 'googleShare', WINDOW_OPTIONS);

            this.triggerShareAnalytics(socialData, 'Google Plus');
        },


        /**
         * Shares page via email.
         * @param socialData {SocialContent}
         */
        shareToEmail: function(socialData) {
            /** @type {SocialMailContent} */
            var mailData = socialData.mail;

            //            if (!mailData) {
            //                throw new Error("Email data is not defined");
            //            }

            var subject = socialData.mail ? encodeURIComponent(socialData.mail.subject) : "";
            var body = socialData.mail ? encodeURIComponent(socialData.mail.body) : "";
            body += encodeURI("\n\n" + this.getSharePath(socialData));

            var mailtoLink = 'mailto:?subject=' + subject + ' &body=' + body;


            window.location.href = mailtoLink;

            this.triggerShareAnalytics(mailData, 'Email');
        },

        triggerShareAnalytics: function(socialData, shareLink) {

            var container = 'Share Icon Overlay',
                shareContent = this.getSharePath(socialData);
            if (LEXUS.page.sectionId === 'cpo') {
                analytics.helper.fireCPOSocialClick(shareLink, shareContent);
            } else {
                analytics.helper.fireGlobalElementShareClick(container, shareLink, shareContent);
            }
        },
        /**
         * Returns the path to share the object.
         * @param shareData {SocialContent}
         * @returns {string}
         */
        getSharePath: function(shareData) {
            // pulling this for the model share.url
            var sharePath;
            var shareSuffix;
            if (shareData && shareData.shareUrl) {
                shareSuffix = shareData.shareUrl;
            } else if (shareData && shareData.url) {
                shareSuffix = shareData.url;
            } else {
                // default to the current browser location.
                return window.location.href;
            }
            if ((String(shareSuffix).indexOf('http') >= 0)) {
                return shareSuffix;
            } else {
                return this.getShareRoot() + shareSuffix;
            }
        },

        /**
         * Returns the share root path.
         * @returns {string}
         */
        getShareRoot: function() {
            // get base page url
            var pathArray = window.location.href.split('/');
            var protocol = pathArray[0];
            var host = pathArray[2];
            var url = protocol + '//' + host;

            return url;
        }
    };
});
