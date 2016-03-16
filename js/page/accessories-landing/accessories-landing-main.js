require([
        'jquery',
        'analytics',
        'component/ResponsiveImages',
        'modules/menu-tile'
    ],

    function(
        $,
        analytics,
        ResponsiveImages,
        menuTile
    ) {

        function init() {
            // Init code goes here
            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            //Page loading tag
            fireTag('2592.1', {
                "<section>": "Accessories",
                "<subsection>": "Accessories",
                "<page>": "Overview"
            });
        }

        $(document).ready(function() {
            init();

            $('#dropdown-0 .menu-item').on('click', function(e) {
                fireTag('2592.3', {
                    "<subsection>": "Accessories",
                    "<module>": "F Sport Accessories Drop Down",
                    "<action>": $(this).text().trim()
                });
            });

            $('#dropdown-1 .menu-item').on('click', function(e) {
                fireTag('2592.3', {
                    "<subsection>": "Accessories",
                    "<module>": "Genuine Accessories Drop Down",
                    "<action>": $(this).text().trim()
                });
            });


            $('a[title="see-more-link"]').on('click', function(e) {
                fireTag('2592.3', {
                    "<subsection>": "Accessories",
                    "<module>": "Lexus Collection Module",
                    "<action>": "See More"
                });
            });
        });
    });
