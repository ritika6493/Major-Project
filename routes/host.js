const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const hostController = require("../controllers/host");

router.get("/dashboard", isLoggedIn, wrapAsync(hostController.dashboard));

module.exports = router;
