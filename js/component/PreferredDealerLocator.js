/**
 * @file Behaviors for the Preferred Dealer locator.
 */

define(['jquery', 'analytics'], function($, analytics) {

    var PreferredDealerLocator = function(el, params) {
        var opts = $.extend({
            el: $(".preferred-dealers"),
            resultContainer: $(".preferred-dealers .dealer-results"),
            errorContainer: $(".preferred-dealers .dis-error"),
            dealerOverride: $("#dealerOverride")
        }, params),
            RESTURL = "/rest/dealersByZip/",
            lastZip;

        /**
         * Performs an ajax request for dealers based on zip. Handles error and success cases.
         *
         * @public
         * @param {String} zip - Contains the zip code required to do a dealer search
         */

        function getPreferedDealers(zip) {
            lastZip = zip;
            $.ajax({
                url: RESTURL + zip,
                beforeSend: function() {
                    opts.el.removeClass('dis-error open').addClass('loading');
                }
            }).done(function(result) {
                handlePreferredDealerListSuccessCases(result.data);
            }).error(function(data) {
                //If a 500 Status returns but the response text contains "Redirect" it means
                //the service found the zipcode but is either Hawaii or PR. Do not treat as
                //a server error/DIS downtime on the front end. (Hawaii - 96730, PR - 00601)
                if (data.responseText.indexOf("Redirect") !== -1) {
                    handlePreferredDealerListErrorCases(400);
                } else {
                    handlePreferredDealerListErrorCases(data.status);
                }
            });
        }

        /**
         * Function handles the success cases based on whether there are any dealers or not.
         *
         * @private
         * @param {Array} dealers - Contains all of the dealers found within the user's zip.
         */

        function handlePreferredDealerListSuccessCases(dealers) {
            if (dealers.length > 0) {
                var output = generateSearchResultPreferedDealerOutput(dealers);
                opts.resultContainer.html(output);
            } else {
                //This does not mean the service is down, this means no dealers
                //were found for particular zipcode (Montana - 59464)
                handlePreferredDealerListErrorCases(400);
            }
        }

        /**
         * Function shows the preferred dealers list module error state.
         *
         * @private
         * @param {int} status - Error thrown by DIS.
         */

        function handlePreferredDealerListErrorCases(status) {
            // If you reached the service but the zip code wasn't found...
            if (status === 400) {
                var errorMessage = opts.errorContainer.find('.error-message.invalid').text();

                analytics.helper.fireLeadFormZipCodeError(lastZip, errorMessage);
                opts.errorContainer.addClass('invalid');
            }
            // Else, couldn't reach the service at all...
            else {
                opts.errorContainer.removeClass('invalid');

                //allows user to submit form regardless of error.
                opts.dealerOverride.val('true');
            }
            opts.el.removeClass('loading open').addClass('dis-error');
            opts.resultContainer.html('');
        }

        /**
         * Function returns the template for all of the dealers found.
         *
         * @private
         * @param {Array} dealers - Contains all of the dealers found within the user's zip.
         */

        function generateSearchResultPreferedDealerOutput(dealers) {
            var output = '';
            var isUnique = dealers.length === 1 ? true : false;

            dealers = randomizeDealerList(dealers);

            $.each(dealers, function(index, dealer) {
                output += searchResultPreferedDealerTemplate(dealer, isUnique);
            });

            opts.el.removeClass('loading dis-error').addClass('open');
            return output;
        }

        /**
         * Function randomizes the dealers list using Fisher-Yates Model.
         *
         * @private
         * @param {Array} dealers - Contains all of the dealers found within the user's zip.
         */

        function randomizeDealerList(dealers) {
            var i = dealers.length - 1;

            for (; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = dealers[i];
                dealers[i] = dealers[j];
                dealers[j] = temp;
            }
            return dealers;
        }

        /**
         * Function returns the form template for a dealer
         *
         * @private
         * @param {Object} dealer - Contains all of the dealer info required to create the input and label.
         */

        function searchResultPreferedDealerTemplate(dealer, isUnique) {
            var address2 = '';
            var checkRadioButton = isUnique ? 'checked="checked"' : '';
            var phone = dealer.dealerPhone.replace(/(\d{3})(\d{3})(\d{4})/, "$1.$2.$3");

            if (dealer.dealerAddress.address2) {
                address2 = '<span class="dealer-info">' + dealer.dealerAddress.address2 + '</span>';
            }

            var output = '<div class="radio custom-radio">' +
                '<input id="dealer-' + dealer.id + '" type="radio" name="dealerCode" value="' + dealer.id + '"' + checkRadioButton +
                ' data-name="' + dealer.dealerName + '" />' +
                '<label for="dealer-' + dealer.id + '" >' +
                dealer.dealerName +
                '<span class="dealer-info">' + dealer.dealerAddress.address1 + '</span>' +
                address2 +
                '<span class="dealer-info">' + dealer.dealerAddress.city + ', ' + dealer.dealerAddress.state + ' ' + dealer.dealerAddress.zipCode + '</span>' +
                '<span class="dealer-info">' + phone + '</span>' +
                '</label>' +
                '</div>';

            return output;
        }

        /**
         * Function sets the preferred dealers list back to its default state.
         *
         * @public
         */

        function removePreferredDealersList() {
            opts.el.removeClass('loading dis-error open');
            opts.resultContainer.html('');
        }

        return {
            getPreferedDealers: getPreferedDealers,
            removePreferredDealersList: removePreferredDealersList
        };
    };

    return PreferredDealerLocator;
});
