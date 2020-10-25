const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();
const fs = require("fs");
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Require db config
var databaseString = fs.readFileSync("./config/dbconfig.json");
databaseString = JSON.parse(databaseString);
console.log(databaseString);
const db = databaseString.MongoURI;

// Require passport config
require("./config/passport")(passport);

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
  saveUnitialized: true,
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

const port = process.env.PORT || 5000;

server.listen(port, console.log(`Server started on port ${port}`));