var Channel = require("../../Server/Channel").getConstructor();

var newChannel = new Channel();

var httpServerImpl = require("../../Server/HTTPServer"),
	longPollImpl = require("../../Server/LongPoll"),
	chatImpl = require("../../Server/Chat");
	
// Create our server and 
var server = httpServerImpl.createNewServer( 1111, null ),
	longPoll = longPollImpl.createNewLongPoll( server ),
	channel = new Channel( server );
	chat = chatImpl.createNewChat( server, channel, longPoll );
	
// Send HTML to client
server.serveFile( "/", "index.html" );
server.addRequestHandler("/", server.createFileHandler("index.html"));