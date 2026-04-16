const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
 
const listingController = require("../controllers/listings.js")

router
.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing, 
    upload.single("listing[image]"), 
    wrapAsync (listingController.createListing));
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
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing));

// EDIT ROUTE
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));

 module.exports = router;