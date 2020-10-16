const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fName: {
    type: String,
    require: true,
  },

  lName: {
    type: String,
    require: true,
  },

  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
