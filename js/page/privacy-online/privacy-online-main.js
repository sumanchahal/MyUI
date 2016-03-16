require([
        'jquery',
        'analytics',
        'modules/menu-tile',
        'modules/sticky-header',
        'omniture/m2-analytics'
    ],

    function(
        $,
        analytics,
        menuTile,
        sitckyHeader,
        m2Analytics
    ) {

        var init,
            subsection = 'Privacy Statement',
            modules,
            moduleMap;

        init = function() {

            fireTag('2592.1', {
                '<section>': 'Privacy',
                '<subsection>': subsection,
                '<page>': modules.DEFAULT
            });

            m2Analytics.init(subsection, moduleMap);

            $('.m2-cta-tile[data-id="print"]').on('click', function(e) {
                window.print();
            });

        };

        modules = {
            DEFAULT: subsection,
            TOC: 'Table of Contents',
            CHOICE: 'Choice and Access',
            AD_TARGETING: 'Advertising Behavioral Targeting',
            SECURITY: 'Security of Your Information',
            OTHER_SITES: 'Other Sites',
            CONTACT_US: 'Contact Us',
            DEALERS_PARTNERSHIPS: 'Dealers and Partnerships'

        };

        moduleMap = {
            'choice-call': modules.CHOICE,
            'targeting-daa': modules.AD_TARGETING,
            'security-hoax': modules.SECURITY,
            'security-ftc': modules.SECURITY,
            'security-antiphishing': modules.SECURITY,
            'othersites-financial': modules.OTHER_SITES,
            'othersites-dealers': modules.OTHER_SITES,
            'contact-call': modules.CONTACT_US,
            'dp-dealers': modules.DEALERS_PARTNERSHIPS,
            'dp-partner': modules.DEALERS_PARTNERSHIPS
        };

        $(function() {
            init();
        });
    });
