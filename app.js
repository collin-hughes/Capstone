const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Require passport config
require("./config/passport")(passport);

// Require db config
const db = require("./config/keys").MongoURI;

// Connect to mongo database
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Set up EJS
app.set("view engine", "ejs");

//Bodyparser
app.use(express.urlencoded( { extended: false }));

// Express sessions
app.use(session({
  secret: "secret",
  resave: true,
  saveUnitialized: true,
}));

// Set up directories
app.use(express.static("public/"));
app.use(express.static("views/"));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set up routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

io.on("connection", socket =>
{
    socket.on("join-room", (roomId, userId) =>
    {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
    
        socket.on("disconnect", () => {
        socket.to(roomId).broadcast.emit("user-disconnected", userId);    
        })
    })
})

const port = process.env.PORT || 5000;

server.listen(port, console.log(`Server started on port ${port}`));