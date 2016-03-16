/**
 * Tests for stringUtil.
 * @author mwright
 */
define(["util/stringUtil"], function(stringUtil) {

    // module sets the category of the tests that are about to run.
    QUnit.module ("stringUtil");

    QUnit.test("Test replaceStringWithMap().", function(assert) {
        var map = {
            "mims": "Mimsy-poo",
            "abc": "Do Re Mi"
        };

        var obj = {};

        assert.equal(stringUtil.replaceStringWithMap("mims", map), "Mimsy-poo", "replaceStringWithMap() replaces strings if they match a value in a map");
        assert.equal(stringUtil.replaceStringWithMap("ABC", map), "Do Re Mi", "replaceStringWithMap() is case insensitive by default.");
        assert.equal(stringUtil.replaceStringWithMap("ABC", map, true), "ABC", "replaceStringWithMap() can be made case-sensitive with a flag.");
        assert.equal(stringUtil.replaceStringWithMap("bogus", map), "bogus", "replaceStringWithMap() returns original string if it's not found in the map");
        assert.equal(stringUtil.replaceStringWithMap(obj, map), obj, "replaceStringWithMap() returns original object if it's not a string");
    });

    QUnit.test("Test replaceAllStringsInObjectWithMap()", function(assert) {
        var map = {
            "specs":    "Specifications",
            "is":       "IS",
            "test":     "Test"
        };

        var obj = {
            "<section>":    "specs",
            "<model>":      "Is",
            "<page>":       "Features"
        };

        var results = stringUtil.replaceAllStringsInObjectWithMap(obj, map);

        assert.equal(results["<section>"], "Specifications", "All strings held within the object are replaced");
        assert.equal(results["<model>"], "IS", "All strings held within the object are replaced");
        assert.equal(results["<page>"], "Features", "Unmapped values are untouched");
        assert.notEqual(results, obj, "The resulting object is not the original");
        assert.equal(stringUtil.replaceAllStringsInObjectWithMap(obj,map,true)["<model>"], "Is", "Case sensitivity can be enabled with a flag.");
    });

    QUnit.test("capitalizeWithoutChangingTrimName", function(assert) {
        assert.equal(stringUtil.capitalizeWithoutChangingTrimName("400h"), "400h", "h's following a number are kept lowercase");
        assert.equal(stringUtil.capitalizeWithoutChangingTrimName("400h is a great car"), "400h IS A GREAT CAR", "it doesn't matter where the h comes in the string");
        assert.equal(stringUtil.capitalizeWithoutChangingTrimName("aBcDe"), "ABCDE", "Anything else gets capitalized");
        assert.throws(function () {
            stringUtil.capitalizeWithoutChangingTrimName([]);
        }, "any non-string throws an error.");
    });

    QUnit.test("capitalizeWithoutChangingTrimName", function(assert) {
        assert.equal(stringUtil.wrapHybridHWithLowercaseSpan("400h"), "400<span class='hybrid-h'>h</span>", "h's following a number are kept lowercase");
        assert.equal(stringUtil.wrapHybridHWithLowercaseSpan("400h is a great car"), "400<span class='hybrid-h'>h</span> is a great car", "it doesn't matter where the h comes in the string");
        assert.equal(stringUtil.wrapHybridHWithLowercaseSpan("aBcDe"), "aBcDe", "Anything else is ignored");
        assert.throws(function () {
            stringUtil.wrapHybridHWithLowercaseSpan([]);
        }, "any non-string throws an error.");
    });


});
