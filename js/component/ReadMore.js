define(['jquery'], function($) {

    /**
     * Read more/read less links are added to show and hide extra text.
     *
     * @class ReadMore
     * @typedef {config} configuration parameters.
     * @property {Object} characterCountMax - The maximum number of characters to display before truncating
     */

    var ReadMore = function(params) {


        /**
         * Enum for parser types.
         * @readonly
         * @enum {String}
         */
        var ParserType = {
            TEXT: "text",
            OPEN_TAG: "openTag",
            CLOSE_TAG: "closeTag",
            SELF_CLOSING_TAG: "selfClosingTag",
            DISCLAIMER_TAG: "disclaimerTag"
        };

        /**
         * Virtual class for character metadata.
         * @typedef {{index:Int, content:String, type:ParserType}} WordMetadata
         */

        /**
         * Configuration object.
         * @type {{
         *      characterCountMax:Int,
         *      instance: String
         * }}
         */
        var opts = $.extend({
            characterCountMax: 80
        }, params);

        /** @type {String} */
        var elementName = opts.instance,
            /** @type {jQuery} */
            $elementName = $(opts.instance),
            /** @type {Int} */
            characterCountMax = opts.characterCountMax,
            /** @type {String} */
            readMoreLabel = 'Read More',
            /** @type {String} */
            readLessLabel = 'Read Less';

        /**
         * Initialize the comonent.
         */

        function init() {
            $elementName.each(function() {
                var text = $(this).html(),
                    splitText;

                if (text.length > characterCountMax && !($(this).hasClass('read-more-text'))) {
                    if ($(this).data('read-more-label')) {
                        readMoreLabel = $(this).data('read-more-label');
                    }
                    if ($(this).data('read-less-label')) {
                        readLessLabel = $(this).data('read-less-label');
                    }

                    /* Truncate the value of text then go back to the end of the
                       previous word to ensure that we don't truncate in the middle of
                       a word */

                    splitText = getTextBeforeAndAfterSplit(text, characterCountMax);

                    // Create read more / read less dom elements
                    $(this).html('<span class="beg-text">' + splitText.beforeSplit + '</span><span class="ellipsis">&hellip;</span> ' + '<a href="#" class="read-more">' + readMoreLabel + '</a><span class="truncated-text">' + splitText.afterSplit + ' <a href="#" class="read-less">' + readLessLabel + '</a></span>').addClass('read-more-text');


                }

            });

            // Init read more click functionality
            addReadMoreClickListener();

        }

        /**
         * Processes the text and returns an object with the text split into two parts.
         * @param text {String} the original string.
         * @param characterCountMax {Int} The maximum character count.
         * @returns {{beforeSplit:String, truncatedText:String}}
         */

        function getTextBeforeAndAfterSplit(text, characterCountMax) {
            var splitIndex = getIndexOfReadMoreBreak(text, characterCountMax),
                beforeSplit = "",
                afterSplit = "";

            // If there was no need for a read more button, the splitIndex will be -1
            if (splitIndex < 0) {
                beforeSplit = text;
            } else {
                // get the beginning text
                beforeSplit = text.substring(0, splitIndex);

                // Separate the end of the text from the begining of the text
                afterSplit = text.slice(beforeSplit.length);

                // Remove extra whitespace on the begining text
                beforeSplit = $.trim(beforeSplit);
            }

            return {
                beforeSplit: beforeSplit,
                afterSplit: afterSplit
            };

        }


        /**
         * Given a string and a max character count, this
         * function returns the index at which to break the text
         * so that no words or HTML tags are split.
         *
         * @param string {String}
         * @param maxCharCount {int}
         */

        function getIndexOfReadMoreBreak(string, maxCharCount) {
            /** @type {Array.<WordMetadata>} */
            var wordList = getLocationsOfWordsAndTags(string),
                /** @type {Int} */
                indexOfBreak = -1;

            /** @type {Int} */
            var i = 0,
                /** @type {Int} */
                l = wordList.length,
                /** @type {Int} */
                endOfWord = 0,
                /** @type {Int} */
                trimmedLength = 0,
                /** @type {Int} */
                strippedStringLength = 0,
                /** @type {WordMetadata} */
                wordMetadata,
                /** @type {Int} */
                wordLength;

            for (; i < l; i++) {

                wordMetadata = wordList[i];

                if (wordMetadata.type === ParserType.DISCLAIMER_TAG) {
                    // treat disclaimer tags as one unit.
                    wordLength = 1;
                } else if (
                    wordMetadata.type === ParserType.OPEN_TAG ||
                    wordMetadata.type === ParserType.CLOSE_TAG ||
                    wordMetadata.type === ParserType.SELF_CLOSING_TAG
                ) {
                    wordLength = 0;
                } else {
                    wordLength = wordMetadata.content.length;
                }

                // ammount cut out if it was a tag.
                trimmedLength += wordMetadata.content.length - wordLength;
                // actual last index of the word
                endOfWord = wordMetadata.index + wordMetadata.content.length;
                strippedStringLength = endOfWord - trimmedLength;
                // the last index of the word as it would render in html.

                if (strippedStringLength > maxCharCount) {
                    if (i === 0) {
                        indexOfBreak = 0;
                        break;
                    }
                    // return the index of the previous word
                    var previousWord = wordList[i - 1];
                    indexOfBreak = previousWord.index + previousWord.content.length;
                    break;
                }
            }
            return indexOfBreak;
        }


        /**
         * Show/Hide read more extra text on click
         *
         * @method addReadMoreClickListener
         * @private
         */

        function addReadMoreClickListener() {
            // Display text after truncation to avoid flicker onload
            $elementName.css('display', 'block');

            // Click body copy
            $elementName.on('click', function(e) {
                e.preventDefault();


                if ($(e.target).parents('.tooltip-trigger').length === 0) {
                    if ($(this).hasClass('open')) {
                        readLess($('.read-less', $(this)));
                    } else {
                        readMore($('.read-more', $(this)));
                    }
                    $(this).toggleClass('open');
                    $(window).trigger('refreshTertiaryNav');
                }
            });


        }

        /**
         * Controls the display of the text when 'read more' is clicked
         *
         * @method readMore
         * @param $scope {JQuery} Instance of .read-more || .read-less button
         * @private
         */

        function readMore($scope) {
            // Show full text
            $scope.next('.truncated-text').css({
                'display': 'inline'
            });
            // Hide the read more link
            $scope.css({
                'display': 'none'
            });
            // Hide .ellipsis span
            $scope.parents(elementName).find('.ellipsis').css({
                'display': 'none'
            });
        }

        /**
         * Controls the display of the text when 'read less' is clicked
         *
         * @method readLess
         * @param $scope {JQuery} Instance of .read-more || .read-less button
         * @private
         */

        function readLess($scope) {
            $scope.parent('.truncated-text').css({
                'display': 'none'
            });
            // Show the read more link
            $scope.parents(elementName).find('.read-more').css({
                'display': 'inline'
            });
            // Show .ellipsis span
            $scope.parents(elementName).find('.ellipsis').css({
                'display': 'inline'
            });
        }

        /**
         * Toggles between read more and read less states depending on
         * which one is currently selected.
         *
         * @method toggle
         * @param $scope {JQuery} Instance of .read-more || .read-less button
         * @public
         */

        function toggleReadMoreLess($scope) {
            if ($scope.find('.truncated-text').is(':visible')) {
                readLess($scope.find('.read-less'));
            } else {
                readMore($scope.find('.read-more'));
            }
        }


        /**
         * @private
         * Searches the string and pulls out all the words and their locations.
         * Treats blocks of HTML as a single word.
         *
         * @param string {String} The original string to parse.
         * @return {Array.<WordMetadata>}
         */

        function getLocationsOfWordsAndTags(string) {

            var l = string.length,

                /**
                 * The set of word metadata.
                 * @type {Array.<WordMetadata>}
                 */
                words = [],

                /**
                 * The point at which the string is currently being read.
                 * @type {Int}
                 */
                cursor = 0,

                /**
                 * Tracks nesting of the tags
                 * @type {Int}
                 */
                tagDepth = 0,

                /** @type {Int} */
                startTagIndex = 0,
                /** @type {String} */
                word,
                /** @type {WordMetadata */
                wordMetadata,
                /** @type {String} */
                tag,
                /** @type {String} */
                fullTag,
                /** @type {String} */
                remainingString,
                /** @type {String} */
                space;

            /**
             * Matches any tag.
             * @const
             * @type {RegExp}
             */
            var TAG = /<\/?[^>]+>/,

                /**
                 * Matches any opening tag.
                 * @const
                 * @type {RegExp}
                 */
                OPEN_TAG = /<[^\/>][^>]*>/,

                /**
                 * Matches any closing tag.
                 * @const
                 * @type {RegExp}
                 */
                CLOSE_TAG = /<\/[^>]+>/,

                /**
                 * Matches Self-closing tags. (currently only supports <BR>)
                 * @const
                 * @type {RegExp}
                 */
                SELF_CLOSING_TAG = /<br\s*\/?>/,

                /**
                 * Matches a single word (that isn't a tag)
                 * @const
                 * @type {RegExp}
                 */
                WORD = /([^<\s])+/,

                /**
                 * Matches a block of whitespace
                 * @const
                 * @type {RegExp}
                 */
                SPACE = /\s+/,

                /**
                 * Matches a disclaimer tag.
                 * @const
                 * @type {RegExp}
                 */
                DISCLAIMER = /(<span class=('|")tooltip-trigger disclaimer('|") data-disclaimers=('|"))(.*?)(('|")><span class=('|")asterisk('|")>\*<\/span><\/span>)/;


            while (cursor < l) {
                wordMetadata = {
                    index: cursor
                };

                // capture the remaining string to parse
                remainingString = string.slice(cursor);

                // if a tag was matched
                if (remainingString.search(TAG) === 0) {
                    tag = remainingString.match(TAG)[0];

                    if (tagDepth === 0) {
                        startTagIndex = cursor;
                    }

                    // if tag is a disclaimer
                    if (remainingString.search(DISCLAIMER) === 0) {
                        tag = remainingString.match(DISCLAIMER)[0];

                        cursor += tag.length;

                        wordMetadata.content = string.slice(startTagIndex, cursor);
                        wordMetadata.type = ParserType.DISCLAIMER_TAG;


                        // if the tag isn't a disclaimer
                    } else {
                        wordMetadata.content = tag;

                        // If this tag is self-closing
                        if (tag.match(SELF_CLOSING_TAG)) {
                            wordMetadata.type = ParserType.SELF_CLOSING_TAG;

                        } else {

                            // If this is an open tag, increment the tag depth
                            if (tag.search(OPEN_TAG) >= 0) {
                                tagDepth++;
                                wordMetadata.type = ParserType.OPEN_TAG;

                                // If this is a close tag, decrement the tag depth.
                            } else if (tag.search(CLOSE_TAG) >= 0) {
                                tagDepth--;
                                wordMetadata.type = ParserType.CLOSE_TAG;
                            } else {
                                throw new Error("'" + tag + "' is an unsupported tag.");
                            }
                        }

                        // Move the cursor forward to the end of the tag.
                        cursor += tag.length;
                    }


                    // if it's not a tag...
                } else {
                    // pull the next word
                    word = remainingString.match(WORD)[0];

                    // Ignore all words while you're diving into HTML
                    wordMetadata.content = word;
                    wordMetadata.type = ParserType.TEXT;

                    // Move the cursor to the end of the word.
                    cursor += word.length;
                }

                // Try to grab any whitespace after the word.
                remainingString = string.slice(cursor);
                space = remainingString.match(SPACE);

                // if whitespace was found,
                if (space && space.index === 0) {
                    // move the cursor past the whitespace
                    cursor += space[0].length;
                }

                // add the metadata to the result
                words.push(wordMetadata);
            }
            return words;
        }

        init();

        return {
            toggle: toggleReadMoreLess,
            getTextBeforeAndAfterSplit: getTextBeforeAndAfterSplit,
            getLocationsOfWordsAndTags: getLocationsOfWordsAndTags,
            getIndexOfReadMoreBreak: getIndexOfReadMoreBreak
        };
    };

    return ReadMore;
});
