/**
 * R4 Menu Tile
 *
 *
 * @author wschoenberger
 */
define(["jquery"], function($) {

    var init,
        activate,
        populateMenuCollapseTitle,
        checkSticky,
        openMenu,
        closeMenu,
        documentClickHandler,
        addDocumentClickListener,
        removeDocumentClickListener,
        isDocumentListenerOn = false,
        dropdownMenus = {},
        $window,
        $body,
        $stickyMenu,
        $collapseMenu,
        $stickyWrapper,
        $header,
        headerOuterHeight,
        scrollTop,
        isStuck = false,
        isOpen = false,
        isTouch = false;


    /**
     * Inits stuff
     *
     * @method init
     * @private
     */

    init = function() {
        console.log('TILE MENU');
        $window = $(window);
        $body = $('body');
        $stickyMenu = $('.menu-sticky');
        $stickyWrapper = $('#sticky-wrapper');
        $collapseMenu = $('.menu-bar-collapse');
        $header = $('.header-wrapper');

        var $menu, id;
        $('.m2-menu-tile.drop-down, .m2-menu-tile.drop-down-black, .m2-menu-tile.menu-bar-collapse').each(function(idx) {
            $menu = $(this);
            if (!$menu[0].id) {
                id = 'dropdown-' + idx;
                $menu.attr('id', id);
            } else {
                id = $menu[0].id;
            }
            var $menuItems = $menu.find(".menu-item-cont").children();
            dropdownMenus[id] = {
                $menu: $menu,
                $items: $menuItems,
                $menuTitle: $menu.find('.menu-title')
            };

        });
        checkSticky();
        activate();
        if ($('.m2-menu-tile.menu-bar-collapse').length > 0) {
            populateMenuCollapseTitle();
        }

        if ($('html').hasClass('touch') || $('html').hasClass('mstouch')) {
            isTouch = true;
        }
    };

    activate = function() {
        $('#content').on('click', '.m2-menu-tile.drop-down, .m2-menu-tile.drop-down-black, .m2-menu-tile.menu-bar-collapse', function() {
            var thisMenu = dropdownMenus[this.id];
            if (!thisMenu.isOpen) {
                openMenu(this.id);
            }
        });

        if ($stickyMenu.length > 0 && $collapseMenu.length > 0) {
            $window.on('scroll', checkSticky);
        }

    };


    checkSticky = function() {
        headerOuterHeight = $header.outerHeight();
        scrollTop = $window.scrollTop();
        //If the menu is open don't do any of this logic, maybe change to thisMenu.isOpen
        if (!isOpen) {
            if (!isStuck && (scrollTop - 10) >= headerOuterHeight) {
                isStuck = true;
                $body.addClass('menu-stuck');
            } else if (isStuck && (scrollTop - 10) < headerOuterHeight) {
                isStuck = false;
                $body.removeClass('menu-stuck');
            }
        } else {
            if ((scrollTop - 10) < headerOuterHeight) {
                $body.removeClass('menu-stuck');
            }
        }
    };

    openMenu = function(menuID) {
        var thisMenu = dropdownMenus[menuID];
        // bail out if we dont have what we need
        if (!thisMenu) {
            return;
        }

        setTimeout(function() {
            if (!thisMenu.isOpen) {
                thisMenu.isOpen = true;
                thisMenu.$menu.addClass('open');
                isOpen = true;
            }

            addDocumentClickListener();
        }, 0);
    };

    closeMenu = function(menuID) {

        var thisMenu = dropdownMenus[menuID];

        if (thisMenu && thisMenu.isOpen) {
            // if we have a menu then do for target menu.
            thisMenu.isOpen = false;
            thisMenu.$menu.removeClass('open');
            isOpen = false;
        } else if (!thisMenu) {
            // if no menu then we do for all menus.
            for (var key in dropdownMenus) {
                if (dropdownMenus.hasOwnProperty(key)) {
                    thisMenu = dropdownMenus[key];
                    thisMenu.isOpen = false;
                    thisMenu.$menu.removeClass('open');
                    isOpen = false;
                }
            }
        }

        removeDocumentClickListener();
    };

    // separate function for handler so we can be specific when removing later
    documentClickHandler = function() {
        // close all menus
        closeMenu(null);
        // do this here as well as in closeMenu since closeMenu may be called as a public method. Best to be safe.
        removeDocumentClickListener();
    };

    // adds docment listener so we can close menu when click anywhere happens
    addDocumentClickListener = function() {
        if (!isDocumentListenerOn) {
            isDocumentListenerOn = true;
            // do this on timeout zero so it's not added and triggered at the same time as our menu click which opens the menu.
            setTimeout(function() {
                $(document).on('click', documentClickHandler);
            }, 0);
        }
    };

    // remove the specific document click listener we added
    removeDocumentClickListener = function() {
        isDocumentListenerOn = false;
        $(document).off('click', documentClickHandler);
    };

    //Goes through the menu items and populates the menu title with the item that
    //has the active class.
    populateMenuCollapseTitle = function() {

        var $item = dropdownMenus[$collapseMenu[0].id].$items.filter('.active');
        if ($item.length > 0) {
            dropdownMenus[$collapseMenu[0].id].$menuTitle.text($item.text().trim());
        }
    };

    /**
     * PUBLIC API
     */

    /**
     * Sets both the text of the title and the state to the specified index
     *
     * @method setState
     * @param menuID - the ID for the menu on the page
     * @param index - the index of the list item within the menu
     * @public
     */
    var setState = function(menuID, index) {
        var $thisMenu = dropdownMenus[menuID].$menu;
        //Setting the text
        var $item = $(dropdownMenus[menuID].$items[index]);
        $thisMenu.find(".menu-title").text($item.find("a").text());
        //Setting the value of the list item.
        dropdownMenus[menuID].activeIndex = index;

    };

    /**
     * Gets the current state of the menu
     *
     * @method getState
     * @param menuID - the ID for the menu on the page
     * @public
     */
    var getState = function(menuID) {
        var activeIndex = dropdownMenus[menuID].activeIndex;
        var currentState = dropdownMenus[menuID].$items[activeIndex];
        if (currentState) {
            if (currentState.dataset.value) {
                console.log(currentState.dataset.value);
                return currentState.dataset.value;
            } else {
                console.log($(currentState).find("a")[0].href);
                return $(currentState).find("a")[0].href;
            }
        } else {
            console.log(null);
            return null;
        }
    };

    $(document).ready(function() {
        init();
    });
    return {
        setState: setState,
        getState: getState,
        openMenu: openMenu,
        closeMenu: closeMenu
    };
});
