const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isAdmin } = require("../middleware");
const adminController = require("../controllers/admin");

router.get("/", isAdmin, wrapAsync(adminController.dashboard));
router.post("/users/:id/role", isAdmin, wrapAsync(adminController.updateUserRole));
router.post("/listings/:id/delete", isAdmin, wrapAsync(adminController.deleteListing));

module.exports = router;
