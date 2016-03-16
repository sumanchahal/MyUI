define([
    "jquery",
    "mvc/AbstractViewController",
    "component/visualizer/Swatch", /** LIM 195**/
    "favorites", /** LIM 195**/
    "favorites-lfr" /** LIM 3199**/
], function(
    $,
    AbstractViewController,
    Swatch, /** LIM 195**/
    Favorite /** LIM 195**/
) {

    /**
     * @class SwatchViewController
     * @extends AbstractViewController
     *
     * A view controller for a single color or wheel swatch.
     *
     * @param model {Swatch} A swatch model object.
     * @param context {jquery|HTMLElement} A pointer to a dom location to draw the view.
     * @constructor
     *
     * @see Swatch
     */

    function SwatchViewController(model, context) {
        AbstractViewController.call(this);

        /** @prop {jquery} Reference to the thumbnail image. */
        this.$thumb = null;
        this.init(model, $(context), Swatch);
    }

    SwatchViewController.prototype = new AbstractViewController();
    SwatchViewController.prototype.parent = AbstractViewController.prototype;
    SwatchViewController.prototype.constructor = SwatchViewController;

    $.extend(SwatchViewController.prototype, {

        /**
         * @inheritDoc
         */
        createView: function(context) {
            this.$thumb = context;
            if (!this.$thumb.length) {
                throw new Error("Context must be an img of type .thumb");
            }
            this.getContext().removeClass("template");
        },

        /**
         * @inheritDoc
         */
        updateView: function() {
            this.$thumb.children("img").attr("src", this.getModel().getImage()) /** LIM 195**/
                .attr("alt", this.getModel().getName());
            this.getContext().model = this.getModel();
            this.getContext().attr("id", "swatch-" + this.getModel().getId());
            /** LIM 195 START**/
            if (this.getModel().getType() !== 'Wheels' && window.favoritesActive) {
                var efcCode = this.getModel().getEfcCode() ? this.getModel().getEfcCode() : "";
                this.getContext().attr("data-code", efcCode);
                this.getContext().attr('data-action', (Favorite.getFavObject.isFavorite(this.getModel().getType(), this.getModel().getEfcCode()) ? "removeFavorite" : "addFavorite"));
            }
            /** LIM 195 END**/
        }
    });

    return SwatchViewController;
});
