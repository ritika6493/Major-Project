const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signUp));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.Login
    );

router
    .route("/logout")
    .get(userController.Logout)
    .post(userController.Logout);

// Profile routes
router
    .route("/profile")
    .get(isLoggedIn, wrapAsync(userController.viewProfile))
    .post(isLoggedIn, wrapAsync(userController.updateProfile));

// Wishlist routes
router.get("/wishlist", isLoggedIn, wrapAsync(userController.viewWishlist));
router.post("/listings/:id/wishlist", isLoggedIn, wrapAsync(userController.toggleWishlist));

// Legal / Information Pages
router.get("/privacy", (req, res) => res.render("pages/privacy.ejs"));
router.get("/terms", (req, res) => res.render("pages/terms.ejs"));

module.exports = router;