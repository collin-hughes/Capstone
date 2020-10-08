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

    var query = "CREATE DATABASE conferenceDb";

    this.sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Database created.");
      }
    });

    var query = "USE conferenceDb";

    this.sqlConnection.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Using conferenceDb.");
      }
    });

    //query = "CREATE TABLE rooms (roomId VARCHAR(255) PRIMARY KEY)";

    //this.sqlConnection.query(query, (err, result) => {
    //  if (err) {
    //    console.log(err.message);
    //  } else {
    //    console.log("Table created.");
    //  }
    //});
  }
}

module.exports = SQLManager;
