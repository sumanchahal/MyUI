define([
        "jquery",
        "dropkick"
    ],
    function(
        $
    ) {

        /**
         * Form which allows a user to drill down to select a specific trim
         * across all car brands. When a particular field is changed
         * new options are lazy loaded via Ajax
         *
         * @class TrimDrillDown
         * @typedef {config}  configuration parameters.
         * @param {Function}  addCallback - Callback which is executed when the drilldown form is submitted
         * @param {Boolean}   lexusOnly - Enables option to only display Lexus trims
         */
        var TrimDrillDown = function(params) {
            var opts = $.extend({
                addCallback: $.noop,
                lexusOnly: false
            }, params),
                $module = opts.instance,
                $form = $module.find("form"),
                $yearSelect = $module.find(".year"),
                $makeSelect = $module.find(".make"),
                $modelSelect = $module.find(".model"),
                $trimSelect = $module.find(".trim"),
                $submitBtn = $module.find(".button"),
                $selects = $module.find("select.custom"),
                selectSettings = {
                    autoWidth: false
                },
                ENDPOINTS = {
                    CMS_MODELS: "/rest/cms/models",
                    CMS_TRIMS: "/rest/cms/trims/{model}",
                    YEARS: "/rest/years",
                    MAKES: "/rest/makes/{year}",
                    MODELS: "/rest/models/{make}/{year}",
                    TRIMS: "/rest/trims/{model}"
                };

            /**
             * @constructor
             */

            function init() {
                bindSelectChanges();
                bindFormSubmit();

                if (!opts.lexusOnly) {
                    initYearSelect();
                } else {
                    initModelSelect();
                }
            }

            /**
             * Send data to compare tray on submit
             *
             * @method bindFormSubmit
             * @private
             */

            function bindFormSubmit() {
                $form.submit(function(e) {
                    var data = {};

                    e.preventDefault();

                    if (!$submitBtn.hasClass("disabled")) {

                        data = {
                            id: $trimSelect.val(),
                            year: $yearSelect.val(),
                            make: $makeSelect.val(),
                            model: $modelSelect.find("option:selected").eq(0).text(),
                            trim: $trimSelect.find("option:selected").eq(0).text(),
                            helperFile: $form.data('file'), //LIM 148                            
                            dealerCode: $form.data('dealercode') // LIM 148
                        };

                        opts.addCallback(data);

                        resetForm();
                    }
                });
            }

            /**
             * Clears out all the form fields.
             *
             * @method resetForm
             * @public
             */

            function resetForm() {
                if (!opts.lexusOnly) {
                    $yearSelect.val("");
                    $yearSelect.dropkick("refresh");
                    disableFields([$makeSelect, $modelSelect, $trimSelect]);
                } else {
                    $modelSelect.val("");
                    $modelSelect.dropkick("refresh");
                    disableFields([$trimSelect]);
                }
            }

            /**
             * Kicks off events for when a selecbox is changed
             *
             * @method bindSelectChanges
             * @private
             */

            function bindSelectChanges() {
                if (!opts.lexusOnly) {
                    $yearSelect.on("change", changeYear);
                    $makeSelect.on("change", changeMake);
                    $modelSelect.on("change", changeModel);
                    $trimSelect.on("change", changeTrim);
                } else {
                    $modelSelect.on("change", changeModelLexusOnly);
                    $trimSelect.on("change", changeTrim);
                }


                $selects.each(function() {
                    var $this = $(this);

                    $this.dropkick(selectSettings);

                    if ($this.prop("disabled")) {
                        $this.parents(".dk_container").addClass("dk_disabled").find(".dk_options_inner li").remove();
                    }
                });
            }

            /**
             * Setup year select
             *
             * @method initYearSelect
             * @private
             */

            function initYearSelect() {
                disableFields([$yearSelect, $makeSelect, $modelSelect, $trimSelect]);

                populateSelect(ENDPOINTS.YEARS, $yearSelect, function(resp) {
                    return convertArrayToOptions(resp.data, false);
                }, function() {
                    enableField($yearSelect);
                });
            }

            /**
             * Setup model select
             *
             * @method initModelSelect
             * @private
             */

            function initModelSelect() {
                disableFields([$trimSelect]);

                populateSelect(ENDPOINTS.CMS_MODELS, $modelSelect, function(resp) {
                    return convertArrayToOptions(resp.data, true);
                }, function() {
                    enableField($modelSelect);
                });
            }

            /**
             * Callback when the change year select is changed
             *
             * @method changeYear
             * @private
             */

            function changeYear() {
                var selectedYear = $yearSelect.val(),
                    requestPath = ENDPOINTS.MAKES.replace("{year}", selectedYear);

                disableFields([$makeSelect, $modelSelect, $trimSelect]);
                clearSelectOptions($makeSelect);

                if (selectedYear !== "") {
                    populateSelect(requestPath, $makeSelect, function(resp) {
                        return convertArrayToOptions(resp.data, true);
                    }, function() {
                        $makeSelect.val("");
                        if ($yearSelect.val() !== "") {
                            enableField($makeSelect);
                        }
                    });
                }
            }

            /**
             * Callback when the change make select is changed
             *
             * @method changeMake
             * @private
             */

            function changeMake() {
                var selectedYear = $yearSelect.val(),
                    selectedMake = $makeSelect.val(),
                    requestPath;

                disableFields([$modelSelect, $trimSelect]);
                clearSelectOptions($modelSelect);

                if (selectedMake !== "" && selectedYear !== "") {
                    requestPath = ENDPOINTS.MODELS.replace("{year}", selectedYear);
                    requestPath = requestPath.replace("{make}", selectedMake);

                    populateSelect(requestPath, $modelSelect, function(resp) {
                        var opts = "",
                            data = resp.data,
                            i = 0,
                            len = data.length;

                        for (i; i < len; i++) {
                            if (typeof data[i].modelName !== "undefined" && typeof data[i].modelId !== "undefined") {
                                opts += '<option value="' + data[i].modelId + '">' + data[i].modelName + '</option>';
                            }
                        }

                        return opts;
                    }, function() {
                        enableField($modelSelect);
                    });
                }
            }

            /**
             * Callback when the change model select is changed
             *
             * @method changeModel
             * @private
             */

            function changeModel() {
                var selectedModel = $modelSelect.val(),
                    requestPath;

                disableFields([$trimSelect]);
                clearSelectOptions($trimSelect);

                if (selectedModel !== "") {
                    requestPath = ENDPOINTS.TRIMS.replace("{model}", selectedModel);

                    populateSelect(requestPath, $trimSelect, function(resp) {
                        var opts = "",
                            data = resp.data,
                            len = data.length,
                            i = 0;

                        for (i; i < len; i++) {
                            if (typeof data[i].trimName !== "undefined" && typeof data[i].trimId !== "undefined") {
                                opts += '<option value="' + data[i].trimId + '">' + data[i].trimName + '</option>';
                            }
                        }

                        return opts;
                    }, function() {
                        enableField($trimSelect);
                    });
                }
            }

            /**
             * Callback when the change model select is changed, for Lexus-only drilldown
             *
             * @method changeModelLexusOnly
             * @private
             */

            function changeModelLexusOnly() {
                var selectedModel = $modelSelect.val(),
                    requestPath;

                disableFields([$trimSelect]);
                clearSelectOptions($trimSelect);

                if (selectedModel !== "") {
                    requestPath = ENDPOINTS.CMS_TRIMS.replace("{model}", selectedModel);

                    populateSelect(requestPath, $trimSelect, function(resp) {
                        var opts = "",
                            data = resp.data,
                            len = data.length,
                            i = 0;

                        for (i; i < len; i++) {
                            if (typeof data[i].trim !== "undefined" && typeof data[i].chromeId !== "undefined") {
                                opts += '<option value="' + data[i].trim.chromeId + '">' + data[i].trim.trimName + ' ' + data[i].trim.powertrainName + '</option>';
                            }
                        }

                        return opts;
                    }, function() {
                        enableField($trimSelect);
                    });
                }
            }

            /**
             * Callback when trim is updated, since it's the last option it will
             * enable the form to submit
             *
             * @method changeTrim
             * @private
             */

            function changeTrim() {
                if ($trimSelect.val() !== "") {
                    $submitBtn.removeClass("disabled");
                } else {
                    $submitBtn.addClass("disabled");
                }
            }

            /**
             * Takes a array of fields and disables them and resets their values
             * Additionally, disables the submit button since if any fields are
             * disabled it's not needed
             *
             * @method disableFields
             * @param {jquery|HTMLElement} fields - List of fields to disable
             * @private
             */

            function disableFields(fields) {
                var i = 0,
                    len = fields.length;

                for (i; i < len; i++) {
                    fields[i].prop("disabled", true);
                    fields[i].val("");

                    fields[i].dropkick("refresh");
                    fields[i].parents(".dk_container").addClass("dk_disabled").attr("disabled", "disabled").find(".dk_options_inner li").remove();
                }

                $submitBtn.addClass("disabled");
            }

            /**
             * Takes a select in the form of a jquery object
             * and removes all the options except the first
             *
             * @method clearSelectOptions
             * @param {Dom Element} $select - Select box to be cleared
             * @private
             */

            function clearSelectOptions($select) {
                var $options = $select.find("option:gt(0)");
                $options.remove();
            }

            /**
             * Makes a request to get the options for a given select
             * processResults is used to massage the results into <options />
             * callback occurs once the results have loaded
             *
             * @method populateSelect
             * @param {String} endpoint - Service endpoint to get selectbox data
             * @param {Dom Element} $select - Select that needs to be populated
             * @param {Function} processResults - adapter method used to populate the select
             * @param {Function} callback - executed after data has return, and results procesed
             * @private
             */

            function populateSelect(endpoint, $select, processResults, callback) {
                var options = '';

                $.get(endpoint, function(resp) {
                    if (resp.status === 200) {
                        options = processResults(resp);
                        $select.append(options);

                        if (typeof callback === "function") {
                            callback();
                        }
                    }
                });

            }

            /**
             * Enable dropdown
             *
             * @method enableField
             * @private
             */

            function enableField($selector) {
                $selector.dropkick("refresh");

                $selector.prop("disabled", false)
                    .val("")
                    .parents(".dk_container")
                    .removeClass("dk_disabled")
                    .removeAttr("disabled");
            }

            /**
             * Takes an array and renders it at select options
             * returns as a chunk of HTML which can be injected into
             * a select.
             *
             * @method convertArrayToOptions
             * @param {Array} arr - array of data to be reformatted as select options
             * @return {String} generated html of select box options
             * @private
             */

            function convertArrayToOptions(arr, accending) {
                var i = 0,
                    len = arr.length,
                    output = "";

                if (accending === true) {
                    for (i; i < len; i++) {
                        output += "<option>" + arr[i] + "</option>";
                    }
                } else {
                    for (i = len - 1; i >= 0; i--) {
                        output += "<option>" + arr[i] + "</option>";
                    }
                }

                return output;
            }

            init();

            return {
                resetForm: resetForm
            };
        };

        return TrimDrillDown;
    });
