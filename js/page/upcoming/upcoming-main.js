/**
 * @file Behaviors for the upcoming sign-up form
 */
require(
    ["jquery", "component/form/FormValidator", "component/form/ClientSideValidation", "util/cookie", "sumoselect"],
    function($, FormValidator, ClientSideValidation, cookie) {

        /**
         * Page Initialization
         */

        var $form = $('#future-vehicle-form'),
            validator;
        // LIM 496 change
        var $multiselect = $form.find("select.multiselect"),
            $addVehicle = $('#specificVehicle'),
            $vehicleofInterestRow = $('.vehicleofInterest');

        function init() {

            // load form validation
            validator = new FormValidator($form);
            validator.initClientSideValidation();

            bindEvents();
            setUpMultiSelect();
            var zipElement = $form.find("#zip");
            if (zipElement.val() === "") {
                zipElement.val(cookie.get("dealer-last-search-dealerZip"));
            }
        }

        /**
         * Form is validated. Validation module handles error and success
         * cases.
         *
         * @private
         * @param {Object}
         *            e - The jQuery event object used to prevent default
         *            form submission.
         */

        function onSubmitForm(e) {

            e.preventDefault();

            if ($addVehicle.is(":checked") && !$("#model option:selected").length) {
                $('.voe_error').show();
                return false;

            } else {
                $('.voe_error').hide();
            }

            validator.validate();
        }

        /**
         * Dealer locator and form submit binds.
         *
         * @private
         */

        function bindEvents() {
            $(".btn-success").on("click", onSubmitForm);
        }

        /*******************************************************************
         * Creates a multi select dropdown box
         *
         *
         ******************************************************************/

        function setUpMultiSelect() {
            $vehicleofInterestRow.hide();
            $multiselect.SumoSelect({
                csvDispCount: 3,
                maxLimit: 3,
                forceCustomRendering: true
            });

            $addVehicle.on('change', function() {

                if ($(this).is(":checked")) {
                    $vehicleofInterestRow.show();
                } else {
                    $vehicleofInterestRow.hide();
                }

            });

        }

        init();

    });
