/** 
 *    Example test suite
 *
 * Name your files <componentName>Test.js e.g. 'pointBreakTest.js'
 *
 * You can add requirements to the array in the define function.
 *
 */
define([], function() {

    // module sets the category of the tests that are about to run.
    module("Example Test.", {
        setup: function() {
            // Do things that need to happen before the tests run like
            // creating a dom element to test against.
        },
        teardown: function() {
            // Clean up stuff that happened in setup or during your tests
            // like deleting a variable.
        }
    });

    test("Sample assertions.", function() {
        ok(true, "Test that a value is true or defined");

        var name = "mims";
        equal(name.toUpperCase(), "MIMS", "Test that the result of a function equals another value.");
        notEqual(name.toUpperCase(), "mims", "...or not.");

        var a = { foo: 4, bar: 8 };
        deepEqual(a, { foo: 4, bar: 8 }, "Test that an object's children are the same.");
        notDeepEqual(a, { foo: "four", bar: "eight" }, "...or not.");

        var b = a;
        strictEqual(a, b, "Tests that a var is the exact same instance as another object.");
        notStrictEqual(a, { foo: 4, bar: 8 }, "...or not.");

        throws( function () { null.someMethod(); }, "Test that a method is expected to throw an error. Use this to ensure that using unexpected parameters for a function will fail.");
    });

/*  // comment out to save build time.

    asyncTest( "Sample async test", function() {
        
        // this is the number of assertions to expect during the async test.
        expect( 1 );
     
        // use setTimeout to simulate a test that runs a fraction of a second later.
        setTimeout(function() {
            ok( true, "Passed and ready to resume!" );
            
            // you must call start to make this run!
            start();
        }, 150);
    });
*/
});
