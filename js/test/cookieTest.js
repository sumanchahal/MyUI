define(["util/cookie"], function (cookie) {
    module("Cookie.js");

    test ("Dependencies", function () {
       ok (cookie, "Cookie util is loaded and not null.");
       equal (typeof cookie.get, "function", "Cookie has a get() function.");
    });

    test ("Setting and retrieving values", function () {
        var personLabel = "person";
        var personValue = "mims";
        cookie.set(personLabel, personValue);

        equal(cookie.get(personLabel), personValue, "I set a cookie and then retrieved it.");

        cookie.set("  person     ", personValue);
        equal(cookie.get(personLabel), personValue, "Trims whitespace correctly around the cookie name");

        throws (function () {
            cookie.set(personLabel);
        }, "cookie.set() requires two paramerters");

        cookie.set ("array", [1,2,'buckle my shoe']);
        equal(cookie.get("array"), "1,2,buckle my shoe", "set() expects a string but other types will be implicitly cast to strings.");
    });
});