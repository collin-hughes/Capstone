const express = require("express");
const layouts = require("express-ejs-layouts");
const mySql = require("mysql");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const fs = require("fs");
const sqlManager = require("./public/sqlManager");

var connectionInfo = SQLConfigLoader();

// Setup SQL connection info
const sqlCon = mySql.createConnection(connectionInfo);

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

function SQLConfigLoader()
{
  // Read in SQL Config
  if (fs.existsSync("./config/dbconfig.json")) {
    var connectionInfo = JSON.parse(fs.readFileSync("./config/dbconfig.json"));
  } else {
    const defaultDbConfig = {
      host: "localhost",
      user: "root",
      password: "root",
    };

    fs.writeFileSync("./config/dbconfig.json", JSON.stringify(defaultDbConfig));
    var connectionInfo = defaultDbConfig;
  }

  return connectionInfo
}