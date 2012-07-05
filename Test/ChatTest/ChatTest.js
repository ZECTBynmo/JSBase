var httpServerImpl = require("../../Server/HTTPServer"),
	longPollImpl = require("../../Server/LongPoll"),
	chatImpl = require("../../Server/Chat");
	
// Create our server and 
var server = httpServerImpl.createNewServer( 1111, null ),
	longPoll = longPollImpl.createNewLongPoll( server ),
	chat = chatImpl.createNewChat( server, longPoll );
	
// Send common files to the cient
server.addRequestHandler("/jquery-1.7.1.min.js", server.createFileHandler("../../Common/jquery-1.7.1.min.js"));
server.addRequestHandler("/jquery.ui.chatbox.js", server.createFileHandler("../../Common/jquery.ui.chatbox.js"));
server.addRequestHandler("/jquery.ui.chatbox.css", server.createFileHandler("../../Common/jquery.ui.chatbox.css"));
server.addRequestHandler("/jquery-ui-1.8.21.custom.min.js", server.createFileHandler("../../Common/jquery-ui-1.8.21.custom.min.js"));
	
// Send HTML to client
server.addRequestHandler("/", server.createFileHandler("index.html"));

// Send scripts to client
server.addRequestHandler("/LongPoll.js", server.createFileHandler("../../Client/LongPoll.js"));