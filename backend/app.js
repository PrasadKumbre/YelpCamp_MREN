if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const apiRoutes = require('./routes/api');
const session = require('express-session');
const port = process.env.PORT || 8080;
// Initialize express app
const app = express();

const mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL)
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON data
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

const store = MongoStore.create({
    mongoUrl: mongoURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

// Session configuration
const sessionConfig = {
    store,
    name: 'Session',
    secret: 'TheirShouldASecretKeyFromENVFill', // Use environment variable in production
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Expires in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7, // Max age is 7 days
    }
}

// Use session middleware
app.use(session(sessionConfig));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Use local strategy for Passport authentication
passport.use(new LocalStrategy(User.authenticate()));

// Configure Passport to serialize and deserialize users
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(helmet());
// Note: CSP is less critical for API-only but good to keep if we serve client later. 
// For now, simpler helmet defautls or previously configured CSP is fine.
// Keeping strictly API focused:

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong :(' } = err;
    res.status(statusCode).json({ success: false, error: message });
})

// 404 Not Found handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not Found' });
})

// Start the server
app.listen(port, () => {
    console.log(`Server is started on http://localhost:8080/`);
})