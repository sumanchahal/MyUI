define([
    "lexus",
    "jquery",
    "component/visualizer/Visualizer",
    "component/visualizer/VisualizerViewController"
], function(
    LEXUS,
    $,
    Visualizer,
    VisualizerViewController
) {

    var visualizerModel,
        visualizerViewController;

    return {
        initVisualizer: function(visualizerContext) {
            var visualizerJSON = LEXUS.visualizer;

            visualizerJSON.items = visualizerJSON.visualizerTrimGroups;

            visualizerModel = new Visualizer(visualizerJSON);
            visualizerViewController = new VisualizerViewController(visualizerModel, visualizerContext);
        }
    };

});
