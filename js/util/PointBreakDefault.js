/**
 * Exactly the same as PointBreak but with the default breakpoints
 * pre-programmed into it.
 *
 * Use this version and never require "pointbreak" on its own.
 *
 * @author Mims Wright
 */
define(["util/PointBreak"], function(PB) {

    PB.SMALL_MAX = 640;
    PB.MED_MAX = 959;
    PB.LARGE_MAX = 1204;

    PB.SMALL_BREAKPOINT = "small";
    PB.MED_BREAKPOINT = "medium";
    PB.LARGE_BREAKPOINT = "large";
    PB.XLARGE_BREAKPOINT = PB.MAX_BREAKPOINT;

    PB.defaultBreakpoints = {
        "small": PB.SMALL_MAX,
        "medium": PB.MED_MAX,
        "large": PB.LARGE_MAX
    };

    return PB;
});
