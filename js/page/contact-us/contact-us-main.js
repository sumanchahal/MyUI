require([
        'jquery',
        'analytics',
        'util/r4Utils',
        'component/ResponsiveImages',
        'omniture/m2-analytics'
    ],

    function(
        $,
        analytics,
        r4Utils,
        ResponsiveImages,
        m2Analytics
    ) {

        var init,
            trackCTA,
            subsection = 'Contact Us',
            modules,
            moduleMap,
            actions,
            actionMap,
            tagMap = {};

        init = function() {

            fireTag('2592.1', {
                '<section>': 'Contact Us',
                '<subsection>': subsection,
                '<page>': modules.DEFAULT
            });

            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            m2Analytics.init(subsection, moduleMap, actionMap);

            $('#content').on('click', '.menu-bar .m2-cta-tile.cta-button', function(event) {
                var cta = $(this),
                    id = cta.attr('data-id');
                if (!id) {
                    return;
                }
                switch (id) {
                    case 'cta-chat':
                        r4Utils.infoPopUp('https://lexus2.custhelp.com/cgi-bin/lexus2.cfg/php/enduser/live.php', '550', '525');
                        break;

                    case 'cta-email':
                        r4Utils.infoPopUp('https://lexus2.custhelp.com/cgi-bin/lexus2.cfg/php/enduser/ask.php', '550', '525');
                        break;
                }
            });

        };

        modules = {
            DEFAULT: 'Contact Us Module',
            HERO: 'Hero',
            ROADSIDE: '24 Hour Roadside Assistance',
            VEHICLE_ASSISTANCE: 'Lexus Vehicle Assistance',
            CREDIT_CARD: 'Lexus Credit Cards',
            FINANCIAL: 'Lexus Financial Services',
            FAQ: 'FAQ',
            DEALER: 'DEALER LOCATOR'

        };

        moduleMap = {
            'cta-hero-phone': modules.HERO,
            'cta-hero-phone-tty': modules.HERO,
            'cta-phone-roadside': modules.ROADSIDE,
            'cta-phone-assistance': modules.VEHICLE_ASSISTANCE,
            'cta-phone-cc': modules.CREDIT_CARD,
            'cta-phone-finance': modules.FINANCIAL,
            'cta-financial-services': modules.FINANCIAL,
            'cta-faq': modules.FAQ,
            'cta-find-dealer': modules.DEALER,
        };

        actions = {
            CALL_TTY: 'Call TTY'
        };

        actionMap = {
            'cta-hero-phone-tty': actions.CALL_TTY
        };

        $(function() {
            init();
        });
    });
