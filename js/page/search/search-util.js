define(['jquery', 'omniture/analytics-helper'], function($, Analytics) {


    "use strict";

    return {

        /**
         * Throw search result error, either from bad JSON mapping or no results
         * @param error - the error message.
         */

        throwSearchResultError: function(jqXHR, textStatus, errorThrown) {
            //Throw up the template for the search result error and inject error message into it
            $('.results-returned').hide();
            $('#no-results-container').show();
            console.error(errorThrown);
        },

        /**
         * Trim all of the URLs to a small length to prevent text wrapping
         */

        trimUrls: function(results) {
            var i = 0;

            for (; i < results.length; i++) {
                results[i].url = results[i].url.replace(/HTTP\:\/\/WWW\./gi, '');
                if ((results[i].url).length > 40) {
                    results[i].url = results[i].url.substring(0, 40) + "...";
                }
            }

            return results;
        },

        /**
         * If title is > 100 add ...
         */

        trimTitles: function(results) {
            var i = 0;

            for (; i < results.length; i++) {
                if (results[i].title.length === 100) {
                    results[i].title = results[i].title + "...";
                }
            }

            return results;
        },

        /**
         * Toggle the group links to expand and contract.
         */

        bindGroupToggle: function() {
            $('.toggle-group-links').on('click', function(e) {
                $(this).toggleClass('expanded');
                $(this).prev('.link-group').toggleClass('expanded');
            });
        },

        /**
         * Looking at the amount of results returned, generate page count (max 10)
         * @returns {number}
         */

        generatePageCount: function(results) {
            var pageCount = Math.ceil(results.length / 10);
            return pageCount > 10 ? 10 : pageCount;
        },

        /**
         * Lowercases h for hybrid (200h) or model (ESh)
         * Also do not uppercase disclaimers
         *
         * @param string
         * @returns {*}
         */
        lowercaseH: function(string) {
            return string.match(/<span/gi) ?
                string.replace(/([^<]*?)?(<span.*?<\/span><\/span>)([^<]*?)?/gi, function(match, p1, p2, p3) {
                    return (p1 ? p1.toUpperCase() : "") + p2 + (p3 ? p3.toUpperCase() : "");
                })
                .replace(/\s([\w]{2,3})(h)\s/gi, " $1h ") :
                string.toUpperCase().replace(/\s([2350estx]{2,3})(h)\s/gi, " $1h ");
        },

        /**
         * Lowercase the i in iTunes for legality
         * @param itunes
         * @return iTUNES
         */
        lowerCaseIinItunes: function(itunes) {
            return itunes.replace(/(^|\s)itunes/gi, "<span class='lowercase'>i</span>Tunes");
        },

        /**
         * Capitalize the first letters of each word. Exceptions include model names.
         * This is used for analytics.
         *
         * @param s
         * @returns {string}
         */
        toCapitalize: function(s) {

            var models = LEXUS.Search.getModelsList(),
                i, reg;

            s = s.toLowerCase();
            s = s.replace(/^\S|\s(\w)/g, function(a) {
                return a.toUpperCase();
            });
            for (i = models.length - 1; i >= 0; i--) {
                reg = new RegExp('(^|\\s)(' + models[i] + ')(\\s|$)', "gi");
                s = s.replace(reg, function(a) {
                    return a.toUpperCase();
                }); //jshint ignore:line
            }

            return s;

        },


        /**
         * When a user clicks on the menu in mobile or tablet hide the search form to avoid duplicate
         * search fields shown to the user. Once menu is closed the search field may appear again.
         */
        hideSearchOnMenuClick: function() {

            $('#mobileMenuButton').click(function(e) {

                if ($("#mobileMenuList").hasClass("open")) {
                    $("#search-form-search").hide();
                } else {
                    $("#search-form-search").show();
                }
            });
        },

        /**
         * PDF's should open in a new tab
         */
        newTabForPDF: function() {

            var pdfNode = document.getElementsByClassName("pdf"),
                i;
            for (i = pdfNode.length - 1; i >= 0; i--) {
                pdfNode[i].parentNode.target = "_blank";
            }
        },

        /**
         * If a property is null or empty on the backend do not load the blank HTML element.
         *
         * @param template
         * @param prop
         * @returns {*}
         */
        removeHTMLElementFromTemplate: function(template, prop) {

            var mustacheIndex, startIndex, endIndex, count;

            mustacheIndex = template.indexOf('{{' + prop + '}}');

            if (mustacheIndex === -1 || prop === 'backgroundImage') {
                return template;
            }

            startIndex = mustacheIndex;
            endIndex = mustacheIndex;
            count = 0;

            //Move left character by character until getting to the opening tag
            while (startIndex > -1) {
                if (template[startIndex] === '<') {
                    if (template[startIndex + 1] === '/') {
                        count++;
                    } else {
                        if (count === 0) {
                            break;
                        }
                        count--;
                    }
                }
                startIndex--;
            }

            //Move right character by character until getting to the closing tag
            while (endIndex < template.length) {

                if (template[startIndex + 1] === 'i') {
                    while (true) {
                        endIndex++;
                        if (template[endIndex] === '>') {
                            break;
                        }
                    }
                    break;
                }

                if (template[endIndex] === '/' && template[endIndex + 1] === template[startIndex + 1]) {
                    while (true) {
                        endIndex++;
                        if (template[endIndex] === '>') {
                            break;
                        }
                    }
                    break;
                }
                endIndex++;
            }

            //Remove HTML element from template, return result
            return template.replace(template.substring(startIndex, endIndex + 1), '');

        },

        /**
         * Search analytics listeners. On click events to fire analytics tags
         *
         * searchPageClick: function(page, container, category, label, keyword) {
         */
        initSearchAnalyticsListeners: function(analyticsSearchType, analyticsSearchTerm) {

            var title, container, category, type, that = this;

            //Results Found Page Clicks
            $(".result a").click(function(e) {

                var $result = $(this).closest(".result");

                title = this.getAttribute("data-title") ? this.getAttribute("data-title").toLowerCase() : this.textContent.toLowerCase();
                container = this.getAttribute("data-managed") || $result.data("managed");
                container = container === true ? "Managed Links" : "Results Link";
                category = $result.data("category") || "";

                //Special case for title remove type
                title = title.replace(/^\s?(html|pdf|faq)\s?/, "");
                title = that.toCapitalize(title);

                Analytics.searchPageClick(analyticsSearchType, container, category, title, analyticsSearchTerm);
            });

            //Card Clicks
            $("a, .clickable", ".card").click(function(e) {

                title = this.getAttribute("data-title") || this.target.textContent || e.target.textContent;
                category = $(e.target).closest(".card").data("category");
                container = $(e.target).closest(".card").data("container") || "Key Card";

                //FAQ links can have disclaimers in them. Remove the * and number
                title = title.replace(/\d\*/gi, "");

                //For iTunes and Google Play send App Title
                title = e.target.className === "app-link" ? that.toCapitalize($(e.target).closest(".app-container-analytics").data("title")) + " " + title : title;
                title = title.replace(/<.*?>/gi, "").replace(/®/gi, ""); //Remove inner HTML if present, Registered mark
                title = that.toCapitalize(title);

                Analytics.searchPageClick(analyticsSearchType, container, category, title, analyticsSearchTerm);
            });

            //No Results Page Clicks 
            $("#no-results a").click(function(e) {
                category = e.target.getAttribute("data-category") || "";
                title = e.target.getAttribute("data-title") || e.target.textContent;

                Analytics.searchPageClick("No Results", "No Results Card", category, title, analyticsSearchTerm || "Search Result not found");
            });

            //Top Searches
            $("#top-searches-list a").click(function(e) {
                Analytics.searchPageClick("No Results", "Top Searches", "", e.target.getAttribute("data-label") || $(e.target).closest("a").data("label"), analyticsSearchTerm || "Search Result not found");
            });

            //Feedback
            $("#feedback").click(function(e) {
                Analytics.searchPageClickExtras("Footer", "Footer Link", "Contact Support", analyticsSearchTerm || "Search Result not found");
            });

            //Suggested Search Alternatives
            $(".search-summary a").click(function(e) {

                if (e.target.className === "searched-term") {
                    return;
                }

                title = e.target.getAttribute("data-title") || e.target.textContent;
                container = e.target.getAttribute("data-container") || "No Container Found";
                category = e.target.getAttribute("data-category") || "No Category Found";

                Analytics.searchPageClickExtras(container, category, title, analyticsSearchTerm || "Search Result not found");
            });

            $(".toggle-group-links span").click(function(e) {

                //Only record opening group links
                if (/more/gi.test(e.target.className)) {

                    type = this.parentNode.getAttribute('data-managed') === "true" ? "Managed Links" : "Results Link";
                    Analytics.searchPageClick(analyticsSearchType, type, "Grouped", "View More Models", analyticsSearchTerm);
                }
            });

        }

    };

});
