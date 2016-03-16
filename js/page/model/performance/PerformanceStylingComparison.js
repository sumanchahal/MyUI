define([
    "jquery",
    "component/tabfilter/TabFilterItem"
], function(
    $,
    TabFilterItem
) {

    /**
     * @class PerformanceStylingComparison
     * @extends TabFilterItem
     * @param data {json}
     * @constructor
     */
    var PerformanceStylingComparison = function(data) {
        TabFilterItem.call(this, data.comparisonTitle);
        this._beforeImage = null;
        this._beforeLabel = null;
        this._afterImage = null;
        this._afterLabel = null;
        this._beforeColor = null;
        this._afterColor = null;

        this.init(data);
    };

    PerformanceStylingComparison.prototype = new TabFilterItem();
    PerformanceStylingComparison.prototype.parent = TabFilterItem.prototype;
    PerformanceStylingComparison.prototype.constructor = TabFilterItem;

    $.extend(PerformanceStylingComparison.prototype, {
        init: function(data) {
            this.setBeforeImage(data.beforeImage);
            this.setBeforeLabel(data.beforeLabel);
            this.setBeforeColor(data.beforeColor);
            this.setAfterImage(data.afterImage);
            this.setAfterLabel(data.afterLabel);
            this.setAfterColor(data.afterColor);
        },

        getBeforeLabel: function() {
            return this._beforeLabel;
        },
        setBeforeLabel: function(beforeLabel) {
            this._beforeLabel = beforeLabel;
        },

        getAfterLabel: function() {
            return this._afterLabel;
        },
        setAfterLabel: function(afterLabel) {
            this._afterLabel = afterLabel;
        },

        getBeforeImage: function() {
            return this._beforeImage;
        },
        setBeforeImage: function(beforeImage) {
            this._beforeImage = beforeImage;
        },

        getAfterImage: function() {
            return this._afterImage;
        },
        setAfterImage: function(afterImage) {
            this._afterImage = afterImage;
        },

        getBeforeColor: function() {
            return this._beforeColor;
        },
        setBeforeColor: function(beforeColor) {
            this._beforeColor = beforeColor;
        },

        getAfterColor: function() {
            return this._afterColor;
        },
        setAfterColor: function(afterColor) {
            this._afterColor = afterColor;
        }

    });

    return PerformanceStylingComparison;
});
