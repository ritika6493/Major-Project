const reviewService = require("../services/reviewService");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    await reviewService.createReview({
        listingId: id,
        reviewData: req.body.review,
        user: req.user,
    });

    req.flash("success", "New review published successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await reviewService.destroyReview({
        listingId: id,
        reviewId,
    });

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
};