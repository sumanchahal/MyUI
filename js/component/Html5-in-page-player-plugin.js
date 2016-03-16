//brightcoveHeroVideo.tag file is the player for this js
(function() {
    player = brightcove.api.getExperience();
    experience = player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);

    function onPlayerReady() {
        videoPlayer = player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
        videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, onProgress);

        var overlay = videoPlayer.overlay(),
            videoEle = videoPlayer.videoPlayer.element;

        // Remove overlay
        $(overlay).remove();

        // Add controls
        $('<div class="overlay-controls" href="#" style="position: absolute; display: block; top: 0; left: 0; width: 100%; height: 100%; z-index:100; background-image: url(http://tempur-pedic.proto.hugeinc.com/video-test/video-controls-play.png); background-repeat: no-repeat; background-position: center center; background-size: 10%;"></div>').appendTo(videoEle);

        var overlayControls = $('.overlay-controls');

        $(overlayControls).click(function() {
            if (videoPlayer.getIsPlaying() === false) {
                videoPlayer.play(true);
                $(overlayControls).css('background-image', 'none');
            } else {
                videoPlayer.pause(true);
                $(overlayControls).css('background-image', 'url(http://tempur-pedic.proto.hugeinc.com/video-test/video-controls-play.png)', 'background-size', '10%');
            }
        });

        // Check for the end of the video and show play icon

        function onProgress(evt) {
            if (parseInt(evt.duration, 10) === parseInt(evt.position, 10)) {
                $(overlayControls).css('background-img', 'url(http://tempur-pedic.proto.hugeinc.com/video-test/video-controls-play.png)', 'background-size', '10%');
            }
        }

        videoPlayer.playOverlayCallbacks({
            show: function() {
                return false;
            },
            hide: function() {
                return false;
            }
        });
    }

    if (experience.getReady()) {
        onPlayerReady();
    } else {
        experience.addEventListener(brightcove.player.events.ExperienceEvent.TEMPLATE_READY, onPlayerReady);
    }

}());
