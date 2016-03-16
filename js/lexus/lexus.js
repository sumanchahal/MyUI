$(window).load(function() {
    $('.disc').text('*').tipTip({
        activation: "click",
        keepAlive: !0,
        defaultPosition: "top"
    });
    $("a.disc").click(function() {
        if (subsectionName === "Owner Benefits" || subsectionName === "Warranty" || subsectionName === "Service") return !1;
        var tagid = $("body.lfa").length ? "2497.7" : "2470.8";
        if (modelName === "PE") {
            modelName = "F Performance";
            sectionName = "Home Page";
        }
        fireTag(tagid, {
            "<model_name>": modelName,
            "<section>": sectionName
        });
    });
    $("#tiptip_content").click(function() {
        $("#tiptip_holder").hide();
    });
    $(document).click(function() {
        $("#tiptip_holder").hide();
        $("#navModelSelect").slideUp(300, function() {
            $("#categories").find("li").removeClass("active");
            $(this).parent().removeClass("active");
        });
    });
});