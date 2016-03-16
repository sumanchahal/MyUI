require([
        'jquery',
        'analytics',
        'component/ResponsiveImages',
        'modules/menu-tile',
        'modules/media-tile',
        'omniture/athletes-list-helper'
    ],

    function(
        $,
        analytics,
        ResponsiveImages,
        menuTile,
        mediaTile,
        athletesListHelper
    ) {

        function init() {
            // Init code goes here
            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            athletesListHelper.init({
                subsection: 'Sponsored Athletes',
                page: 'Overview Page',
                module: 'Gallery',
                action: 'Photo'
            });

            fireTag('2594.1', {
                '<section>': 'Partnerships',
                '<subsection>': 'Sponsored Athletes',
                '<page>': 'Overview Page'
            });

            $('.media-image.hero').on('click', function(e) {
                fireTag('2594.3', {
                    '<subsection>': 'Sponsored Athletes',
                    '<page>': 'Overview Page',
                    '<module>': 'Hero',
                    '<action>': 'Browse'
                });
            });

            $('.grid-item').on('click', function(e) {
                var $cta = $(this),
                    id = $cta.find('a').data('id'),
                    trackingObj = {
                        '<subsection>': 'Sponsored Athletes',
                        '<page>': 'Overview Page'
                    };

                // checks if cta is from athletes list and tracks click if it is
                athletesListHelper.trackAthlete($cta);

                // track clicks in the promo
                if (id.indexOf('cta-promo') >= 0) {
                    trackingObj['<module>'] = 'End Cap Module';
                    trackingObj['<action>'] = $cta.find('a').text().trim() || 'Photo';
                    fireTag('2594.3', trackingObj);
                    console.log(JSON.stringify(trackingObj));
                }



            });
        }

        $(function() {
            init();
        });
    });
