var appjs = require('appjs');

var window;

// Initialize appjs.
var app = appjs.init();

// Called when page load finishes.
app.on("ready",function(){
    console.log("Event Ready called");

    // Runs a script in browser context.
    window.runInBrowser(function(){
        var body = document.body;
        body.style.color="#f60";
    });

  // Show created window ( see below )
  window.show();
});

// Routing:

// you can use a static router:
 app.use(app.staticRouter('./public'));

// or you can handle requests manually:
/*app.get("/",function(req,res,next){
  res.send("\
    <html>\
        <head><title>Hello World</title></head>\
        <body>Hello World</body>\
    </html>\
  ")
});*/

// Creates a new window. Its invisible until window.show() get called.
// http://appjs/ is a special url. It is home for your application!
window = app.createWindow("http://appjs/",{autoResize:false});