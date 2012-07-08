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
		module: someModule,							// The name of the module that triggered this event
		time: someTime,								// The time at which this event was triggered
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
var REQUEST_LIFETIME_MS = 30000;
var DBG = true;
var log = function(text) { if(DBG) console.log(text); }

//////////////////////////////////////////////////////////////////////////
// Constructor
function LongPoll( httpServer ) {
	this.eventUpdates = new Array();												// Our collection of events that we need to update the client about
	this.queuedUserRequests = new Array();											// Our collection of user request callbacks that are sitting waiting for events
	this.httpServer = httpServer;													// Our HTTP server
	
	// Add our long poll request handler to the server
	var self = this;
	httpServer.addRequestHandler( "/longPollRequest", httpServer.createGenericHandler(function( respondToClient, data ) {
		log( "Got LongPoll request" );
		
		var userInfo = data.userInfo;
		var requestTime = data.requestTime;
		
		// Find server event updates relevant to this user
		var eventsForUser = self.getUserUpdates( userInfo );
		
		// Push this user into our list of queued update callbacks
		if( !exists(eventsForUser) ) {		
			var userRequest = {
				userInfo: userInfo,
				time: requestTime,
				respond: respondToClient
			}
		
			self.queuedUserRequests.push( userRequest );
		} else {
			// Give the user the new data
			userRequest( eventsForUser );
		}
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
LongPoll.prototype.addEventUpdate = function( event ) {
	log( "Got an event: " + event.name );
	
	this.eventUpdates[event.name]= event;
	
	// Dispatch event updates to clients who are waiting
	if( this.queuedUserRequests.length > 0 ) {
		this.dispatchQueuedRequests( event );
	}
} // end addUpdateCallback()


//////////////////////////////////////////////////////////////////////////
// Returns a list of server side event updates since the user requested them
LongPoll.prototype.getUserUpdates = function( userInfo, requestTime ) {

	var events = new Array();
	
	// We're goign to loop through our collection of events backwards
	// until we find one that is BEFORE the user's request time.
	// NOTE: eventUpdates[0] represents the oldest event we've got record of
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
LongPoll.prototype.dispatchQueuedRequests = function( event ) {
	for( var iRequest=0; iRequest<this.queuedUserRequests.length; ++iRequest ) {
		var userRequest = this.queuedUserRequests[iRequest];
		// Construct our event response
		var response = {};
		response[event.name] = event;
	
		userRequest.respond( response );
	} // end for each user request
} // end dispatchQueuedRequests()