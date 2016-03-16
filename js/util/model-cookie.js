require(["jquery", "util/cookie"], function($, cookie) {

    var MODEL_MAX_COUNT = 5;

    // Name of the cookie requested by MindTree
    var MODEL_COOKIE = 'lexus-drivers-viewed-cars';

    // Roughly 30 days
    var EXPIRATION = 45 * 60 * 1000;

    // Array that holds all the data
    var cookie_data;

    init();

    function init() {
        cookie_data = getCookie();
        var car = getCar();
        if (cookie_data === undefined) {
            // Instantiate a new model-data array
            cookie_data = [];
            addModelView(car.model, car.year);
        } else {
            // Query if this model has any interactions
            var actions = queryModelData(car.model, 'actions');
            if (actions) {
                // Pass actions to addModelView
                addModelView(car.model, car.year, car.actions);
            } else {
                // Add the modelView to the array with no actions
                addModelView(car.model, car.year);
            }
        }
        // Save the cookie
        uploadCookie();
    }

    function queryModelData(name, param) {
        if (!cookie_data) {
            return false;
        }
        for (var i = 0; i < cookie_data.length; i++) {
            if (cookie_data[i].model === name) {
                switch (param) {
                    case 'actions':
                        return cookie_data[i].interactions;
                    case 'index':
                        return i;
                }
            }
        }
        return false;
    }

    function filterFalseArrayValues() {
        cookie_data = cookie_data.filter(function(value) {
            return value !== undefined;
        });
    }

    function uploadCookie() {
        var bakedCookie = JSON.stringify(cookie_data);
        cookie.setWithExpiration(MODEL_COOKIE, bakedCookie, EXPIRATION);
    }

    function getCookie() {
        if (cookie.get(MODEL_COOKIE)) {
            return JSON.parse(cookie.get(MODEL_COOKIE));
        } else {
            return undefined;
        }
    }

    function addModelView(model, year, actions) {
        actions = actions === undefined ? 1 : actions + 1;
        var index = queryModelData(model, 'index');
        if (typeof index === 'number') {
            cookie_data[index] = undefined;
        }
        cookie_data.push({
            model: model,
            modelYear: year,
            timestamp: Date.now(),
            interactions: actions
        });
        filterFalseArrayValues();
        if (cookie_data.length > MODEL_MAX_COUNT) {
            cookie_data.shift();
        }
    }

    function addInteraction() {
        cookie_data = getCookie();
        var car = getCar();
        addModelView(car.model, car.year, car.actions);
        uploadCookie();
    }

    function getCar() {
        var model = LEXUS.page.seriesName;
        model = LEXUS.isHybrid === "true" || LEXUS.isHybrid === true ? model + " Hybrid" : model;
        var year = LEXUS.modelYear;
        var actions = queryModelData(model, 'actions');
        return {
            model: model,
            year: year,
            actions: actions
        };
    }
    $(document).ready(function() {
        // GALLERY LISTENERS
        $('.gallery-item').on('click', addInteraction);
        $('#overlay-nav').on('click', addInteraction);
        // FEATURES LISTENERS
        $('.feature-image').on('click', addInteraction);
    });
});
