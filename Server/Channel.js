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
	
var DEBUG_LOG = false;

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

	console.log( "pooop" );
} // end Channel()


//////////////////////////////////////////////////////////////////////////
// Adds a callback to some event
Channel.prototype.on = function( eventName, callback ) {	
	log( "Adding callback for " + eventName );
	
	// If the event name doesn't already begin with a /, put one on
	if( eventName.indexOf("/") != 0 ) {
		eventName = "/" + eventName;
	}
	
	// Create our struct of event traits
	eventTraits = {
		callback: callback,
		callbackIfNew: this.onNewEvent,
		shouldCreateEvent: true
	}
	
	// Add this event to our event handler
	this.eventHandler.addEventCallback( eventName, eventTraits, this.name );
} // end addRequestHandler()


//////////////////////////////////////////////////////////////////////////
// We want to add each event to our parent server the first time we get it
// (and only the first)
Channel.prototype.onNewEvent = function( eventName ) {	
	this.parentServer.on( eventName, this.onEventFired );
} // end onNewEvent()


//////////////////////////////////////////////////////////////////////////
// Fire the event in our event handler, so we call all of the callbacks attached to the event
Channel.prototype.onEventFired = function( eventName, traits ) {	
	// Subtract our prefix
	eventName = eventName.subString(("/" +this.name).length-1);

	this.eventHandler.fireEvent( eventData.eventName );
}