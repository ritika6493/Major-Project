const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema } = require("./schema.js");
const { reviewSchema} = require("./schema.js");
const Review = require("./models/review");


module.exports.isLoggedIn = (req,res,next) => {
   
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!")
        return res.redirect("/login")
    }next();
}
// passport ke andr automatically jaise hi app /login krte ho ,
// jaise hi passport ne authenticate kr diya waise hi passport by delault 
// request.session ko reset kr dega yani if humare middleware ne koi extra info save  karai hogi 
// toh ye jo redirecturl hai v\usko humare store karaya hoga 
// to user ke loohin krte hi voh delete ho jayega isliye hm 
// redirecturl ki value ko hum apne locals ke andr save kkr lenge 
// or locals ese varriable hai jo hr jagah accessible hote hai humare passport ke pass access ni hai locals ko 
// delete kkrne ka isliye hm ek or middleware create krenge
module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next()
}
// let {id} = req.params;
//     let listing = await Listing.findById(id);
//     if(!listing.owner._id.equals(res.locals.currUser._id)){
//         req.flash("error","You don't have permission to edit")
//         return res.redirect(`/listings/${id}`)
//     } kyunki is pure code ko humko baar likhna padega isliye hm middleware use krenge
module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing")
        return res.redirect(`/listings/${id}`)
        }
    next();
}

module.exports.validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg)
    }else{
        next();
    }
}

module.exports.validateReview = (req,res,next) => {
        let { error } = reviewSchema.validate(req.body);
        if(error) {
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400,errMsg)
        }else{
            next();
        }
}
module.exports.isReviewAuthor = async (req,res,next) => {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review")
        return res.redirect(`/listings/${id}`)
        }
    next();
}