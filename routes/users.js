const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");

// Get requests
router.get("/login", (req, res) => res.render("Login"));
router.get("/register", (req, res) => res.render("register"));

// Post requests
/*router.post("/register", (req, res) => {
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
});*/

//Register handle
router.post("/register", (req, res) => {
    const { fName, lName, username, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if (!fName || !lName || !username || !password || !password2)
    {
      errors.push({ msg: "Please fill in all fields" });
    }

    //Check passwords match
    if(password !== password2)
    {
        errors.push({ msg: "Passwords do not match" });
    }

    //Check password length
    if(password.length < 6)
    {
        errors.push({msg: "Password should be atleast 6 characters" })
    }

    if(errors.length > 0)
    {
        res.render("register", {
          //errors,
          fName,
          lName,
          username,
          password,
          password2,
        });
    }

    else
    {
        //Validation passed
        User.findOne({ username: username })
            .then(user => {
                if(user) {
                    errors.push({ msg: "Email is already registered" });
                    console.log("Username is already registered");

                    //User exists
                    res.render("register", {
                        //errors,
                        fName,
                        lName,
                        username,
                        password,
                        password2,
                    });
                }

                else
                {
                    const newUser = new User({
                        fName,
                        lName,
                        username,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                      bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;

                        // Set password to hash
                        newUser.password = hash;

                        //Save user
                        newUser
                          .save()
                          .then(user => {
                              //req.flash("success_msg", "You are now registered and can log in!");
                              console.log("User registered");
                              res.redirect("/users/login");
                          })
                          .catch((err) => console.log(err));
                      })
                    );
                }
            });
    }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: false
  })(req, res, next);
})

module.exports = router;

/*function AddUser(fName, lName, username, password, password2, res, sqlCon) {
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
};*/