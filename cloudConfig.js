const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('./config/env.js');

const isCloudinaryConfigured = Boolean(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret &&
    config.cloudinary.cloudName.trim() !== '' &&
    config.cloudinary.cloudName !== 'your_cloud_name'
);

let storage;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: config.env === 'production' ? 'wanderlust_PROD' : 'wanderlust_DEV',
            allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
        },
    });
} else {
    // Local disk storage fallback for development / offline use
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname) || '.jpg';
            cb(null, `${uniqueSuffix}${ext}`);
        },
    });
}

module.exports = {
    cloudinary,
    storage,
    isCloudinaryConfigured,
};