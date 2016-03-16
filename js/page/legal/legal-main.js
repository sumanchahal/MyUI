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
            subsection = 'Legal Terms',
            modules,
            moduleMap,
            actions,
            actionMap;

        init = function() {

            fireTag('2592.1', {
                '<section>': 'Privacy',
                '<subsection>': subsection,
                '<page>': modules.DEFAULT
            });

            m2Analytics.init(subsection, moduleMap, actionMap);

            $('.m2-cta-tile[data-id="print"]').on('click', function(e) {
                window.print();
            });
        };

        modules = {
            DEFAULT: subsection,
            TOC: 'Table of Contents',
            ACCOUNT: 'Account Registration',
            MOBILE_SERVICES: 'Mobile Services',
            COPYRIGHT: 'Copyright Agent',
            COMMENTS: 'Other Complaints and Comments to Lexus',
            PRIVACY: 'Privacy',
            DISPUTES: 'Disputes Arbitration',
            CONTACT: 'Contact'

        };

        moduleMap = {
            'cta-account': modules.ACCOUNT,
            'cta-account-privacy': modules.ACCOUNT,
            'cta-services': modules.MOBILE_SERVICES,
            'cta-copyright-phone': modules.COPYRIGHT,
            'cta-copyright-fax': modules.COPYRIGHT,
            'cta-comments-phone': modules.COMMENTS,
            'cta-privacy': modules.PRIVACY,
            'cta-disputes-phone': modules.DISPUTES,
            'cta-contact': modules.CONTACT,
            'cta-contact-phone': modules.CONTACT
        };

        actions = {
            FAX: 'FAX'
        };

        actionMap = {
            'cta-copyright-fax': actions.FAX
        };

        $(function() {
            init();
        });
    });
