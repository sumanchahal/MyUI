/**
 * @file Client side validation for lead forms.
 */

define(["jquery", "lexus", "component/form/FormValidator"], function($, LEXUS, FormValidator) {

    $.extend(LEXUS.FormValidatorProto, {

        initClientSideValidation: function() {
            this.textInputBinds();
            this.selectBinds();
            this.zipBinds();
        },

        /**
         * Binds text inputs with blur and throttled keyup events for validation.
         *
         * @public
         */

        textInputBinds: function() {
            var self = this;
            var textInputs = [
                this.$el.find("input[id=firstName]"),
                this.$el.find("input[id=lastName]"),
                this.$el.find("input[id=email]"),
                this.$el.find("input[id=addressLine1]"),
                this.$el.find("input[id=addressLine2]"),
                this.$el.find("input[id=city]"),
                this.$el.find("input[id=zip]")
            ];

            $.each(textInputs, function(i, $input) {
                $input.on('keyup', self.debounce(function(e) {
                    self.onInputKeyup(e);
                }, 1500));

                $input.blur(function() {
                    self.validateInput($input);
                });
            });
        },

        /**
         * Validates input if the user pressed on a key that is not tab.
         *
         * @public
         * @param {Object} e - The jQuery event object used to detect tab.
         */

        onInputKeyup: function(e) {
            var $input = $(e.target);
            var keyCode = window.event ? e.keyCode : e.which;

            if (keyCode !== 9) {
                this.validateInput($input);
            }
        },

        /**
         * Binds selects with change events for validation.
         *
         * @public
         */

        selectBinds: function() {
            var self = this;
            var selects = [
                this.$el.find("select#modelFulfillmentCode"),
                this.$el.find("select#state")
            ];

            $.each(selects, function(i, $input) {
                $input.change(function() {
                    self.validateInput($input);
                });
            });
        },

        /**
         * Binds zip with paste and keypress events for validation.
         *
         * @public
         */

        zipBinds: function() {
            var self = this;
            var $zip = this.$el.find("input[id=zip]");

            $zip.on('keypress', $.proxy(this.onZipCodeFieldKeyPress, this));
        },

        /**
         * Function throttles keyup events to avoid unnecessary function calls.
         *
         * @public
         * @param {function} callback - the function that is called after throttle.
         * @param {int} delay - The amount in ms the keyup event is throttled.
         */

        debounce: function(callback, delay) {
            var timer = null;

            return function() {
                var context = this;
                var args = arguments;

                clearTimeout(timer);
                timer = setTimeout(function() {
                    callback.apply(context, args);
                }, delay);
            };
        },

        /**
         * Function allows user to only enter numbers in zip code.
         *
         * @public
         * @param {Object} e - The jQuery event object used to prevent default keyboard events.
         */

        onZipCodeFieldKeyPress: function(e) {
            var $input = $(e.target);
            var keyCode = window.event ? e.keyCode : e.which;

            if (keyCode < 48 || keyCode > 57) {
                //codes for backspace, delete, enter
                if (keyCode !== 0 && keyCode !== 8 && keyCode !== 13 && !e.ctrlKey) {
                    e.preventDefault();
                }
            } else if (keyCode === 118) {
                this.validateInput($input);
                e.preventDefault();
            }
        },

        /**
         * Function handles all of the logic necessary to validate input.
         *
         * @public
         * @param {Object} $input - The jQuery elemnt that needs to be validated.
         */

        validateInput: function($input) {
            var value = $input.val();
            var optional = $input.data('optional');
            var id = $input.attr('id');

            if (this.isEmptyField(value) && !optional) {
                this.postSingleErrorMessage($input, 'empty');
            } else if (!this.isValidField(value, id)) {
                this.postSingleErrorMessage($input, 'invalid');
            } else {
                this.removeError($input);
            }
        },

        /**
         * [LIM- 3028] Function that goes through all of the validate-able fields and
         * validates them, this fu nction is called on submit.
         * @public
         */
        validateInputsOnSubmit: function() {
            var self = this;
            var textInputs = [
                this.$el.find("input[id=firstName]"),
                this.$el.find("input[id=lastName]"),
                this.$el.find("input[id=email]"),
                this.$el.find("input[id=addressLine1]"),
                this.$el.find("input[id=addressLine2]"),
                this.$el.find("input[id=city]"),
                this.$el.find("input[id=zip]")
            ];

            $.each(textInputs, function(i, $input) {
                self.validateInput($input);
            });
        },

        /**
         * [LIM- 3028] Function that goes through all of the validate-able fields and
         * checks whether they are complete or not. Will only return true if all of the
         * fields are complete i.e do not have the class error.
         * @public
         */
        isFormComplete: function() {
            var self = this;
            var complete = true;
            var textInputs = [
                this.$el.find("input[id=firstName]"),
                this.$el.find("input[id=lastName]"),
                this.$el.find("input[id=email]"),
                this.$el.find("input[id=addressLine1]"),
                this.$el.find("input[id=addressLine2]"),
                this.$el.find("input[id=city]"),
                this.$el.find("input[id=zip]")
            ];

            $.each(textInputs, function(i, $input) {
                if ($input.hasClass('error')) {
                    complete = false;
                }
            });
            return complete;
        },

        /**
         * Function returns true if the string passed is empty.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isEmptyField: function(string) {
            if (typeof(string) === "string") {
                string = string.trim();
                if (string.length > 0) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Function returns true if the string is considered valid based on the element's id.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isValidField: function(string, id) {
            var isValid = true;

            if (id === 'firstName' || id === 'lastName') {
                isValid = this.isValidName(string);
            } else if (id === 'addressLine1' || id === 'addressLine2') {
                isValid = this.isValidAddress(string);
            } else if (id === 'email') {
                isValid = this.isValidEmail(string);
            } else if (id === 'zip') {
                isValid = this.isValidZipCode(string);
            } else if (id === 'city') {
                isValid = this.isValidCity(string);
            }

            return isValid;
        },

        /**
         * Function returns true if the string is considered a valid name.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isValidName: function(string) {
            if (!string.match(/^[a-zA-Z' -]*$/)) {
                return false;
            }
            return true;
        },

        /**
         * Function returns true if the string is considered a valid city.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isValidCity: function(string) {
            if (!string.match(/^[a-zA-Z' - .]*$/)) {
                return false;
            }
            return true;
        },

        /**
         * Function returns true if the string is considered a valid email.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isValidEmail: function(string) {
            var regex = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
            if (!string.match(regex)) {
                return false;
            }
            return true;
        },

        /**
         * Function returns true if the string is considered a valid Address.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isValidAddress: function(string) {
            if (!string.match(/^[\w -'.#]*$/)) {
                return false;
            }
            return true;
        },

        /**
         * Function returns true if the string is considered a valid zip.
         *
         * @public
         * @param {String} string - String that needs to be validated.
         */

        isValidZipCode: function(zip) {
            zip = zip.replace(/\(.*?\)/g, "").replace(/ /gi, "");
            if (!zip.match(/^\d+$/)) {
                return false;
            }
            if (zip.length !== 5) {
                return false;
            }
            return true;
        },

        /**
         * Function returns true if the string is considered a valid email.
         *
         * @public
         * @param {Object} $input - Element that contains the error.
         * @param {String} errorType - The type of error contained in the input. opts: invalid, empty or long.
         */

        postSingleErrorMessage: function($input, errorType) {
            var id = $input.attr('id');
            var error = {};

            error[id] = errorType;
            this.removeError($input);
            this.validationErrorsIteration(error);
        }

    });
});
