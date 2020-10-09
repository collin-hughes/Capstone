const express = require("express");
const layouts = require("express-ejs-layouts");
const mySql = require("mysql");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const fs = require("fs");

var connectionInfo = SQLConfigLoader();

// Setup SQL connection info
const sqlCon = mySql.createConnection(connectionInfo);

// Connect and setup database
MakeSQLConnection(sqlCon);

module.exports = sqlCon;

// Set up EJS
app.set("view engine", "ejs");

//Bodyparser
app.use(express.urlencoded( { extended: false }));

// Set up directories
app.use(express.static("public/"));
app.use(express.static("views/"));

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

function MakeSQLConnection(sqlConnection) {
    console.log("Setting up SQL connection");

    // Test connection
    sqlConnection.connect((err) => {
      if (err)
      {
        console.log(err);
      } 

      console.log("Connected to database successfully!");
    });

    var query = "CREATE DATABASE conferenceDb";

    sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Database created.");
      }
    });

    var query = "USE conferenceDb";

    sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Using conferenceDb.");
      }
    })

    var query = "CREATE TABLE users (userId INT PRIMARY KEY AUTO_INCREMENT, lName VARCHAR(255), fName VARCHAR(255), username VARCHAR(255), password VARCHAR(255))";

    sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Users table created.");
      }
    })
};