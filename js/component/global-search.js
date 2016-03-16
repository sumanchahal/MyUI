(function($) {

    var GlobalSearch = function() {

        var Search = {},
            searchArray = [],
            predictiveContainer = {
                large: $("#predictive-container-large"),
                small: $("#predictive-container-small"),
                search: $("#predictive-container-search")
            },
            predictiveTermsContainer = {
                large: $("#predictive-terms-large"),
                small: $("#predictive-terms-small"),
                search: $("#predictive-terms-search")
            },
            $predictiveTerms = $('#predictive-terms-large-outer, #predictive-terms-search-outer'),
            i, l, html;

        Search.models = ["is", "es", "gs", "ls", "rx", "gx", "lx", "ct", "lf", "nx", "rc", "hs", "sc"];

        function getModelsList() {
            return Search.models;
        }

        function init() {
            bindKeydownSearches();
        }

        /**
         * Sets up the listeners for keydown events
         */

        function bindKeydownSearches() {

            var $search,
                searchTerm,
                searchLength,
                predictiveSearchTerms,
                predictiveSearchLinks,
                appendedTerms,
                appendedLinks,
                searchType,
                predictiveListCount = 0,
                prevSearchHadResults,
                currentIndex = -1,
                touch = $('html').hasClass('touch');

            //Do not allow the cursor to move to the front of the search on
            //up arrow key
            $('.search').on('keydown', function(e) {
                if (e.keyCode === 38) {
                    return false;
                }
            });

            $('.search').on('keyup', function(e) {

                e.preventDefault();

                $search = $(this);
                searchTerm = $search.val().toLowerCase();
                searchLength = searchTerm.length;

                /**
                 * Type of search situations
                 *   Large
                 *   Small
                 *   Large but on touch device (force mobile)
                 *   Search page (mobile)
                 */
                searchType = $search.attr("id") === "search-page-search" ? "search" :
                    touch ? 'small' : window.innerWidth >= 960 ? "large" : "small";

                if (searchLength < 2) {
                    predictiveContainer[searchType].hide();
                    return true;
                }

                if (searchLength === 2 && Search.models.indexOf(searchTerm) === -1) {
                    predictiveContainer[searchType].hide();
                    return true;
                }

                //If last search yielded results AND up/down key pressed:
                if (/(large|search)/.test(searchType) && prevSearchHadResults && (e.keyCode === 38 || e.keyCode === 40)) {

                    //We made it into the scrolling of predictive terms, is this our first time?
                    predictiveListCount = predictiveListCount === 0 ? document.querySelectorAll("#predictive-terms-" + searchType + " li").length : predictiveListCount;

                    //We know our index and how many items we have now, let's move
                    switch (e.keyCode) {
                        case 38:
                            currentIndex = arrowKeyPressed(currentIndex, predictiveListCount, -1, searchType);
                            break;
                        case 40:
                            currentIndex = arrowKeyPressed(currentIndex, predictiveListCount, 1, searchType);
                            break;
                        default:
                            console.log("Funky-ness.");
                    }

                    return true;
                }

                //If we get to this point we can make an ajax call, because of scope i should have
                //variables available
                hydrateObjectFromJSON('terms', '/rest/suggest?q=' + searchTerm, function() {

                    hydrateObjectFromJSON('links', '/rest/shortcuts?q=' + searchTerm, function() {
                        currentIndex = -1;
                        predictiveListCount = 0;

                        html = '';

                        predictiveSearchTerms = getPredictiveSearchTerms();
                        predictiveSearchLinks = Search.links[0] || null;

                        appendedTerms = appendTermsToList(predictiveSearchTerms, searchTerm, searchType);
                        appendedLinks = appendDestinationToList(predictiveSearchLinks, searchType);

                        if (appendedTerms || appendedLinks) {
                            //Show the dropdown
                            prevSearchHadResults = true; //This lets us know if we need to listen to up and down arrows in the future
                            predictiveTermsContainer[searchType].html(html); //The html variable is a high level variable that is injected once instead of being passed around
                            predictiveContainer[searchType].show();
                        } else {
                            //Hide the dropdown
                            prevSearchHadResults = false;
                            predictiveContainer[searchType].hide();
                        }
                    });
                });
            });
        }

        /**
         * Search the predictive text JSON object for a given term
         * @param term - String
         * @return - Array - Up to 4 terms
         */

        function arrowKeyPressed(currentIndex, predictiveListCount, nextIndexDifference, windowSize) {

            var nextIndex = currentIndex + Number(nextIndexDifference);

            if (nextIndex < 0) {
                nextIndex = predictiveListCount - 1;
            }

            if (nextIndex === predictiveListCount) {
                nextIndex = 0;
            }

            $("#predictive-terms-" + windowSize + " a").removeClass('focus');
            $("#predictive-terms-" + windowSize + " li").eq(nextIndex).find("a").addClass('focus');

            return nextIndex;

        }

        /**
         * Search the predictive text JSON object for a given term
         * @param term - String
         * @return - Array - Up to 4 terms
         */

        function getPredictiveSearchTerms() {

            searchArray = [];
            l = Search.terms.length > 4 ? 4 : Search.terms.length;

            for (i = 0; i < l; i++) {
                if (Search.terms[i].term) { //watch out for undefined!
                    searchArray.push(Search.terms[i].term);
                }
            }

            return searchArray;
        }

        /**
         * Grabs JSON data from a file path, turns it into a Javascript object,
         * injects it into the Search object
         * @param name
         * @param path
         */

        function hydrateObjectFromJSON(name, path, callback) {
            $.ajax(
                path, {
                    dataType: 'json'
                }
            ).done(function(data) {
                Search[name] = data;
                if (callback) {
                    callback();
                }
            });
        }

        /**
         * Appends terms to predictive terms HTML container
         * @param size - big / small
         */

        function appendTermsToList(terms, searchTerm, size) {
            predictiveTermsContainer[size].html("");

            if (terms.length === 0) {
                $predictiveTerms.addClass("empty-terms");
                return false;
            }
            $predictiveTerms.removeClass("empty-terms");
            var r = "(" + searchTerm + ")";
            var reg = new RegExp(r, "i");

            for (i = 0; i < terms.length; i++) {
                terms[i] = terms[i]
                    .toUpperCase()
                    .replace(/0H/gi, "0h")
                    .replace(/0t/gi, "0t");
                html += '<li><a href="/search?q=' + terms[i].toLowerCase().replace(/\s/g, '+') + '">' + terms[i].replace(reg, '<em>$1</em>') + '</a></li>';
            }

            return true;

        }

        /**
         * Append Destination to list
         * @param size
         */

        function appendDestinationToList(link, size) {

            var originalLink;

            if (!link) {
                return false;
            }

            originalLink = link.url;
            link.url = link.url.replace(new RegExp('https?:\/\/www.', 'g'), '');
            link.url = link.url.indexOf("/") === 0 ? "lexus.com" + link.url : link.url;

            if (size === 'small') {
                link.url = link.url.substr(0, 30) + "...";
            }

            html += '<li id="predictive-destination-' + size + '"><a class="destination" href="' + originalLink + '">' +
                '<strong>' + link.title + '</strong>' +
                '<span>' + link.url + '</span>' +
                '</a></li>';

            return true;
        }

        /**
         * Submit event triggered - returning true will submit form normally
         * @param e
         */

        function submitRequested(e) {

            var focusedElement = document.querySelectorAll(".focus"),
                $searchValue = $(e).find('.search'),
                searchValue;

            if (focusedElement.length) {
                window.location.href = focusedElement[0].getAttribute('href');
                return false;
            }

            searchValue = $searchValue.val().trim();

            if (searchValue !== '') {
                searchValue = searchValue
                //                    .replace(/;/g, "")
                //                    .replace(/"/g, "")
                //                    .replace(/'/g, "")
                //                    .replace(/</g, "&lt;")
                //                    .replace(/>/g, "&gt;")
                .toLowerCase();
                $searchValue.val(searchValue);

            } else {
                return false;
            }

            return true;

        }


        init();

        return {
            submitRequested: submitRequested,
            getModelsList: getModelsList
        };

    };

    if (typeof jQuery === "function") {
        $(function() {
            window.LEXUS = window.LEXUS || {};
            window.LEXUS.Search = new GlobalSearch();
        });
    } else {
        throw new Error("jQuery needs to be defined for the nav to work.");
    }

})(jQuery);
