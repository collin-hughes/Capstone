const express = require("express");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");
const { ensureAuthenticated } = require("../auth.js");

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
    });
  }
);

module.exports = router;