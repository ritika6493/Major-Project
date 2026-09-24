const Listing = require("../models/listing");

class ListingRepository {
    async findAll({ query = {}, sort = { createdAt: -1 }, skip = 0, limit = 50 } = {}) {
        return await Listing.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async count(query = {}) {
        return await Listing.countDocuments(query);
    }

    async findById(id) {
        return await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                    select: "username"
                }
            })
            .populate("owner", "username email");
    }

    async create(listingData) {
        const listing = new Listing(listingData);
        return await listing.save();
    }

    async updateById(id, updateData) {
        return await Listing.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deleteById(id) {
        return await Listing.findByIdAndDelete(id);
    }
}

module.exports = new ListingRepository();
