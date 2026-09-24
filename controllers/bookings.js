const bookingService = require("../services/bookingService");

module.exports.createBooking = async (req, res) => {
    const { id: listingId } = req.params;
    const { checkIn, checkOut, guestsCount } = req.body.booking;

    const booking = await bookingService.createBooking({
        listingId,
        guestId: req.user._id,
        checkIn,
        checkOut,
        guestsCount,
    });

    req.flash("success", `Reservation confirmed! Booking Reference: ${booking.code}`);
    res.redirect("/trips");
};

module.exports.myTrips = async (req, res) => {
    const bookings = await bookingService.getGuestTrips(req.user._id);
    res.render("users/trips.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    await bookingService.cancelBooking({
        bookingId: id,
        userId: req.user._id,
        reason,
    });

    req.flash("success", "Reservation has been cancelled.");
    res.redirect("/trips");
};
