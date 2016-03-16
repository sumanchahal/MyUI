define([], function() {
    var data = {
        "seriesId": "is",
        "items": [
            // gallery item
            {
                "id": "1",
                "type": "image", // "image_transparent", "video"
                "category": "exterior", // "interior"
                "thumbnail": {
                    "src": "http://placekitten.com/400/300",
                    "title": "FPO",
                },
                "fullsize": {
                    "src": "http://placekitten.com/800/600",
                    "title": "FPO"
                },
                "video": {
                    "id": "1"
                },
                "title": "",
                "description": "",
                "disclaimer": {
                    "id": "1",
                    "text": "Lorem ipsum dolor sit amet."
                }
            } // ...
        ]
    };
    // make copies
    for (var i = 0; i < 5; i++) {
        data.items.push(data.items[0]);
    }
    return data;
});
