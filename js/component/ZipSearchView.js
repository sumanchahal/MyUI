define(["jquery",
        "modernizr",
        "util/geolocationHelper",
        "util/cookie",
        "analytics",
        "component/map/ZipSearch"
    ],
    function($,
        Modernizr,
        geolocationHelper,
        Cookie,
        analytics,
        ZipSearch) {
        $("#zip-wrapper").addClass("active");
        var ZipSearchView = function(element, params, callbacks) {
            var self = this;
            self.zipSearch = $(element);
            self.ajaxLoader = self.zipSearch.find("#ajaxLoader");
            self.zipCode = "";
            self.searchResults = $(".search-results");
            self.searchResultsContainer = self.searchResults.find("ul");
            self.inputSearch = self.zipSearch.find(".input-search");
            self.btnSearch = self.zipSearch.find(".btn-search");
            self.searchResultTmpl = getSearchTemplate();
            self.disErrorLarge = $(".dis-error-large");
            var opts = $.extend({
                geolocation: self.geolocation,
                zipCode: self.zipCode,
                hasStateDropDown: false,
                maxResults: 5,
                fireTags: false,
                onAjaxBeforeSend: function() {
                    //self.ajaxLoader.show();
                    //self.searchResults.hide();

                },
                onAjaxComplete: function() {
                    //self.ajaxLoader.hide();
                },
                onAjaxError: function(data) {
                    //if (data.status === 500) {
                    //    self.disErrorLarge.show();
                    //    self.zipSearch.hide();
                    //    self.mapEl.hide();
                    //}
                    //self.ajaxLoader.hide();
                },
                onValidationError: function(type) {
                    //if (type === "invalid-zip") {
                    //    self.map.removePins();
                    //    clearOffers();
                    //    analytics.helper.fireFindADealerErrorPageLoad("Error Overlay", self.inputSearch.val());
                    //}
                },
                onSuccess: function(searchType, result) {
                    //getDealers() results callback
                    renderSearchResultsTemplate(searchType, result);
                    if (callbacks && callbacks.onSuccess) {
                        callbacks.onSuccess(result);
                    }
                }
            }, params);
            zipsearch = new ZipSearch(element, opts);
            $(".form-zip-search").on("submit", onSearchSubmit);

            function onSearchSubmit(e) {
                e.preventDefault();
                zipsearch.getDealers("", "");

                // check if DIS is down
                // TODO: Add in DIS errors
                zipsearch.isDISDown(function(isDown) {
                    if (isDown) {
                        self.disErrorLarge.show();
                        self.zipSearch.hide();
                    }
                });
            }

            function getSearchTemplate() {
                return ['<li data-dealer-id="{{id}}" data-lng="{{dealerLongitude}}" data-lat="{{dealerLatitude}}">',
                    '<span class="marker"></span>',
                    '<h2 class="sub-heading">{{dealerName}}</h2>',
                    '{{showDealerDistance}}',
                    '{{eliteStatus}}',
                    '<address>',
                    '<span class="street">{{address1}}</span>',
                    '<span class="city">{{city}}</span>, <span class="state">{{state}}</span>&nbsp;<span class="zip">{{zipCode}}</span>',
                    '<span class="phone">{{phone}}</span>',
                    '</address>',
                    '<p><a href="/dealers/{{id}}-{{dealerDetailSlug}}" class="btn btn-stroke">Dealer Info</a></p>',
                    '</li>'
                ].join('\n');
            }

            function setSearchTemplate(searchTemplate) {
                self.searchResultTmpl = searchTemplate.join('\n');
            }

            function renderSearchResultsTemplate(searchType, result) {
                var dealers = result.data;

                //https://gist.github.com/Integralist/1225181

                function template(string, data, prop) {
                    for (prop in data) {
                        if (data.hasOwnProperty(prop)) {
                            string = string.replace(new RegExp('{{' + prop + '}}', 'g'), data[prop]);
                        }
                    }
                    return string;
                }

                var output = "",
                    tmplEliteDealerStatus = '<span class="elite-dealer">Elite Dealer</span>',
                    tmplDealerDistance = '<span class="distance">{{dealerDistance}} MI.</span>';
                $.each(dealers, function(index, dealer) {
                    var address = dealer.dealerAddress;
                    dealer.address1 = address.address1;
                    dealer.city = address.city;
                    dealer.state = address.state;
                    dealer.zipCode = address.zipCode;
                    if (!dealer.dealerPhone) {
                        dealer.phone = "";
                        dealer.mobilePhone = "";
                    } else {
                        dealer.phone = dealer.dealerPhone.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                        dealer.mobilePhone = "1-" + dealer.dealerPhone.replace(/[^\d]/g, "-");
                    }
                    dealer.showButtonSeeMoreDealers = "";
                    dealer.showDealerDistance = "";
                    if (dealer.dealerPreOwnedInventoryUrl.indexOf('VehicleSearchResults') !== false) {
                        dealer.dealerPreOwnedInventoryUrl += "?search=preowned";
                    } else if (dealer.dealerPreOwnedInventoryUrl.indexOf('Inventory') !== false) {
                        daler.dealerPreOwnedInventoryUrl += "?cid=2";
                    }

                    //check if dealer has elite status
                    if (dealer.eliteStatus === true) {
                        dealer.eliteStatus = tmplEliteDealerStatus;
                    } else {
                        dealer.eliteStatus = "";
                    }

                    if (dealer.dealerDistance !== 0) {
                        dealer.showDealerDistance = tmplDealerDistance.replace(new RegExp('{{dealerDistance}}', 'g'), dealer.dealerDistance);
                    }

                    output += template(self.searchResultTmpl, dealer);
                });

                self.searchResultsContainer.empty().append(output);
                return;
            }
            return {
                setSearchTemplate: setSearchTemplate
            };
        };
        return ZipSearchView;
    });
