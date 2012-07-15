//////////////////////////////////////////////////////////////////////////
// EventHandler - Server Side
//////////////////////////////////////////////////////////////////////////
//
// This is a generic interface to setup events in a class. 
//
// We want to be able to say this:
// 		someClass.on( "someEventName", function( eventData ) { do something }
//
// A class can create an event like this:
/*
	eventHandler.createEvent( "myEventName" );
*/
// A class can set up the on("some event") functionality like this:
/*
	someClass.prototype.on = function( eventName, callback ) {
		eventHandler.addEventCallback( eventName, callback );
	}
	
*/
// To trigger an event, you can call "fireEvent( eventName )"
//
// Give the event handler a name if you want to have legible debug statements.
// This is a big help, because debugging can be difficult when events have
// a complicated structure.
/* ----------------------------------------------------------------------
                                                    Object Structures
-------------------------------------------------------------------------
	var event = {
		name: some name,
		callbackList: some array of callbacks
	}
	
	var eventTraits = {
		callback: some callback (),
		callbackScope: some scope {},
		shouldCreateEvent: should we create a new even if we haven't heard of this eventName before
	}
	
	var callback = {
		callback: some function,
		callbackScope: optional scope argument, allows you to pass some 
		               arbitrary scope in while setting up the callback,
					   and get it back when an event occurs
	}
*/
//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.createNewEventHandler = function( name ) {
		newEventHandler= new EventHandler( name );
		return newEventHandler;
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var DEBUG = false;
var log = function( text ) {
	if( DEBUG ) console.log( text ) ;
}

//////////////////////////////////////////////////////////////////////////
// Constructor
function EventHandler( name ) {
	this.name = name;
	this.eventList = {};
} // end EventHandler()


//////////////////////////////////////////////////////////////////////////
// Creates a new event that others can listen for
EventHandler.prototype.createEvent = function( eventName ) {
	var newEvent = {
		callbackList: new Array()
	}

	this.eventList[eventName] = newEvent;
	
	log( this.name + " event created: " + eventName );
}; // end createEvent()


//////////////////////////////////////////////////////////////////////////
// Deletes an event
EventHandler.prototype.deleteEvent = function( eventName ) {
	delete this.eventList[eventName];
}; // end deleteEvent()


//////////////////////////////////////////////////////////////////////////
// Adds a callback to an event's list
EventHandler.prototype.addEventCallback = function( eventName, traits ) {
	/*
		traits = {
			callback: some callback (),
			callback scope: some scope {},
			callbackIfNew: if this is the first time we've heard of eventName then call this,
			shouldCreateEvent: should we create a new even if we haven't heard of this eventName before
		}
	*/
	
	if( typeof(traits) == "undefined" ) { 
		log( "Tried to add a callback with no callback" );
		return;
	}

	// Create our new callback (strip out traits elements that we don't need)
	newCallback = {
		callback: traits.callback,
		callbackScope: traits.callbackScope
	}

	// Push the new callback into the event callback list
	if( this.eventList[eventName] ) {
		log( "Adding callback for " + eventName );
		this.eventList[eventName].callbackList.push( newCallback );
	} else {
		if( traits.shouldCreateEvent ) { 
			this.createEvent( eventName );
			this.eventList[eventName].callbackList.push( newCallback );
		}
	}
}; // end EventHandler.addEventCallback()


//////////////////////////////////////////////////////////////////////////
// Call all callback functions attached to an event
EventHandler.prototype.fireEvent = function( eventName, data ) {
	// Just return if we don't have this event yet
	if( typeof(this.eventList[eventName]) == "undefined" ) {
		log( "Tried to fire a " + this.name + " event that didn't exist: " + eventName );
		return;
	}
	
	log( this.name + " event fired: " + eventName + " with " + this.eventList[eventName].callbackList.length + " callbacks" );

	for( iCallback=0; iCallback<this.eventList[eventName].callbackList.length; ++iCallback ) {
		if( typeof(this.eventList[eventName].callbackList[iCallback].callbackScope) == "undefined" ) {
			this.eventList[eventName].callbackList[iCallback].callback( data );
		} else {
			this.eventList[eventName].callbackList[iCallback].callback( this.eventList[eventName].callbackList[iCallback].callbackScope, data );
		}
	}
}; // end EventHandler.fireEvent()