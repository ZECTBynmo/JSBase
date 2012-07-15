JSBase
======

*Base functionality for node.js applications*

Server
* Common        -- Shared files
  * EventHandler   -- Generic event handling, used to setup myObject.on("someEvent", callback) for your class
  * MimeLookup     -- Lookup table to map between file extensions and mime data types (eg: ".text" -> "text/html")
* Long Poll			-- Effectively allows the server to push data down to the client
* HTTPServer		-- Creates a server and allows easy/clean interaction
* Chat  	      -- Uses LongPoll and HTTPServer to setup a chat server, sends all required files to client
* MimeLookup		-- Allows the lookup of mime text strings for common file extensions
* Channel  		  -- Sets up "rooms" for people to be in and interace with eachother

Client
* Long Poll			-- Effectively allows the server to push data down to the client

Common
* Jquery
* Widgets

Test
* Chat Test			-- Test the server side Chat class, exercising LongPoll, and HTTPServer for the first time