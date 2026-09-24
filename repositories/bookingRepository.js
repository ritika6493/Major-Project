const Booking = require("../models/booking");

class BookingRepository {
    async create(bookingData) {
        const booking = new Booking(bookingData);
        return await booking.save();
    }

    async findConflictingBooking({ listingId, checkIn, checkOut }) {
        return await Booking.findOne({
            listing: listingId,
            status: { $in: ["confirmed", "pending"] },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
        });
    }

    async findByGuestId(guestId) {
        return await Booking.find({ guest: guestId })
            .populate({
                path: "listing",
                select: "title location country image price category",
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    async findById(id) {
        return await Booking.findById(id)
            .populate("listing")
            .populate("guest", "username email")
            .populate("host", "username email");
    }

    async updateStatus(id, { status, cancelledBy, cancelReason }) {
        return await Booking.findByIdAndUpdate(
            id,
            { status, cancelledBy, cancelReason },
            { new: true }
        );
    }
}

module.exports = new BookingRepository();
