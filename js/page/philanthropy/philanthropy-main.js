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
                '<subsection>': 'Philanthropy',
                '<page>': 'Philanthropy'
            });

            $('.media-image.hero').on('click', function() {
                fireTag('2593.4', {
                    '<section>': 'About',
                    '<subsection>': 'Philanthropy',
                    '<module>': 'Hero',
                    '<action>': 'Making a Difference Image'
                });
            });

            m2Analytics.init('Philanthropy', moduleMap, actionMap, tagIdMap);
        }
        modules = {
            IMPROVE: 'SUPPORTING ORGANIZATIONS THAT IMPROVE CHILDRENS LIVES',
            COMMUNITY: 'OUR DEALERS ALSO SERVICE THE COMMUNITY.'
        };

        moduleMap = $.extend(subnavMap.moduleMap, {
            'cta-eco-challenge': modules.IMPROVE,
            'cta-scholastic-partnership': modules.IMPROVE,
            'cta-tee-up-action': modules.COMMUNITY
        });

        tagIds = {
            EXTERNAL: '2593.3',
            INTERNAL: '2593.4',
        };

        tagIdMap = $.extend(subnavMap.tagMap, {
            'cta-eco-challenge': tagIds.INTERNAL,
            'cta-scholastic-partnership': tagIds.EXTERNAL,
            'cta-tee-up-action': tagIds.INTERNAL
        });

        $(function() {
            init();
        });
    });
