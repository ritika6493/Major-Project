const Listing = require("../models/listing");
const Payment = require("../models/payment");
const bookingService = require("../services/bookingService");
const ExpressError = require("../utils/ExpressError");

module.exports.renderCheckout = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guestsCount = 1 } = req.query;

    if (!checkIn || !checkOut) {
        req.flash("error", "Please select valid check-in and checkout dates.");
        return res.redirect(`/listings/${id}`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }

    const pricing = bookingService.calculatePricing({
        nightlyRate: listing.price,
        checkInDate: checkIn,
        checkOutDate: checkOut,
    });

    res.render("payments/checkout.ejs", {
        listing,
        checkIn,
        checkOut,
        guestsCount: Number(guestsCount) || 1,
        pricing,
    });
};

module.exports.processPayment = async (req, res) => {
    const { id: listingId } = req.params;
    const { checkIn, checkOut, guestsCount = 1, paymentMethod = "card" } = req.body;

    // 1. Create confirmed booking
    const booking = await bookingService.createBooking({
        listingId,
        guestId: req.user._id,
        checkIn,
        checkOut,
        guestsCount,
    });

    // 2. Generate and record payment transaction
    const transactionId = `pay_${Date.now().toString(36)}_${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.create({
        booking: booking._id,
        user: req.user._id,
        amount: booking.pricing.total,
        currency: "INR",
        provider: "razorpay",
        providerPaymentId: transactionId,
        providerOrderId: `order_${Date.now().toString(36)}`,
        status: "captured",
        method: paymentMethod,
    });

    req.flash("success", `Payment successful! ₹${booking.pricing.total.toLocaleString("en-IN")} paid via ${paymentMethod.toUpperCase()}. Reference: ${booking.code}`);
    res.redirect("/trips");
};
