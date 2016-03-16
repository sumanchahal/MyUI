define(function() {

    return {

        single: {
            single: '<div class="result single results-returned {{filetype}}" data-managed="{{managed}}"><a href="{{url}}" class="title"><span class="{{filetype}}">{{filetype}}<span class="icon"></span></span>{{title}}</a><p class="snippet">{{snippet}}</p></div>'
        },

        group: {
            group: '<div class="result group results-returned preload" data-managed="{{managed}}" data-category="Grouped"><a href="{{url}}" class="title" data-title="{{title}}"><span class="{{filetype}}">{{filetype}}<span class="icon"></span></span>{{title}}</a><span class="url">{{url}}</span><p class="snippet">{{snippet}}</p><ul class="link-group">{{children}}</ul><span class="toggle-group-links" data-managed="{{managed}}"><span class="more">view more models</span><span class="less">view fewer models</span><span class="indicator"></span></span></div>',
            children: '<li><a href="{{url}}" data-title="{{title}}">{{title}}</a><span class="url">{{url}}</span></li>'
        },

        tree: {
            tree: '<div class="result tree results-returned preload" data-managed="{{managed}}" data-category="Tree Branch"><a href="{{url}}" class="title title-link" data-title="{{title}}">{{title}}</a><p class="title">{{title}}</p><p class="snippet">{{snippet}}</p><ul class="link-group">{{children}}</ul></div>',
            children: '<li><a href="{{url}}" data-title="{{title}}">{{title}}</a></li>'
        },

        dealers: {
            dealers: '<div class="card dealers plain" data-category="Find a Dealer Card">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="title">{{title}}</p>' + '<hr/>' + '<p class="mobile-summary">We found {{count}} dealers near "{{zip}}"</p>' + '<a class="btn primary" href="/dealers">see dealers</a>' + '<ul class="dealers-list">{{dealerships}}</ul>' + '</div>' + '</div>' + '</div>',
            dealerships: '<li>' + '<p class="dealer-title">{{name}}</p>' + '<p class="dealer-info">{{address1}}</p>' + '<p class="dealer-info">{{address2}}</p>' + '<p class="dealer-info">{{City}} {{state}}, {{zip}}</p>' + '<p class="dealer-info">{{phone}}</p>' + '<p class="directions-link">' + '<a class="directions" href="{{directions}}">Directions<span></span></a>' + '</p>' + '</li>'
        },

        roadside: {
            roadside: '<div class="card roadside plain" data-category="Roadside Support Card">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="eyebrow">{{eyebrow}}</p>' + '<p class="title">{{title}}</p>' + '<p class="subhead"><a href="tel:+1-{{subhead}}" class="phone" data-title="Roadside Call">{{subhead}}</a></p>' + '<p class="description">{{description}}</p>' + '<hr/>' + '<div class="apps-container">' + '{{apps}}' + '</div>' + '</div>' + '</div>' + '</div>',
            apps: '<img class="app-icon" src="{{icon}}" />' + '<div class="app app-container-analytics" data-title="Roadside">' + '<p class="app-title">{{title}}</p>' + '<p class="app-description">{{description}}</p>' + '<ul class="devices urls-container">' + '{{urls}}' + '</ul>' + '</div>',
            urls: '<li><a class="app-link" href="{{url}}">{{title}}<span class="arrow"></span></a></li>'
        },

        model: {
            model: '<div class="card model" style="background-image: url({{background}})" data-category="Current Model Year Card">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="title">{{title}}</p>' + '<p class="description">{{description}}</p>' + '<a class="main-link" href="{{linkURL}}">{{linkTitle}}</a>' + '<div class="cta-container">' + '{{actions}}' + '<p class="disclaimer">{{disclaimer}}</p>' + '</div>' + '</div>' + '</div>' + '</div>',
            actions: '<a href="{{url}}" class="{{style}} btn">{{label}}</a>',
            photos: ''
        },

        future: {
            future: '<div class="card model" style="background-image: url({{background}})" data-category="Future Model Year Card">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="title">{{title}}</p>' + '<p class="subhead">{{subhead}}</p>' + '<p class="description">{{description}}</p>' + '<a class="main-link" href="{{linkURL}}">{{linkTitle}}</a>' + '<div class="cta-container">' + '<a href="{{buttonUrl}}" class="primary btn">{{buttonText}}</a>' + '</div>' + '</div>' + '</div>' + '</div>',
            actions: '',
            photos: ''
        },

        certified: {
            certified: '<div class="card model" style="background-image: url({{background}})" data-category="Previous Model Year Card">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="title">{{title}}</p>' + '<p class="subhead">{{subhead}}</p>' + '<p class="description">{{description}}</p>' + '<a class="main-link" href="{{linkURL}}">{{linkTitle}}</a>' + '<div class="cta-container">' + '<a href="{{buttonUrl}}" class="primary btn">{{buttonText}}</a>' + '</div>' + '</div>' + '</div>' + '</div>',
            actions: '',
            photos: ''
        },

        support: {
            support: '<div class="card contact plain" data-category="Customer Support Card">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="title">{{title}}</p>' + '<p class="subhead"><a href="tel:+1-{{subhead}}" class="phone" data-title="Call">{{subhead}}</a></p>' + '<p class="description">{{description}}</p>' + '<div class="cta-container">' + '{{actions}}' + '</div>' + '<hr/>' + '<p class="topics-title">Knowledge center topics</p>' + '<ul>' + '{{topics}}' + '</ul>' + '</div>' + '</div>' + '</div>',
            actions: '<a href="{{url}}" class="{{style}} btn">{{label}}</a>',
            photos: '',
            topics: '<li class="topic"><a href="{{url}}" data-title="{{title}}">{{title}}</a></li>'
        },

        app: {
            app: '<div class="card app" data-category="Lexus Apps Card">' + '<div class="content-container">' + '<div class="content-container-inner" style="background-image:url({{backgroundImage}})">' + '<p class="title">{{title}}</p>' + '<hr/>' + '<div class="bottom-content">' + '<ul class="app-list">' + '{{apps}}' + '</ul>' + '</div>' + '{{actions}}' + '</div>' + '</div>' + '</div>',
            apps: '<li class="app-container-analytics" data-title="{{title}}">' + '<img class="icon" src="{{icon}}" alt=""/>' + '<p class="app-title">{{title}}</p>' + '<p class="app-description">{{description}}</p>' + '<ul class="devices">' + '{{urls}}' + '</ul>' + '</li>',
            urls: '<li><a href="{{url}}" class="app-link">{{title}}<span class="arrow"></span></a></li>',
            actions: '<a class="btn primary" href="{{url}}">{{label}}</a>'
        },

        faq: {
            faq: '<div class="card faq plain" data-category="Help & Support Card"><p class="title">{{title}}</p><hr/><ul>{{questions}}</ul></div>',
            questions: '<li class="faq-item"><p class="question">{{question}}</p><p class="answer">{{answer}}</p><p class="answer full">{{fullAnswer}}</p><a href="#" class="{{viewMore}}">View More</a></li>'
        },

        dealerNoZip: {
            dealerNoZip: '<div class="card dealers plain">' + '<div class="content-container">' + '<div class="content-container-inner">' + '<p class="title">Nearby Dealers</p>' + '<hr/>' + '<p id="summary-count" class="summary"></p>' + '<form action="/dealers" class="form-zip-search">' + '<div class="input-group">' + '<span class="input-group-addon">' + '<span class="geolocation-icon marker-gold active"></span></span>' + '<input id="no-dealers-zip-form" type="text" name="zip" data-tooltip-position="bottom" value="" placeholder="Enter Zip" class="input-search form-control" maxlength="5">' + '</div>' + '<p class="error-message">Please enter a valid 5-digit zip code.</p>' + '<input type="submit" href="#" id="submit-no-dealer-form" class="btn primary no-dealers" value="See Dealers"/>' + '</form>' + '</div>' + '</div>' + '</div>'
        },

        gallery: {
            gallery: '<div class="card gallery" data-category="" data-container="Gallery">' + '<p class="title">{{title}}</p>' + '<p class="description">' + '{{subhead}}' + '&nbsp;&nbsp;&nbsp;<a href="{{linkURL}}" data-title="View All">view all</a>' + '</p>' + '<div class="gallery-outer">' + '<span id="galleryArrowPrev" class="arrow prev clickable hide" data-title="Toggle">' + '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" data-title="Toggle" ' + 'width="100%" height="20px" viewBox="302 388 8.869 16" enable-background="new 302 388 8.869 16" xml:space="preserve">' + '<path d="M310.869,388.717l-8.172,7.923L302,395.923l8.172-7.923L310.869,388.717z"/>' + '<path d="M310.126,404l-7.429-7.359l0.766-0.75l7.406,7.405L310.126,404z"/>' + '</svg>' + '</span>' + '<span id="galleryArrowNext" class="arrow next clickable" data-title="Toggle">' + '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" data-title="Toggle" ' + 'width="100%" height="20px" viewBox="302 388 8.869 16" enable-background="new 302 388 8.869 16" xml:space="preserve">' + '<path d="M302.697,388l8.172,7.923l-0.697,0.717L302,388.717L302.697,388z"/>' + '<path d="M302,403.296l7.406-7.405l0.766,0.75L302.743,404L302,403.296z"/>' + '</svg>' + '</span>' + '<div id="gallery-scroll" class="gallery-inner">' + '<ul id="gallery-list">' + '{{photos}}' + '</ul>' + '</div>' + '</div>' + '</div>',
            photos: '<li class="gallery-item"><a href="{{url}}" data-title="Image"><img src="{{img}}" alt="{{alt}}" data-title="Image"/></a></li>'
        }
    };

});
