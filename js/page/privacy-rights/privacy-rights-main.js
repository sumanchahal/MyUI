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
            subsection = 'Privacy Rights',
            modules,
            moduleMap;

        // var moduleMap = {
        //     'online-privacy': 'Online Privacy',
        //     'personal-sharing': 'Personal Information',
        //     'contact': 'Contact Us',
        //     'info-collect': 'Collected Information',
        //     'info-use': 'User and Sharing',
        //     'choice-access': 'Choice and Access',
        //     'important-info': 'Important Information'
        // };

        init = function() {
            // Page load Tracking tag
            fireTag('2592.1', {
                '<section>': 'Privacy',
                '<subsection>': subsection,
                '<page>': subsection,
            });

            m2Analytics.init(subsection, moduleMap);
        };

        modules = {
            DEFAULT: subsection,
            PERSONAL_SHARING: 'Lexus Personal Information Sharing Practices – 2014',
            INFO_COLLECTED: 'Information Collected',
            INFO_USE: 'Uses and Sharing',
            CHOICE_ACCESS: 'Your Privacy Rights, Choice and Access',
            IMPORTANT_INFO: 'Important Information',
            CONTACT: 'How To Contact Us'
        };

        moduleMap = {
            'personal-sharing': modules.PERSONAL_SHARING,
            'info-collect': modules.INFO_COLLECTED,
            'info-use': modules.INFO_USE,
            'choice-access': modules.CHOICE_ACCESS,
            'important-info': modules.IMPORTANT_INFO,
            'phone': modules.CONTACT,
            'contact': modules.CONTACT
        };

        $(function() {
            init();
        });
    });
