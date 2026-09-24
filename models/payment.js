const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
    {
        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        provider: {
            type: String,
            enum: ["razorpay", "stripe", "mock_gateway"],
            default: "razorpay",
        },
        providerPaymentId: {
            type: String,
            required: true,
        },
        providerOrderId: {
            type: String,
        },
        status: {
            type: String,
            enum: ["created", "authorized", "captured", "failed", "refunded"],
            default: "captured",
        },
        method: {
            type: String,
            enum: ["upi", "card", "netbanking", "wallet"],
            default: "card",
        },
    },
    { timestamps: true }
);

paymentSchema.index({ booking: 1, user: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
