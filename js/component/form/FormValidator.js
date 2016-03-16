define(["lexus", "jquery", "omniture/global-metrics", "component/FullPageLoader", "analytics", "util/cookie"], function(LEXUS, $, globalMetrics, FullPageLoader, analytics, cookie) {

    var REQUEST_STATUS_REJECTED = "REJECTED",
        FORM_DATA_ANALYTICS_COOKIE = "leadFormAnalyticsData",
        /** @prop {LeadFormAnalyticsBundle} */
        analyticsData;

    if (!LEXUS.FormValidationRules) {
        LEXUS.FormValidationRules = {};
    }

    var FormValidator = function(el, params) {
        this.init(el, params);
    };

    $.extend(FormValidator.prototype, {
        analytics: analytics,
        constructor: FormValidator,
        init: function(el, options) {
            this.$el = $(el);
            this.requestInProgress = false;
            this.opts = $.extend({
                $form: $("form"),
                errorClass: "error",
                serverRequestErrorClass: "form-error",
                formUrl: this.$el.data("validator")
            }, options);
            this.loader = this.$el.find("." + this.opts.loaderClass);
            this.serverRequestError = this.$el.find("." + this.opts.serverRequestErrorClass);
            this.$el.find("input").on("keypress", $.proxy(this.onFieldKeyPress, this));
            this.$el.find("select").on("change", $.proxy(this.onFieldKeyPress, this));
            FullPageLoader.init();

            // init validation rules
            $.each(LEXUS.FormValidationRules, $.proxy(function(helper, opts) {
                opts.call(this);
            }, this));
        },


        validate: function() {
            analyticsData = this.collectDataForAnalytics(this.$el);
            this.request(this.$el.serialize(), $.proxy(this.requestSuccess, this));
        },

        /**
         * Save data to be kept for analytics fireTag.
         * @param $form {jquery} The form to parse for data.
         * @return analyticsData {LeadFormAnalyticsBundle}
         */
        collectDataForAnalytics: function($form) {
            var analyticsData = {};
            analyticsData.zip = $form.find("#zip").val();
            analyticsData.pageId = LEXUS.page.pageId;
            analyticsData.modelName = $("#modelFulfillmentCode").find(":selected").text().trim() || globalMetrics.getGlobalVariable("model_name");
            analyticsData.dealerName = $form.find(".dealer-results input:checked").data('name');
            analyticsData.didCheckAllowDealerToContact = $form.find("#mayContact:checked").length > 0;
            analyticsData.didCheckSendMeCPO = $form.find("#cpoFulfillmentCode:checked").length > 0;
            analyticsData.didCheckSendMeFinancialInfo = $form.find("#lfsFulfillmentCode:checked").length > 0;
            // Start LIM 496
            analyticsData.vehicleOfInterestSelected = $form.find("#specificVehicle").is(":checked");
            analyticsData.modelNamesVOE = $("#model").val();
            // END LIM 496
            return analyticsData;
        },

        request: function(data, serverCallback) {
            if (this.requestInProgress) {
                return;
            }

            this.requestInProgress = true;
            FullPageLoader.open();
            this.serverRequestError.removeClass('server-error validation-error');

            $.get(this.opts.formUrl, data, serverCallback)
                .fail($.proxy(this.requestFail, this))
                .always($.proxy(this.requestAlways, this));
        },

        requestFail: function() {
            this.showServerErrorMessage();
        },

        requestAlways: function() {
            this.requestInProgress = false;
            FullPageLoader.close();
        },

        requestSuccess: function(result, textStatus) {
            if (result.data.status === REQUEST_STATUS_REJECTED) {
                this.showValidationErrorMessages(result.data.validationErrors);
            } else {
                this.saveConfirmationAnalytics(analyticsData);
                this.proceedToConfirmationPage();
            }
        },


        handleValidationErrors: function(validationErrors) {
            this.removeAllErrors();
            this.validationErrorsIteration(validationErrors);
        },

        validationErrorsIteration: function(validationErrors) {
            if (validationErrors.dealerCode) {
                validationErrors.mayContact = 'invalid';
                if ($('input[name="dealerCode"]').length > 0) {
                    validationErrors.mayContact = validationErrors.dealerCode;
                }
            }

            $.each(validationErrors, $.proxy(function(field, errorMessage) {
                var $parent = $("#" + field).parent();

                if ($parent.hasClass('dk_container')) {
                    $parent.addClass(this.opts.errorClass);
                    $parent = $parent.parent();
                }

                //check if the preferred dealers message is visible and if it is don't show the extra zip code error message
                if ($('.preferred-dealers').hasClass('dis-error') && field === 'mayContact') {
                    return false;
                }

                $parent.addClass(this.opts.errorClass);
                $("#" + field).addClass(this.opts.errorClass);
                $parent.find('span.' + errorMessage).addClass(this.opts.errorClass).show();

            }, this));
        },

        removeError: function($target) {
            var $parent = $target.parent();

            if ($parent.hasClass('dk_container')) {
                $parent.removeClass(this.opts.errorClass);
                $parent = $parent.parent();
            }

            $target.removeClass(this.opts.errorClass);
            $parent.removeClass(this.opts.errorClass);
            $parent.find("span." + this.opts.errorClass).hide();
        },

        removeAllErrors: function() {
            this.$el.find("span." + this.opts.errorClass).hide();
            this.$el.find("." + this.opts.errorClass).removeClass(this.opts.errorClass);
        },

        showServerErrorMessage: function() {
            analytics.helper.fireLeadFormValidationError("Server Error", $(".server-error.error-description").text());
            this.serverRequestError.addClass('server-error');
        },

        showValidationErrorMessages: function(errors) {
            analytics.helper.fireLeadFormValidationError("Validation Error", $(".validation-error.error-description").text());
            this.serverRequestError.addClass('validation-error');
            this.handleValidationErrors(errors);
        },

        saveConfirmationAnalytics: function(analyticsData) {
            cookie.set(cookie.key.LEAD_FORM_DATA_ANALYTICS_COOKIE, JSON.stringify(analyticsData));
        },

        proceedToConfirmationPage: function() {
            this.$el.submit();
        },

        onFieldKeyPress: function(e) {
            var $target = $(e.target);

            if (!$target.hasClass(this.opts.errorClass)) {
                return;
            }

            this.removeError($target);
        }
    });

    //expose prototype for validation rules
    if (!LEXUS.FormValidatorProto) {
        LEXUS.FormValidatorProto = FormValidator.prototype;
    }

    return FormValidator;

});
