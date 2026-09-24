const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            url: {
                type: String,
                default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
            },
            filename: {
                type: String,
                default: "defaultlistingimage",
            },
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price must be positive"],
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "trending",
                "rooms",
                "iconic-cities",
                "mountains",
                "castles",
                "pools",
                "camping",
                "farms",
                "arctic",
            ],
            default: "trending",
            lowercase: true,
        },
        propertyType: {
            type: String,
            enum: ["House", "Apartment", "Villa", "Cabin", "Hotel", "Cottage", "Other"],
            default: "House",
        },
        capacity: {
            guests: { type: Number, default: 2, min: 1 },
            bedrooms: { type: Number, default: 1, min: 0 },
            beds: { type: Number, default: 1, min: 1 },
            bathrooms: { type: Number, default: 1, min: 0 },
        },
        amenities: {
            type: [String],
            default: ["Wifi", "Free parking", "Air conditioning"],
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        avgRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: true,
                default: [77.4126, 23.2599], // Default fallback coordinates
            },
        },
    },
    { timestamps: true }
);

// Indexes for high performance searches and geo queries
listingSchema.index({ geometry: "2dsphere" });
listingSchema.index({ title: "text", description: "text", location: "text", country: "text" });
listingSchema.index({ category: 1, price: 1 });
listingSchema.index({ owner: 1 });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;