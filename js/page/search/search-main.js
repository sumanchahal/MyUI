require(['jquery',
        'util/geolocationHelper',
        'util/cookie',
        'page/search/search-util',
        'page/search/search-card-util',
        'page/search/search-templates',
        'component/Disclaimers',
        'omniture/analytics-helper'
    ],
    function(
        $,
        geo,
        cookie,
        SearchUtil,
        SearchCard,
        SearchTemplate,
        Disclaimers,
        Analytics) {

        'use strict';

        LEXUS = LEXUS || {};

        /**
         * Geolocation API
         * @type {object}
         */
        LEXUS.Geo = geo;

        /**
         * SearchPage API
         * @type {*|LEXUS.SearchPage}
         */
        LEXUS.SearchPage = LEXUS.SearchPage || function() {

            /**
             * The number of results to show per page
             * @type {number}
             */
            var RESULTS_PER_PAGE = 10,

                /**
                 * Start on page 1
                 * @type {number}
                 */
                currentPage = 1,

                /**
                 * Results array. No Cards
                 * @type {array}
                 */
                results,

                /**
                 * Card array
                 * @type {array}
                 */
                cards,

                /**
                 * Current page count
                 * @type {number}
                 */
                pageCount = null,
                currentResultType = '',

                /**
                 * Initialized search type (Managed Answers | Suggested Links | Organic)
                 * @type {string}
                 */
                analyticsSearchType = "Organic";

            /**
             * Initialize. searchResults is populated by JSP. This is faster than loading the page
             * then making a REST call.
             */

            function init() {

                scrollAnimation();

                try {

                    if (Object.keys(searchResults).length === 0) {
                        throw "Empty Search Results";
                    }

                    results = searchResults.results || [];
                    cards = searchResults.cards || [];

                    if (results.length === 0 && cards.length === 0) {
                        throw "Empty Search Results";
                    } else {
                        startSearchProcess();
                    }

                } catch (e) {

                    SearchUtil.throwSearchResultError(null, null, e);
                    Analytics.searchPageLoad("No Results", analyticsSearchTerm);
                    SearchUtil.initSearchAnalyticsListeners(analyticsSearchType, analyticsSearchTerm);

                }
            }


            /**
             * Start the search process! Inject the results into the page and run utility functions.
             */

            function startSearchProcess() {

                results = SearchUtil.trimTitles(results);

                injectResultsAndCards();
                SearchUtil.bindGroupToggle();

                SearchCard.scrollGallery();
                SearchCard.noDealersListener(cookie);
                SearchCard.faqViewMoreListener();

                buildPageAnchors();
                SearchUtil.hideSearchOnMenuClick();
            }

            /**
             * Results are added 1 by 1. Cards need to be added in between results. To prevent
             * looping through the cards object every time a result is added save the positions
             * in memory. In special cases do additional work.
             */

            function getCardPositions() {

                var cardArray = [];

                if (!cards) {
                    return cardArray;
                }

                for (var i = 0; i < cards.length; i++) {

                    cardArray.push(Number(cards[i].position));

                    switch (cards[i].type) {
                        case "dealerNoZip":
                            SearchCard.injectGeoLocatedZipToCard(geo);
                            break;
                        case "faq":
                            SearchCard.truncateLongFAQs(cards, i);
                            break;
                        default:
                            break;
                    }
                }

                return cardArray;
            }

            /**
             * Takes a page number and updates the view to respective page. Function does the following:
             *
             *  Generates new page anchors
             *  Generates new starting position for results
             *  Sets the CURRENT_PAGE
             *  Injects Cards / Results
             *
             * @param page
             */

            function goToPage(page) {

                var startingPosition;

                currentPage = page;
                buildPageAnchors();
                startingPosition = getResultIndexForPage(page);

                injectResultsAndCards(startingPosition);

                SearchUtil.bindGroupToggle();

                SearchCard.scrollGallery();
                SearchCard.noDealersListener(cookie);
                SearchCard.faqViewMoreListener();

            }

            /**
             * Animate user to the top of the page on click of pagination links
             *
             *  Scrolls user to top of page
             *
             */

            function scrollAnimation() {
                $('body').animate({
                    scrollTop: 0
                }, 1000);
            }

            /**
             * Determine where to start search results filtering based on page number,
             * if param is invalid start at the beginning.
             *
             * @param page - the page clicked
             * @returns {number}
             */

            function getResultIndexForPage(page) {
                return Number(page) * RESULTS_PER_PAGE - 10;
            }

            /**
             * Loops through the results at the startPosition and aggregates them into 'html' variable,
             * Once complete the html variable content is injected via innerHTML to the DOM.
             *
             * @param startPosition - the starting index in results
             */

            function injectResultsAndCards(startPosition) {

                startPosition = startPosition || 0;

                var endPosition = (startPosition + 10) < results.length ? (startPosition + 10) : results.length,
                    cardArray = getCardPositions(),
                    html = "",
                    suggestedLinkCheck = [],
                    i;

                for (i = startPosition; i < endPosition; i++) {

                    suggestedLinkCheck.push(results[i].managed);

                    if (cardArray.indexOf(i + 1) !== -1) {

                        analyticsSearchType = "Managed Answers";

                        currentResultType = cards[cardArray.indexOf(i + 1)].type;
                        html += injectDataIntoTemplate(cards[cardArray.indexOf(i + 1)], cards[cardArray.indexOf(i + 1)].type);

                    }

                    currentResultType = results[i].type;
                    html += injectDataIntoTemplate(results[i], results[i].type);

                }

                //Analytics
                if (analyticsSearchType !== "Managed Answers") {
                    analyticsSearchType = suggestedLinkCheck.indexOf("true") !== -1 ? "Suggested Links" : "Organic Results";
                }

                updateResultIndex(++startPosition, endPosition);
                document.getElementById("results").innerHTML = html;

                animateResults();

                Analytics.searchPageLoad(analyticsSearchType, analyticsSearchTerm);
                SearchUtil.initSearchAnalyticsListeners(analyticsSearchType, analyticsSearchTerm);
                SearchUtil.newTabForPDF();
                Disclaimers.refreshDisclaimers();

            }

            /**
             * Takes in a template (single, group, dealer) and replaces placeholder values with authentic values.
             *
             * If the values returned are empty then remove the entire HTML element
             * surrounding said HTML element for visual presentation.
             *
             * @param template - raw template without dynamic data
             * @param data - javascript object containing values
             * @returns string
             */

            function injectDataIntoTemplate(dataObject, type) {

                var nestedTemplate, template, injectee;

                template = SearchTemplate[currentResultType][type];
                for (var prop in dataObject) {

                    if (dataObject[prop] !== "" && prop !== {} && prop !== []) {

                        nestedTemplate = false;

                        if (dataObject[prop].constructor === Array) {
                            nestedTemplate = '';
                            for (var i = 0; i < dataObject[prop].length; i++) {
                                nestedTemplate += injectDataIntoTemplate(dataObject[prop][i], prop);
                            }
                        }

                        if (dataObject[prop].constructor === Object) {
                            nestedTemplate = '';
                            nestedTemplate += injectDataIntoTemplate(dataObject[prop], prop);
                        }

                        injectee = nestedTemplate || dataObject[prop];
                        if (prop === 'title' && /(single|tree|group)/.test(currentResultType)) {
                            injectee = SearchUtil.lowercaseH(injectee);
                        }
                        if (dataObject[prop].constructor === String && /(\s|^)itunes/gi.test(dataObject[prop])) {
                            injectee = SearchUtil.lowerCaseIinItunes(dataObject[prop]);
                        }
                        injectee = injectee.constructor === Object ? "" : injectee;

                        template = template.replace(new RegExp("{{" + prop + "}}", "g"), injectee);

                    } else {
                        template = SearchUtil.removeHTMLElementFromTemplate(template, prop);
                    }
                }
                return template;
            }

            /**
             * Animates individual results
             */

            function animateResults() {
                $('#results').find('.card, .result').animate({
                    opacity: 1
                }, 1000);
            }

            /**
             * Updates result index (showing results 1-10)
             * @param start
             * @param end
             */

            function updateResultIndex(start, end) {
                document.getElementById('result-index').innerHTML = start + " - " + end;
            }

            /**
             * Build page anchors for pagination so a user can paginate through search results.
             */

            function buildPageAnchors() {

                var i = 1,
                    html = '';

                document.getElementById('pagination-anchors').innerHTML = '';

                pageCount = pageCount || SearchUtil.generatePageCount(results);

                //Do not show pagination if single page
                if (pageCount <= 1) {
                    return;
                }

                html += '<li><a class="prev ';
                html += currentPage === 1 ? '' : 'available';
                html += '" href="#" onclick="LEXUS.SearchPage.paginateSearchResultsToPage(' + (currentPage - 1) + ')"></a></li>';

                for (; i <= pageCount; i++) {
                    html += '<li>';
                    html += i !== currentPage ? '<a ' : '<span>';
                    html += i !== currentPage ? 'href="#" onclick="LEXUS.SearchPage.paginateSearchResultsToPage(' + i + ')">' : "";
                    html += i;
                    html += i !== currentPage ? '</a>' : '</span>';
                    html += '</li>';
                }

                html += '<li><a class="next ';
                html += currentPage === pageCount ? '' : 'available';
                html += '" href="#" onclick="LEXUS.SearchPage.paginateSearchResultsToPage(' + (currentPage + 1) + ')"></a></li>';

                document.getElementById('pagination-anchors').innerHTML = html;
            }

            init();

            return {
                CURRENT_PAGE: currentPage,
                paginateSearchResultsToPage: goToPage
            };
        }();
    });
