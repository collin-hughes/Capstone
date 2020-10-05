const express = require("express");
const mySql = require("mysql");
const router = express.Router();

class SQLManager {
  constructor(sqlConnection) {
    console.log("Setting up SQL connection");

    this.sqlConnection = sqlConnection;

    // Test connection
    this.sqlConnection.connect((err) => {
      if (err)
      {
        console.log(err);
      } 

      console.log("Connected to database successfully!");
    });

    //var query = "CREATE DATABASE conferenceDb";

    //this.sqlConnection.query(query, (err, result) => {
    //  if (err) {
    //    console.log(err.message);
    //  } else {
    //    console.log("Database created.");
    //  }
    //});

    //var query = "USE conferenceDb";
    var query = "USE heroku_02d83eb6efdee97";

    this.sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Using conferenceDb.");
      }
    });

    query = "CREATE TABLE rooms (roomId VARCHAR(255) PRIMARY KEY)";

    this.sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Table created.");
      }
    });
  }

  CreateNewRoom(roomId, res) {
    var success;
    var query = "INSERT INTO rooms (roomId) VALUES ('" + roomId + "')";

    this.sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Room added.");

        res.redirect(`/room=${roomId}`);
      }
    });

    return success;
  }

  CheckRoom(roomId, res) {
    var success;
    var query = "SELECT * FROM rooms WHERE roomId ='" + roomId + "'";

    this.sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        if(result !== null)
        {
          console.log(`Joining Room: ${result}.`);
          
          res.render("room", { roomId: roomId });
        }

        else
        {
          res.redirect("/");

        }
      }
    });

    return success;
  }
}

module.exports = SQLManager;
