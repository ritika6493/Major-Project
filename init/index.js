require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const categories = [
    "trending",
    "rooms",
    "iconic-cities",
    "mountains",
    "castles",
    "pools",
    "camping",
    "farms",
    "arctic"
];

function inferCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes("mountain") || text.includes("cabin") || text.includes("aspen") || text.includes("chalet")) return "mountains";
    if (text.includes("castle") || text.includes("historic") || text.includes("palace") || text.includes("chateau")) return "castles";
    if (text.includes("pool") || text.includes("villa") || text.includes("beach")) return "pools";
    if (text.includes("camp") || text.includes("treehouse") || text.includes("glamping") || text.includes("tent")) return "camping";
    if (text.includes("farm") || text.includes("barn") || text.includes("ranch") || text.includes("countryside")) return "farms";
    if (text.includes("snow") || text.includes("arctic") || text.includes("ice") || text.includes("ski")) return "arctic";
    if (text.includes("city") || text.includes("loft") || text.includes("downtown") || text.includes("urban") || text.includes("tokyo") || text.includes("york")) return "iconic-cities";
    if (text.includes("room") || text.includes("suite") || text.includes("studio")) return "rooms";
    return "trending";
}

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Connected to DB for seeding");
        return initDB();
    })
    .then(() => {
        console.log("Database initialized successfully with rich enterprise categories!");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Error initializing DB:", err);
    });

const initDB = async () => {
    const User = require("../models/user.js");
    let ownerId = "6ab4db26c4822c9655829e0a";
    const existingUser = await User.findOne({});
    if (existingUser) {
        ownerId = existingUser._id;
    }

    const count = await Listing.countDocuments();
    if (count <= 2) {
        await Listing.deleteMany({});
    }

    const seedData = initData.data.map((obj, index) => {
        const category = inferCategory(obj.title || "", obj.description || "") || categories[index % categories.length];
        return {
            ...obj,
            category,
            avgRating: 4.5 + ((index % 5) * 0.1),
            reviewCount: 8 + (index * 3),
            propertyType: obj.propertyType || (index % 2 === 0 ? "House" : "Villa"),
            capacity: {
                guests: 2 + (index % 4),
                bedrooms: 1 + (index % 3),
                beds: 1 + (index % 3),
                bathrooms: 1 + (index % 2)
            },
            amenities: ["Wifi", "Free parking", "Air conditioning", "Kitchen", "Dedicated workspace"],
            owner: ownerId,
            geometry: obj.geometry || {
                type: "Point",
                coordinates: [77.4126 + (index * 0.05), 23.2599 + (index * 0.03)]
            }
        };
    });

    await Listing.insertMany(seedData);
};
