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
	
	console.log( "Event created: " + eventName );
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
		console.log( "Listened for event that doesn't exist: " + eventName );
		createEvent( eventName );
	}
}; // end EventHandler.addEventCallback()


//////////////////////////////////////////////////////////////////////////
// Call all callback functions attached to an event
EventHandler.prototype.fireEvent = function( eventName, data ) {
	// Just return if we don't have this event yet
	if( typeof(this.eventList[eventName] == "undefined" ) {
		console.log( "Tried to fire an event that didn't exist: " + eventName );
		return;
	}

	// Call all of our callbacks
	for( iCallback=0; iCallback<this.eventList[eventName].callbackList.length; ++iCallback ) {
		if( typeof(this.eventList[eventName].callbackList[iCallback].callbackScope) == "undefined" ) {
			this.eventList[eventName].callbackList[iCallback].callback( data );
		} else {
			this.eventList[eventName].callbackList[iCallback].callback( data, this.eventList[eventName].callbackList[iCallback].callbackScope );
		}
	}
}; // end EventHandler.fireEvent()