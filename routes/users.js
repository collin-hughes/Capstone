const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");

// Get requests
router.get("/login", (req, res) =>
  res.render("Login", {
    layout: "layouts/layout_main",
    pgName: "Login",
    pageCSS: "login",
  })
);
router.get("/register", (req, res) =>
  res.render("register", {
    layout: "layouts/layout_main",
    pgName: "Registration",
    pageCSS: "register",
  })
);

//Register handle
router.post("/register", (req, res) => {
    const { username, fName, lName, password, password2 } = req.body;
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
          errors,
          username,
          fName,
          lName,
          password,
          password2,
          layout: "layouts/layout_main",
          pgName: "Registration",
          pageCSS: "register",
        });
    }

    else
    {
        //Validation passed
        User.findOne({ username: username })
            .then(user => {
                if(user) {
                    errors.push({ msg: "Username is already registered" });

                    //User exists
                    res.render("register", {
                      errors,
                      username,
                      fName,
                      lName,
                      password,
                      password2,
                      layout: "layouts/layout_main",
                      pgName: "Registration",
                      pageCSS: "register",
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
                              req.flash("success_msg", "You are now registered and can log in!");
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
    failureFlash: true
  })(req, res, next);
})

module.exports = router;