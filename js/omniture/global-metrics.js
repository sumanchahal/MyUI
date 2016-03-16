/**
 * Defines global values that are tracked by the analytics framework.
 */
define(["lexus", "jquery", "PointBreak", "underscore"], function(LEXUS, $, PointBreak, _) {
    var global,
        pageData = LEXUS.page,
        pb = new PointBreak();

    window.omni_page_var = window.omni_page_var || {};
    global = window.omni_page_var;

    var $page = $("body");

    /**
     * @public
     * Adds an additional value to the global analytics tags.
     * Useful for dispatching page load tags.
     *
     * @param name {string} name of the variable withouth angle brackets.
     * @param value {string|number} value associated with the name.
     */

    function addGlobalVariable(name, value) {
        if (typeof(value) === "undefined" || value === "" || value === null) {
            value = "<" + name + ">";
        }
        global["<" + name + ">"] = value;
    }


    function getGlobalVariable(name) {
        return global["<" + name + ">"];
    }

    addGlobalVariable("break_point", pb.getCurrentBreakpoint());
    addGlobalVariable("orientation", pb.getCurrentOrientation());

    // use data-model-name if it's defined. otherwise, pull the model name from the page model if it exists.
    if ($page.data("model-name")) {
        addGlobalVariable("model_name", $page.data("model-name"));
    }
    if (typeof(pageData) !== "undefined" && pageData.seriesName) {
        var hybridText = pageData.isHybrid ? " HYBRID" : "";
        addGlobalVariable("model_name", pageData.seriesName + hybridText);
    }

    addGlobalVariable("section", $page.data("section"));
    addGlobalVariable("subsection", $page.data("subsection"));
    addGlobalVariable("page", $page.data("page"));

    // make this function available to the global object.
    global.addGlobalVariable = addGlobalVariable;
    global.getGlobalVariable = getGlobalVariable;

    return global;
});
