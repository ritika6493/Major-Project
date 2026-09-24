const Joi = require("joi");
require("dotenv").config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
    PORT: Joi.number().default(8080),
    ATLASDB_URL: Joi.string().default("mongodb://127.0.0.1:27017/wanderlust"),
    SECRET: Joi.string().default("wanderlust-super-secret-key-change-in-production"),
    CLOUD_NAME: Joi.string().allow("").default(""),
    CLOUD_API_KEY: Joi.string().allow("").default(""),
    CLOUD_API_SECRET: Joi.string().allow("").default(""),
    MAP_TOKEN: Joi.string().allow("").default(""),
}).unknown(); // Allow other standard env vars

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    dbUrl: envVars.ATLASDB_URL,
    secret: envVars.SECRET,
    cloudinary: {
        cloudName: envVars.CLOUD_NAME,
        apiKey: envVars.CLOUD_API_KEY,
        apiSecret: envVars.CLOUD_API_SECRET,
    },
    mapbox: {
        token: envVars.MAP_TOKEN,
    },
};
