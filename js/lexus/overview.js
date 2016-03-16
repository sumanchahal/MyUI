/**************
 * Overview page specific functions
 *
 * instantiates appropriate modules
 *
 **************/$(".module.slides").Slider();

$(".module.static").Static();

$(".module.slides").data("firetag", "2470.2");

$(".module.features").data("firetag", "2470.3");

$(".module.promos").data("firetag", "2470.3");

$(document).ready(function() {
    $(".overview .col3 li").each(function() {
        var e = $(this).children(".top").children("h3").children("a").text();
        e = e.replace("RWD", "");
        e = e.replace("AWD", "");
        e = e.replace("FWD", "");
        $(this).children(".top").children("h3").children("a").text(e);
    });
    $("li.models h3 a, div.top > a").click(function() {
        fireTag("2470.3", {
            "<model_name>": modelName,
            "<module>": $(this).closest(".module").data("module-name"),
            "<action>": "Explore"
        });
    });
    $(".promo img").click(function() {
        $(this).parent("li").children(".action").trigger("click");
        window.location.assign($(this).parent("li").children(".action").data("href"));
    });
    $(".action").click(function() {
        fireTag("2470.3", {
            "<model_name>": modelName,
            "<module>": $(this).closest(".module").data("module-name"),
            "<action>": $(this).data("action")
        });
    });
});