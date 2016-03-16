// RequireJS Configuration

require.config({
	"baseUrl" : "/assets/js/",
	"waitSeconds" : 120,

	// Paths are like aliases for referencing modules in require
	"paths" : {
		// RequireJS and its plugins
		"require" : "vendor/require/2.1.8/require",
		"async" : "vendor/require/2.1.8/plugins/async",
		"text" : "vendor/require/2.1.8/text",

		// jQuery and plugins
		"jquery" : "vendor/jquery/1.10.2/jquery",
		"colorbox" : "vendor/jquery/plugin/colorbox/1.4.33/colorbox",
		"dropkick" : "vendor/jquery/plugin/dropkick/1.5.1/dropkick",
        "underscore" : "vendor/underscore/underscore-min",
		"jscrollpane" : "vendor/jquery/plugin/jscrollpane/2.0.18/jscrollpane",
		"lazyload" : "vendor/jquery/plugin/lazyload/1.9.0/lazyload",
		"mousewheel" : "vendor/jquery/plugin/mousewheel/3.1.6/mousewheel",
		"touchSwipe" : "vendor/jquery/plugin/touchSwipe/1.6.5/touchSwipe",
		"transit" : "vendor/jquery/plugin/transit/0.9.9/transit",
		"waypoints" : "vendor/jquery/plugin/waypoints/2.0.3/waypoints",
		"waypoints-sticky" : "vendor/jquery/plugin/waypoints-sticky/2.0.3/waypoints-sticky",
		"jquery-all" : "vendor/jquery/jquery-all",
		"scrollTo" : "vendor/jquery/plugin/scrollTo/scrollTo",
		// LIM 496 change
		"sumoselect" : "vendor/jquery/plugin/sumoselect/sumoselect",

		// Other vendors
		"mbox" : "vendor/adobe/mbox",
		"modernizr" : "vendor/modernizr/2.6.2/modernizr",

		//GreenSock -TweenMax
		"TweenMax" : "vendor/TweenMax/TweenMax.min",

		// Internal code
		"analytics" : "omniture/analytics",
        "ms-analytics" : "omniture/m2-analytics",
		"PointBreak" : "util/PointBreakDefault", // <-- PointBreak actually
		// points to a default
		// implementation that
		// contains the correct
		// breakpoints.
		"resizer" : "util/resizer",

        "model-cookie" : "util/model-cookie"
	// Bundle Modules
	// "mvc": "mvc/mvc-module",
	// "gallery": "component/gallery/gallery-module"

	},

	// Shims are a way to convert global vars into require moudles
	"shim" : {
		// jQuery Plugins (note, some plugins are AMD-ready)
		"colorbox" : {
			"deps" : [ "jquery" ],
			"exports" : "jQuery"
		},
		"dropkick" : {
			"deps" : [ "jquery" ],
			"exports" : "jQuery"
		},
		"jscrollpane" : {
			"deps" : [ "jquery" ],
			"exports" : "jQuery"
		},
		"lazyload" : {
			"deps" : [ "jquery" ],
			"exports" : "jQuery"
		},
		"transit" : {
			"deps" : [ "jquery" ],
			"exports" : "jQuery"
		},

		// Other Vendors
		"mbox" : {
			"exports" : "mbox"
		},
		"modernizr" : {
			"exports" : "Modernizr"
		}
	},

	"modules" : [

	// Global Modules
	{
		"name" : "global",
		"exclude" : [ "modernizr", "util/loadingAnimation", "util/cookie" ],
		"include" : [ "debug", "jquery" ]
	},
	// {
	// "name": "component/gallery/Gallery",
	// "exclude": ["global"],
	// "include": [ "gallery" ]
	// },

	// Pages
	{
		"name" : "page/home/home-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/all-models/all-models-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/all-models-offer/all-models-offer-main",
		"exclude" : [ "global" ]
	},

	// Model pages
	{
		"name" : "page/model/overview/overview-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/accessories/accessories-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/current-offers/current-offers-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/feature-category/feature-category-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/key-features/key-features-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/owner-benefits/owner-benefits-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/packages/packages-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/performance/performance-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/model/specifications/specifications-main",
		"exclude" : [ "global" ]
	},

	// Dealer
	{
		"name" : "page/dealer-locator/dealer-locator-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/dealer/details/details-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/dealer/print/print-main",
		"exclude" : [ "global" ]
	},

	// Compare
	{
		"name" : "page/compare/landing/landing-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/compare/print/print-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/compare/select-competitor/select-competitor-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/compare/select-trim/select-trim-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/compare/side-by-side/side-by-side-main",
		"exclude" : [ "global" ]
	},

	// Leads forms
	{
		"name" : "page/brochure/brochure-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/newsletter/newsletter-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/upcoming/upcoming-main",
		"exclude" : [ "global" ]
	}, {
		"name" : "page/confirmation/confirmation-main",
		"exclude" : [ "global" ]
	},

	// Cpo Pages
    {
        "name": "page/cpo/cpo-overview/cpo-overview-main",
        "exclude": [
            "global"
        ]
    },
    {
        "name": "page/cpo/inventory/inventory-main",
        "exclude": [
            "global"
        ]
    },
    {
        "name": "page/cpo/financing/financing-main",
        "exclude": [
            "global"
        ]
    },
    {
        "name": "page/cpo/compare/compare-main",
        "exclude": [
            "global"
        ]
    },
    {
        "name": "page/cpo/certificate-warranty/certificate-warranty-main",
        "exclude": [
            "global"
        ]
    },
    {
        "name": "page/cpo/models/models-main",
        "exclude": [
            "global"
        ]
    },
    {
        "name": "page/cpo/model-details/model-details-main",
        "exclude": [
            "global"
        ]
    },

	]
});

// Uncomment to trace require configuration to console.
// console.log("require.js config:");
// console.log(requirejs.s.contexts._.config);
