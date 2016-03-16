function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getWidth(e) {
    winWidth = $(window).width();
    try {
        $("#tiptip_holder").hide();
        if (currentState != "mobile" && winWidth <= 959) {
            loadMobileDivs();
            formatMobile();
            currentState = "mobile";
        } else if (currentState != "desktop" && winWidth > 959) {
            $("#mobileMenu").is(":visible") && $("#mobileMenuButton").click();
            loadDesktopDivs();
            formatDesktop();
            currentState = "desktop";
        }
    } catch (e) {}
}

function mobileImage(path) {
    var i = path.lastIndexOf("."), mobilePath = path.substring(0, i) + "_mobile" + path.substring(i);
    return mobilePath;
}

function ucwords(str) {
    strVal = "";
    str = str.split(" ");
    for (var chr = 0; chr < str.length; chr++) strVal += str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length) + " ";
    return strVal;
}

function loadDesktopDivs() {

return false;
    $.each($("img"), function() {
        $(this).data("path") != undefined && $(this).attr("src", $(this).data("path"));
    });
    topoffset = $("#nav2").offset();
    $(".showMobile").hide();
    $(".mobileOnly").hide();
    $(".responsive").removeClass("isMobile");
    $(".responsive").addClass("isDesktop");
    $(".showDesktop").show();
    $(".menuArrow").removeClass("activated");
    $("#section_container").show();
}

function loadMobileDivs() {
	return false;
    $.each($("img"), function() {
        $(this).data("path") != undefined && $(this).attr("src", mobileImage($(this).data("path")));
    });
    $(".showDesktop").hide();
    $(".desktopOnly").hide();
    $(".responsive").removeClass("isDesktop");
    $(".responsive").addClass("isMobile");
    $(".expandThis").show();
    $(".showMobile").show();
}

(function(root, name, factory) {
    var dep = root.jQuery || root.Zepto || root.ender || root.elo;
    typeof module != "undefined" && module.exports ? module.exports = factory(dep) : root[name] = factory(dep);
})(this, "responsive", function($) {
    function _setState() {
        $.each(viewports, function(state, width) {
            if ($(window).width() >= width[0] && $(window).width() <= width[1]) {
                if (state != currentViewportState) {
                    currentViewportState = responsive.currentState = state;
                    var moduleStateCallback = eval("[_init" + currentViewportState + "]");
                    $.isFunction(moduleStateCallback[0]) && moduleStateCallback[0]();
                    $(window).trigger("viewportChange", [ currentViewportState ]);
                }
                return !0;
            }
        });
    }
    function _initDesktop() {}
    function _initMobile() {
        $("body").hasClass("features") && ($("body").hasClass("isf") || $("body").hasClass("lfa") || $("body").hasClass("lx") || $("body").hasClass("cth")) && $(".modelSelectDiv").hide();
    }
    function getCurrentState() {
        return responsive.currentState;
    }
    function init() {
        _setState();
        $(window).on("resize", function() {
            _setState();
        });
    }
    if (typeof $ != "function") try {
        console.log("Response was unable to run due to missing dependency.");
    } catch (e) {}
    var viewports = {
        Mobile: [ 0, 959 ],
        Desktop: [ 960, 1e4 ]
    }, currentViewportState = null, uagent = navigator.userAgent.toLowerCase(), isDesktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/), isiPhone = uagent.indexOf("iphone") > 0, isiPad = uagent.indexOf("ipad") > 0, isAndroid = uagent.indexOf("android") > 0;
    responsive = {
        init: init,
        getCurrentState: getCurrentState,
        currentState: currentViewportState,
        isDesktop: isDesktop,
        isiPad: isiPad,
        isiPhone: isiPhone,
        isAndroid: isAndroid
    };
    return responsive;
});

var uagent = navigator.userAgent.toLowerCase(), winWidth, currentState = "unknown", savePosition = 0;

$(document).ready(function() {
    getWidth();
    !isiPhone && !isiPad && !isiPod && $(window).bind("resize", getWidth);
    var isMouseInNav = !1, category = "";
    $(".navCategory").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $("#tiptip_holder").hide();
        category = $(this).text();
        category = category.replace(/[^a-zA-Z]/g, "");
        $(this).focus();
        if ($("#navModelSelect").is(":hidden")) {
            $(this).parent().addClass("active");
            $(".modelCategoryRow").hide();
            $("#category_" + category).show();
            $("#navModelSelect").slideDown(300);
        } else if (!$(this).parent().hasClass("active")) {
            $("#categories li").removeClass("active");
            $(this).parent().addClass("active");
            $(".modelCategoryRow").hide();
            $("#category_" + category).fadeIn(1e3);
        }
    }).mouseenter(function() {
        isiPad || (isMouseInNav = !0);
    }).mouseleave(function() {
        isMouseInNav = !1;
    });
    $("#navModelSelectWrap").click(function(e) {
        if ($("#navModelSelect").is(":hidden")) {
            $(this).parent().addClass("active");
            $(".modelCategoryRow").hide();
            $("#category_" + category).show();
            $("#navModelSelect").slideDown(300);
        } else if (!$(this).parent().hasClass("active")) {
            $("#categories li").removeClass("active");
            $(this).parent().addClass("active");
            $(".modelCategoryRow").hide();
            $("#category_" + category).fadeIn(1e3);
        }
    });
    $("#navModelSelectWrap").on("click.modelSelect", ".navModel", function(ev) {
        ev.preventDefault();
        var tag = "2477.1", model = $(this).attr("id").replace("icon_", "");
        fireTag(tag, {
            "<model_name>": model
        });
        location.href = $(this).data("href");
    });
    isiPad && $(".navModel").swipe({
        click: function(ev, target) {
            $(this).trigger("click");
        }
    });
    typeof modelName != "undefined" ? modelName != "CO" && $("#mobileMenuList").append('<li class="mobileBanner"><p>' + modelName + "</p></li>") : $("#mobileMenuList").append('<li class="mobileBanner"><p>' + sectionName + "</p></li>");
    //Huge: do not append menu items to global nav
