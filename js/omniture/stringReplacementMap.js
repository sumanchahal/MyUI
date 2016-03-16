/**
 * @file
 * Used in conjunction with analyticsHelper.js
 * When fireTag() is called, any values in the object that is dispatched that match the values
 * in this map will be replaced with their corresponding values.
 *
 * Use this to fix casing or spelling issues as needed.
 *
 * @type {Object}
 *
 * @author Mims Wright
 */
define([], function() {
    return {
        "dealer-locator": "Dealer Locator",
        "key-features": "Key Features",
        "keyfeatures": "Key Features",
        "featureoverlay": "Features Overlay",
        "features": "Features",
        "performance": "Performance",
        "safety": "Safety",
        "technology": "Technology",
        "comfort-design": "Comfort & Design",
        "packages": "Packages",
        "accessories": "Accessories",

        // breakpoints
        "small": "Small",
        "medium": "Medium",
        "large": "Large",
        "max": "Max",

        // orientation
        "landscape": "Landscape",
        "portrait": "Portrait",

        // content type
        "image": "Image",
        "video": "Video",

        // all models view_type
        "grid": "Grid",
        "list": "List"
    };
});
