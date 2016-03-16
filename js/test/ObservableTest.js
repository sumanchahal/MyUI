define(["mvc/Observable"], function (Observable) {
    var o;

    module ("Observable", {
        setup: function () {
            o = new Observable();
        },
        teardown: function () {
            o = null;
        }
    });

    asyncTest ("Observable", function () {
        expect(19);

        ok( !o.hasListeners("test"), "No listeners to begin with.");

        o.on("test", onTest);
        ok( o.hasListeners("test"), "hasListeners() returns true after adding a listener.");
        ok( !o.hasListeners("wrong"), "hasListeners() still returns false for other eventTypes.");

        o.trigger("test", [1,2,3]);

        o.trigger("BOGUS"); // doesn't throw an error.


        var numListenersBefore = o._listeners.test.length;
        o.on("test", onTest);
        var numListenersAfter = o._listeners.test.length;
        equal(numListenersBefore, numListenersAfter, "You can't add the same listener twice." );

        o.off("test", onTest);
        equal(o._listeners.test.length, 0, "Removed with off()");

        function onTest() {
            ok (true, "onTest is triggered when test event is triggered.");
            deepEqual([].slice.call(arguments, 0), [1,2,3], "Values array are passed into the listener as individual arguments.");
        }

        var failObject = {};
        var foo = {};
        o.on("test2", onTest2, window);
        o.on("test2", onTest2, foo);
        equal(o.getListeners("test2")[0].scope, window, "getListeners() returns the listeners for an event.");
        equal(o.getListeners("test2", foo)[0].scope, foo, "getListeners() takes an optional scope var that filters the list.");

        ok( o.hasListeners("test2", foo), "hasListeners() returns true with a real scope var.");
        ok( o.hasListeners("test2"), "hasListeners() returns true without a scope var if listener was registered without one.");
        ok(!o.hasListeners("test2", failObject), "hasListeners() returns false with a fake scope var.");
        equal(o._listeners.test2.length, 2, "Using a different scope allows you to use the same listener function twice.");
        o.trigger("test2");

        o.off("test2", onTest2);
        equal(o._listeners.test2.length, 2, "Not providing a scope to off() only removes listeners with no scope.");

        o.off("test2", onTest2, foo);
        equal(o._listeners.test2.length, 1, "off() works when you use a scope object.");

        o.off("test2", onTest2, failObject);
        equal(o._listeners.test2.length, 1, "If you remove a listener from a scope that doesn't exist, nothing happens.");


        function onTest2() {
            ok(true, "This should fire twice!");
        }

        o.trigger("test");
        ok (true, "The off function works or else the test would fail due to too many assertions.");

        start();
    });

    asyncTest("Multiple instances", function (){
        expect(2);

        var a = new Observable();
        var b = new Observable();

        a.on("test", onTestA);
        b.on("test", onTestB);

        a.trigger("test", [a]);
        b.trigger("test", [b]);

        function onTestA (observable) {
            equal(observable, a, "Only the triggered object dispatches an event.");
        }
        function onTestB (observable) {
            equal(observable, b, "Only the triggered object dispatches an event.");
        }

        start();
    });
});