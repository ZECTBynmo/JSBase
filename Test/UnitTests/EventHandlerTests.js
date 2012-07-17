var assert = require("assert");var eventHandlerImpl = require("../../Server/Common/EventHandler");var eventHandler = eventHandlerImpl.createNewEventHandler( "Event Handler tests" );var runTests = function() {	describe('EventHandler', function() {			it('Should be able to add event callbacks and fire events', function(){			var hasEventFired = false;					// Create the event			eventHandler.createEvent( "testEvent" );						// Create our callback for when the event fires			var callback = function() {				hasEventFired = true;			};						// Give the event handler the callback for our test event			eventHandler.addEventCallback( "testEvent", callback );						// Fire the event			eventHandler.fireEvent( "testEvent" );						assert.equal( true, hasEventFired );  		})	});} // end runTests();exports.runTests = runTests;