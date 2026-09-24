const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const paymentController = require("../controllers/payments");

router.get("/listings/:id/checkout", isLoggedIn, wrapAsync(paymentController.renderCheckout));
router.post("/listings/:id/checkout", isLoggedIn, wrapAsync(paymentController.processPayment));

module.exports = router;
