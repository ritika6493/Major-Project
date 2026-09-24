const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage, isCloudinaryConfigured } = require("../cloudConfig.js");
const logger = require("../config/logger.js");

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const handleListingUpload = (req, res, next) => {
    upload.single("listing[image]")(req, res, (err) => {
        if (err) {
            logger.warn({ err: err.message, code: err.code }, "File upload warning");
            if (err.code === "LIMIT_FILE_SIZE") {
                req.flash("error", "Image file too large! Maximum allowed size is 15MB.");
                return res.redirect(req.originalUrl.includes("edit") ? req.originalUrl : "/listings/new");
            }
            req.flash("error", `Image upload notice: ${err.message || "Failed to process photo"}. Listing saved with default image.`);
            req.file = null;
            return next();
        }

        if (req.file) {
            if (!isCloudinaryConfigured || (!req.file.path.startsWith("http://") && !req.file.path.startsWith("https://"))) {
                req.file.path = `/uploads/${req.file.filename}`;
            }
        }
        next();
    });
};
 
const listingController = require("../controllers/listings.js");

router
.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    handleListingUpload,
    validateListing, 
    wrapAsync(listingController.createListing));
//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing))
  .put(
    isLoggedIn,
    isOwner,
    handleListingUpload,
    validateListing,
    wrapAsync(listingController.updateListing));

// EDIT ROUTE
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));

 module.exports = router;