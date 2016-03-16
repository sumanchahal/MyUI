/**
 * @file Behaviors for the brochure sign-up form
 */
require([
    "jquery",
    "component/form/FormValidator",
    "component/form/ClientSideValidation",
    "component/PreferredDealerLocator",
    "component/VerifiedAddress",
    "util/cookie",
    "dropkick"
], function(
    $,
    FormValidator,
    ClientSideValidation,
    PreferredDealerLocator,
    VerifiedAddress,
    cookie
) {

    /**
     * Page Initialization
     */

    var preferredDealerLocator,
        $form = $("#brochure-form"),
        $selects = $form.find("select.custom"),
        $getPreferredDealersCheck = $form.find('#mayContact'),
        validator;

    //clear "May Contact" checkbox (if already selected due to browser back button)
    $('#mayContact').prop('checked', false);

    //clear CPO checkbox (if already selected due to browser back button)
    $('#cpoFulfillmentCode').prop('checked', false);

    //clear Lexus Financials checkbox (if already selected due to browser back button)
    $('#lfsFulfillmentCode').prop('checked', false);

    function init() {

        //load form validation
        validator = new FormValidator($form);
        validator.initClientSideValidation();

        bindEvents();
        initPreferedDealers();
        initVerifiedAddress();
        setUpCustomSelects();
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
     * initializes the address verification module
     *
     * @private
     */

    function initVerifiedAddress() {
        verifiedAddress = new VerifiedAddress();
    }

    /**
     * Function ensures that the user has a completed address that can be verified.
     *
     * @private
     */

    function verifiedAddressListener() {
        var address2 = $form.find('#addressLine2').val();

        var addressObj = {
            'addressLine': $form.find('#addressLine1').val(),
            'locality': $form.find('#city').val(),
            'state': $form.find('#state').val(),
            'postalCode': $form.find('#zip').val()
        };

        $.each(addressObj, function(key, value) {
            if (validator.isEmptyField(value)) {
                addressObj = false;
            }
        });

        $('[data-address="verifiable"]').each(function() {
            if ($(this).hasClass('error')) {
                addressObj = false;
            }
        });

        if (addressObj) {
            verifiedAddress.getVerifiedAddress(addressObj, address2);
        }
    }

    /**
     * Form is validated. Validation module handles error and success cases.
     *
     * @private
     * @param {Object} e - The jQuery event object used to prevent default form submission.
     */

    function onSubmitForm(e) {
        e.preventDefault();
        validator.validateInputsOnSubmit();
        var allSelectsChecked = selectsChecked();
        if (validator.isFormComplete() && allSelectsChecked) {
            validator.validate();
        }
    }

    /**
     * Dealer locator, form submit and address verification element binds.
     *
     * @private
     */

    function bindEvents() {
        $getPreferredDealersCheck.on("click", onGetPreferedDealers);
        $(".btn-success").on("click", onSubmitForm);

        //Address verification done on change or on keyup events after 1600ms. (100ms after client side validation).
        $('[data-address="verifiable"]').keyup(validator.debounce(function() {
            verifiedAddressListener();
        }, 1600));
        $form.find('#state').on('change', verifiedAddressListener);
    }

    /**
     * Function finds preferred dealers based on whether user checked on the dealer locator input.
     *
     * @private
     * @param {Object} e - The jQuery event object used to find checked element.
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
     * Function finds preferred dealers based on whether user changed zip while input was checked.
     *
     * @private
     * @param {Object} e - The jQuery event object used to find zip code element.
     */

    function changeZipForPreferredDealers(e) {
        var zip = $(this).val();

        validator.removeError($getPreferredDealersCheck);
        if (validator.isValidZipCode(zip)) {
            preferredDealerLocator.getPreferedDealers(zip);
        } else {
            preferredDealerLocator.removePreferredDealersList();
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
    /**
     * Checks to make sure Selects(dropdowns have been selected)
     * returns true if all selects have been selected
     *
     * @private
     */

    function selectsChecked() {
        var selectsComplete = true;
        $selects.each(function() {
            var $this = $(this);
            var selectedItem = $this.val();

            //Kind of weird, but checking to make sure all the parents exist
            //so that we dont get an error.
            var selectorParent = $this.parent();
            var selectorControls;
            var errorSpan;
            if (selectorParent) {
                selectorControls = selectorParent.parent();
            }
            if (selectorControls) {
                errorSpan = selectorControls.find('span');
            }


            if (!selectedItem) {
                if (errorSpan) {
                    errorSpan.css('display', 'block');
                }
                selectsComplete = false;
            } else {
                if (errorSpan) {
                    errorSpan.css('display', 'none');
                }
            }
        });
        return selectsComplete;
    }

    init();

});
