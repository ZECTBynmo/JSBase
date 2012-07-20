var assert = require("assert");

// Get our tests
var moduleTestCollection = new Array();

moduleTestCollection.push( "./EventHandlerTests" );
moduleTestCollection.push( "./HTTPServerTests" );
moduleTestCollection.push( "./ChannelTests" );

for( var iTest = 0; iTest<moduleTestCollection.length; ++iTest ) {
	var moduleTests = require( moduleTestCollection[iTest] );
	
	moduleTests.runTests();
}
