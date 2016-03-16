require([
        'jquery',
        'analytics',
        'component/ResponsiveImages'
    ],

    function(
        $,
        analytics,
        ResponsiveImages
    ) {

        var init,
            doSearch;

        fireTag('2592.2', {
            '<section>': 'Error',
            '<subsection>': 'Not Found',
            '<page>': 'Not Found',
            '<error_type>': 'Not Found',
            '<error_code>': '404'
        });

        init = function() {
            responsiveImages = new ResponsiveImages();
            responsiveImages.update();

            $('#search-button').on('click', doSearch);
            $('#search-bar').on('keydown', doSearch);

            $('.topPagesWidget-page').on('click ', function(event) {
                fireTag('2592.4', {
                    '<section>': 'Error',
                    '<subsection>': 'Not Found',
                    '<module>': 'Top Pages',
                    '<action>': $(this).find('.top-page-label').text().trim()
                });
            });
        };

        doSearch = function(event) {
            if (event) {
                if (event.which && event.which !== 13 && event.which !== 1) {
                    return;
                } else {
                    event.preventDefault();
                }
            }

            var searchTerm = $('#search-bar').val();
            if (!searchTerm.replace(/\s/g, '')) {
                return;
            }

            fireTag('2592.4', {
                '<section>': 'Error',
                '<subsection>': 'Not Found',
                '<module>': 'Search',
                '<action>': searchTerm
            });

            searchTerm = searchTerm.replace(' ', '+');
            searchTerm = escape(searchTerm);
            window.location = '/search?q=' + searchTerm;
        };

        $(document).ready(function() {
            init();
        });
    });
