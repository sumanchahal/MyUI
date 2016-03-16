/**
 * Takes input from the Visualizer model and returns a URL to the correct image.
 *
 * @author Mims Wright
 * @author Ian Bartholomew
 */
define(["PointBreak"], function(PointBreak) {
    var SMALL = "small",
        LARGE = "large",
        INTERIOR = "interior",
        EXTERIOR = "exterior",
        WHEELS = "wheels";


    /** {String} The base domain for the image links. */
    var BASE_DOMAIN = ""; //"http://lexus.com";

    /** {String} The path to the folder containing the visualizer images. */
    var BASE_PATH = "/cm-img/visualizer/";

    var UNKNOWN_IMAGE = "";

    /**
     * @module visualizerImageStringBuilder
     */
    return {


        /**
         * Gets an image path using data from the visualizer model object.
         *
         * @param visualizerModel {Visualizer} The visualizer model object.
         * @param slideIndex {Int} The index of the slide to show (0-based)
         * @returns {string}
         */
        getImagePathForVisualizerState: function(visualizerModel, slideIndex) {
            var trimModel, year, trim, series, swatchGroupModel, view, wheels, color, size;

            try {
                trimModel = visualizerModel.getTrimGroups().getSelectedItem();
                year = trimModel.getYear();
                trim = trimModel.getTrimName().toLowerCase();
                series = trimModel.getSeriesName();
                swatchGroupModel = trimModel.getSwatchGroups().getSelectedItem();
                view = swatchGroupModel.getId().toLowerCase();
                wheels = trimModel.getWheels().getSelectedSwatch().getId();
            } catch (e) {
                console.warn("visualizerImageStringBuilder failed to build a valid URL for this image.");
                console.warn(e.message);
                return UNKNOWN_IMAGE;
            }

            if (view === INTERIOR) {
                color = trimModel.getInteriorColors().getSelectedSwatch().getId();
            } else {
                color = trimModel.getExteriorColors().getSelectedSwatch().getId();
            }

            // if breakpoint is small, use small image. otherwise, use large
            size = visualizerModel.getBreakpoint() === PointBreak.SMALL_BREAKPOINT ? SMALL : LARGE;

            //                                       year, series, trim, view, size, slideIndex, color, wheels
            return this.buildImagePath(year, series, trim, view, size, slideIndex, color, wheels);
        },

        /**
         * Gets an alt attribute for the composed image.
         *
         * @param visualizerModel {Visualizer} The visualizer model object.
         * @param slideIndex {Int} The index of the slide to show (0-based)
         * @returns {string}
         */
        getAltForVisualizerState: function(visualizerModel, slideIndex) {
            var trimModel, year, trim, series, swatchGroupModel, view, wheels, colorAndWheels;

            try {
                trimModel = visualizerModel.getTrimGroups().getSelectedItem();
                year = trimModel.getYear();
                trim = trimModel.getTrimName().toLowerCase();
                series = trimModel.getSeriesName();
                swatchGroupModel = trimModel.getSwatchGroups().getSelectedItem();
                view = swatchGroupModel.getId().toLowerCase();
            } catch (e) {
                console.warn("visualizerImageStringBuilder failed to build a valid alt description for this image.");
                console.warn(e.message);
                return UNKNOWN_IMAGE;
            }

            if (view === INTERIOR) {
                colorAndWheels = trimModel.getInteriorColors().getSelectedSwatch().getName();
            } else {
                colorAndWheels = trimModel.getExteriorColors().getSelectedSwatch().getName() + " with " + trimModel.getWheels().getSelectedSwatch().getName();
            }

            return (year + " " + series + " " + trim + " in " + colorAndWheels + ", angle " + (slideIndex + 1));
        },

        /**
         * Takes all necessary parameters and returns a path to a visualizer image.
         *
         * Note that the slideIndex/angle is begins with 1, not 0, on the server
         *
         * @param year {string}     Model year "20xx"
         * @param series {string}   Series / model id
         * @param trim {string}     Trim id
         * @param view {string}     Type of image, either "interior", "exterior", or "wheels"
         *                          (note: wheels is functionally the same as exterior)
         * @param size {string}     Size of image, "large" or "small"
         * @param slideIndex {Int}  Index / angle of the image. (0-based)
         * @param color {string}    Either the interior or exterior selected color id
         * @param [wheels] {string} Selected wheel id. (optional)
         *
         * @returns {string} Correctly constructed url
         */
        buildImagePath: function(year, series, trim, view, size, slideIndex, color, wheels) {
            /** Combines ext color and wheels or just int color into a single string. */
            var swatchString;

            // Convert all strings to lowercase.
            year = year.toLowerCase();
            series = series.toLowerCase().replace(/ /g, "");
            trim = trim.toLowerCase().replace(/ /g, "-");
            view = view.toLowerCase();
            size = size.toLowerCase();
            color = color.toLowerCase();
            wheels = wheels ? wheels.toLowerCase() : "";

            // convert index to 1-based
            slideIndex += 1;

            if (size !== SMALL && size !== LARGE) {
                throw new Error("Size must be 'small' or 'large'");
            }

            if (view === EXTERIOR || view === WHEELS) {
                view = EXTERIOR;
                swatchString = wheels + "/" + color;
            } else if (view === INTERIOR) {
                swatchString = color;
            } else {
                throw new Error("view must be either 'interior', 'exterior', or 'wheels'");
            }


            /*
             Format
             Interior:
             /{year}/{series}/{vehicletrim}/{view}/{interiortrim}/{size}-{angle}.jpg
             e.g.
             /2014/is/250/interior/shinyred-grayleather/large-1.jpg

             Exterior:
             /{year}/{series}/{vehicletrim}/{view}/{wheel}/{exteriorcolor}/{size}-{angle}.jpg
             e.g.
             /2014/is/250-f-sport/exterior/17-inch-alloy/passionate-crimson/small-4.jpg
             */
            return (this.getBasePath() + year + "/" + series + "/" + trim + "/" + view + "/" + swatchString + "/" + size + "-" + slideIndex + ".jpg").toLowerCase();
        },

        /**
         * builds a base url path to return a visualizer url image path
         *
         * @returns {string}
         */
        getBasePath: function() {
            return BASE_DOMAIN + BASE_PATH;
        }

    };
});
