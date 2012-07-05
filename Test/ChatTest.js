var httpServerImpl = require("../Server/HTTPServer"),
	longPollImpl = require("../Server/LongPoll"),
	chatImpl = require("../Server/Chat");
	
var server = httpServerImpl.createNewServer( 1111, null ),
	longPoll = longPollImpl.createNewLongPoll( server ),
	chat = chatImpl.createNewChat( server, longPoll );
	
// HTML
server.addRequestHandler("/", server.createFileHandler("index.html"));
server.addRequestHandler("/jquery-1.7.1.min.js", server.createFileHandler("jquery-1.7.1.min.js"));

// Scripts
server.addRequestHandler("/LongPoll.js", server.createFileHandler("../Client/LongPoll.js"));