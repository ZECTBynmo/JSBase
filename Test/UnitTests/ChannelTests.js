var assert = require("assert");
var httpMocks = require("node-mocks-http");
var phantom = require('phantom');

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
server.serveFile( "/", "./TestHTML/sendTestString.html" );
server.serveFile( "/jquery-1.7.1.min.js", "../../Client/Common/jquery-1.7.1.min.js" );

var hasRunTests = false;

var runTests = function() {

	describe('Channel', function() {
		console.log( "RUNNING Channel TESTS" );
		
		it('Should be able to respond to an HTTP request', function( done ) {
			var hasResponded = false;
			
			// Tell the client what our test string is
			server.addGenericHandler( "/whatTestString", function(data, respondToClient) { 
				var responseData = {
					testString: "/ChannelTests"
				}
				
				if( !hasRunTests )
					respondToClient( responseData );
			});
			
			// Wait for the response
			channel.on( "/ChannelTests", function() {
				if( hasRunTests ) return;
			
				hasResponded = true;
				assert.equal( true, true );
				console.log( "ChannelTests: Callback from /ChannelTests" );
				done(); 
			});
			
			// Load the page in a headless browser
			phantom.create(function(ph) {
				return ph.createPage(function(page) {
					return page.open("http://localhost:1212/", function(status) {
						console.log("opened the page? ", status);
						
						return page.evaluate( (function(){return document.title;}), function(result) {
							console.log('Page title is ' + result);
							return ph.exit();
						});
					});
				});
			});
		});
	});
}; // end runTests();

exports.runTests = runTests;