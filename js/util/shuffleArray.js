/**
 * Randomizes order of elements in an array.
 *
 * Inspired by Knuth shuffle algorithm http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *
 * @author mwright
 * @file
 */
define([], function() {
    return function shuffle(array) {
        var i = array.length,
            temp,
            rand;

        while (i > 0) {
            rand = Math.floor(Math.random() * i);
            i -= 1;

            temp = array[i];
            array[i] = array[rand];
            array[rand] = temp;
        }

        return array;
    };
});
