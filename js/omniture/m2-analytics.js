/**
 *
 *
 */
define([

    ],

    function() {
        var init,
            initialized = false,
            trackCTA,
            subsection = '',
            moduleMap = {},
            actionMap = {},
            tagIdMap = {},
            tagMap = {};

        init = function(_subsection, _moduleMap, _actionMap, _tagIdMap) {

            if (initialized) {
                return;
            }
            initialized = true;

            subsection = _subsection;
            moduleMap = $.extend(moduleMap, _moduleMap || {});
            actionMap = $.extend(actionMap, _actionMap || {});
            tagIdMap = $.extend(tagIdMap, _tagIdMap || {});

            $('#content').on('click', '.m2-cta-tile, .m2-text-tile a:not(.m2-cta-tile)', function() {
                var cta = $(this),
                    href,
                    id = cta.attr('data-id') || cta.attr('title') || cta.attr('href'),
                    data = tagMap[id];

                if (!data) {
                    data = tagMap[id] = {};
                    href = cta.attr('href');
                }

                data['<subsection>'] = data['<subsection>'] || subsection;
                data['<module>'] = data['<module>'] || moduleMap[id] || (href && href.match(/[#][\w-]+/) ? 'Table of Contents' : void(0)) || subsection;
                data['<action>'] = data['<action>'] || actionMap[id] || (href && href.indexOf('tel:') === 0 ? 'Call' : void(0));
                // || cta.text().trim();
                var trackData = data;
                if (!data['<action>']) {
                    trackData = $.extend({}, trackData);
                    trackData['<action>'] = cta.text().trim();
                }

                // var tagId = tagIdMap[id];
                trackCTA(tagIdMap[id], trackData);
            });
        };

        trackCTA = function(tagId, data) {
            tagId = tagId || '2592.3';
            if (data) {
                console.log('track CTA :: data: ', data);
                fireTag(tagId, data);
            }
        };

        return {
            init: init,
            trackCTA: trackCTA,
            subsection: subsection,
            moduleMap: moduleMap,
            actionMap: actionMap
        };
    }
);
