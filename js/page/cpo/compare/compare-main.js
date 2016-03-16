require([
    "jquery",
    "PointBreak",
    "component/social/ShareOverlay",
    "dropkick",
    "analytics",
    "page/cpo/cpoNav"
], function(
    $,
    PointBreak,
    ShareOverlay,
    dropkick,
    analytics,
    cpoNav
) {
    var pb, $select, hasChanged = false;

    function init() {
        //$('#cpo-compare-table').find('th:last-child').on('click', function() {
        //    $('.dk_toggle').click();
        //});
        var nav = new cpoNav();
        pb = new PointBreak();
        pb.addChangeListener(onResize);
        // trigger a change event
        pb.onResize();

        $select = $('th .select-manufacturer');
        $select.dropkick({
            autoWidth: false,
            dropdownTemplate: ['<div class="dk_container" id="dk_container_{{ id }}" tabindex="{{ tabindex }}" aria-hidden="true">',
                '<a class="dk_toggle dk_label">{{ label }}</a>',
                '<div class="dk_options">',
                '<ul class="dk_options_inner" role="main" aria-hidden="true">',
                '</ul>',
                '</div>',
                '</div>'
            ].join("")
        });
        $(".dk_toggle").addClass("fresh");
        $select.on("change", changeManufacturer);

        initShareOverlay();
    }

    function initShareOverlay() {
        var $overlayContext = $("#nav-share-overlay"),
            $shareButton = $(".subnav a.share");
        var share = new ShareOverlay($overlayContext, $shareButton, LEXUS.social);
        var $secondaryNavShare = $('.nav-footer li a:contains("SHARE")');
        $secondaryNavShare.on('click', $.proxy(share.showShareOverlay, share));
        var $mobileNavShare = $('.small-nav-wrapper a.share');
        $mobileNavShare.on('click', $.proxy(share.showShareOverlay, share));
    }

    function onResize(event) {
        switch (event.newBreakpoint) {
            case PointBreak.SMALL_BREAKPOINT:
                break;
            case PointBreak.MED_BREAKPOINT:
                break;
            default:
        }
    }

    function changeManufacturer() {
        $(".dk_toggle").removeClass("fresh");
        if (!hasChanged) {
            hasChanged = true;
            $('#cpo-compare-table .dk_toggle').addClass('competitor');
        }
        if (!$('.comp:visible')) {
            $('.select-comp').addClass('empty');
        }
        var selectedMenu = $select.val();
        analytics.helper.fireLeadCPOButtons("Compare Manufacturer", "Select Manufacturer", selectedMenu);
        $('.comp').hide();

        $('.comp.' + selectedMenu).show();
    }

    init();
});
