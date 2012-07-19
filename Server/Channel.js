//////////////////////////////////////////////////////////////////////////
// Channel - Server Side
//////////////////////////////////////////////////////////////////////////
//
// We are trying to create a "channel" or "room" system. A user can join
// a channel, and interact with users in that channel. 
//
//
// We have this process/flow for handling HTTP requests (top to bottom)
//
//                [HTTP Request]
//                      |
//                   [Server]
//                  /        \                    // Scan through each channel
//                 /          \
//         [Channel]          [Channel]
//         /       \          /       \           // Scan through each user
//    [Client]  [Client] [Client]  [Client]             
//
// This means that the server won't have to loop through each user to see where
// the http request should go, it can just scan through the channels, and ask
// them whether one of their users cares. The channel will know in advance what
// events its users care about, so the whole process is much faster.
//
// The end result of this is that adding users does not slow down the servers ability
// to respond to HTTP requests much, adding channels will
//
// The channel will look exactly like a client to the server. It just acts like
// a middle man, dispatching events to users attached to it. Channels can be daisy
// chained or nested, they can exist with no users present, etc...
//
/* ----------------------------------------------------------------------
													Object Structures
-------------------------------------------------------------------------

*/
//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.createNewChannel = function( httpServer ) {
		return new Channel( httpServer );
	};
	
	exports.getConstructor = function() { return Channel; };
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var eventHandlerImpl = require("./Common/EventHandler");
	
var DEBUG_LOG = true;

var log = function( text ) {	// A log function we can turn off :/
	if( DEBUG_LOG ) { console.log( text ); }
}


//////////////////////////////////////////////////////////////////////////
// Constructor
function Channel( parentServer ) {
	this.name = "Channel";
	this.channelRequests = {};
	this.parentServer = parentServer;
	this.eventHandler = eventHandlerImpl.createNewEventHandler( this.name );

	log( "Creating channel " + this.name );
} // end Channel()


//////////////////////////////////////////////////////////////////////////
// Adds a callback to some event
Channel.prototype.on = function( eventName, callback ) {	
	log( "Channel: Adding callback for " + eventName )
	
	// If the event name doesn't already begin with a /, put one on
	if( eventName.indexOf("/") != 0 ) {
		eventName = "/" + eventName;
	}
	
	// Create our struct of event traits
	var eventTraits = {
		callback: callback,
		callbackIfNew: this.getOnNew(eventName),
		shouldCreateEvent: true
	}
	
	// Add this event to our event handler
	this.eventHandler.addEventCallback( eventName, eventTraits, this.name );
	
	// Get this event from our parent
	this.parentServer.on( eventName, this.getCallback(eventName) );
} // end addRequestHandler()


//////////////////////////////////////////////////////////////////////////
// Returns a function that the server will call when it receives an event
// that we've registered for
Channel.prototype.getCallback = function( eventName ) {
	var self = this;
	
	var callback = function() {
		self.eventHandler.fireEvent( eventName );
		log( "Channel: Got event: " + eventName);
	}
	
	return callback;
} // end getCallback()


//////////////////////////////////////////////////////////////////////////
// We want to add each event to our parent server the first time we get it
// (and only the first)
Channel.prototype.getOnNew = function( eventName ) {
	console.log( "New event: " + eventName );
	
	// Put our this pointer in closure
	var self = this;
	
	var onNew = function( name ) {
		log( "Got event " + name + " for the first time" );
		
		// Append our channel name into the event string, so it can be unique
		eventName = "/" + self.name + eventName;
		self.parentServer.on( eventName, self.getOnEventFired( eventName ) );
	}
	
	return onNew;
} // end getOnNew()


//////////////////////////////////////////////////////////////////////////
// Fire the event in our event handler, so we call all of the callbacks attached to the event
Channel.prototype.getOnEventFired = function( eventName ) {	
	var self = this;
	var eventName = eventName;
	
	var onEventFired = function( data, respond ) {	
		console.log( self.name + ": Event " + eventName + " fired" );
	
		// Subtract our prefix
		if( eventName.indexOf(self.name) != -1 ) {
			eventName = eventName.substring(("/" + self.name).length);
		}

		self.eventHandler.fireEvent( eventName, data );
	}
	
	return onEventFired;
} // end getOnEventFired()