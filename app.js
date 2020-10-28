const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();
const fs = require("fs");
//const https = require("https");
const os = require("os");
//const ExpressPeerServer = require("peer").ExpressPeerServer;

//const WebSocket = require("ws");
// based on examples at https://www.npmjs.com/package/ws
//const WebSocketServer = WebSocket.Server;

//const options = {
//  key: fs.readFileSync("./config/key.pem"),
//  cert: fs.readFileSync("./config/cert.pem"),
//};

//httpsServer = https.createServer(options, app);

const httpServer = require("http").Server(app);
//const io = require("socket.io")(httpsServer);
const io = require("socket.io")(httpServer);

// Require db config
var databaseString = fs.readFileSync("./config/dbconfig.json");
databaseString = JSON.parse(databaseString);
console.log(databaseString);
const db = databaseString.MongoURI;

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


io.on("connection", socket =>
{
    socket.on("join-room", (roomId, userId) =>
    {
        console.log("Joined");
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);

        socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);    
        })
    })

    socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
    });
})

/*
// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpsServer });

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });

  ws.on('error', () => ws.terminate());
});

wss.broadcast = function (data) {
  this.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
*/


const httpPort = process.env.PORT || 5000;

//var networkInterfaces = os.networkInterfaces();
//console.log(networkInterfaces);

httpServer.listen(
  httpPort,
  console.log(`Server started on port ${httpPort}`)
);