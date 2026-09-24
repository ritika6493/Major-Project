const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().min(3).max(120).required(),
        description: Joi.string().trim().min(10).required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().min(0).required(),
        image: Joi.allow("", null),
        category: Joi.string()
            .valid(
                "trending",
                "rooms",
                "iconic-cities",
                "mountains",
                "castles",
                "pools",
                "camping",
                "farms",
                "arctic"
            )
            .default("trending"),
        propertyType: Joi.string()
            .valid("House", "Apartment", "Villa", "Cabin", "Hotel", "Cottage", "Other")
            .default("House"),
        capacity: Joi.object({
            guests: Joi.number().min(1).default(2),
            bedrooms: Joi.number().min(0).default(1),
            beds: Joi.number().min(1).default(1),
            bathrooms: Joi.number().min(0).default(1),
        }).optional(),
        amenities: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).optional(),
        geometry: Joi.object({
            type: Joi.string().valid("Point"),
            coordinates: Joi.array().items(Joi.number())
        }).optional()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().trim().min(3).required()
    }).required()
});