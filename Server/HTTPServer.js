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
var createServer = require("http").createServer,
	readFile = require("fs").readFile,
	url = require("url"),
	qs = require("querystring"),
	mime = require("./MimeLookup");
	
var DEBUG_LOG = true;

var log = function( text ) {	// A log function we can turn off :/
	if( !DEBUG_LOG ) return;	
	console.log( text );
}

//////////////////////////////////////////////////////////////////////////
// Constructor
function Server( port, host ) {
	var self = this;
	this.requestHandlers = {};			// Our list of responses to http requests
	
	// Create a server using the built in Node http module and declare our response to client requests
	this.server = createServer(function (request, response) {
		if( typeof(self.requestHandlers) === "undefined" ) { log("no request handlers"); return; }
	
		// Handle GET requests
		if( request.method === "GET" ) {
			// Grab the request handler from our map
			var handler = self.requestHandlers[url.parse(request.url).pathname] || notFound;

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
				var handler = self.requestHandlers[url.parse(request.url).pathname] || notFound;

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
	}); // end createServer()	
	
	// Listen on the port and host we were given
	this.server.listen( port, host );
	log("Server at http://" + (host || "localhost") + ":" + port.toString() + "/");
} // end Server()


//////////////////////////////////////////////////////////////////////////
// Create a handler that responds by calling the callback function its given
// and sending the data that it returns to the client
Server.prototype.createGenericHandler = function( callback, isDataExpected ) {
	if( typeof(isDataExpected) === "undefined" )
		isDataExpected = false;
	
	// Create our handler
	var handler = function(request, response) {		
		// Create a function that will send some data to the client.
		// If we don't want to respond right away, we can store this function
		// and it will stay valid until we need it, with all the relevant info
		// stored in closure.
		var respondToClient = function( responseData ) {
			try {
				response.respondJSON( 200, responseData );
			} catch( error ) {
				if( isDataExpected )
					response.respondJSON(400, {error: "Response data expected but undefined"});
				else
					response.respondJSON( 200, {} );
			}
		}
	
		// Grab our request data if there is any
		var data = qs.parse(url.parse(request.url).query);
	
		// Give that function to the module/code using the generic handler
		callback( respondToClient, data );
	} // end handler()
	
	return handler;
} // end Server.createGenericHandler()


//////////////////////////////////////////////////////////////////////////
// Create a response handler for a static file
Server.prototype.createFileHandler = function( filename ) {
	var body, headers;
	
	var content_type = mime.lookupExtension( extname(filename) );
	log( "Creating handler for file: " + filename );
	
	function loadResponseData(response) {
		// If we've already loaded this file, get out
		if ( body && headers ) {
			response();
			return;
		}
		
		// Read the file from disk asynchronously 
		readFile(filename, function ( error, data ) {
			if ( error ) {
				log("Error loading " + filename);
			} else {
				body = data;
				
				headers = { "Content-Type": content_type,
							"Content-Length": body.length
				};
				
				log( "static file " + filename + " loaded" );
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
Server.prototype.addRequestHandler = function( path, handler, shouldOverwrite ) {
	if( typeof(shouldOverwrite) == "undefined" ) {
		shouldOverwrite = false;
	}

	// If we're okay with overwriting any request handler that was sitting in our collection
	// already, just insert the handler. Otherwise, check whether it already exists
	if( shouldOverwrite ) {
		log( "Adding request handler for " + path + " with overwrite" );
		this.requestHandlers[path] = handler;
	} else {
		if( typeof(this.requestHandlers[path]) != "undefined" ) {
			log( "Failed to add request handler for " + path + ", a handler already exists" );
		} else {
			this.requestHandlers[path] = handler;
		}
	} 
	
}; // end Server.addRequestHandler()	httpServer.addRequestHandler("/jquery-1.7.1.min.js", httpServer.createFileHandler("../../Common/jquery-1.7.1.min.js"));


//////////////////////////////////////////////////////////////////////////
// Adds a handler for a file
Server.prototype.serveFile = function( clientPath, serverPath ) {
	log( "Serving " + serverPath + " to clients as " + clientPath );
	
	// If the client path doesn't already begin with a slash, append one
	if( clientPath.indexOf("/") != 0 ) {
		clientPath = "/" + clientPath;
	}
		
	this.addRequestHandler( clientPath, this.createFileHandler(serverPath) );
}; // end Server.addGenericHandler()


//////////////////////////////////////////////////////////////////////////
// Add a new generic handler directly to our request handlers
Server.prototype.addGenericHandler = function( path, callback ) {
	log( "Adding generic request handler for " + path );
		
	this.addRequestHandler( path, this.createGenericHandler(callback) );
}; // end Server.addGenericHandler()


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