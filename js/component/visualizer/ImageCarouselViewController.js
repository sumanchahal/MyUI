define([
    "jquery",
    "mvc/AbstractViewController",
    "component/visualizer/Visualizer",
    "component/Carousel",
    "component/lazyLoadManager"
], function(
    $,
    AbstractViewController,
    Visualizer,
    Carousel,
    lazyload
) {

    /**
     * @class ImageCarouselViewController
     * @extends AbstractViewController
     *
     * View controller for teh visualizer image carousel.
     * @see VisualizerViewController
     *
     * @constructor
     * @param model {Visualizer} The visualizer model object.
     * @param context {jquery|HTMLElement} dom area to draw the view.
     *
     */

    function ImageCarouselViewController(model, context) {
        AbstractViewController.call(this);

        this.init(model, $(context), Visualizer);
    }

    ImageCarouselViewController.prototype = new AbstractViewController();
    ImageCarouselViewController.prototype.parent = AbstractViewController.prototype;
    ImageCarouselViewController.prototype.constructor = ImageCarouselViewController;

    var firstImageLoaded = false,
        $slidesToDelete = null,
        IMAGE_RATIO = "56.3%",
        carouselSettings = {
            slideSelector: 'img',
            showIndicators: true,
            showNextPrev: true,
            animationDuration: 450,
            autoSlideHeight: false,
            viz: true
        };

    $.extend(ImageCarouselViewController.prototype, {

        /** @inheritDoc */
        createView: function(context) {
            var c = context;
            carouselSettings.instance = c;
            this.template = c.find("img.template");
        },

        /** @inheritDoc */
        updateView: function() {
            if (this.getModel() === null) {
                return;
            }

            var c = this.getContext();
            c.find("img.template").remove();
            c.addClass("loading");
            c.empty();

            var currentTrimGroup = this.getModel().getSelectedTrimGroup(),
                currentSwatchGroup = currentTrimGroup.getSelectedSwatchGroup(),
                isExterior = currentTrimGroup.isExteriorSelected();

            // if the current swatch group is exterior or wheels, use the exterior count.
            // otherwise, use the interior count.
            var numberOfImages = currentTrimGroup.getCurrentNumberOfAngles();
            var currentAngle = currentTrimGroup.getCurrentAngle();

            var i = 0;

            firstImageLoaded = false;

            for (; i < numberOfImages; i++) {
                var image = this.template.clone();
                image.removeClass("template");
                image.appendTo(c);
                image.attr("src", this.getModel().getImageUrl(i));
                //                image.data("original", this.getModel().getImageUrl(i));
                //                lazyload.init(image, {}, false);
                image.attr("alt", this.getModel().getImageAlt(i));
                image.one("load", $.proxy(this.onImageLoad, this));
            }

            // If it's the first time, instantiate the carousel
            // subsequent updates to the slides should just reset the slides
            if (typeof this.carousel === "undefined") {
                this.carousel = new Carousel(carouselSettings);
                this.carousel.module.on(this.carousel.SLIDE_CHANGED, $.proxy(this.onSlideChanged, this));
            } else {
                this.carousel.resetSlides(carouselSettings);
            }
            c.css("padding-top", IMAGE_RATIO);

            // Scroll to the selected image.
            this.carousel.jumpToIndex(currentAngle, "left", true);
        },

        /**
         * @private
         * called as each image loads. When it does, this resets the height of it in the carousel.
         */
        onImageLoad: function(event) {
            if (firstImageLoaded === false) {
                firstImageLoaded = true;

                if (this.carousel) {
                    this.carousel.setSlideHeight();
                }

                var c = this.getContext();
                c.removeClass("loading");
            }
        },

        /**
         * @private
         * Called whenever the current slide changes.
         */
        onSlideChanged: function() {
            // tells the selected trim group what the current index is.
            this.getModel().getSelectedTrimGroup().setCurrentAngle(this.carousel.getCurrentIndex());
        }
    });

    return ImageCarouselViewController;
});
