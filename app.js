const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();
const fs = require("fs");
const https = require("https");
const publicIp = require("public-ip");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;

const options = {
  key: fs.readFileSync("./config/key.pem"),
  cert: fs.readFileSync("./config/cert.pem"),
};

// Create the https server
httpsServer = https.createServer(options, app);

// Load in the config settings
const config = JSON.parse(fs.readFileSync("./config/config.json"));

const db = config.MongoURI;

// Require passport config
require("./passport")(passport);

// Connect to mongo database
mongoose.connect(db.toString(), { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Set up EJS
app.use(layouts);
app.set("view engine", "ejs");

//Bodyparser
app.use(express.urlencoded( { extended: false }));

// Express sessions
app.use(session({
  secret: "secret",
  resave: true,
}));

// Set up directories
app.use(express.static("public/"));
app.use(express.static("views/"));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// Set up routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("*", require("./routes/error"));

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });

// On the connection event
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    // Broadcast any received message to all clients
    wss.broadcast(message);
  });

  // On the error event, close the socket
  ws.on('error', () => ws.terminate());
});

// Create a broadcast event
wss.broadcast = function (data) {
  // For each client
  this.clients.forEach(function (client) {
    // If the client ready state is open, send the message data
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

const httpsPort = process.env.PORT || config.ServerPort;

// Start the https server 
httpsServer.listen(
  httpsPort,
  console.log(`Server started on port:${httpsPort}`)
);

// Output the server ip address
(async () => {
  console.log(await publicIp.v4());
})();
