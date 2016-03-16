define(['jquery'], function($) {

    return {
        init: function() {

            bindEvents();

            function bindEvents() {
                $('.expand-icon').on("click", toggleAccordion);
                $('.close-icon').on('click', toggleAccordion);
                $('.expand-icon,.close-icon').on("mouseover", bounceIcon);
            }

            function toggleAccordion(e) {
                var a = e.target;
                console.log('toggle' + a);

                a.preventDefault();
                var el = a.parent().find('.accordion-body');
                console.log(el);

                if (el.hasClass('expanded')) {
                    bounceIcon();
                } else {
                    if ($('.accordion-body').hasClass('expanded')) {
                        $(this).removeClass('expanded');
                    } else {
                        el.addClass('expanded');
                    }
                }
            }

            function bounceIcon() {
                var e = event.target;
                console.log('bounce' + e);
                if (e.hasClass('bounce')) {
                    e.removeClass('bounce');
                } else {
                    e.addClass('bounce').delay(30).removeClass('bounce');
                }
            }
        }
    };
});
