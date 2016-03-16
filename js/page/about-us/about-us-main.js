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
            // Init code goes here
            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            //Page loading tag
            fireTag('2593.1', {
                "<section>": "About",
                "<subsection>": "About Us",
                "<page>": "About Us"
            });

            $('.media-image.hero').on('click', function() {
                fireTag('2593.4', {
                    '<section>': 'About',
                    '<subsection>': 'About Us',
                    '<module>': 'Hero',
                    '<action>': 'Us in Lexus Image'
                });
            });

            m2Analytics.init('About', moduleMap, null, tagIdMap);
        }

        moduleMap = $.extend(subnavMap.moduleMap, {
            'cta-shareholder': 'Investor Relations Module',
        });

        tagIds = {
            EXTERNAL: '2593.3',
            INTERNAL: '2593.4',
        };

        tagIdMap = $.extend(subnavMap.tagMap, {
            'cta-shareholder': tagIds.EXTERNAL
        });

        $(function() {
            init();
        });
    });
