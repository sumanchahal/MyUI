require([
        'jquery',
        'TweenMax',
        'analytics',
        'component/ResponsiveImages',
        'modules/menu-tile',
        'modules/media-tile',
        'modules/thumb-slider',
        'omniture/athletes-list-helper'
    ],

    function(
        $,
        TweenMax,
        analytics,
        ResponsiveImages,
        menuTile,
        mediaTile,
        thumbSlider,
        athletesListHelper
    ) {

        var init,
            mousePan,
            activate,
            $thumbSlider,
            $slideCont,
            athleteNameArray,
            athlete;

        init = function() {
            // Init code goes here
            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            athletesListHelper.init({
                subsection: 'Sponsored Athletes',
                page: 'Profile Page',
                module: 'Hero',
                action: 'Photo'
            });

            console.log('LEXUS.page.sport: ', LEXUS.page.sport);

            athleteNameArray = window.location.pathname.split('/');
            //Athlete's name will be the last thing in the URL
            athlete = athleteNameArray[athleteNameArray.length - 1];

            fireTag('2594.2', {
                '<section>': 'Partnerships',
                '<subsection>': 'Sponsored Athletes',
                '<page>': 'Profile Page',
                '<athlete>': athlete,
                '<sport>': LEXUS.page.sport || 'Golf-default'
            });

            $('.thumb-slider-nav a').on('click', function(e) {
                var action = $(this).data('id');
                fireTag('2594.5', {
                    '<subsection>': 'Sponsored Athletes',
                    '<page>': 'Profile Page',
                    '<module>': 'Hero',
                    '<action>': action,
                    '<athlete>': athlete,
                    '<sport>': LEXUS.page.sport || 'Golf-default'
                });
            });

            //JUST IN CASE THEY WANT TO TRACK THE SLIDER
            $('.thumb-slider-item').on('click', function(e) {
                var $cta = $(this);
                // checks if cta is from athletes list and tracks click if it is
                athletesListHelper.trackAthlete($cta);
            });

            $('a[data-id^="cta-out_"], a[title^="cta-out_"]').on('click', function(e) {
                var cta = $(this);
                console.log('OUT LINK: ', {
                    '<subsection>': 'Sponsored Athletes',
                    '<page>': 'Profile Page',
                    '<module>': cta.text().trim(),
                    '<action>': 'Outlink',
                    '<athlete>': athlete,
                    '<sport>': LEXUS.page.sport || 'Golf-default'
                });
                fireTag('2594.6', {
                    '<subsection>': 'Sponsored Athletes',
                    '<page>': 'Profile Page',
                    '<module>': cta.text().trim(),
                    '<action>': 'Outlink',
                    '<athlete>': athlete,
                    '<sport>': LEXUS.page.sport || 'Golf-default'
                });
            });
        };

        $(function() {
            init();
        });
    });
