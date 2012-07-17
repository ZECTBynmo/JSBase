var assert = require("assert");var httpMocks = require("node-mocks-http");var http = require("http");var serverImpl = require("../../Server/HTTPServer");var httpServer = serverImpl.createNewServer( 1212, null );// Spin up two HTTP servers to send us requests, so we can test things!var secondServer = serverImpl.createNewServer( 1313, null );var runTests = function() {	describe('HTTPServer', function() {			it('Should be able to respond to an HTTP request', function() {			var hasResponded = false;						httpServer.on( "/test", function() {				hasResponded = true;			});						//askForRequest( "/test", "test" );						assert.equal( true, hasResponded );  		})	});}; // end runTests();exports.runTests = runTests;var askForRequest = function( path, data ) {	var options = {		host: "",		port: 1212,		path: path,		method: 'GET'	};	var req = http.request(options, function(res) {		console.log('STATUS: ' + res.statusCode);		console.log('HEADERS: ' + JSON.stringify(res.headers));		res.setEncoding('utf8');		res.on('data', function (chunk) {			console.log('BODY: ' + chunk);		});	});		req.on('error', function(e) {		console.log('problem with request: ' + e.message);	});	// write data to request body	req.write( data );	req.end();}