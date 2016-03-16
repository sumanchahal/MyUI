/**
 *
 *
 */
define([

    ],

    function() {

        var page,
            subsection,
            init,
            trackAthlete;

        init = function(options) {
            this.tagId = options.tagId || '2594.4';
            this.subsection = options.subsection;
            this.module = options.module;
            this.action = options.action;
            this.imagePosition = options.imagePosition;
        };


        trackAthlete = function($cta) {
            if (!$cta || $cta.length === 0) {
                return;
            }
            var id = $cta.find('a').attr('data-id'),
                trackingObj = {
                    '<subsection>': this.subsection,
                    '<page>': this.page,
                    '<module>': this.module,
                    '<action>': this.action,
                    '<image_position>': this.imagePosition || $cta.attr('data-idx')
                };

            // track clicks in the athletes list
            if (id.indexOf('cta-athlete') >= 0) {
                var athleteIDSplit = id.split('_'),
                    sport = athleteIDSplit[1],
                    athlete = athleteIDSplit[2];
                trackingObj['<athlete>'] = athlete;
                trackingObj['<sport>'] = sport;
                console.log(JSON.stringify(trackingObj));
                fireTag('2594.4', trackingObj);
                return true;
            }
        };


        return {
            init: init,
            trackAthlete: trackAthlete
        };

    }
);
