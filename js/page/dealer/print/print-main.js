/** 
 * @file Behaviors for the dealer print page.
 */
define([], function() {

    /** 
     * Kicks off the page-level methods
     */

    function init() {
        triggerPrintDialog();
    }

    /** 
     * Triggers the browser's print dialog
     */

    function triggerPrintDialog() {
        window.print();
    }

    init();

});
