define(["jquery", "mvc/AbstractViewController", "mvc/SelectableList"],
    function($, AbstractViewController, SelectableList) {

        var filterButton = ".filter-button",
            filterButtonTemplate = filterButton + ".template",
            filterButtonList = ".filter-button-list",
            MISSING_ELEMENT_ERROR = "Context is missing an element with selector: ",
            SELECTED_CLASS = "selected",
            TEMPLATE_CLASS = "template";

        /**
         * This is a view controller for a tab filter. It takes a
         * SelectableList as a model and will always show the selected
         * item in the list.
         *
         * @class TabFilterViewController
         * @extends AbstractViewController
         *
         * @constructor
         * @param model {SelectableList} A selectable list to use as a model.
         * @param context {jquery} A jquery object pointing to the dom element
         * for this component's view.
         */

        function TabFilterViewController(model, context) {
            AbstractViewController.apply(this, arguments);

            this._buttonsNeedUpdate = true;
            this.init(model, context, SelectableList);

        }

        TabFilterViewController.prototype = new AbstractViewController();
        TabFilterViewController.prototype.parent = AbstractViewController.prototype;
        TabFilterViewController.prototype.constructor = TabFilterViewController;

        $.extend(TabFilterViewController.prototype, {
            setModel: function(model) {
                if (model !== this.getModel()) {
                    this._model = model;
                    if (model) {
                        this.getModel().addSelectionListener(this.updateView, this);
                    }
                    this._buttonsNeedUpdate = true;
                    this.updateView();
                }
            },

            createView: function(context) {
                this.$template = context.find(filterButtonTemplate);
                if (!this.$template.length) {
                    throw new Error(MISSING_ELEMENT_ERROR + filterButtonTemplate);
                }

                this.$filterList = context.find(filterButtonList);
                if (!this.$filterList.length) {
                    throw new Error(MISSING_ELEMENT_ERROR + filterButtonList);
                }

                // Add the mouse listener to the list (and therefore, all the buttons within)
                this.$filterList.on("click", filterButton, $.proxy(this.onItemClick, this));
            },

            updateView: function() {
                var context = this.getContext();

                this.redrawButtons();

                var model = this.getModel();

                // update based on model's selected item.
                var selectedId = model.getSelectedItemId();

                // get all the trim filter buttons
                var $filters = this.getContext().find(filterButton);

                // Remove selected from all buttons.
                $filters.removeClass(SELECTED_CLASS);

                // Add selected class if more than one filter is present
                if ($filters.length > 1) {
                    $filters.each(function(i, filter) {
                        var $filter = $(filter),
                            filterId = $filter.data("id");

                        // if id of the button matches selected id of the model...
                        if (filterId === selectedId) {
                            $filter.addClass(SELECTED_CLASS);
                        }
                    });
                }

            },

            /**
             * Remove then recreate the button elements in the dom.
             *
             * @param force {Boolean} If true will redraw even if not needed.
             */
            redrawButtons: function(force) {
                if (this._buttonsNeedUpdate || force) {
                    // create the buttons
                    var i = this.getModel().getListIterator(),
                        tabFilterItem,
                        $filter;

                    this.$filterList.empty();

                    while (i.hasNext()) {
                        tabFilterItem = i.next();

                        // clone the template dom element and remove the template class.
                        $filter = this.$template.clone().removeClass(TEMPLATE_CLASS);
                        // set the button text based on the model
                        $filter.text(tabFilterItem.getLabel());
                        // set the data id based on the model
                        $filter.data("id", tabFilterItem.getId());
                        // store a reference to the model in the dom object
                        $filter[0].model = tabFilterItem;

                        // Add to the display
                        this.$filterList.append($filter);
                    }
                    this._buttonsNeedUpdate = false;
                }
            },


            /**
             * When a button is clicked, select the button in the model.
             * When the change propagates, updateView will be called.
             */
            onItemClick: function(event) {
                var $button = $(event.target);
                this.getModel().setSelectedItem($button[0].model);
            }

        });

        return TabFilterViewController;
    });
