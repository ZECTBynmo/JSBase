//////////////////////////////////////////////////////////////////////////
// Chat - Server Side
//////////////////////////////////////////////////////////////////////////
//
// Receive text messages from a client, and report them to LongPoll
/* ----------------------------------------------------------------------
													Object Structures
-------------------------------------------------------------------------
	var newChat = {
		text: text,
		userInfo: userInfo,
		time: time
	}
*/
//////////////////////////////////////////////////////////////////////////
// Node.js Exports
var globalNamespace = {};
(function (exports) {
	exports.createNewChat = function( httpServer, longPoll, moduleName, newChatString ) {
		newChat= new Chat( httpServer, longPoll, moduleName, newChatString );
		return newChat;
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var DBG = false;
var log = function( a ) { console.log(a); };
var exists = function(a) { return typeof(a) === "undefined"; };		// Check whether a variable exists
var deflt = function(a, b) { 										// Default a to b if it's undefined
	if( typeof(a) === "undefined" ){ 
		return b; 
	} else return a; 
};


//////////////////////////////////////////////////////////////////////////
// Constructor
function Chat( httpServer, longPoll, moduleName, newChatString ) {
	// Default arguments
	moduleName = deflt( moduleName, "Chat" );
	newChatString = deflt( newChatString, "newChat" );

	this.httpServer = httpServer;			// Our HTTP server
	this.longPoll = longPoll;				// Our long poll
	this.moduleName = moduleName;			// Our module name					
	this.newChatString = newChatString;		// The string we expect for a new chat	
	
	// Receive new chat events
	var self = this;
	console.log( "Chat name is: " + newChatString );
	httpServer.addRequestHandler( "/" + newChatString, httpServer.createGenericHandler(function( respondToClient, data ) {
		// Create a new event to report to LongPoll
		var event = {
			name: self.newChatString, 	// The name of this event (must be unique)
			module: self.moduleName,	// The name of the module that triggered this event
			time: new Date(),			// The time at which this event was triggered
			data: data			
		}		
		
		self.longPoll.addEventUpdate( event );
		
		// Respond to the client so the connection isn't sitting open
		// We will push data down to the client in long poll, so don't
		// give them any data here
		respondToClient();
	}));
} // /*end Chat()*/