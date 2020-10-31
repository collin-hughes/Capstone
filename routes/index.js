const express = require("express");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");
const { ensureAuthenticated } = require("../auth.js");
const fs = require("fs");

// Load in the config settings
const config = JSON.parse(fs.readFileSync("./config/config.json"));

router.get("/", (req, res) => res.render("index", { layout: "layouts/layout_main", pgName: "Home", pageCSS: "index"}));

router.get("/room", (req, res) => 
  {
    var roomId = uuidV4();

    res.redirect(`/room=${roomId}`);
  });


router.get("/room=:room", ensureAuthenticated, (req, res) =>
//router.get("/room/", ensureAuthenticated, (req, res) =>
  {
    res.render("room", {
    //res.render("newRoom", {
      layout: "layouts/layout_room",
      //layout: false,
      roomId: req.params.room,
      name: req.user.username,
      userUuid: uuidV4(),
      port: config.ServerPort
    });
  }
);

module.exports = router;