/**
 * R4 Sticky Header
 *
 *
 * @author ebarriga
 */
define([
        'jquery',
        '../util/scrolltype'
    ],

    function(
        $,
        scrolltype
    ) {

        var $sections,
            updateSticky,
            currentPosition,
            headerPositions,
            positionToHeader,
            isHidden = true,
            stickyBaseH,
            $stickyHeader,
            $header;


        /**
         * Inits stuff
         *
         * @method init
         * @private
         */

        init = function() {
            $sections = $('.m2-text-tile').find('.sticky-header');
            $stickyHeader = $('.sticky-header-display');
            stickyBaseH = $stickyHeader.height();
            updateSticky();
            $(window).on('scroll', updateSticky);
        };

        /**
         * Goes through the h3 $sections on the page and updates the stick header accordingly
         *
         * @public
         */

        updateSticky = function() {
            currentPosition = $(this).scrollTop();
            headerPositions = [];
            positionToHeader = {};

            //going through the h3 $sections
            $sections.each(function() {
                $header = $(this);
                if ($header.offset().top < (currentPosition + stickyBaseH)) {
                    headerPositions.push($header.position().top);
                    positionToHeader[$header.position().top] = $header;
                }
            });

            //if you found a header above you.
            if (headerPositions.length > 0) {
                // we only want to do this when the user is scrolling so when jumplink scrolls page, the sticky header doesnt cover the content.
                if (isHidden && scrolltype.isUserScroll()) {
                    isHidden = false;
                    $stickyHeader.addClass('show');
                } else if (!scrolltype.isUserScroll()) {
                    isHidden = true;
                    $stickyHeader.removeClass('show');
                }
                //take the closest one to you but above you.
                var currentHeaderPosition = Math.max.apply(Math, headerPositions);
                var $currentHeader = positionToHeader[currentHeaderPosition];
                $stickyHeader.find('h3').text($currentHeader.text());
            } else {
                if (!isHidden) {
                    isHidden = true;
                    $stickyHeader.removeClass('show');
                }
                $stickyHeader.find('h3').text('');
            }
        };


        $(document).ready(function() {
            init();
        });


        return {

        };
    });
