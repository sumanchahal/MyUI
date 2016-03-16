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
                '<section>': 'About',
                '<subsection>': 'Environment',
                '<page>': 'Environment'
            });

            $('.media-image.hero').on('click', function() {
                fireTag('2593.4', {
                    '<section>': 'About',
                    '<subsection>': 'Environment',
                    '<module>': 'Hero',
                    '<action>': 'Raising the Bar Image'
                });
            });

            m2Analytics.init('Environment', moduleMap, actionMap, tagIdMap);
        }
        modules = {
            RENEWABLE: 'MADE FROM RENEWABLE RESOURCES AT LEED-CERTIFIED FACILITIES.',
            LUXURY: 'FIRST IN LUXURY HYBRID TECHNOLOGY THATS SECOND TO NONE.',
            SPONSOR: 'PROUD SPONSOR OF THE ENVIRONMENT.'
        };

        moduleMap = $.extend(subnavMap.moduleMap, {
            'cta-bamboo': modules.RENEWABLE,
            'cta-greener-industry': modules.RENEWABLE,
            'cta-bolder-es-hybrid': modules.LUXURY,
            'cta-green-project-winners': modules.SPONSOR
        });

        tagIds = {
            EXTERNAL: '2593.3',
            INTERNAL: '2593.4',
        };

        tagIdMap = $.extend(subnavMap.tagMap, {
            'cta-bamboo': tagIds.EXTERNAL,
            'cta-greener-industry': tagIds.EXTERNAL,
            'cta-bolder-es-hybrid': tagIds.INTERNAL,
            'cta-green-project-winners': tagIds.EXTERNAL
        });

        $(function() {
            init();
        });
    });
