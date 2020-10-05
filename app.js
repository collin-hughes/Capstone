const express = require("express");
const layouts = require("express-ejs-layouts");
const { v4: uuidV4 } = require("uuid");
const mySql = require("mysql");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const sqlManager = require("./public/sqlManager");

// Setup SQL connection info
//const sqlCon = mySql.createConnection(
//  {
//    host: "localhost",
//    user: "root",
//    password: "root"
//  }
//);

const sqlCon = mySql.createPool({
  host: "us-cdbr-east-02.cleardb.com",
  user: "b06a09bccf04b5",
  password: "d0095677",
});

// Connect and setup database
sql = new sqlManager(sqlCon);

module.exports = sql;

// Set up EJS
app.set("view engine", "ejs");

// Set up directories
app.use(express.static("public/"));
app.use(express.static("views/"));

// Set up routes
app.use("/", require("./routes/index"));

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

//app.get("/", (req, res) => res.render("index"));
//app.get("/room", (req, res) => res.redirect(`/room=${uuidV4()}`));
//app.get("/room=:room", (req, res) =>
//  res.render("room", { roomId: req.params.room })
//);


const port = process.env.PORT || 5000;

server.listen(port, console.log(`Server started on port ${port}`));