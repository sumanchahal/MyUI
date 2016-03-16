define(["mvc/AbstractViewController", "mvc/List", "component/gallery/WallpaperAsset"], function(AbstractViewController, List, WallpaperAsset) {

    // closure variables and constants
    // var CONST = 1;

    /**
     * @author mwright
     * @class WallpaperAssetsViewController
     * @extends AbstractViewController
     *
     * A view for the wallpaper download list.
     *
     * @param model {List.<WallpaperAsset>}
     *
     * @constructor
     */

    function WallpaperAssetsViewController(model, context) {
        AbstractViewController.call(this);

        // instance properties
        this.model = null;
        this.context = context;
        this.dropDown = this.context.next('.download-dropdown');
        this.dropDownContent = this.dropDown.find('ul');

    }

    WallpaperAssetsViewController.prototype = new AbstractViewController();
    WallpaperAssetsViewController.prototype.parent = AbstractViewController.prototype;
    WallpaperAssetsViewController.prototype.constructor = WallpaperAssetsViewController;

    $.extend(WallpaperAssetsViewController.prototype, {
        // instance methods
        // method : function () {}

        /**
         * Set the model for this view.
         *
         * @param model {List.<WallpaperAsset>}
         */
        setModel: function(model) {
            this.parent.setModel.call(this, model);
            // Show/Hide model if empty or full
            for (var key in model) {
                if (model.hasOwnProperty(key)) {
                    var value = model[key];
                    if (key === "_items") {
                        if (typeof value[0] !== "undefined") {
                            // Show downloads if they exist
                            this.context.show();

                            // Remove old content
                            var dropDownContentLi = this.dropDownContent.find('li');
                            dropDownContentLi.remove();

                            for (var download in value) {
                                if (value.hasOwnProperty(download)) {
                                    var downloadContents = value[download];
                                    this.dropDownContent.append('<li><a href="' + downloadContents._url + '" target="_blank" download><span class="icon ' + downloadContents._type + '"></span><span class="title">' + downloadContents._type + '</span><span class="dimensions">( ' + downloadContents._size + ' )</span></a></li>');
                                }
                            }
                        } else {
                            // Hide downloads if they do not exist
                            this.context.hide();
                        }
                    }
                }
            }
        },

        /**
         * @inheritDoc
         */
        updateView: function(model) {
            // update the dropdown list here
            var that = this;
            var $colorbox = $('#colorbox');

            this.dropDown.hide();
            that.closeDropdown();

            // Show/hide functionality
            this.context.off('click');
            this.context.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if ($(this).hasClass('open')) {
                    that.closeDropdown();
                } else {
                    that.openDropdown();
                }
            });

            //
            $colorbox.off('click');
            $colorbox.on('click', function() {
                if (that.context.hasClass('open')) {
                    that.closeDropdown();
                }
            });
        },

        openDropdown: function() {

            this.context.addClass('open');
            this.dropDown.fadeIn();

            return;
        },

        closeDropdown: function() {

            this.context.removeClass('open');
            this.dropDown.fadeOut();

            return;
        }

    });

    return WallpaperAssetsViewController;
});
