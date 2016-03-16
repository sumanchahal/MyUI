/**
 * Utils we needed for r4.
 * Not limited to but mostly stuff we pulled from legacy page js
 * file that we needed for the new R4 pages.
 *
 *
 * @author wschoenberger
 * @file
 */
define([], function() {

    return {
        curPopUpWindow: null,


        infoPopUp: function(popID, popWidth, popHeight, defaultElements) {
            // calculating the center of the browser window, so that we can center the popup over the window
            var windowWidth = (document.all) ? document.body.offsetWidth : window.innerWidth;
            var windowHeight = (document.all) ? document.body.offsetHeight : window.innerHeight;

            var left = Math.round((windowWidth - popWidth) / 2) + "px";
            var top = Math.round((windowHeight - popHeight) / 2) + "px";

            // close the popup if its already opened
            this.closeExamplePopup();

            // opens a new window and sets the object o your popup variable
            var elementString = (defaultElements === true) ? "toolbar=yes, location=yes, directories=yes, status=yes;" : "toolbar=no, location=no, directories=no, status=no;";

            this.popupExampleWindow = window.open(popID + '', '_blank', elementString + ', menubar=yes, scrollbars=yes, resizable=yes, copyhistory=yes, width=' + popWidth + ', height=' + popHeight + ',top=' + top + ', left=' + left);

            // make sure the popup is the focused window
            if (this.popupExampleWindow) {
                this.popupExampleWindow.focus();
            }

            // Add events dynamically to the window, that makes sure we close the popup when navigating away from this page
            if (window.addEventListener) {
                window.addEventListener('unload', this.closeExamplePopup, null);
            } else if (window.attachEvent) {
                window.attachEvent('on' + 'unload', this.closeExamplePopup);
            }
        },


        closeExamplePopup: function() {
            // We only close the popup if its exists
            if (this.popupExampleWindow && !this.popupExampleWindow.closed) {
                this.popupExampleWindow.close();
                this.popupExampleWindow = null;
            }
        }


    };
});
