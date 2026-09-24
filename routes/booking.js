const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// Create a new booking for a listing
router.post("/listings/:id/bookings", isLoggedIn, wrapAsync(bookingController.createBooking));

// View user's trips / reservations
router.get("/trips", isLoggedIn, wrapAsync(bookingController.myTrips));

// Cancel a booking
router.post("/bookings/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
