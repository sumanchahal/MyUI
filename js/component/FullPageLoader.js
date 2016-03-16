define(["jquery"], function($) {

    return {

        init: function() {
            this.loader = $('#full-page-loader');
            this.icon = this.loader.children('.loading.animation');
        },

        open: function() {
            this.loader.addClass('on');
        },

        close: function() {
            this.loader.removeClass('on');
        },

    };
});
