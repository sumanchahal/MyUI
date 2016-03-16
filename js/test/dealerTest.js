define(["jquery", "component/map/Dealer"], function($, Dealer) {

    var dealerResponseMockJSON = {"id":"60407","dealerName":"Lexus of Glendale","dealerAddress":{"address1":"1221 S. Brand Blvd.","address2":null,"zipCode":"91204","zipCodeFive":"91204","state":"CA","city":"Glendale"},"dealerThumbnailDesktop":null,"dealerThumbnailMobile":null,"dealerOverlayImages":[],"dealerKeyContactImages":[],"dealerKeyContactPhoneNumbers":[],"dealerPhone":"8185071300","dealerFax":"(818) 547-4526","dealerMobileUrl":"http://touch.lexusofglendalemobile.com/index.ftl?dealerid=60407","dealerTabletUrl":"http://touch.lexusofglendalemobile.com/index.ftl?dealerid=60407","dealerWebUrl":"http://www.lexusofglendale.com","dealerEmail":"main@lexusofglendale.com","dealerDistance":3.82,"dealerLatitude":34.13137,"dealerLongitude":-118.2549,"dealerLogoURI":null,"dealerLocationImageURI":null,"dealerServiceUrl":"http://www.lexusofglendale.com/ServiceApptForm","dealerPreOwnedInventoryUrl":"http://www.lexusofglendale.com/VehicleSearchResults","dealerContactWebUrl":"http://www.lexusofglendale.com/CorporateContactUsForm","dealerDetailSlug":"lexus-of-glendale","hoursOfOperation":{"Sales":{"Mon-Fri":"8:30am-9pm","Sat":"9am-8pm","Sun":"10am-7pm"}},"dealerKeyContacts":[],"marketName":"Los Angeles","marketNames":["Los Angeles"],"dealerServices":[{"serviceType":"additionalService","code":"OnlineTestDriveEnabled","name":"Online Test Drive Enabled","description":null},{"serviceType":"additionalService","code":"BrowseInventoryEnabled","name":"Browse Inventory Enabled","description":null},{"serviceType":"additionalService","code":"BuildAndSearchEnabled","name":"Build And Search Enabled","description":null},{"serviceType":"certification","code":"LexusElite","name":"Lexus Elite Status","description":null},{"serviceType":"program","code":"DataSharingAgreement","name":"Data Sharing Agreement","description":null},{"serviceType":"program","code":"PMA","name":"Primary Marketing Area","description":null}],"eliteStatus":true};

    QUnit.module ("Dealer model");

    QUnit.test("Dependencies loaded", function(assert) {
        assert.ok(Dealer, "Dealer is loaded.");
    });

    QUnit.test("Dealer class parses JSON", function(assert) {
        var dealer = new Dealer(dealerResponseMockJSON);

        assert.equal(dealer.getId(), dealerResponseMockJSON.id, "getId()");
        assert.equal(dealer.getName(), dealerResponseMockJSON.dealerName, "getName()");
        assert.equal(dealer.getLatitude(), dealerResponseMockJSON.dealerLatitude, "getLatitude()");
        assert.equal(dealer.getPhone(), "(818) 507-1300", "getPhone() reformats phone number");
        assert.equal(dealer.isElite(), dealerResponseMockJSON.eliteStatus, "hasEliteStatus");

        var $address = $(dealer.getAddressAsHTML());

        assert.equal($address.find('.street').text(), dealerResponseMockJSON.dealerAddress.address1, "getAddressAsHTML() formats address");
        assert.equal($address.find('.zip').text(), dealerResponseMockJSON.dealerAddress.zipCode, "getAddressAsHTML() formats zip");
    });
});
