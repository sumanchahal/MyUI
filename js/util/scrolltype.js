/**
 * scrolltype
 * Designed to detect if a scroll was user initiated or
 * not. We are currently using this for sticky header
 * that we don't want to show when jumplinks are used.
 *
 * @author wschoenberger
 */
define(["jquery"], function($) {

    var init,
        activated = false,
        activate,
        deactivate,
        setUserScroll,
        unsetUserScroll,
        isTouch = ($('html').hasClass('touch') || $('html').hasClass('mstouch')),
        isUserScroll = false,
        $jumplinks;


    /**
     * Inits stuff
     *
     * @method init
     * @private
     */

    init = function() {
        activate();
    };

    /**
     * Initializes event bindings.
     *
     * @public
     */
    activate = function() {

        if (!activated) {
            activated = true;
            if (isTouch) {
                $(document).on('touchstart', setUserScroll);
            } else {
                /*
                    @NOTE: Not a single page app so we dont need this.
                */
                // // reset flag on back/forward
                // $.history.init(function(hash) {
                //     isUserScroll = false;
                // });

                $(document).keydown(function(e) {
                    //  page up,          page dn,          spacebar,         up,               down,              ctrl + home,                     ctrl + end
                    if (e.which === 33 || e.which === 34 || e.which === 32 || e.which === 38 || e.which === 40 || (e.ctrlKey && e.which === 36) || (e.ctrlKey && e.which === 35)) {
                        setUserScroll();
                    }
                });

                // detect user scroll through mouse
                // Mozilla/Webkit 
                if (window.addEventListener) {
                    document.addEventListener('DOMMouseScroll', setUserScroll, false);
                }

                //for IE/OPERA etc 
                document.onmousewheel = setUserScroll;
            }

            // to reset flag when jumplinks are clicked
            $jumplinks = $('a[href^=#]:not(a[href=#])');
            $jumplinks.on('click', unsetUserScroll);
        }
    };

    /**
     * Removes event bindings.
     *
     * @public
     */
    deactivate = function() {
        activated = false;
        if (isTouch) {
            $(document).off('touchstart', setUserScroll);
        } else {
            if (window.removeEventListener) {
                document.removeEventListener('DOMMouseScroll', setUserScroll);
            }
            document.onmousewheel = null;
        }
        $jumplinks.off('click', unsetUserScroll);
    };

    /**
     * Sets user scroll flag to true.
     *
     * @private
     */
    setUserScroll = function(event) {
        isUserScroll = true;
    };

    /**
     * Sets user scroll flag to false.
     *
     * @private
     */
    unsetUserScroll = function(event) {
        isUserScroll = false;
    };


    $(document).ready(function() {
        init();
    });

    return {
        activate: activate,
        deactivate: deactivate,
        /**
         * Returns current state of user scroll flag.
         *
         * @public
         */
        isUserScroll: function() {
            return isUserScroll;
        }
    };
});
