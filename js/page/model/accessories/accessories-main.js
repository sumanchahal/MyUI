require(["jquery", "component/ReadMore", "PointBreak", "analytics"], function($, ReadMore, PointBreak) {
    // technology
    var defaultSort = true;

    var accessoryItems = [];
    var sportItems = [];
    var nonSportItems = [];
    var readMore;

    var imagesLoaded = false;

    var analyticsPage = "Genuine Accessories";

    function init() {

        // Initializes the read more state
        readMore = new ReadMore({
            instance: '.accessory-item:not(".tout") .description',
            characterCountMax: 210
        });

        var pb = new PointBreak();
        pb.addChangeListener(onResize);

        // trigger a change event
        pb.onResize();
        var columns = getColCountByBreakpoint(pb.getCurrentBreakpoint());
        setItemBorders(columns);
        generateAccessories();

        $(".accessory-item").find(".read-more, .link").on("click", handleAccessoryItemClick);

        $(".accessory-item .sub-title").on("click", handleFindDealerClick);

        $("#f-sport-toggle, #genuine-toggle").on("click", sortAccessories);

        initAccessoriesToggle();

        $('img.lazy-load').trigger('loadImages');

        //"Callback" to know when all the images have been loaded at that point, 
        //we can allow the user to be able to use the accessories toggle.
        $('img.lazy-load:last').load(function() {
            imagesLoaded = true;
            $('#f-sport-toggle').removeClass('greyed');
            $('#genuine-toggle').removeClass('greyed');
        });

        // //Analytics tag 2545.3
        // fireTag('2540.1', {
        //     '<page>': analyticsPage
        // });

    }

    /**
     * handleFindDealerClick
     * triggers analytics call
     */

    function handleFindDealerClick() {
        // fire analytics
        analytics.helper.fireFindADealerClick('Accessories Item');
    }

    /**
     * Generates the accessoies arrays used later when sorting.
     *
     */

    function generateAccessories() {
        //Making three copies of the accessory items one with all the non-quote items
        // and ones with the NonSport and Sport accessories, to be used in the 'sort' later.
        $(".accessory-item").each(function(index, item) {
            if (item.className.indexOf("tout") === -1) {
                accessoryItems.push(item);
                if ($($(item).children()[0]).children().length > 0) {
                    sportItems.push(item);
                } else {
                    nonSportItems.push(item);
                }
            }
        });
    }

    /**
     * Actually sorts the accessories.
     *
     */

    function sortAccessories() {
        if (imagesLoaded) {
            var $this = $(this);
            var sortedArray = [];
            var currentlySorted = [];

            //Have to grab the current sorted version of the items
            $(".accessory-item").each(function(index, item) {
                if (item.className.indexOf("tout") === -1) {
                    currentlySorted.push(item);
                }
            });

            //Checking to see what to sort by and forming the array accordingly
            if ($this.text() === "F Sport Accessories") {
                sortedArray = sportItems.concat(nonSportItems);
                $("#f-sport-toggle").addClass("selected");
                $("#genuine-toggle").removeClass("selected");
            } else if ($this.text() === "Genuine Accessories") {
                sortedArray = nonSportItems.concat(sportItems);
                $("#genuine-toggle").addClass("selected");
                $("#f-sport-toggle").removeClass("selected");
            }

            //Going through and replacing the sport/nonsport items with the
            //'CurrentlySorted' items.
            for (var i = 0; i < accessoryItems.length; i++) {
                var nonSortedItem = $(currentlySorted[i]);
                var sortedItem = $(sortedArray[i]);

                var tempNonSortedItem = nonSortedItem.clone();
                var tempSortedItem = sortedItem.clone();

                //switcherroony
                tempSortedItem.attr("class", nonSortedItem.attr("class"));
                nonSortedItem.replaceWith(tempSortedItem);
            }

            //We have to go through and re-add the events for the readmore links
            //because the "swapping" we are doing with replace with actually
            //gets rid of any jquery events.
            var readMoreAgain = new ReadMore({
                instance: '.accessory-item:not(".tout") .description',
                characterCountMax: 210
            });
        }
        //Analytics tag 2545.3
        fireTag('2545.3', {
            '<model_name>': LEXUS.page.seriesName,
            '<subsection>': 'Features',
            '<page>': analyticsPage,
            '<module>': 'Accessories Filter',
            '<content_title>': $(this).text(),
            '<container>': 'Accessories Filter'
        });

    }

    /**
     * This will initialize the toggle at the top of the page depending
     * on what sorting order is determined
     *
     */

    function initAccessoriesToggle() {
        if (sportItems.length !== 0) {
            $('.accessories-toggle').css('visibility', 'visible');
        }
        if (getURLParameter('genuine') === 'true') {
            $('#genuine-toggle').addClass('selected');
            $('#f-sport-toggle').removeClass('selected');

            $('#f-sport-toggle').addClass('greyed');
            analyticsPage = "Genuine Accessories";
        } else {
            $('#f-sport-toggle').addClass('selected');
            $('#genuine-toggle').removeClass('selected');

            $('#genuine-toggle').addClass('greyed');
            analyticsPage = "F Sport Accessories";
        }
    }

    /**
     * Grabs the Query parameter from the URL
     *
     */

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }

    function handleAccessoryItemClick(event) {
        var $element = $(event.delegateTarget).closest(".accessory-item"),
            module = "Accessories",
            contentTitle = $element.find('.title').text().trim(),
            container = module + " Module";

        // fire analytics
        analytics.helper.fireGenericModuleClick(module, contentTitle, container);
    }

    function onResize(event) {
        var columns = getColCountByBreakpoint(event.newBreakpoint);

        setItemBorders(columns);
    }

    function getColCountByBreakpoint(breakpoint) {
        var columns;
        switch (breakpoint) {
            case PointBreak.SMALL_BREAKPOINT:
                columns = 1;
                break;
            case PointBreak.MED_BREAKPOINT:
                columns = 2;
                break;
            default:
                columns = 3;
        }
        return columns;
    }

    function setItemBorders(columns) {
        var items = $('.accessory-item');
        var i = 0,
            cursor = 0,
            isLarge,
            $currentItem,
            $tileAbove,
            smallItems = 0;

        for (; i < items.length; i++) {

            $currentItem = $(items[i]);
            $currentItem.attr('id', 'item-' + i);
            resetItem($currentItem);

            isLarge = $currentItem.hasClass('tout');

            if (columns > 1) {
                if (isLarge) {
                    // if the item is in the last column (and therefore doesn't fit)
                    if ((cursor % columns) === (columns - 1)) {
                        cursor++;
                    }
                    cursor++;
                } else {
                    // tile is small
                    smallItems++;
                    if (cursor < columns) {
                        // this is the top row of items.
                        $currentItem.addClass('top-row');

                    } else {
                        //R4C-363 - Initalizing the items without border
                        //and then adding it later so as to not get the
                        //loading effect.
                        $currentItem.addClass('border');
                        // get the tilie above this tile
                        var indexAbove = i - (columns - 1);
                        $tileAbove = $(items[indexAbove]);
                        //R4C-362 - Doiing some css switching if there are an odd number
                        //of small acessory items so that we dont get a gap ONLY in tablet
                        //if tablet
                        if (columns === 2) {
                            //If item above is accolade and we have odd number of items before
                            if ($tileAbove.hasClass('tout') && (smallItems % 2) === 0) {
                                $currentItem.addClass('last');
                                $tileAbove.css('float', 'left');
                                cursor++;
                            }
                        }
                    }
                }

                // check if the item is the last in the row
                if ((cursor % columns) === (columns - 1)) {
                    $currentItem.addClass("last");
                }
                //Addding back the margins
                $currentItem.addClass("margins");
                cursor++;
            }
        }

    }


    function resetItem($item) {
        $item.removeClass("top-row");
        $item.removeClass("last");
        $item.removeClass("double-left");
    }
    $(document).ready(function() {
        //Re-initialzing lazyload on this page, because it will behave diferently than on 
        //other pages.
        $('img.lazy-load').lazyload({
            event: 'loadImages'
        });
        init();
    });
});
