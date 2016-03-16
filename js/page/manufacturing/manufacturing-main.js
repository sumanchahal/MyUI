require([
        'jquery',
        'analytics',
        'component/ResponsiveImages',
        'omniture/m2-analytics',
        'omniture/subnavMap',
        'modules/menu-tile',
        'modules/media-tile'
    ],

    function(
        $,
        analytics,
        ResponsiveImages,
        m2Analytics,
        subnavMap,
        menuTile,
        mediaTile
    ) {
        var modules,
            moduleMap,
            tagIds,
            tagIdMap,
            actionMap;

        function init() {
            console.log(subnavMap);
            // Init code goes here
            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            //Page loading tag
            fireTag('2593.1', {
                '<section>': 'About',
                '<subsection>': 'Manufacturing',
                '<page>': 'Manufacturing'
            });

            $('.media-image.hero').on('click', function() {
                fireTag('2593.4', {
                    '<section>': 'About',
                    '<subsection>': 'Manufacturing',
                    '<module>': 'Hero',
                    '<action>': 'Finding Innovation Image'
                });
            });

            m2Analytics.init('Manufacturing', moduleMap, actionMap, tagIdMap);
        }

        modules = {
            CARBON: "THE WORLD'S FIRST 3-D CARBON FIBER LOOM.",
            PREMIUM: 'PREMIUM MATERIALS. PERFECTED.',
            EXPERTISE: 'BUILDING ON OUR EXPERTISE AND PROCESS.'
        };

        moduleMap = $.extend(subnavMap.moduleMap, {
            'cta-video-carbon-loom': modules.CARBON,
            'cta-video-shimamoku': modules.PREMIUM,
            'cta-video-takumi': modules.EXPERTISE
        });

        tagIds = {
            EXTERNAL: '2593.3',
            INTERNAL: '2593.4',
        };

        tagIdMap = $.extend(subnavMap.tagMap, {
            'cta-video-carbon-loom': tagIds.EXTERNAL,
            'cta-video-shimamoku': tagIds.EXTERNAL,
            'cta-video-takumi': tagIds.EXTERNAL
        });

        $(function() {
            init();
        });
    });
