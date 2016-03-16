define(["jquery", "mvc/Observable"], function($, Observable) {

    /**
     * A base class for model objects.
     *
     * @class AbstractModel
     * @abstract
     * @extends Observable
     */
    var AbstractModel = function() {
        Observable.apply(this);
    };
    AbstractModel.prototype = new Observable();
    AbstractModel.prototype.parent = Observable.prototype;
    AbstractModel.prototype.constructor = AbstractModel;

    $.extend(AbstractModel.prototype, {
        /**
         * @public
         * Use init instead of a constructor.
         * @param {Object} data - Some data used to prime the model.
         */
        init: function(data) {
            this.data = data;
        },

        /**
         * @public
         * Override to create a readable string version of this model.
         */
        toString: function() {
            return this.data;
        }
    });


    return AbstractModel;
});
