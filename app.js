const express = require("express");
const layouts = require("express-ejs-layouts");
const { v4: uuidV4 } = require("uuid");
const mySql = require("mysql");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const sqlManager = require("./public/sqlManager");

// Setup SQL connection info
const sqlCon = mySql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "root"
  }
);

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

const port = process.env.PORT || 5000;

server.listen(port, console.log(`Server started on port ${port}`));