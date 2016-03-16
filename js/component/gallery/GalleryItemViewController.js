define(["jquery", "mvc/AbstractViewController", "component/gallery/GalleryItem", "component/lazyLoadManager"], function($, AbstractViewController, GalleryItem, lazyload) {

    /**
     * A view controller for a single gallery item.
     *
     * @constructor
     * @class GalleryItemViewController
     * @extends AbstractViewController
     *
     * @param model {GalleryItem} The model for this gallery item.
     * @param context {jquery} The location in the dom to attach the view.
     */

    function GalleryItemViewController(model, context) {
        AbstractViewController.call(this);

        this.init(model, context, GalleryItem);
    }

    GalleryItemViewController.prototype = new AbstractViewController();
    GalleryItemViewController.prototype.parent = AbstractViewController.prototype;
    GalleryItemViewController.prototype.constructor = GalleryItemViewController;

    $.extend(GalleryItemViewController.prototype, {

        /**
         * @inheritDoc
         */
        updateView: function() {
            var itemModel = this.getModel();
            var context = this.getContext();
            var $img = context.find(".thumbnail");
            $img.attr("data-original", itemModel.thumbnail.src);
            $img.attr("alt", itemModel.title);
            lazyload.init($img, {}, false);
            context.find(".title").text(itemModel.title);

            context.addClass(itemModel.type);

            return context;
        }
    });

    return GalleryItemViewController;
});
