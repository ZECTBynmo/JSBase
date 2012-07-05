//////////////////////////////////////////////////////////////////////////
// Constructor
function LongPoll() {
	this.eventCallbacks = new Array();									// Our list of responses to events
	this.numErrors;														// The number of errors our server has experienced
	this.onTooManyErrors = function() {};								// Our response to having too many errors	
	this.userInfo = {};													// Our description to the server (ID number, name, last message time, whatever)
	
	/* /////////////////////////////// 
		var callback = { 			// Callback structure
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

var MAX_ERRORS = 2;
var ERROR_TIMEOUT_MS = 10*1000;
var exists = function( someItem ) { return typeof(someItem) === "undefined"; }

//////////////////////////////////////////////////////////////////////////
// Add a callback that we'll call in response to some event
LongPoll.prototype.addEventCallback = function( eventCallback ) {
	this.eventCallbacks.push( eventCallback );
} // end addEventCallback();

//////////////////////////////////////////////////////////////////////////
// This is our main event loop
//
// We we have sent a request to the server asking for any new updates, 
// with a callback that the server can call when there are updates. The server 
// will store the callback we give it until eventually something happens, and then 
// it will call it.
//
// This should reduce the amount of work for the server to keep every client
// up to date (compared to short polling).
LongPoll.prototype.eventLoop = function( eventData ) {
	var self = this;

	if( self.numErrors > MAX_ERRORS ) {
		// We've gotten too many errors
		self.onTooManyErrors( eventData );
		return;
	}
	
	if( typeof(eventData) != "undefined" ) {
		for( var iEvent in eventData ){
			// Loop through our eventCallbacks and see if we need to respond to this event
			// Note: we have to loop through all of them, because more than one may be a response
			// to this event
			for( var iCallback = 0; iCallback < self.eventCallbacks.length; ++iCallback ) {
				var callback = self.eventCallbacks[iCallback];
			
				// If we find a callback that's listening for this event, call the callback
				if( callback.eventName === eventData[iEvent].name ) {
					callback.callback( eventData[iEvent] );
				}
			} // end for each callback
		} // end for each event
	}
	
	// Handles errors from requests to the server
	var onRequestError = function( errorData ) {		
		self.numErrors += 1;
		
		// Don't flood the servers on error, wait ERROR_TIMEOUT_MS before retrying
		setTimeout( self.eventLoop, ERROR_TIMEOUT_MS );
	}
	
	// Handles successful requests to the server
	var onRequestSuccess = function( successData ) {	
		self.numErrors = 0;
		
		// If everything went well, begin another request immediately
		// the server will take a long time to respond
		// How long? It will wait until there is another message
		// and then it will return it to us and close the connection.
		// since the connection is closed when we get data, we longPoll again
		self.eventLoop( successData );
	}
	
	// Make another HTTP request to the server for new data
	$.ajax({
		cache: false, 
		type: "GET", 
		url: "/longPollRequest",
		dataType: "json", 
		data: { 
			userInfo: self.userInfo,
			requestTime: new Date()
		}, 
		error: onRequestError,
		success: onRequestSuccess
	});
} // end LongPoll.eventLoop()