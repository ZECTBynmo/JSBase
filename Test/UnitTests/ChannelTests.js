var assert = require("assert");
var httpMocks = require("node-mocks-http");

console.log( " " );
console.log( "--------------------------------" );
console.log( "Channel Tests" );
console.log( "Go to http://localhost:1212/" );
console.log( "--------------------------------" );

var Channel = require("../../Server/Channel").getConstructor();

var newChannel = new Channel();

var httpServerImpl = require("../../Server/HTTPServer"),
	longPollImpl = require("../../Server/LongPoll"),
	chatImpl = require("../../Server/Chat");
	
// Create our server and 
var server = httpServerImpl.createNewServer( 1212, null ),
	longPoll = longPollImpl.createNewLongPoll( server ),
	channel = new Channel( server );
	
// Serve our test file
server.serveFile( "/", "./TestHTML/sendtest.html" );
server.serveFile( "/jquery-1.7.1.min.js", "../../Client/Common/jquery-1.7.1.min.js" );


var runTests = function() {
	describe('Channel', function() {
		it('Should be able to respond to an HTTP request', function( done ) {
			var hasResponded = false;
			
			channel.on( "/test", function() {
				hasResponded = true;
				assert.equal( true, hasResponded );
				console.log( "Tests: Callback from /test" );
				done(); 
			});
		});
	});
}; // end runTests();

exports.runTests = runTests;