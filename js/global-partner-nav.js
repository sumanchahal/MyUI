/* global LEXUS */
/**
 * @file Special version of global.js for the partner-nav. Includes the dependencies need for the partner nav
 * DEPENDENCIES
 *    "lexus",
 *    "jquery",
 *    "component/Disclaimers",
 *    "component/AttachedTooltip",
 *    "component/ThirdPartyInterstitial"
 */

(function initPartnerNav(
    LEXUS,
    $,
    Disclaimers,
    AttachedTooltip,
    ThirdPartyInterstitial
) {
    var thirdPartyInterstitial = new ThirdPartyInterstitial();
    var attachedTooltip = new AttachedTooltip();

    LEXUS.Disclaimers = Disclaimers;
    LEXUS.Disclaimers.init();
}(LEXUS, jQuery, LEXUS.Disclaimers, LEXUS.AttachedTooltip, LEXUS.ThirdPartyInterstitial));
