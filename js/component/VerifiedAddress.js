/**
 * @file Behaviors for the Bing address verification service.
 */

define(['jquery'], function($) {

    var VerifiedAddress = function() {

        var opts = $.extend({
            el: $('.address-verification'),
            userAddressContainer: $('.user-address-label'),
            verifiedAddressContainer: $('.verified-address-label'),
            verifiedAddressInput: $('#verifiedAddress'),
            addressLine2: ''
        }),
            RESTURL = '/rest/verifyAddress';

        /**
         * Grabs the key value pairs from the address object and formats them into query strings
         *
         * @private
         * @param {Object} address - Contains the necessary key value pairs for bing address verification
         */

        function getAddressQueryStrings(address) {
            var output = '';

            for (var prop in address) {
                if (address.hasOwnProperty(prop)) {
                    output += prop + '=' + address[prop] + '&';
                }
            }
            return output;
        }

        /**
         * Grabs the key value pairs from an address object and makes it into a jQuery dom object.
         *
         * @private
         * @param {Object} address - Contains the necessary key value pairs for template insertion.
         */

        function getFormattedAddress(address) {
            var output = '';

            // Hack to stop android devices from opening google maps on tap
            var hiddenCharacter = '<span class="hidden-character">@#$@</span>';

            if ('adminDistrict' in address) {
                address.state = address.adminDistrict;
            }
            // Add addressLine 2 back in.
            output = $('<span>' + address.addressLine + '<span class="hidden-character">@#$@</span>&nbsp;' + opts.addressLine2 + '</span>' +
                '<span>' + address.locality + ', ' + address.state + '<span class="hidden-character">@#$@</span>&nbsp;' + address.postalCode + '</span>');
            return output;
        }

        /**
         * Grabs the key value pairs from an address object and makes it into a series of jQuery hidden inputs.
         *
         * @private
         * @param {Object} address - Contains the necessary key value pairs for template insertion.
         */

        function getHiddenVerifiedAddress(address) {
            var output = '';

            output = $('<input type="hidden" id="verifiedAddressLine1" name="verifiedAddressLine1" value="' + address.addressLine + '"/>' +
                '<input type="hidden" id="verifiedAddressLine2" name="verifiedAddressLine2" value="' + opts.addressLine2 + '" />' +
                '<input type="hidden" id="verifiedCity" name="verifiedCity" value="' + address.locality + '" />' +
                '<input type="hidden" id="verifiedState" name="verifiedState" value="' + address.adminDistrict + '" />' +
                '<input type="hidden" id="verifiedZip" name="verifiedZip" value="' + address.postalCode + '" />');
            return output;
        }

        /**
         * Adds the class to the verified address main element to show loading state
         *
         * @private
         */

        function loadingVerifiedAddress() {
            opts.el.removeClass('open').addClass('loading');
        }

        /**
         * Inserts all of our formatted address templates, removes the loading state and adds the open state.
         *
         * @private
         * @param {Object} address - An object that contains the address that the user submitted.
         * @param {Object} verifiedAddress - An object that contains the verified address from Bing.
         */

        function openVerifiedAddress(address, verifiedAddress) {
            if (verifiedAddress) {

                // Get the different formatted addresses
                hiddenVerifiedAddress = getHiddenVerifiedAddress(verifiedAddress);
                address = getFormattedAddress(address);
                verifiedAddress = getFormattedAddress(verifiedAddress);

                // Add current info
                opts.el.append(hiddenVerifiedAddress);
                opts.userAddressContainer.append(address);
                opts.verifiedAddressContainer.append(verifiedAddress);

                // Default to verified address and remove loading
                opts.verifiedAddressInput.prop('checked', true);
                opts.el.removeClass('loading').addClass('open');
            } else {
                opts.el.removeClass('loading');
            }
        }

        /**
         * Removes all of our previously inserted address template.
         *
         * @private
         */

        function removePreviousVerifiedAddress() {
            opts.verifiedAddressInput.prop('checked', false);
            opts.el.find('input[type=hidden]').remove();
            opts.userAddressContainer.find('span').remove();
            opts.verifiedAddressContainer.find('span').remove();
        }

        /**
         * Requests the verified address from Bing. Handles error and success cases.
         *
         * @param {Object} address - An object that contains the address that the user submitted.
         * @param {String} address2 - contains the optional address line 2 string.
         * @public
         */

        function getVerifiedAddress(address, addressLine2) {

            // We save the second address line since Bing's address validation does not care about it.
            opts.addressLine2 = addressLine2;

            $.ajax({
                url: RESTURL + '?' + getAddressQueryStrings(address),
                beforeSend: function() {
                    loadingVerifiedAddress();
                    removePreviousVerifiedAddress();
                }
            }).done(function(result) {
                openVerifiedAddress(address, result.data.suggestedLocation);
            }).error(function() {}).complete(function() {
                opts.el.removeClass('loading');
            });
        }

        return {
            getVerifiedAddress: getVerifiedAddress
        };
    };

    return VerifiedAddress;
});
