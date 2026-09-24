const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.dashboard = async (req, res) => {
    const myListings = await Listing.find({ owner: req.user._id }).lean();
    const listingIds = myListings.map((l) => l._id);

    const reservations = await Booking.find({ host: req.user._id })
        .populate("listing", "title location country image price")
        .populate("guest", "username email phone")
        .sort({ createdAt: -1 })
        .lean();

    // Financial & Performance Metrics
    const confirmedReservations = reservations.filter((r) => r.status === "confirmed");
    const totalEarnings = confirmedReservations.reduce((sum, r) => sum + (r.pricing?.total || 0), 0);
    const totalNightsBooked = confirmedReservations.reduce((sum, r) => sum + (r.nights || 0), 0);

    const ratingsCount = myListings.filter((l) => l.reviewCount > 0);
    const avgHostRating =
        ratingsCount.length > 0
            ? (ratingsCount.reduce((sum, l) => sum + (l.avgRating || 0), 0) / ratingsCount.length).toFixed(1)
            : "New";

    res.render("host/dashboard.ejs", {
        myListings,
        reservations,
        totalEarnings,
        totalNightsBooked,
        avgHostRating,
    });
};
