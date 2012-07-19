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
var log = function( a ) { console.log(a); };
var exists = function(a) { return typeof(a) === "undefined"; };		// Check whether a variable exists
var deflt = function(a, b) { 										// Default a to b if a is undefined
	if( typeof(a) === "undefined" ){ 
		return b; 
	} else return a; 
};


//////////////////////////////////////////////////////////////////////////
// Constructor
function Chat( httpServer, channel, longPoll, newChatString ) {
	this.name = "Chat";

	// Default arguments
	newChatString = deflt( newChatString, "newChat" );

	this.httpServer = httpServer;			// Our HTTP server
	this.longPoll = longPoll;				// Our long poll				
	this.newChatString = newChatString;		// The string we expect for a new chat	
	
	// Receive new chat events
	var self = this;
	console.log( "Chat name is: " + newChatString );
	
	// Handle user requests for our UI objects
	httpServer.serveFile("/jquery-1.7.1.min.js", "../../Client/Common/jquery-1.7.1.min.js" );
	httpServer.serveFile("/jquery.ui.chatbox.js", "../../Client/Common/jquery.ui.chatbox.js" );
	httpServer.serveFile("/jquery.ui.chatbox.css", "../../Client/Common/jquery.ui.chatbox.css" );
	httpServer.serveFile("/jquery-ui-1.8.21.custom.min.js", "../../Client/Common/jquery-ui-1.8.21.custom.min.js" );
	
	// Handle user requests for needed scripts
	httpServer.serveFile("/LongPoll.js", "../../Client/LongPoll.js" );
	
	// Create a generic request handler to grab new chat data (text, etc)
	channel.on( "/" + newChatString, this.createOnChat() );
} // end Chat()


//////////////////////////////////////////////////////////////////////////
// Returns a function to handle incoming chat events
// We want to return a function here, rather than BEING the function, because
// it allows us to pass our this pointer into closure as self
Chat.prototype.createOnChat = function( respondToClient, data ) {
	var self = this;
	
	var onChat = function( data, respondToClient ) {
		console.log( data );
	
		// Create a new event to report to LongPoll
		var event = {
			"name": self.newChatString, 	// The name of this event (must be unique)
			"module": self.moduleName,	// The name of the module that triggered this event
			"time": new Date(),			// The time at which this event was triggered
			"data": data			
		}		
		
		require("util").inspect(event);
		
		self.longPoll.addEventUpdate( event );
		if( typeof(respondToClient) === "function" ) {
			respondToClient();
		} else {
			log( "Undefined response to client, actual structure is: " + respondToClient );
		}
		
	}
	
	return onChat;
} // end createOnChat()