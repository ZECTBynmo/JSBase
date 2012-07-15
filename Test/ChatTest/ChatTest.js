var httpServerImpl = require("../../Server/HTTPServer"),
	longPollImpl = require("../../Server/LongPoll"),
	chatImpl = require("../../Server/Chat");
	
// Create our server and 
var server = httpServerImpl.createNewServer( 1111, null ),
	longPoll = longPollImpl.createNewLongPoll( server ),
	chat = chatImpl.createNewChat( server, server, longPoll );
	
// Send HTML to client
server.serveFile( "/", "index.html" );
server.addRequestHandler("/", server.createFileHandler("index.html"));