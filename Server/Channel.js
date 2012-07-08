//////////////////////////////////////////////////////////////////////////
// Channel - Server Side
//////////////////////////////////////////////////////////////////////////
//
// We are trying to create a "channel" or "room" system. A user can join
// a channel, and interact with users in that channel. We want it to have the
// exact same API as the HTTPServer class as far as request handling
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
	exports.createNewChannel = function( server ) {
		return new Channel( server );
	};
}(typeof exports === 'object' && exports || globalNamespace));


//////////////////////////////////////////////////////////////////////////
// Constructor
function Channel( server ) {
	this.requestHandlers = 
} // end Channel()