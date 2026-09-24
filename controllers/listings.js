const listingService = require("../services/listingService");

module.exports.index = async (req, res) => {
    const { q, category, sort } = req.query;
    const { listings: allListings, total, activeCategory, searchQuery } = await listingService.getAllListings({
        q,
        category,
        sort,
    });
    res.render("listings/index.ejs", { allListings, total, activeCategory, searchQuery });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await listingService.getListingById(id);
    if (!listing) {
        req.flash("error", "Listing You Requested For Does Not Exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    await listingService.createListing({
        listingData: req.body.listing,
        file: req.file,
        userId: req.user._id,
    });
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await listingService.getListingById(id);
    if (!listing) {
        req.flash("error", "Listing You Requested For Does Not Exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image ? listing.image.url : "";
    if (originalImageUrl && originalImageUrl.includes("res.cloudinary.com") && originalImageUrl.includes("/upload")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    await listingService.updateListing({
        id,
        listingData: req.body.listing,
        file: req.file,
    });
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await listingService.deleteListing(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};