//////////////////////////////////////////////////////////////////////////
// This is our main testing file
// Mocha looks for a file called test.js explicitly, so everything must
// come through here.
//
// I couldn't figure out how to get tests to run sequentially. Right now,
// if you run multiple modules' tests, they will interfere with eachother,
// and you will get incorrect results
//
// This file is basically a switch for which modules' tests to run
//

var assert = require("assert");

// Get our tests
var moduleTestCollection;

//moduleTestCollection = "./EventHandlerTests";
//moduleTestCollection = "./HTTPServerTests";
moduleTestCollection = "./ChannelTests";

require( moduleTestCollection ).runTests();

/* THIS DOESN'T WORK - DONT USE IT
for( var iTest = 0; iTest<moduleTestCollection.length; ++iTest ) {
	var moduleTests = require( moduleTestCollection[iTest] );
	
	moduleTests.runTests();
}
*/

