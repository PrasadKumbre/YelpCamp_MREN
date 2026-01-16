const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in :(');
        return res.redirect('/login');
    }
    next();
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', "Can't Find that campground :(");
        return res.redirect('/campgrounds');
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to edit this campground :(");
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', "Can't Find that campground :(");
        return res.redirect('/campgrounds');
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to delete this review :(");
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
}
