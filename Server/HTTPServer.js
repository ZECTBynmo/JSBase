//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.createNewServer = function( port, host ) {
		var newServer = new Server( port, host );
		return newServer;
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var createServer = require("http").createServer;
var readFile = require("fs").readFile;
var url = require("url");


//////////////////////////////////////////////////////////////////////////
// Constructor
function Server( port, host ) {
	this.requestHandlers = {};			// Our list of responses to http requests
	
	// Create a server using the built in Node http module and declare our response to client requests
	this.server = createServer(function (request, response) {
		// Handle GET requests
		if( request.method === "GET" ) {
			// Grab the request handler from our map
			var handler = requestHandlers[url.parse(request.url).pathname] || notFound;

			// Give the response a function to respond to the request with a JSON object
			response.respondJSON = function (code, obj) {
				var body = new Buffer( JSON.stringify(obj) );
				response.writeHead(code, {
					"Content-Type": "text/json",
					"Content-Length": body.length
				});
				response.end( body );
			};

			handler(request, response);
		} else if( request.method === "POST" ) {
			var fullBody = '';
		
			request.on('data', function(chunk) {
				// Append the current chunk of data to the current record of the body
				fullBody += chunk.toString();
			});
		 
			request.on("end", function() {
				var handler = requestHandlers[url.parse(request.url).pathname] || notFound;

				response.respondJSON = function (code, obj) {
					var body = new Buffer( JSON.stringify(obj) );
					response.writeHead(code, { 
						"Content-Type": "text/json", 
						"Content-Length": body.length
					});
					response.end( body );
				};

				handler( request, response, fullBody );
			});
		}
	}
	}); // end createServer()	
	
	// Listen on the port and host we were given
	server.listen( port, host );
	console.log("Server at http://" + (host || "localhost") + ":" + port.toString() + "/");
} // end Server()


//////////////////////////////////////////////////////////////////////////
// Create a handler that responds by calling the callback function its given
// and sending the data that it returns to the client
Server.prototype.createGenericHandler = function( callback, isDataExpected ) {
	if( typeof(isDataExpected) === "undefined" )
		isDataExpected = false;

	var handler = function(request, response) {
		var responseData = callback();
		if( !isDataExpected || typeof(responseData) === "undefined" )
			response.respondJSON(200, responseData);
		else
			response.respondJSON(400, {error: "Response data expected but undefined"});
	} // end handler()
	
	return handler;
} // end Server.createGenericHandler()


//////////////////////////////////////////////////////////////////////////
// Create a response handler for a static file
Server.prototype.createFileHandler = function( filename ) {
	var body, headers;
	var content_type = "text/html";
	console.log( "Creating handler for file: " + filename );
	
	function loadResponseData(response) {
		// If we've already loaded this file, get out
		if ( body && headers ) {
			response();
			return;
		}
		
		// Read the file from disk asynchronously 
		readFile(filename, function ( error, data ) {
			if ( error ) {
				console.log("Error loading " + filename);
			} else {
				body = data;
				
				headers = { "Content-Type": content_type,
							"Content-Length": body.length
			};
				
			console.log( "static file " + filename + " loaded" );
			response();	
			}
		});
	}

	return function (req, res) {
		loadResponseData(function () {
			res.writeHead(200, headers);
			res.end(body);
		});
	}
} // end Server.createFileHandler()


//////////////////////////////////////////////////////////////////////////
// Add a request handler to our map
Server.prototype.addRequestHandler = function( path, handler ) {
	this.requestHandlers[path] = handler;
}; // end Server.addRequestHandler()


//////////////////////////////////////////////////////////////////////////
// Construct a not found response
function notFound(req, res) {
	var notFoundString = "Not Found\n";
	
	res.writeHead(404, { "Content-Type": "text/plain", 
						 "Content-Length": notFoundString.length
	});
	
	res.end(notFoundString);
} // end notFound()


//////////////////////////////////////////////////////////////////////////
// Get the extension of a file
function extname (path) {
	var index = path.lastIndexOf(".");
	return index < 0 ? "" : path.substring(index);
}