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
//------------------
	eventHandler.createEvent( "myEventName" );
// ------------------
*/
// A class can set up the on("some event") functionality like this:
/* 
// ------------------
	someClass.prototype.on = function( eventName, callback ) {
		eventList.addEventCallback( eventName, callback );
	}
// ------------------
*/
// To trigger an event, you can call "fireEvent"
//
/* ----------------------------------------------------------------------
                                                    Object Structures
-------------------------------------------------------------------------
	var event = {
		callbackList: some array of callbacks,
	}
	
	var callback = {
		callback: some function,
		callbackScope: optional scope argument, allows you to pass some 
		               arbitrary scope into the function and get it back 
					   when an event occurs
	}
*/
//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.createNewEventHandler = function() {
		newEventHandler= new EventHandler();
		return newEventHandler;
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
	var DEBUG = true;
	var log = function( text ) {
		if( DEBUG ) console.log( text ) ;
	}

//////////////////////////////////////////////////////////////////////////
// Constructor
function EventHandler() {
	this.eventList = {};
} // end EventHandler()


//////////////////////////////////////////////////////////////////////////
// Creates a new event that others can listen for
EventHandler.prototype.createEvent = function( eventName ) {
	var newEvent = {
		callbackList: new Array()
	}

	this.eventList[eventName] = newEvent;
	
	log( "Event created: " + eventName );
}; // end createEvent()


//////////////////////////////////////////////////////////////////////////
// Deletes an event
EventHandler.prototype.deleteEvent = function( eventName ) {
	delete this.eventList[eventName];
}; // end deleteEvent()


//////////////////////////////////////////////////////////////////////////
// Adds a callback to an event's list
EventHandler.prototype.addEventCallback = function( eventName, callback, callbackScope ) {
	// Create our new callback
	newCallback = {
		callback: callback,
		callbackScope: callbackScope
	}

	// Push the new callback into the event callback list
	if( this.eventList[eventName] ) {
		this.eventList[eventName].callbackList.push( newCallback );
	} else {
		log( "Someone tried to sign up for an even that didnt exist: " + eventName );
	}
}; // end EventHandler.addEventCallback()


//////////////////////////////////////////////////////////////////////////
// Call all callback functions attached to an event
EventHandler.prototype.fireEvent = function( eventName, data ) {
	log( "Event fired: " + eventName + " with " + this.eventList[eventName].callbackList.length + " callbacks" );

	for( iCallback=0; iCallback<this.eventList[eventName].callbackList.length; ++iCallback ) {
		if( typeof(this.eventList[eventName].callbackList[iCallback].callbackScope) == "undefined" ) {
			this.eventList[eventName].callbackList[iCallback].callback( data );
		} else {
			this.eventList[eventName].callbackList[iCallback].callback( this.eventList[eventName].callbackList[iCallback].callbackScope, data );
		}
	}
}; // end EventHandler.fireEvent()