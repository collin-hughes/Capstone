const express = require("express");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");

// Open welcome page
//router.get("/", (req, res) => res.render("index"));
//router.get("/rooms", (req, res) => res.redirect(`/rooms/${uuidV4()}`));
//router.get("/rooms/:room", (req, res) => res.render("room", {roomId: req.params.room}));

module.exports = router;