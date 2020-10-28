const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/User");

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: "username"}, (username, password, done) => {
    
        User.findOne({username: username})
            .then(user => {
                if(!user)
                {
                    return done(null, false, { message: "Username is not registered"});
                }

                // Match the password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;

                    if(isMatch)
                    {
                        return done(null, user);
                    }

                    else
                    {
                        return done(null, false, {message: "Incorrect Password!"});
                    }
                });
            })
            .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      User.findById(id, (err, user) => {
        done(err, user);
      });
    });
}
