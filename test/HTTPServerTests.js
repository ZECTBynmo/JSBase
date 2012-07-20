var assert = require("assert");var httpMocks = require("node-mocks-http");var phantom = require('phantom');console.log( " " );console.log( "--------------------------------" );console.log( "HTTPServer Tests" );console.log( "--------------------------------" );var http = require("http");var serverImpl = require("../Server/HTTPServer");var httpServer = serverImpl.createNewServer( 1212, null );// Serve our test pagehttpServer.serveFile( "/", "./TestHTML/sendTestString.html" );httpServer.serveFile( "/jquery-1.7.1.min.js", "../Client/Common/jquery-1.7.1.min.js" );

var hasRunTests = false;
var runTests = function() {	describe('HTTPServer', function() {
		console.log( "RUNNING HTTPServer TESTS" );
				it('Should be able to respond to an HTTP request', function( done ) {			var hasResponded = false;
			
			// Tell the client what our test string is
			httpServer.addGenericHandler( "/whatTestString", function(data, respondToClient) { 
				var responseData = {
					testString: "/HTTPServerTests"
				}
			
				if( !hasRunTests )
					respondToClient( responseData );
			});						httpServer.on( "/HTTPServerTests", function() {
				if( hasRunTests ) return;
							hasResponded = true;
				hasRunTests = true;				assert.equal( true, hasResponded );				console.log( "HTTPServerTests: Callback from /HTTPServerTests" );				done();			});
			
			// Load the page in a headless browser to trigger our events
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
			});		});	});}; // end runTests();exports.runTests = runTests;
