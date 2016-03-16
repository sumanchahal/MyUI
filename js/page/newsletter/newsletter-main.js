/**
 * @file Behaviors for the newsletter sign-up form
 */
require(["jquery", "component/form/FormValidator", "component/form/ClientSideValidation", "component/PreferredDealerLocator", "util/cookie", "dropkick",
    // LIM 496 changes
    "sumoselect"
], function($, FormValidator, ClientSideValidation, PreferredDealerLocator, cookie) {

    /**
     * Page Initialization
     */

    var preferredDealerLocator, $form = $('#newsletter-form'),
        $selects = $form.find("select.custom"),
        $getPreferredDealersCheck = $form.find('#mayContact'),
        validator;
    var $multiselect = $form.find("select.multiselect"),
        $addVehicle = $('#specificVehicle'),
        $vehicleofInterestRow = $('.vehicleofInterest');

    // clear "May Contact" select button (if already selected due to
    // browser
    // back button)
    $('input:checkbox').prop('checked', false);

    function init() {

        // load form validation
        validator = new FormValidator($form);
        validator.initClientSideValidation();

        bindEvents();
        var zipElement = $form.find("#zip");
        if (zipElement.val() === "") {
            zipElement.val(cookie.get("dealer-last-search-dealerZip"));
        }
        initPreferedDealers();
        setUpCustomSelects();
        setUpMultiSelect();
        $vehicleofInterestRow.hide();

    }

    /**
     * initializes the preferred dealer locator module
     *
     * @private
     */

    function initPreferedDealers() {
        preferredDealerLocator = new PreferredDealerLocator();
    }

    /**
     * Form is validated. Validation module handles error and success cases.
     *
     * @private
     * @param {Object}
     *            e - The jQuery event object used to prevent default form
     *            submission.
     */

    function onSubmitForm(e) {

        if ($addVehicle.is(":checked") && !$("#model option:selected").length) {
            $('.voe_error').show();
            return false;

        } else {
            $('.voe_error').hide();
        }
        e.preventDefault();
        validator.validate();
    }

    /**
     * Dealer locator and form submit binds.
     *
     * @private
     */

    function bindEvents() {
        $getPreferredDealersCheck.on("click", onGetPreferedDealers);
        $(".btn-success").on("click", onSubmitForm);
    }

    /**
     * Function finds preferred dealers based on whether user checked on the
     * dealer locator input.
     *
     * @private
     * @param {Object}
     *            e - The jQuery event object used to find checked element.
     */

    function onGetPreferedDealers(e) {
        var $zip = $form.find('#zip');
        var zip = $zip.val();
        var isChecked = $(this).prop("checked");
        var error = {};

        validator.removeError($(this));

        if (!isChecked) {
            preferredDealerLocator.removePreferredDealersList();
            $zip.off('keyup', changeZipForPreferredDealers);
        } else {
            $(this).prop("checked", true);
            if (validator.isValidZipCode(zip)) {
                preferredDealerLocator.getPreferedDealers(zip);
            } else {
                error.mayContact = 'invalid';
                validator.validationErrorsIteration(error);
            }
            $zip.on('keyup', changeZipForPreferredDealers);
        }
    }

    /**
     * Function finds preferred dealers based on whether user changed zip while
     * input was checked.
     *
     * @private
     * @param {Object}
     *            e - The jQuery event object used to find zip code element.
     */

    function changeZipForPreferredDealers(e) {
        var zip = $(this).val();

        validator.removeError($getPreferredDealersCheck);
        if (validator.isValidZipCode(zip)) {
            preferredDealerLocator.getPreferedDealers(zip);
        }
    }

    /**
     * Loads dropckick functions and styles for select element.
     *
     * @private
     */

    function setUpCustomSelects() {
        $selects.each(function() {
            var $this = $(this);
            $this.dropkick();
            // removes focus to options ul
            $this.promise().done(function() {
                $('.dk_options_inner').attr('tabindex', -1);
            });
        });
    }

    /***************************************************************************
     * Creates a multi select dropdown box
     *
     *
     **************************************************************************/

    function setUpMultiSelect() {
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
