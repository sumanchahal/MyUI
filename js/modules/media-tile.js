/**
 * R4 Media Tile
 * Controls the video.
 *
 * @author wschoenberger
 */
require([
        'jquery',
        'page/home/tile-video',
        'modules/video-overlay'
    ],

    function(
        $,
        tileVideo,
        videoOverlay
    ) {

        var init,
            isTouch,
            activate;

        /**
         * Inits stuff
         *
         * @method init
         * @private
         */

        init = function() {
            isTouch = ($('html').hasClass('touch') || $('html').hasClass('mstouch'));
            if (!isTouch && tileVideo) {
                tileVideo.startPreloading();
            }
            activate();
        };

        activate = function() {
            $('.m2-media-tile.media-video.brightcove').on('click', function() {
                var brightcoveId = $(this).attr('data-brightcove-id');
                if (brightcoveId) {
                    console.log('brightcove id: ', brightcoveId);
                    // brightcoveplayer.openAndPlay(brightcoveId);
                    videoOverlay.openOverlay(brightcoveId);
                }
            });
        };

        $(function() {
            init();
        });

        return {

        };
    });
