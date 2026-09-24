const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");
const ExpressError = require("../utils/ExpressError");

class ReviewService {
    async createReview({ listingId, reviewData, user }) {
        const listing = await Listing.findById(listingId);
        if (!listing) {
            throw new ExpressError(404, "Listing not found.");
        }

        // Host cannot review their own listing
        if (listing.owner.equals(user._id)) {
            throw new ExpressError(400, "Hosts cannot leave reviews on their own properties.");
        }

        // Check if user has a verified stay (booking)
        const hasBooking = await Booking.exists({
            listing: listingId,
            guest: user._id,
            status: { $in: ["confirmed", "completed"] },
        });

        const newReview = new Review({
            ...reviewData,
            author: user._id,
            isVerifiedStay: Boolean(hasBooking),
        });

        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();

        // Recalculate average rating & review count on listing
        await this.recalculateRatings(listingId);

        return newReview;
    }

    async destroyReview({ listingId, reviewId }) {
        await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        // Recalculate average rating & review count on listing
        await this.recalculateRatings(listingId);
    }

    async recalculateRatings(listingId) {
        const listing = await Listing.findById(listingId).populate("reviews");
        if (listing) {
            const reviews = listing.reviews || [];
            const count = reviews.length;
            const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            listing.reviewCount = count;
            listing.avgRating = count > 0 ? Number((sum / count).toFixed(2)) : 0;
            await listing.save();
        }
    }
}

module.exports = new ReviewService();
