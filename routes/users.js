const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const sql = require("../app.js");
const sqlCon = require("../app.js");
const expressEjsLayouts = require("express-ejs-layouts");

// Get requests
router.get("/login", (req, res) => res.render("Login"));
router.get("/register", (req, res) => res.render("register"));

// Post requests
router.post("/register", (req, res) => {
  const { fName, lName, username, password, password2 } = req.body;

  // Check for all required fields
  if (!fName || !lName || !username || !password || !password2) {
    res.render("register", {
      fName,
      lName,
      username,
      password,
      password2,
    });
  }

  // Check that passwords match
  if (password !== password2) {
    res.render("register", {
      fName,
      lName,
      username,
      password,
      password2,
    });
  }

  //Check password length
  if (password.length < 6) {
    console.log("password not long enough");

    res.render("register", {
      fName,
      lName,
      username,
      password,
      password2,
    });
  } else {
    AddUser(fName, lName, username, password, password2, res, sqlCon);
  }
});

module.exports = router;

function AddUser(fName, lName, username, password, password2, res, sqlCon) {
  var query =
    "SELECT * FROM conferencedb.users WHERE username='" + username + "'";

  sqlCon.query(query, (err, result) => {
    if (err) {
      console.log(err.message);
    } else {
      if (result.length) {
        console.log("A match was found");
        res.render("register", {
          fName,
          lName,
          username,
          password,
          password2,
        });
      } else {
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              console.log(err.message);
            }

            // Set password to hash
            hashedPassword = hash;

            var query =
              "INSERT INTO users (lName, fName, username, password) VALUES ('" +
              lName +
              "', '" +
              fName +
              "', '" +
              username +
              "', '" +
              hashedPassword +
              "')";

            sqlCon.query(query, (err, result) => {
              if (err) {
                console.log(err.message);
              } else {
                console.log("User added successfully");
              }
            });
          })
        );

        res.redirect("/users/login");
      }
    }
  });
};