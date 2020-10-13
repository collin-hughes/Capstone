const express = require("express");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");
const sql = require("../app.js");
const { ensureAuthenticated } = require("../config/auth.js");

router.get("/", (req, res) => res.render("index"));

router.get("/room", (req, res) => 
  {
    var roomId = uuidV4();

    res.redirect(`/room=${roomId}`);
  });

router.get("/room=:room", ensureAuthenticated, (req, res) =>
  {
    res.render("room", { roomId: req.paramsroom });
  }
);

module.exports = router;