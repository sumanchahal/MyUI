define([
    "jquery",
    "mvc/AbstractModel",
    "component/tabfilter/TabFilter",
    "page/model/performance/PerformanceStylingComparison"
], function(
    $,
    AbstractModel,
    TabFilter,
    PerformanceStylingComparison
) {

    /**
     * @class PerformanceStyling
     * @extends AbstractModel
     * @param data {json}
     * @constructor
     */
    var PerformanceStyling = function(data) {
        AbstractModel.call(this);
        this._comparisons = null;

        this.init(data);
    };

    PerformanceStyling.prototype = new AbstractModel();
    PerformanceStyling.prototype.parent = AbstractModel.prototype;
    PerformanceStyling.prototype.constructor = AbstractModel;

    $.extend(PerformanceStyling.prototype, {
        init: function(data) {

            this._comparisons = new TabFilter();
            if (data && data.stylingComparisons) {
                var i = 0,
                    l = data.stylingComparisons.length,
                    comparisonData,
                    comparison;

                for (; i < l; i++) {
                    comparisonData = data.stylingComparisons[i];
                    comparison = new PerformanceStylingComparison(comparisonData);
                    this._comparisons.addItem(comparison);
                }
            } else {
                throw new Error("Missing comparisons data from page model");
            }

            this._comparisons.selectFirstItem();
        },

        getComparisons: function() {
            return this._comparisons;
        }
    });

    return PerformanceStyling;
});
