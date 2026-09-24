const listingRepository = require("../repositories/listingRepository");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const config = require("../config/env");

const geocodingClient = config.mapbox.token
    ? mbxGeocoding({ accessToken: config.mapbox.token })
    : null;

class ListingService {
    async getAllListings({ q, category, sort } = {}) {
        const filter = {};

        if (q && q.trim()) {
            const searchRegex = new RegExp(q.trim(), "i");
            filter.$or = [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex },
                { description: searchRegex }
            ];
        }

        if (category && category !== "all") {
            filter.category = category.toLowerCase().trim();
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        if (sort === "price_desc") sortOption = { price: -1 };

        const listings = await listingRepository.findAll({
            query: filter,
            sort: sortOption,
            limit: 60
        });

        return {
            listings,
            total: listings.length,
            activeCategory: category || "",
            searchQuery: q || ""
        };
    }

    async getListingById(id) {
        return await listingRepository.findById(id);
    }

    async createListing({ listingData, file, userId }) {
        let coordinates = [77.4126, 23.2599]; // Bhopal default fallback

        if (geocodingClient && listingData.location) {
            try {
                const response = await geocodingClient
                    .forwardGeocode({
                        query: `${listingData.location}, ${listingData.country || ""}`,
                        limit: 1,
                    })
                    .send();

                if (response.body.features && response.body.features.length > 0) {
                    coordinates = response.body.features[0].geometry.coordinates;
                }
            } catch (err) {
                console.warn("Geocoding failed, using fallback coordinates:", err.message);
            }
        }

        const newListingData = {
            ...listingData,
            owner: userId,
            geometry: {
                type: "Point",
                coordinates,
            },
        };

        if (file) {
            newListingData.image = {
                url: file.path,
                filename: file.filename,
            };
        } else {
            newListingData.image = {
                url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
                filename: "defaultlistingimage",
            };
        }

        return await listingRepository.create(newListingData);
    }

    async updateListing({ id, listingData, file }) {
        const updatePayload = { ...listingData };

        if (file) {
            updatePayload.image = {
                url: file.path,
                filename: file.filename,
            };
        }

        return await listingRepository.updateById(id, updatePayload);
    }

    async deleteListing(id) {
        return await listingRepository.deleteById(id);
    }
}

module.exports = new ListingService();
