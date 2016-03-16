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
                '<subsection>': 'Technology',
                '<page>': 'Technology'
            });

            $('.media-image.hero').on('click', function() {
                fireTag('2593.4', {
                    '<section>': 'About',
                    '<subsection>': 'Technology',
                    '<module>': 'Hero',
                    '<action>': 'Dreaming Big Image'
                });
            });

            m2Analytics.init('Technology', moduleMap, actionMap, tagIdMap);
        }

        modules = {
            HOVERBOARD: 'WE NEVER TAKE A BREAK FROM TECHNOLOGICAL BREAKTHROUGHS.',
            TEST: 'WE PUT OUR VEHICLES TO THE TEST. AND THEN TEST THEM AGAIN.',
            RESEARCH: 'RESEARCH AND DEVELOPMENT. WHERE TECHNOLOGY AND ARTISTRY BLUR.',
            HERITAGE: 'A PROVEN HERITAGE OF INNOVATION.'
        };

        moduleMap = $.extend(subnavMap.moduleMap, {
            'cta-video-hoverboard': modules.HOVERBOARD,
            'cta-developing-ai': modules.HOVERBOARD,
            'cta-video-the-hard-way': modules.TEST,
            'cta-video-knowing-unknowable': modules.TEST,
            'cta-video-calty-research': modules.RESEARCH,
            'cta-history-lexus': modules.HERITAGE
        });

        tagIds = {
            EXTERNAL: '2593.3',
            INTERNAL: '2593.4',
        };

        tagIdMap = $.extend(subnavMap.tagMap, {
            'cta-video-hoverboard': tagIds.EXTERNAL,
            'cta-developing-ai': tagIds.EXTERNAL,
            'cta-video-the-hard-way': tagIds.EXTERNAL,
            'cta-video-knowing-unknowable': tagIds.EXTERNAL,
            'cta-video-calty-research': tagIds.EXTERNAL,
            'cta-history-lexus': tagIds.EXTERNAL
        });

        $(function() {
            init();
        });
    });
