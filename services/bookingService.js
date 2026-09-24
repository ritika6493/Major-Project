const bookingRepository = require("../repositories/bookingRepository");
const listingRepository = require("../repositories/listingRepository");
const ExpressError = require("../utils/ExpressError");

class BookingService {
    calculatePricing({ nightlyRate, checkInDate, checkOutDate }) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const diffTime = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            throw new ExpressError(400, "Checkout date must be after check-in date.");
        }

        const totalNightsPrice = nights * nightlyRate;
        const cleaningFee = 500;
        const serviceFee = 300;
        const taxes = Math.round((totalNightsPrice + cleaningFee + serviceFee) * 0.18); // 18% GST
        const total = totalNightsPrice + cleaningFee + serviceFee + taxes;

        return {
            nights,
            nightlyRate,
            totalNightsPrice,
            cleaningFee,
            serviceFee,
            taxes,
            total,
        };
    }

    async createBooking({ listingId, guestId, checkIn, checkOut, guestsCount = 1 }) {
        const listing = await listingRepository.findById(listingId);
        if (!listing) {
            throw new ExpressError(404, "Listing not found.");
        }

        if (listing.owner._id.equals(guestId)) {
            throw new ExpressError(400, "You cannot book your own listing.");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            throw new ExpressError(400, "Check-in date cannot be in the past.");
        }

        // Conflict check for double-booking protection
        const conflict = await bookingRepository.findConflictingBooking({
            listingId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
        });

        if (conflict) {
            throw new ExpressError(409, "Selected dates are no longer available for this property.");
        }

        const pricing = this.calculatePricing({
            nightlyRate: listing.price,
            checkInDate,
            checkOutDate,
        });

        const randomCode = `WL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const booking = await bookingRepository.create({
            code: randomCode,
            listing: listing._id,
            guest: guestId,
            host: listing.owner._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights: pricing.nights,
            guestsCount: Number(guestsCount) || 1,
            pricing,
            status: "confirmed",
        });

        return booking;
    }

    async getGuestTrips(guestId) {
        return await bookingRepository.findByGuestId(guestId);
    }

    async cancelBooking({ bookingId, userId, reason = "Cancelled by user" }) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) {
            throw new ExpressError(404, "Booking not found.");
        }

        if (!booking.guest._id.equals(userId) && !booking.host._id.equals(userId)) {
            throw new ExpressError(403, "You do not have permission to cancel this booking.");
        }

        return await bookingRepository.updateStatus(bookingId, {
            status: "cancelled",
            cancelledBy: userId,
            cancelReason: reason,
        });
    }
}

module.exports = new BookingService();
