/**
 * @file Behaviors for the compare print page
 */
define(["jquery"], function($) {

    function init() {
        placeAdvantageFlags();
        triggerPrintDialog();
    }

    /**
     * Triggers the browser's print dialog
     */

    function triggerPrintDialog() {
        window.print();
    }

    /**
     * Ensures the Lexus Advantage checkmark shows up in the print
     */

    function placeAdvantageFlags() {
        $(".advantage-flag").after('<img src="/assets/img/global-non-sprite/checkmark.png" />');
    }

    init();

});
