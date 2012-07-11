//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.getNewEventHandler = function() {
		newEventHandler= new EventHandler();
		return newEventHandler;
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var sys = require("sys"),
	util = require("./util");
	

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
	
	util.serverConsole( sys, "Event created: " + eventName );
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
		util.serverConsole( sys, "Someone tried to sign up for an even that didnt exist: " + eventName );
	}
}; // end EventHandler.addEventCallback()


//////////////////////////////////////////////////////////////////////////
// Call all callback functions attached to an event
EventHandler.prototype.fireEvent = function( eventName, data ) {
	util.serverConsole( sys, "Event fired: " + eventName + " with " + this.eventList[eventName].callbackList.length + " callbacks" );

	for( iCallback=0; iCallback<this.eventList[eventName].callbackList.length; ++iCallback ) {
		if( !util.exists(this.eventList[eventName].callbackList[iCallback].callbackScope) ) {
			this.eventList[eventName].callbackList[iCallback].callback( data );
		} else {
			this.eventList[eventName].callbackList[iCallback].callback( this.eventList[eventName].callbackList[iCallback].callbackScope, data );
		}
	}
}; // end EventHandler.fireEvent()