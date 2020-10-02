const express = require("express");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");
const sql = require("../app.js");

router.get("/", (req, res) => res.render("index"));
router.get("/room", (req, res) => 
  {
    var newRoomID = uuidV4();
    console.log(newRoomID);

    sql.CreateNewRoom(newRoomID, res);     
  });
router.get("/room=:room", (req, res) =>
  {
    sql.CheckRoom(req.params.room, res)
  }
);

module.exports = router;