/**
 * Input form field placeholder fix for IE9
 *
 * @class equal-heights
 * @uses jQuery
 */
define(["jquery"], function($) {
    return {
        setPlaceHolder: function() {
            // https://gist.github.com/akeemw/5114232
            // Released under MIT license: http://www.opensource.org/licenses/mit-license.php
            var input = document.createElement("input");

            if (('placeholder' in input) === false) {
                $('[placeholder]')
                    .each(function() {
                        var i = $(this);
                        if (i.val() === '' || i.val() === i.attr('placeholder')) {
                            if (this.type === 'password') {
                                i.addClass('password');
                                this.type = 'text';
                            }
                            i.addClass('placeholder').val(i.attr('placeholder'));
                        }
                    })
                    .focus(function() {
                        var i = $(this);
                        if (i.val() === i.attr('placeholder')) {
                            i.val('').removeClass('placeholder');
                            if (i.hasClass('password')) {
                                i.removeClass('password');
                                this.type = 'password';
                            }
                        }
                    })
                    .blur(function() {
                        var i = $(this);
                        if (i.val() === '' || i.val() === i.attr('placeholder')) {
                            if (this.type === 'password') {
                                i.addClass('password');
                                this.type = 'text';
                            }
                            i.addClass('placeholder').val(i.attr('placeholder'));
                        }
                    })
                    .parents('form').submit(function() {
                        $(this).find('[placeholder]').each(function() {
                            var i = $(this);
                            if (i.val() === i.attr('placeholder')) {
                                i.val('');
                            }
                        });
                    });
            }
        }
    };
});
