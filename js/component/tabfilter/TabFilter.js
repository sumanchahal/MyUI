define(["mvc/SelectableList", "component/tabfilter/TabFilterItem"], function(SelectableList, TabFilterItem) {

    /**
     * A model to bue used for lists of objects that can be filtered
     *
     * @class TabFilter
     * @extends SelectableList<TabFilterItem>
     *
     * @constructor
     * @param data {Array<TabFilterItem>} A list of tab filters used to initialize the object.
     */

    function TabFilter(data) {
        SelectableList.call(this, data, null);
    }

    TabFilter.prototype = new SelectableList(null, TabFilterItem);
    TabFilter.prototype.parent = SelectableList.prototype;
    TabFilter.prototype.constructor = TabFilter;

    return TabFilter;
});
