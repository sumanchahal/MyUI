define(["jquery"], function($) {
    var TYPE_ERROR = "Model is an unexpected data type.";

    /**
     * Prototype for a view controller.
     *
     * @author Mims Wright
     *
     * @abstract
     * @constructor
     * @class AbstractViewController
     */

    function AbstractViewController() {
        this._modelType = null;
        this._model = null;
        this._context = null;
    }

    $.extend(AbstractViewController.prototype, {

        /**
         * Initializes the controller.
         *
         * @method init
         * @param {AbstractModel} model - The model to associate with this controller.
         * @param {jquery|HTMLElement} context - The context in the dom associated with this controller.
         * @param {Function} modelType - An optional type (class) for the model
         */
        init: function(model, context, modelType) {
            this._modelType = modelType || Object;
            this.setContext(context);
            if (context && this.createView) {
                this.createView(this.getContext());
            }
            this.setModel(model);
        },

        /**
         * Redraw the view to match the model.
         *
         * @abstract
         */
        updateView: function() {
            // define in subclass.
        },

        /**
         * Set the model after first checking the type of the object.
         *
         * @param model {Object} The type of the model should match this._modelType.
         */
        setModel: function(model) {
            if (model && this._modelType && !(model instanceof this._modelType)) {
                throw new Error(TYPE_ERROR);
            } else {
                this._model = model;
                if (this.updateView) {
                    this.updateView();
                }
            }
        },
        getModel: function() {
            return this._model;
        },

        /**
         * Sets the context in the dom in which this view will operate.
         * Context should be used for all methods that update the dom.
         *
         * @param context {jquery|HTMLElement}
         */
        setContext: function(context) {
            this._context = $(context);
        },
        getContext: function() {
            return this._context;
        }

    });
    return AbstractViewController;
});
