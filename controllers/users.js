const User = require("../models/user");
const Listing = require("../models/listing");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.Login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.Logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out now!");
        res.redirect("/listings");
    });
};

module.exports.viewProfile = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    const myListings = await Listing.find({ owner: req.user._id });
    res.render("users/profile.ejs", { user, myListings });
};

module.exports.updateProfile = async (req, res) => {
    const { bio, phone } = req.body;
    await User.findByIdAndUpdate(req.user._id, { bio, phone });
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
};

module.exports.toggleWishlist = async (req, res) => {
    const { id: listingId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(listingId);
    let inWishlist = false;

    if (index === -1) {
        user.wishlist.push(listingId);
        inWishlist = true;
        req.flash("success", "Added to your wishlist!");
    } else {
        user.wishlist.splice(index, 1);
        inWishlist = false;
        req.flash("success", "Removed from your wishlist!");
    }

    await user.save();

    if (req.xhr || req.headers.accept?.includes("json")) {
        return res.json({ success: true, inWishlist });
    }

    res.redirect(req.get("referer") || "/listings");
};

module.exports.viewWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("users/wishlist.ejs", { wishlist: user.wishlist || [] });
};