const express = require("express");
const router = express.Router();

router.get("*", (req, res) => res.render("error", { layout: "layouts/layout_main", pgName: "Error", pageCSS: "error"}));

module.exports = router;