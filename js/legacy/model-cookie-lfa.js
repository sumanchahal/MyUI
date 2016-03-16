var MODEL_MAX_COUNT = 5;
var MODEL_COOKIE = 'lexus-drivers-viewed-cars';
var EXPIRATION = 45 * 60 * 1000;
var cookie_data;

function initCookie() {
    cookie_data = getCookie();
    var car = getCar();
    if (cookie_data === undefined) {
        cookie_data = [];
        addModelView(car.model, car.year);
    } else {
        var actions = queryModelData(car.model, 'actions');
        if (actions) {
            addModelView(car.model, car.year, car.actions);
        } else {
            addModelView(car.model, car.year);
        }
    }
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
    var model = model_data.seriesName;
    model = model_data.isHybrid === "true" || model_data.isHybrid === true ? model + " Hybrid" : model;
    var year = model_data.modelYear;
    var actions = queryModelData(model, 'actions');
    return {
        model: model,
        year: year,
        actions: actions
    };
}
initCookie();

$(window).load(function() {
    // INDEX + MILESTONES
    $('.col3 li').on('click', addInteraction);
    $('.hotspot').on('click', addInteraction);
    $('.video-thumb').on('click', addInteraction);

    // SPECS + GALLERY
    $('.tabsList').on('click', addInteraction);
    $('galleryPhoto').on('click', addInteraction);

    //LOOKBOOK
    $('.galleria-image-nav-right').on('click', addInteraction);
    $('.galleria-image-nav-left').on('click', addInteraction);
});
