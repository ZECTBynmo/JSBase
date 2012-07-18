var assert = require("assert");var httpMocks = require("node-mocks-http");console.log( " " );console.log( "--------------------------------" );console.log( "HTTPServer Tests" );console.log( "Go to http://localhost:1212/" );console.log( "--------------------------------" );var http = require("http");var serverImpl = require("../../Server/HTTPServer");var httpServer = serverImpl.createNewServer( 1212, null );// Serve our test pagehttpServer.serveFile( "/", "./TestHTML/sendtest.html" );httpServer.serveFile( "/jquery-1.7.1.min.js", "../../Client/Common/jquery-1.7.1.min.js" );var runTests = function() {	describe('HTTPServer', function() {		it('Should be able to respond to an HTTP request', function( done ) {			var hasResponded = false;						httpServer.on( "/test", function() {				hasResponded = true;				assert.equal( true, hasResponded );				console.log( "HTTPServerTests: Callback from /test" );				done();			});		});	});}; // end runTests();exports.runTests = runTests;