define([], function() {
    /**
     * Replaces values in the string with data you provide.
     *
     * Replaces any instance of {{propName}} with data.propName.
     *
     * Taken from https://gist.github.com/Integralist/1225181
     *
     * @param template {String} original template string.
     * @param data {Object} Data set wtith values to replace.
     * @returns {String}
     *
     * @author Lukas Mairl
     */

    function renderTemplate(template, data) {
        var prop;
        for (prop in data) {
            if (data.hasOwnProperty(prop)) {
                template = template.replace(new RegExp('{{' + prop + '}}', 'g'), data[prop]);
            }
        }
        return template;
    }

    return renderTemplate;
});
