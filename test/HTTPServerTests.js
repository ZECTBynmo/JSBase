var assert = require("assert");

var hasRunTests = false;

		console.log( "RUNNING HTTPServer TESTS" );
		
			
			// Tell the client what our test string is
			httpServer.addGenericHandler( "/whatTestString", function(data, respondToClient) { 
				var responseData = {
					testString: "/HTTPServerTests"
				}
			
				if( !hasRunTests )
					respondToClient( responseData );
			});
				if( hasRunTests ) return;
			
				hasRunTests = true;
			
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
			});