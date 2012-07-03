//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.createNewLongPoll = function( httpServer ) {
		var newLongPoll = new LongPoll( httpServer );
		return newLongPoll;
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var createServer = require("http").createServer;
var readFile = require("fs").readFile;
var url = require("url");
var exists = function( someItem ) { return typeof(someItem) === "undefined"; }


//////////////////////////////////////////////////////////////////////////
// Constructor
function LongPoll( httpServer ) {
	this.eventUpdates = new Array();												// Our collection of events that we need to update the client about
	this.queuedUserRequests = new Array();											// Our collection of user request callbacks that are sitting waiting for events
	this.httpServer = httpServer;													// Our HTTP server
	this.validateUserInfo = function( userInfo ) { return exists(userInfo); };		// Our user info validation function
	
	// Add our long poll request handler to the server
	server.addRequestHandler( "/longPollRequest", server.createGenericHandler(function(request, response) {
		var userInfo = qs.parse(url.parse(request.url).query).userInfo;
		var requestTime = qs.parse(url.parse(request.url).query).requestTime;
		
		// Validate this user
		var isValidated = this.validateUserInfo( userInfo );
		
		if( isValidated ) {
			// Push this user into our list of queued update callbacks
			
		} // end if user is validated
	}));
	
	
	// Clear out old event updates
	// They can hang around for at most CALLBACK_LIFETIME
	setInterval(function () {
		if( !this.m_callbacks || !this.m_messages ) return;
		
		var now = new Date();
		while ( this.m_callbacks.length > 0 && now - this.m_callbacks[0].timestamp > CALLBACK_LIFETIME ) {
			this.m_callbacks.shift().callback([]);
		}
	}, 3000);
	
	/* /////////////////////////////// 
		var update = { 			// update structure
			eventName: someName,						// The name of the event we're responding to
			callback: someFunction( event )				// The function with which we'll respond
		}		
		
		var event = {				// Event structure
			name: someName, 							// The name of this event (must be unique)
			time: someTime,								// The time at which this event was triggered
			data: { 
				someName: someData,						// We want to be able to index into data with the name of the piece of data we're expecting
				someOtherName: someOtherData			// Ex: var something = event.data["whateverMyDataIsCalled"];
			}			
		}
	*/
	
} // end LongPoll()


//////////////////////////////////////////////////////////////////////////
// Adds a function to callback for updates from some other module
LongPoll.prototype.addEventUpdate() = function( update ) {
	this.eventUpdates[
} // end addUpdateCallback()


//////////////////////////////////////////////////////////////////////////
// Returns a list of server side event updates since the user requested them
LongPoll.prototype.getUserUpdates() = function( userInfo, requestTime ) {
	// We're goign to loop through our collection of messages backwards 
	// until we find one that is BEFORE the user's request time.
	var iEvent
	while( 
} // end getUserUpdates()