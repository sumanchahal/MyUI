define([], function() {

    // BYLResizer namespace
    var BYLResizer = {};

    return {

        getUrlVars: function() {
            // Read a page's GET URL variables and return them
            // as an
            // associative array.
            var vars = [],
                hash;
            var hashes = window.location.href.slice(window.location.href.lastIndexOf('?') + 1).split('&');

            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
            // console.log(vars);

        },
        updateHeight: function(doScroll) {
            // if BYLResizer.BYLparentURL is null or undefined, that means init
            // has not yet run.
            if (typeof BYLResizer.BYLparentURL === "undefined") {
                this.init('0');
                return false;
            }

            var parameters = this.getUrlVars();
            var height = this.currentHeight();
            var pipe = document.getElementById('helpframe');

            // update ifram SRC to include new height
            pipe.src = BYLResizer.BYLparentURL + 'helper.html?height=' + height + '&scrollTo=' + doScroll + '&cacheb=' + Math.random();
        },
        getCookie: function(name) {
            var namedCookies = document.cookie.split(";"),
                keyValuePair = null;

            for (var i = 0; i < namedCookies.length; i++) {
                keyValuePair = namedCookies[i].split("=");
                var trimmed = keyValuePair[0].replace(/^\s+|\s+$/gm, '');
                if (trimmed === name) {
                    return decodeURIComponent(keyValuePair[1]);
                }
            }
            return undefined;
        },

        init: function(doScroll) {

            if (!doScroll) {
                doScroll = '0';
            }
            /*
             * <iframe id="helpframe" src="" height="0" width="0"
             * frameborder="0"></iframe>
             */
            var iframe = document.createElement('iframe');
            iframe.style.display = "none";
            iframe.id = 'helpframe';
            iframe.height = 0;
            iframe.width = 0;

            if (iframe.frameBorder) {
                iframe.frameBorder = 0;
            } else {
                if (iframe.frameborder) {
                    iframe.frameborder = 0;
                }
            }

            // this should be appended only once
            document.body.appendChild(iframe);

            var parameters = this.getUrlVars();
            // set BYLResizer.BYLparentURL as global var
            BYLResizer.BYLparentURL = unescape(parameters.parent);
            console.log(typeof BYLResizer.BYLparentURL);
            if (BYLResizer.BYLparentURL === "undefined") {
                return;
            }
            var height = this.currentHeight();
            var pipe = document.getElementById('helpframe');

            // alert("init needs to run after page is rendered. Proper height
            // after load is: " + height);
            // Cachebuster a precaution here to stop browser caching interfering
            // helper iframe points to dealer site
            pipe.src = BYLResizer.BYLparentURL + 'helper.html?height=' + height + '&scrollTo=' + doScroll + '&cacheb=' + Math.random();
            this.resizeWatcher();
        },

        currentHeight: function() {
            var height = $('#wrapper').outerHeight();
            return height;
        },

        resizeWatcher: function() {
            var rtime = new Date(1, 1, 2000, 12, 0, 0);
            var timeout = false;
            var delta = 200;
            var that = this;

            $(window).resize(function() {
                rtime = new Date();
                if (timeout === false) {
                    timeout = true;
                    setTimeout(resizeEnd);
                }
            });

            resizeEnd = function() {
                if (new Date() - rtime < delta) {
                    setTimeout(resizeEnd, delta);
                } else {
                    timeout = false;
                    that.updateHeight(-1);
                }
            };
        }
    };

});
