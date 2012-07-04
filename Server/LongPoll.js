//////////////////////////////////////////////////////////////////////////
// LongPoll - Server Side
//////////////////////////////////////////////////////////////////////////
//
// We are trying to setup a system where we (the server) can push messages
// to a client dependably. 
//
// Here are the possible series of events
//
// 1) Client requests updates about server events (chat from other users, etc...)
// 2) Server gets a callback to respond to the client with some data/object
// 3) Server looks for updates for that client/user
// 		A) Server finds events that have happened since the client requested it
// 			a) Server creates an object with all of the events
//			b) Server calls the response callback with the events object
// 		B) Server doesn't find any events
//			a) Server stores the callback for later (when an event occurs)
//			b) (much later) event happens, call stored callbacks with event data
//
/* ----------------------------------------------------------------------
													Object Structures
-------------------------------------------------------------------------
	var userRequest = {
		userInfo: { some object },					// The info about the user who sent it
		time: someDate,							// The time the request was made
		respond: someFunction( events )				// The function with which we'll respond
	}
	
	var event = {
		name: someName, 							// The name of this event (must be unique)
		time: someTime,								// The time at which this event was triggered
		validateUser: someValidationFn(user, time), // The function we call to make sure this event is valid for this user
		data: { 
			someName: someData,						// We want to be able to index into data with the name of the piece of data we're expecting
			someOtherName: someOtherData			// Ex: var something = event.data["whateverMyDataIsCalled"];
		}			
	}
*/
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
var REQUEST_LIFETIME_MS = 

//////////////////////////////////////////////////////////////////////////
// Constructor
function LongPoll( httpServer ) {
	this.eventUpdates = new Array();												// Our collection of events that we need to update the client about
	this.queuedUserRequests = new Array();											// Our collection of user request callbacks that are sitting waiting for events
	this.httpServer = httpServer;													// Our HTTP server
	this.validateUserInfo = function( userInfo ) { return exists(userInfo); };		// Our user info validation function. This can change, to
																					// change how a user is validated for responses
	
	// Add our long poll request handler to the server
	server.addRequestHandler( "/longPollRequest", server.createGenericHandler(function( respondToClient ) {
		var userInfo = qs.parse(url.parse(request.url).query).userInfo;
		var requestTime = qs.parse(url.parse(request.url).query).requestTime;
		
		// Validate this user
		var isValidated = this.validateUserInfo( userInfo );
		
		if( isValidated ) {
			// Find server event updates relevant to this user
			var eventsForUser = getUserUpdates( userInfo );
			
			// Push this user into our list of queued update callbacks
			if( !exists(eventsForUser) ) {		
				var userRequest = {
					userInfo: userInfo,
					time: requestTime,
					respond: respondToClient
				}
			
				this.queuedUserRequests.push( userRequest );
			}
		} // end if user is validated
	}));
	
	
	// Clear out old user requests
	// They can hang around for at most REQUEST_LIFETIME_MS
	setInterval(function () {
		/*
		if( !this.m_callbacks || !this.m_messages ) return;
		
		var now = new Date();
		while ( this.m_callbacks.length > 0 && now - this.m_callbacks[0].timestamp > REQUEST_LIFETIME_MS ) {
			this.m_callbacks.shift().callback([]);
		}
		*/
	}, 3000);
	
} // end LongPoll()


//////////////////////////////////////////////////////////////////////////
// Adds a function to callback for updates from some other module
LongPoll.prototype.addEventUpdate() = function( event ) {
	this.eventUpdates[event.name]= event;
	
	// Dispatch event updates to clients who are waiting
	if( this.queuedUserRequests.length > 0 ) {
		this.dispatchQueuedRequests( event );
	}
} // end addUpdateCallback()


//////////////////////////////////////////////////////////////////////////
// Returns a list of server side event updates since the user requested them
LongPoll.prototype.getUserUpdates() = function( userInfo, requestTime ) {

	// We're goign to loop through our collection of events backwards
	// until we find one that is BEFORE the user's request time.
	// NOTE: eventUpdates[0] represents the oldest event we've got record of
	var events = new Array();
	
	for( var iEvent = this.eventUpdates.length; iEvent > 0; --iEvent ) {
	
		// If this event happened before the client requested the data, stop searching events
		if( this.eventUpdates[iEvent].time > requestTime ) { break; }
		
		// If this event has a validation function, use it to make sure the user should actually get the event.
		// This is to make sure that time sensitive modules that use this code can create a validation function
		// to make sure that nothing has changed with the users status, and they should still get the event.
		// You could call this the last line of defense against someone getting an event they shouldn't
		var isValidated = true;
		if( exists(this.eventUpdates[iEvent].validateUser) ) {
			isValidated = this.eventUpdates[iEvent].validateUser( userInfo, requestTime );
		}
		
		if( isValidated ) {
			events.push( this.eventUpdates[iEvent] );
		}
	}
	
	return events;
} // end getUserUpdates()


//////////////////////////////////////////////////////////////////////////
// Respond to queued user requests with new events
LongPoll.prototype.dispatchQueuedRequests() = function( event ) {
	for( var iRequest=0; iRequest<this.queuedUserRequests.length; ++iRequest ) {
		var userRequest = this.queuedUserRequests[iRequest];
		
		// Validate the user for this event
		var isValidated = true;
		if( exists(event.validateUser) ) {
			isValidated = event.validateUser( userInfo, requestTime );
		}
		
		if( isValidated ) {
			// Construct our event response
			var response = {};
			response[event.name] = event;
		
			userRequest( response );
		}		
	} // end for each user request
} // end dispatchQueuedRequests()