define(["component/tabfilter/TabFilter", "component/tabfilter/TabFilterItem", "mvc/SelectableListItem", "mvc/SelectableList", "selectableListTest.js"], function (TabFilter, TabFilterItem, SelectableListItem, SelectableList) {
    var larry, curly, moe, tabs;

    QUnit.module("TabFilter", {
        setup: function () {
            larry = new TabFilterItem("larry", "Larry");
            curly = new TabFilterItem("curly", "Curly");
            moe = new TabFilterItem("moe", "Moe");

            tabs = new TabFilter([larry, curly, moe]);
        }
    });

    QUnit.test ("TabFilter, TabFilterItem and SelectableListItem", function (assert) {
        assert.ok (larry instanceof TabFilterItem, "Larry is a TabFilterItem");
        assert.ok (larry instanceof SelectableListItem, "TabFilterItem is a SelectableListItem");
        assert.ok (tabs instanceof TabFilter, "tabs is a TabFilter");
        assert.ok (tabs instanceof SelectableList, "TabFilter is a SelectableList");

        assert.ok (!tabs.getSelectedItem(), "Nothing selected by default.");
        tabs.setSelectedItem(larry);
        assert.equal (tabs.getSelectedItem(), larry, "get and set selected item work.");

        assert.throws( function () { tabs.addItem("FOO"); }, "Items added to TabFilter must be TabFilterItems");
    });

    QUnit.asyncTest("Multiple instances", function (assert){
        QUnit.expect(2);

        var a = new TabFilter();
        var b = new TabFilter();

        a.on("test", onTestA);
        b.on("test", onTestB);

        a.trigger("test", [a]);
        b.trigger("test", [b]);

        function onTestA (observable) {
            assert.equal(observable, a, "Only the triggered object dispatches an event.");
        }
        function onTestB (observable) {
            assert.equal(observable, b, "Only the triggered object dispatches an event.");
        }

        QUnit.start();
    });
});