define(["mvc/SelectableList", "mvc/SelectableListItem", "listTest.js"], function (SelectableList, SelectableListItem){
    QUnit.module ("SelectableList");

    QUnit.test("Dependencies", function(assert) {
        assert.ok(SelectableList, "SelectableList exists");
        assert.ok(SelectableListItem, "SelectableListItem exists");
    });

    QUnit.test("Basics & Selection functions", function(assert) {
        var items = [
            new SelectableListItem("a"),
            new SelectableListItem("b"),
            new SelectableListItem("c"),
            new SelectableListItem("d"),
            new SelectableListItem("e")
        ];

        var list = new SelectableList(items, SelectableListItem);
        assert.ok(list instanceof SelectableList, "Constructor works");
        assert.equal(list.getItemAtIndex(1), items[1], "Constructor adds items. Also getItemAtIndex() works.");


        assert.equal(list.getSelectedItem(), null, "By default, nothing is selected unless you specifically select it.");
        list.selectFirstItem();
        assert.equal(list.getSelectedItem(), items[0], "selectFirstItem() === setSelectedItemIndex(0)");
        assert.equal(list.setSelectedItemIndex(1), items[1], "setSelectedItemIndex(i) selects the item at i and returns it");
        list.setSelectedItem(items[2]);
        assert.equal(list.getSelectedItem(), items[2], "setSelectedItem(item) selects item");
        list.setSelectedItemId("d");
        assert.equal(list.getSelectedItem(), items[3], "setSelectedItemId(id) selects an item by its id.");
        assert.equal(list.getSelectedItemId(), "d", "getSelectedItemId() returns id of whatever's selected.");
        list.selectNextItem();
        assert.equal(list.getSelectedItemIndex(), 4, "selectNextItem() selects the next in the list");
        assert.equal(list.getNextItem(), items[0], "going past the bounds of the list wraps around");
        list.deselect();
        assert.equal(list.getSelectedItem(), null, "deselect() removes any selection.");

        assert.equal(list.getItemById("b"), items[1], "getItemById() returns the item with the matching id.");
    });
});