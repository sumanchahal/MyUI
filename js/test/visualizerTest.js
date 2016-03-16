require([
    "data/visualizerMockData",
    "mvc/SelectableList",
    "component/visualizer/Visualizer",
    "component/visualizer/TrimVisualizer",
    "component/visualizer/SwatchGroup",
    "component/visualizer/Swatch",
    "component/visualizer/visualizerImageStringBuilder",
    "mvcTest.js"
], function (mockData, SelectableList, Visualizer, TrimVisualizer, SwatchGroup, Swatch, imageStringBuilder) {
    var viz, trim, swatchGroup, swatch;

    QUnit.module("Visualizer", {
        setup: function () {
            viz = new Visualizer(mockData);
            trim = viz.getTrimGroups().getItemAtIndex(0);
            swatchGroup = trim.getSwatchGroups().getItemAtIndex(0);
            swatch = swatchGroup.getSwatches().getItemAtIndex(0);
        },
        teardown: function () {
            swatchGroup = trim = viz = null;
        }
    });

    QUnit.test("Visualizer", function (assert) {
        assert.ok(viz, "Hello world");
        assert.ok(viz.getTrimGroups() instanceof SelectableList, "Visualizer.getTrimGroups() returns a SelectableList");
        assert.ok(viz.getTrimGroups().getItemAtIndex(0) instanceof TrimVisualizer, "Visualizer.getTrimGroups() is a list of TrimVisualizers");
        assert.ok(viz.getDisclaimer(), "Disclaimer");
        assert.equal(viz.getTrimGroups().getSelectedItem(), viz.getTrimGroups().getItemAtIndex(0), "First trim group is selected by default.");
    });

    QUnit.test("TrimVisualizer", function (assert) {
        assert.ok(trim.getSwatchGroups() instanceof SelectableList, "TrimVisualizer.getSwatchGroups() returns a SelectableList");
        assert.ok(trim.getSwatchGroups().getItemAtIndex(0) instanceof SwatchGroup, "TrimVisualizer.getSwatchGroups() is composed of SwatchGroups");
        assert.equal(trim.getSwatchGroups().getSelectedItem(), trim.getSwatchGroups().getItemAtIndex(0), "First swatch group selcted by default.");

        assert.equal(trim.getDisplayName(), "IS 250 / 350");
        assert.equal(trim.getLabel(), "IS 250 / 350");
        assert.ok(trim.getId(), "id");
        assert.equal(trim.getExteriorColors(), trim.getSwatchGroups().getItemAtIndex(0), "getExterior() (first group)");
        assert.equal(trim.getInteriorColors(), trim.getSwatchGroups().getItemAtIndex(1), "getInterior() (second group)");
        assert.equal(trim.getWheels(), trim.getSwatchGroups().getItemAtIndex(2), "getWheels() (third group)");

        assert.equal (trim.getCurrentAngle(), 0, "By default the first angle is selected.");
        // set current swatchgroup to exterior
        trim.getSwatchGroups().setSelectedItem(trim.getExteriorColors());
        // set current image to second image
        trim.setCurrentAngle(1);
        // switch to wheels
        trim.getSwatchGroups().setSelectedItem(trim.getWheels());
        assert.equal (trim.getCurrentAngle(), 1, "Wheel angle is locked to exterior angle.");
        trim.getSwatchGroups().setSelectedItem(trim.getInteriorColors());
        assert.equal (trim.getCurrentAngle(), 0, "Interior angle is independent of exterior and wheels.");

    });

    QUnit.test("SwatchGroup", function (assert) {
        assert.ok(swatchGroup.getSwatches() instanceof SelectableList, "SwatchGroup.getSwatches() returns a SelectableList");
        assert.ok(swatchGroup.getSwatches().getItemAtIndex(0) instanceof Swatch, "SwatchGroup.getSwatches() is composed of Swatches");

        assert.ok(swatchGroup.getTitle(), "title");
        assert.ok(swatchGroup.getId(), "id");
        assert.ok(swatchGroup.getNumberOfAngles() >= 1, "number getNumberOfAngles");
    });
    QUnit.test("Swatch", function (assert) {
        assert.ok(swatch.getId(), "swatch id");
        assert.ok(swatch.getImage(), "swatch image");
        assert.ok(swatch.getLabel(), "swatch name");
    });
    QUnit.asyncTest("Test selection events", function (assert) {
        QUnit.expect(1);

        swatchGroup.getSwatches().addSelectionListener(onSelectionChanged);
        swatchGroup.getSwatches().setSelectedItemIndex(1);
        swatchGroup.getSwatches().removeSelectionListener(onSelectionChanged);
        swatchGroup.getSwatches().setSelectedItemIndex(0);

        function onSelectionChanged(newItem) {
            assert.ok(true, "Selection listener works");
            QUnit.start();
        }
    });

    QUnit.test("Image string builder", function (assert) {
        assert.ok (imageStringBuilder.getBasePath(), "Base path is returned by getBasePath");


        /*
         Format
         Interior:

         /{year}/{series}/{vehicletrim}/{view}/{interiortrim}/{size}-{angle}.jpg
         e.g.
         /2014/is/250/interior/shinyred-grayleather/large-1.jpg

         Exterior:
         /cm-img/visualizer/{year}/{series}/{trim}/{view}/{wheel}/{exteriorcolor}/{size}-{angle}.jpg
         e.g.
         /2014/is/250-f-sport/exterior/17-inch-alloy/passionate-crimson/small-4.jpg
         */

        var BASE_PATH = imageStringBuilder.getBasePath();
        var EXPECTED_URL = BASE_PATH + "2014/is/250/interior/shinyred-grayleather/large-1.jpg";
        var sampleURL = imageStringBuilder.buildImagePath("2014", "is", "250", "interior", "large", 0, "shinyred-grayleather");
        assert.equal (sampleURL, EXPECTED_URL, "String builder generates interior strings as expected.");


        EXPECTED_URL = BASE_PATH + "2014/is/250-f-sport/exterior/17-inch-alloy/passionate-crimson/small-4.jpg";
        sampleURL = imageStringBuilder.buildImagePath("2014", "is", "250-f-sport", "exterior", "small", 3, "passionate-crimson", "17-inch-alloy");
        assert.equal (sampleURL, EXPECTED_URL, "String builder generates exterior strings as expected.");
        sampleURL = imageStringBuilder.buildImagePath("2014", "is", "250-f-sport", "wheels", "small", 3, "passionate-crimson", "17-inch-alloy");
        assert.equal (sampleURL, EXPECTED_URL, "String builder generates wheel strings as expected.");

        sampleURL = imageStringBuilder.buildImagePath("2014", "IS", "250-F-Sport", "Wheels", "small", 3, "Passionate-crimson", "17-inch-Alloy");
        assert.equal (sampleURL, EXPECTED_URL, "Strings are converted to lower case.");

        assert.throws (function (){
            imageStringBuilder.buildImagePath("2014", "is", "250", "interior", "BOGUS", 0, "light-gray-nuluxe-silver-performance");
        }, "Checks for valid size.");
        assert.throws (function (){
            imageStringBuilder.buildImagePath("2014", "is", "250", "BOGUS", "large", 0, "light-gray-nuluxe-silver-performance");
        }, "Checks for valid view.");
    });

    QUnit.test("Integrated image strings", function (assert) {
        assert.ok(viz.getImageUrl(), "getImageUrl() returns a url");
        var url1 = viz.getImageUrl(); // first trim group

        var trimGroup = viz.getTrimGroups().setSelectedItemIndex(1); // switch trim groups
        var swatchGroups = trimGroup.getSwatchGroups();
        swatchGroups.setSelectedItem(trimGroup.getExteriorColors()); // select the exterior swatches
        var url2 = viz.getImageUrl();

        swatchGroups.setSelectedItem(trimGroup.getInteriorColors()); // select the interior swatches
        var url3 = viz.getImageUrl();

        swatchGroups.setSelectedItem(trimGroup.getWheels()); // select the wheel swatches
        var url4 = viz.getImageUrl();

        assert.notEqual(url1, url2, "Changing selected trim group changes the image url.");
        assert.notEqual(url2, url3, "Changing selected swatch group changes the image url.");
        assert.equal (url2, url4, "Exterior and wheel images share the same URL.");
    });
});