//    $("#nav2ButtonList").find("li.mobileMenuItem").each(function() {
//        $(this).addClass("expandable").clone().appendTo("#mobileMenuList");
//    });
    $("#mobileMenuList").find("li.mobileMenuItem").children("a").each(function() {
        if ($(this).parent("li").hasClass("milestones")) return;
    });
    $("#mobileMenuList .mobileMenuItem").each(function() {
        var $this = $(this), $title = $("a:first", $this), $subsection = $(".subsection li", $this);
        $subsection.length > 1 ? $(this).children("a").replaceWith("<p>" + $(this).children("a").text() + "</p>") : $title.attr("href") === $("a", $subsection).attr("href") && $title.text === $("a", $subsection).text && $subsection.remove();
    });
    
    $("#mobileMenuList").append('<li class="mobileBanner"><p>LEXUS</p></li>');
    $("#mobileMenuList").append('<li class="mobileMenuItem outlink"><p><a href="all-models-alt.php">ALL VEHICLES</a></p></li>');
    $("#mobileMenuList").append('<li class="mobileMenuItem outlink"><p><a href="/dealers">Find a dealer</a></p></li>');
    $("#mobileMenuList").append('<li class="mobileMenuItem outlink"><p><a href="https://secure.drivers.lexus.com/lexusdrivers">Owner\'s resources</a></p></li>');
    $(".expandable").click(function() {
        if ($("#" + $(this).attr("rel")).is(":hidden")) {
            $(".subsection").slideUp(300);
            $("#" + $(this).attr("rel")).slideDown(300);
            $(this).find(".menuArrow").addClass("activated");
        }
    });
    $(".expandable p").on("click", function() {
        var subsection = $.trim($(this).parent("li").find("ul.subsection li a").eq(0).text()), section = $.trim($(this).closest("li[data-section]").data("section")), tagID;
        modelName === "LFA" ? tagID = "2497.2" : tagID = "2470.4";
        fireTag(tagID, {
            "<model_name>": modelName,
            "<section>": section.capitalize(),
            "<subsection>": subsection
        });
    });
    $(".expandable a.overview").on("click", function() {
        var subsection = $.trim($(this).text()), section = $.trim($(this).text()), tagID;
        modelName === "LFA" ? tagID = "2497.2" : tagID = "2470.4";
        if (responsive.currentState === "Mobile") {
            if (subsectionName === "Owner Benefits" || subsectionName === "Warranty" || subsectionName === "Service") return;
            fireTag(tagID, {
                "<model_name>": modelName,
                "<section>": section.capitalize()
            });
        }
    });
    $(".expandable a").on("click", function() {
        var subsection = $.trim($(this).text()), section = $.trim($(this).text()), tagID;
        (subsectionName === "Owner Benefits" || subsectionName === "Warranty" || subsectionName === "Service") && responsive.currentState === "Mobile" && fireTag("2531.9", {
            "<subsection>": section.capitalize(),
            "<section>": section.capitalize()
        });
    });
    $(".subsection li").on("click", function() {
        var subsection = $.trim($(this).find("a").text()), section = $.trim($(this).closest("li[data-section]").data("section")), tagID;
        modelName === "LFA" ? tagID = "2497.3" : tagID = "2470.5";
        fireTag(tagID, {
            "<model_name>": modelName,
            "<section>": section.capitalize(),
            "<subsection>": subsection
        });
    });
    $(".outlink p a").on("click", function() {
        var section = $.trim($(this).text().capitalize()), tagID;
        subsectionName === "Owner Benefits" || subsectionName === "Warranty" || subsectionName === "Service";
        modelName === "LFA" ? tagID = "2497.2" : tagID = "2470.4";
        fireTag(tagID, {
            "<model_name>": modelName,
            "<section>": section.capitalize()
        });
    });
    $("body.explore").length > 0 && $("#Section1.subsection li a").click(function(e) {
        $(".section").show();
        $("#mobileMenu").slideUp(300);
        $("#mobileMenuButtonArrow").removeClass("activated");
        $("#Section0").addClass("expandThis").show();
    });
    $("body.explore.lfa").length > 0 && $("#Section0.subsection li a").click(function(e) {
        $(".section").show();
        $("#mobileMenu").slideUp(300);
        $("#mobileMenuButtonArrow").removeClass("activated");
        $("#Section0").addClass("expandThis").show();
    });
    $("#mobileMenuButton").click(function() {
        if ($("#mobileMenu").is(":hidden")) {
            $(".section_container").hide();
            $(".section").hide();
            $(".module").hide();
            $("#visualizerModule").hide();
            $("#model-section").hide();
            $("#player").hide();
            $(".mobileFooter").hide();
            $("#mobileMenu").slideDown(500, function() {
                window.scrollTo(0, 1);
            });
            $("#mobileMenuButtonArrow").addClass("activated");
            $(".module").show();
        } else {
            $(".section_container").show();
            $(".section").show();
            $(".module").show();
            $("#visualizerModule").show();
            $("#model-section").show();
            $(".mobileFooter").show();
            $("#mobileMenu").slideUp(300);
            $("#mobileMenuButtonArrow").removeClass("activated");
        }
    });
});