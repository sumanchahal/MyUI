jQuery.ajax("http://www.lexus.com/footer", {
    async: false,
    type: 'GET',
    contentType: 'text/plain',
    success: function(html) {
        document.write(html);
    }
});
