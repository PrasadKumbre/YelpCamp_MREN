const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, isReviewAuthor } = require('../middleware/auth');
const { validateCampground } = require('../middleware/campground');
const { validateReview } = require('../middleware/review');
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const passport = require('passport');
const { cloudinary } = require('../cloudnary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const multer = require('multer');
const { storage } = require('../cloudnary');
const upload = multer({ storage });

// ========== CAMPGROUNDS API ==========

// GET /api/campgrounds - Get all campgrounds
router.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.json({ success: true, data: campgrounds });
}));

// GET /api/campgrounds/:id - Get single campground with reviews
router.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    
    if (!campground) {
        return res.status(404).json({ success: false, error: 'Campground not found' });
    }
    
    res.json({ success: true, data: campground });
}));

// POST /api/campgrounds - Create new campground
router.post('/campgrounds', isLoggedIn, upload.array('image'), validateCampground, catchAsync(async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    res.json({ success: true, data: campground, message: 'Successfully created a new campground!' });
}));

// PUT /api/campgrounds/:id - Update campground
router.put('/campgrounds/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        return res.status(404).json({ success: false, error: 'Campground not found' });
    }
    
    // Update basic fields
    campground.title = req.body.campground.title;
    campground.location = req.body.campground.location;
    campground.description = req.body.campground.description;
    campground.price = req.body.campground.price;
    
    // Update geometry if location changed
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    
    // Add new images if any
    if (req.files && req.files.length > 0) {
        const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...images);
    }
    
    // Delete images if specified
    if (req.body.deleteImages) {
        const deleteImagesArray = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
        for (let filename of deleteImagesArray) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: deleteImagesArray } } } });
    }
    
    await campground.save();
    
    // Populate author before sending
    await campground.populate('author');
    
    res.json({ success: true, data: campground, message: 'Successfully updated campground!' });
}));

// DELETE /api/campgrounds/:id - Delete campground
router.delete('/campgrounds/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Successfully deleted campground!' });
}));

// ========== REVIEWS API ==========

// POST /api/campgrounds/:id/reviews - Add review
router.post('/campgrounds/:id/reviews', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        return res.status(404).json({ success: false, error: 'Campground not found' });
    }
    
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    
    // Populate the review with author info before sending
    await review.populate('author');
    res.json({ success: true, data: review, message: 'Successfully added a new review!' });
}));

// DELETE /api/campgrounds/:id/reviews/:reviewId - Delete review
router.delete('/campgrounds/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ success: true, message: 'Successfully deleted review!' });
}));

// ========== AUTHENTICATION API ==========

// GET /api/user - Get current user
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ success: true, user: { _id: req.user._id, username: req.user.username, email: req.user.email } });
    } else {
        res.json({ success: false, user: null });
    }
});

// POST /api/register - Register new user
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body.user || req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        
        req.login(registerUser, err => {
            if (err) return next(err);
            res.json({ 
                success: true, 
                user: { _id: registerUser._id, username: registerUser.username, email: registerUser.email },
                message: 'Account created successfully!' 
            });
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}));

// POST /api/login - Login user
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ success: false, error: info?.message || 'Invalid username or password' });
        }
        req.login(user, (err) => {
            if (err) return next(err);
            res.json({ 
                success: true, 
                user: { _id: user._id, username: user.username, email: user.email },
                message: 'Welcome to YelpCamp!' 
            });
        });
    })(req, res, next);
});

// POST /api/logout - Logout user
router.post('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.json({ success: true, message: 'Goodbye!' });
    });
});

module.exports = router;
