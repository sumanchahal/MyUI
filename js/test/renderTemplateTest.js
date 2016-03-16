require ([
        "util/renderTemplate"
    ], function (
        renderTemplate
    ) {

    QUnit.module ("renderTemplate()");

    QUnit.test("renderTemplate()", function(assert) {
        var testTemplate = "Hello, {{who}}";
        assert.equal(typeof renderTemplate, "function", "renderTemplate() is a function");
        assert.equal(renderTemplate(testTemplate, {who: "world"}), "Hello, world" , "Basic string replacement works.");
        assert.equal(renderTemplate(testTemplate, {foo: "world"}), "Hello, {{who}}" , "Ignores unfound strings.");

        assert.equal(renderTemplate("{{foo}}{{foo}}{{foo}}", {foo: "!"}), "!!!" , "Replaces all instances.");
        assert.equal(renderTemplate("{{int}}", {int: 123}), "123" , "Implicitly converts to strings");
    });

});
