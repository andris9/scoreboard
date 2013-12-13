var express = require('express'),
    app = express(),
    pathlib = require("path"),
    http = require("http"),
    port = process.env.NODE_PORT || 1080;

// Express.js configuration
app.configure(function(){
    
    // HTTP port to listen
    app.set("port", port);

    // Define path to EJS templates
    app.set("views", pathlib.join(__dirname, "views"));

    // Use EJS template engine
    app.set("view engine", "ejs");

    // Use gzip compression
    app.use(express.compress());

    // Use default Espress.js favicon
    app.use(express.favicon());

    // Log requests to console
    app.use(express.logger("tiny"));

    app.use(app.router);

    // Define static content path
    app.use(express["static"](pathlib.join(__dirname, "static")));

    //Show error traces
    app.use(express.errorHandler());
});

app.get('/', function(req, res){
    res.render("admin");
});

app.get('/client', function(req, res){
    res.render("client");
});

http.createServer(app).listen(app.get("port"));