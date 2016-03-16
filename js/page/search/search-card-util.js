define(['jquery', 'component/map/FindNearbyDealers'], function($, FindNearbyDealers) {

    'use strict';

    var galleryAnimating = false,
        $arrow = null,
        factor = null,
        scrollPosition = 0,
        cardUtility = {

            that: this,
            /**
             * Find the geolocated zip code
             * @param geo - geolocation API
             */
            injectGeoLocatedZipToCard: function(geo) {

                geo.fetchData(function() {

                    if (geo.getApi().getZip() !== '00000') {

                        document.getElementById('no-dealers-zip-form').value = geo.getApi().getZip();

                        $.ajax({
                            url: '/rest/dealersByZip/' + geo.getApi().getZip()
                        }).done(function(data) {
                            var string = "We found " +
                                data.data.length +
                                (data.data.length === 1 ? " dealer" : " dealers") +
                                " near";
                            document.getElementById('summary-count').innerText = string;
                        });
                    }

                });
            },

            /**
             * When submitting dealer search from dealer card update cookie and send client to dealers page
             * @param cookie
             */
            noDealersListener: function(cookie) {

                var zip;

                $('#no-dealers-zip-form').on('keydown', function(e) {
                    return (e.keyCode >= 37 && e.keyCode <= 57) ||
                        (e.keyCode >= 96 && e.keyCode <= 105) ||
                        e.keyCode === 13 ||
                        e.keyCode === 8;
                });

                $('#submit-no-dealer-form').on('click', function(e) {

                    e.preventDefault();

                    zip = document.getElementById('no-dealers-zip-form').value;
                    zip = zip.replace(/\(.*?\)/g, "").replace(/ /gi, "");
                    if (!zip.match(/^\d+$/) || zip.length < 5) {
                        $(this).closest('form').addClass('error');
                        $(this).closest('form').find('.error-message').show();
                        return false;
                    }

                    cookie.set('dealer-last-search-dealerZip', document.getElementById('no-dealers-zip-form').value);
                    cookie.set('isFirstTimeVisitor', 'false');

                    document.location.href = 'dealers';
                });
            },

            /**
             * If FAQ answers go over 200 characters cut them and add a view more button
             *
             * @param cards
             * @param index
             */
            truncateLongFAQs: function(cards, index) {

                var tempAnswer, disclaimers,
                    cutoff,
                    disclaimerLocations = [],
                    disclaimerRegExp = /<span\sclass\=\'tooltip\-trigger.*?\/span><\/span>/gi;

                for (var i = 0; i < cards[index].questions.length; i++) {

                    cutoff = 200;
                    tempAnswer = cards[index].questions[i].answer;

                    //Check for disclaimers
                    disclaimers = tempAnswer.match(disclaimerRegExp) || [];
                    //console.dir(disclaimers);

                    //Remove disclaimers for character count
                    if (disclaimers.length) {

                        for (var j = 0; j < disclaimers.length; j++) {

                            var start = tempAnswer.indexOf(disclaimers[j]);
                            var end = start + disclaimers[j].length;

                            disclaimerLocations.push({
                                "start": start,
                                "end": end
                            });

                            cutoff += (end - start);
                        }

                        for (j = 0; j < disclaimerLocations.length; j++) {

                            //Our cutoff will be in the middle of a disclaimer (span tag), cut to end of disclaimer
                            if (disclaimerLocations.start <= cutoff && cutoff <= disclaimerLocations.end) {
                                cutoff = disclaimerLocations[j].end;
                            }
                        }

                        tempAnswer = tempAnswer.replace(disclaimerRegExp, "");

                    }

                    //Tossing out the disclaimer, if the length is >= 200 show a "view more"
                    if (tempAnswer.length >= 200) {
                        cards[index].questions[i].fullAnswer = cards[index].questions[i].answer;
                        cards[index].questions[i].answer = cards[index].questions[i].answer.substring(0, cutoff) + "...";
                        cards[index].questions[i].viewMore = "view-more";
                    } else {
                        cards[index].questions[i].fullAnswer = "";
                        cards[index].questions[i].viewMore = "";
                    }
                }
            },

            /**
             * If View More button is clicked on FAQ show the content
             */
            faqViewMoreListener: function() {

                var $this;

                $('.view-more').on('click', function(e) {

                    e.preventDefault();

                    $this = $(this);

                    $this.hide();
                    $this.parent().find('.answer').css({
                        'display': 'none'
                    });
                    $this.parent().find('.full').show();
                });
            },

            /**
             * When a right or left arrow button is clicked for the gallery "carousel"
             * DESKTOP ONLY (free scroll on tablet and mobile)
             * @param direction - left or right
             */

            scrollGallery: function() {

                var direction = '',
                    scrollPosition = scrollPosition || 0,
                    diff = 0,
                    updatedScroll = 0,
                    galleryScroll = document.getElementById('gallery-scroll'),
                    width = 0,
                    i,
                    $prevArrow = $(".prev"),
                    $nextArrow = $(".next");

                //If no scroll is presented on this page do not execute.
                if (!galleryScroll) {
                    return;
                }

                $arrow = $(".arrow");

                $arrow.on('click', function(e) {

                    //Only execute if the gallery is not in motion.
                    if (!galleryAnimating) {

                        galleryAnimating = true;

                        direction = $(this).hasClass('prev') ? 'prev' : 'next';

                        //determine which direction was clicked and add/subtract value from the main scroll value
                        diff = direction === 'next' ? (window.innerWidth - 500) : -(window.innerWidth - 500);
                        scrollPosition = galleryScroll.scrollLeft + diff;

                        cardUtility.triggerScrollGallery(scrollPosition, galleryScroll.scrollLeft, 0, galleryScroll, direction === 'next' ? 1 : -1);

                        updatedScroll = galleryScroll.scrollLeft;
                    }

                });


                //Anytime the gallery is scrolled check arrow opacity.
                galleryScroll.addEventListener('scroll', function(e) {

                    //If width is 0 determine true width.
                    if (width === 0) {
                        var galleryItems = document.getElementsByClassName('gallery-item');
                        for (i = 0; i < galleryItems.length; i++) {
                            width += galleryItems[i].clientWidth;
                        }
                        document.getElementById('gallery-list').style.width = width + "px";
                    }

                    if (galleryScroll.scrollLeft === 0) {
                        $prevArrow.addClass("hide");
                        return;
                    }

                    if ((galleryScroll.clientWidth + galleryScroll.scrollLeft) >= width) {
                        $nextArrow.addClass("hide");
                        return;
                    }

                    $arrow.removeClass("hide");
                });
            },

            /**
             * Scroll the gallery left or right, this function uses a recursive method
             * based upon the setTimeout duration. Using some basic math the gallery scrolls
             * a higher distance at first and slows itself down as it nears the destination
             * creating a semi-elastic effect. The factor number and timeout duration may
             * be manipulated to adjust the look and feel of the gallery.
             *
             * @param destination - Final scroll position
             * @param current - Current scroll position
             * @param diff - Difference between Final and Current
             * @param elem - Element being scrolled
             * @param direction - Direction of scroll
             */
            triggerScrollGallery: function(destination, current, diff, elem, direction) {

                setTimeout(function() {

                    var rawDiff = Math.abs(destination - current);

                    factor = parseFloat(rawDiff - diff) / rawDiff;
                    factor = parseFloat(factor * 250);

                    if (factor > 0.5) {
                        elem.scrollLeft = current + ((factor + diff) * direction);
                        cardUtility.triggerScrollGallery(destination, current, diff + factor, elem, direction);
                    } else {
                        galleryAnimating = false;
                    }

                }, 20); //speed
            }

        };

    return cardUtility;

});
