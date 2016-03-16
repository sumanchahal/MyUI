jQuery.ajax("http://www.lexus.com/header", {
    async: false,
    type: 'GET',
    contentType: 'text/plain',
    success: function(html) {
        document.write(html);
    }
});
