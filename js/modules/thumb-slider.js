require([
        'jquery',
        'TweenMax'
    ],

    function(
        $,
        TweenMax
    ) {

        var init,
            isTouch,
            mousePan,
            activate,
            isDocumentListenerOn = false,
            documentClickHandler,
            addDocumentClickListener,
            removeDocumentClickListener,
            $thumbSlider,
            $slideCont,
            $sliderInnerCont,
            $seeAll;

        init = function() {
            isTouch = ($('html').hasClass('touch') || $('html').hasClass('mstouch'));
            $thumbSlider = $('.thumb-slider');
            $slideCont = $thumbSlider.find('.slide-cont');
            $sliderInnerCont = $thumbSlider.find('.thumb-slider-inner-cont');
            $seeAll = $thumbSlider.find('.see-all');

            activate();
        };

        activate = function() {
            if (isTouch) {
                $seeAll.on('click', function() {
                    $thumbSlider.toggleClass('show');
                    if ($thumbSlider.hasClass('show')) {
                        addDocumentClickListener();
                    } else {
                        removeDocumentClickListener();
                    }
                });
            } else {
                $slideCont.on('mousemove', mousePan);
                $seeAll.on('mouseover', function() {
                    $thumbSlider.addClass('show');
                });
                $sliderInnerCont.on('mouseleave', function() {
                    $thumbSlider.removeClass('show');
                });
            }

        };

        // separate function for handler so we can be specific when removing later
        documentClickHandler = function() {
            $thumbSlider.removeClass('show');
            removeDocumentClickListener();
        };

        // adds docment listener so we can close when click anywhere happens
        addDocumentClickListener = function() {
            if (!isDocumentListenerOn) {
                isDocumentListenerOn = true;
                // do this on timeout zero so otherwise the open click will bubble to the document level and trigger this event.
                setTimeout(function() {
                    $(document).on('click', documentClickHandler);
                }, 200);
            }
        };

        // remove the specific document click listener we added
        removeDocumentClickListener = function() {
            isDocumentListenerOn = false;
            $(document).off('click', documentClickHandler);
        };


        mousePan = function(event) {
            var x = (event.originalEvent.clientX - 100) / ($thumbSlider.width() - 200),
                maxL = $slideCont[0].scrollWidth - $slideCont[0].clientWidth;

            TweenMax.to($slideCont, 0.45, {
                scrollLeft: (x * maxL),
                ease: Expo.easeOut,
                overwrite: 'auto'
            });
        };

        $(function() {
            init();
        });
    });
