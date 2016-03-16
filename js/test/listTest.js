define(["mvc/List", "ObservableTest.js"],
    function (List) {
        QUnit.module ("List");
        QUnit.test("List type checking", function () {
                equal(new List(["a"], String).getItemAtIndex(0), "a", "String type works");
                equal(new List([1], Number).getItemAtIndex(0), 1, "Number type works");
                equal(new List([true], Boolean).getItemAtIndex(0), true, "Boolean type works");
                var a = [];
                equal(new List([a], Array).getItemAtIndex(0), a, "Array type works");
                var o = {};
                equal(new List([o], Object).getItemAtIndex(0), o, "Object type works");

                function Foo () {
                    this.bar = "baz";
                }
                var f = new Foo();
                equal(new List([f], Foo).getItemAtIndex(0), f, "Arbitrary type works.");

                equal(new List([null, "a"], String).getItemAtIndex(0), null, "null works for any type");
                equal(new List([null, {}], Object).getItemAtIndex(0), null, "null works for any type");

                function Bar () {

                }
                Bar.prototype = new Foo();
                var b = new Bar();
                equal(new List([b], Foo).getItemAtIndex(0), b, "Subclasses work for superclass.");
                throws( function () { new List([f], Bar).getItemAtIndex(0); }, "Superclass doesn't work for subclass.");
            }
        );

        QUnit.test("Conversion", function(assert) {
            var list = new List(["A","B","C"],String);
            assert.equal(list.toString(), "A, B, C", "toString converts list to a string similarly to how Array.toString() works.");
            assert.deepEqual(list.toArray(), ["A","B","C"], "toArray() returns an array of the values in the list.");
        });

        QUnit.test("CRUD", function(assert) {
            var list = new List([], String);
            assert.equal(list.getLength(), 0, "getLength() returns length");
            list.addItem("a");
            list.addItem("b");
            list.addItem("c");
            list.addItem("d");

            assert.equal(list.getIndexOfItem("b"), 1, "getIndexOfItem()");
            assert.equal(list.getIndexOfItem("bogus"), -1, "getIndexOfItem() fails with -1");

            assert.equal(list.hasItem("b"), true, "hasItem() is similar to getIndexOfItem()");
            assert.equal(list.hasItem("bogus"), false, "hasItem() is similar to getIndexOfItem()");

            assert.equal(list.getItemAtIndex(1), "b", "addItem() and getItemAtIndex() work.");
            var removed = list.removeItemAtIndex(1);
            assert.equal(removed, "b", "removeItemAtIndex() returns removed value");
            assert.equal(list.getItemAtIndex(1), "c", "removeItemAtINdex() works");

            removed = list.removeItem("d");
            assert.equal(removed, "d", "removeItem() returns removed value");
            assert.equal(list.getLength(), 2, "removeItem() works");

            list.setItemAtIndex(2, "e");
            assert.equal(list.getItemAtIndex(2), "e", "Set a new item at the last index");
            list.setItemAtIndex(2, "f");
            assert.equal(list.getItemAtIndex(2), "f", "Overwrite an item");

        });
    }
);