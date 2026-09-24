const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        code: {
            type: String,
            unique: true,
            required: true,
        },
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        nights: {
            type: Number,
            required: true,
            min: [1, "Stay must be at least 1 night"],
        },
        guestsCount: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
        pricing: {
            nightlyRate: { type: Number, required: true },
            totalNightsPrice: { type: Number, required: true },
            cleaningFee: { type: Number, default: 500 },
            serviceFee: { type: Number, default: 300 },
            taxes: { type: Number, required: true },
            total: { type: Number, required: true },
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "confirmed",
        },
        cancelledBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        cancelReason: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Indexes for conflict checks and user dashboards
bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, createdAt: -1 });
bookingSchema.index({ host: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
