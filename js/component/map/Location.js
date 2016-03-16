/**
 * A map location.
 * @interface Location
 */

function Location() {}

/** @return {String} */
Location.prototype.getId = function() {};

/** @return {String} */
Location.prototype.getName = function() {};

/** @return {String} */
Location.prototype.getDetailUrl = function() {};

/**
 * Returns an HTML formatted mailing address.
 * E.g. <address>
            <span class="street">123 Main St.</span>
            <span class="city">Townville</span>, <span class="state">CA</span>&nbsp;<span class="zip">12345</span>
            <span class="phone">(818) 555-1300</span>
        </address>
 * @return {String}
 */
Location.prototype.getAddressAsHTML = function() {};

/** @param lat {Number} */
Location.prototype.setLatitude = function(lat) {};
/** @return {Number} */
Location.prototype.getLatitude = function() {};


/** @param lng {Number} */
Location.prototype.setLongitude = function(lng) {};
/** @return {Number} */
Location.prototype.getLongitude = function() {};
