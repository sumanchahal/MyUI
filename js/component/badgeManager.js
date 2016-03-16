define(
    ["util/fitText", "jquery"],
    function(fitText, $) {

        var MODEL_NAME_TEXT_SELECTOR = ".badge .model-name",
            HYBRID_LABEL_TEXT_SELECTOR = ".badge .bottom-line",
            MODEL_NAME_MAX_SIZE = 85,
            HYBRID_MAX_SIZE = 12,
            $w = $(window),
            $context,
            $modelName,
            $hybridLabel,
            $badgeContainer = $(".badge-container"),
            $hero = $('.hero');

        /**
         * Watches a badge element and updates its model name text to match the width of the container when the
         * window size changes.
         *
         * @param $badge {jquery} The badge container element.
         */

        function watchBadge($badge) {
            $context = $badge;
            $modelName = $context.find(".badge .model-name");
            $hybridLabel = $context.find('.bottom-line');
            $w.on("resize", updateView);
            updateView();
        }

        /**
         * Stop managing the badge.
         */

        function unwatchBadge() {
            $w.off("resize", updateView);
        }

        /**
         * Resize the badge to match the width of the container.
         */

        function updateView() {
            var width = $context.find(".badge-title").width();
            // reset to max size before shrinking
            $modelName.css("font-size", MODEL_NAME_MAX_SIZE);
            fitText.resize(MODEL_NAME_TEXT_SELECTOR, width);

            // reset to max size of hybrid label before shrinking
            $hybridLabel.css("font-size", HYBRID_MAX_SIZE);
            fitText.resize(HYBRID_LABEL_TEXT_SELECTOR, width);
            // show badge when text is "fitted"
            $badgeContainer.addClass("fitted-text");

        }

        /**
         * @module badgeManager
         * Updates the size of a model badge.
         */
        return {
            watchBadge: watchBadge,
            unwatchBadge: unwatchBadge,
            updateView: updateView
        };
    }
);
