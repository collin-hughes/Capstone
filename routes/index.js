const express = require("express");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");
const { ensureAuthenticated } = require("../config/auth.js");

router.get("/", (req, res) => res.render("index", { layout: "layouts/layout_main", pgName: "Home", pageCSS: "index"}));

router.get("/room", (req, res) => 
  {
    var roomId = uuidV4();

    res.redirect(`/room=${roomId}`);
  });

router.get("/room=:room", ensureAuthenticated, (req, res) =>
  {
    res.render("room", {
      layout: "layouts/layout_room",
      roomId: req.paramsroom,
      name: req.user.username,
    });
  }
);

module.exports = router;