// ✅ Load env always (Render also uses env vars)
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");

const User = require("./models/user");
const apiRoutes = require("./routes/api");

const port = process.env.PORT || 8080;
const app = express();

// ✅ Required for Render / proxies (VERY IMPORTANT)
app.set("trust proxy", 1);

// ✅ Mongo URL from env
const mongoURL = process.env.MONGO_URL;

// ✅ connect MongoDB
mongoose
    .connect(mongoURL)
    .then(() => console.log("✅ Connected to MongoDB!"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ CORS configuration (IMPORTANT)
const allowedOrigins = [
    process.env.FRONTEND_URL,     // render frontend URL
    "http://localhost:5173",      // local dev Vite
    "http://localhost:3000",      // local dev React
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like Postman)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("❌ Not allowed by CORS: " + origin));
            }
        },
        credentials: true,
    })
);

// ✅ Session Store
const store = MongoStore.create({
    mongoUrl: mongoURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.STORE_SECRET || "storeSecretFallback",
    },
});

store.on("error", function (e) {
    console.log("❌ Session store error:", e);
});

// ✅ Session configuration
const sessionConfig = {
    store,
    name: "session",
    secret: process.env.SECRET || "secretFallback",
    resave: false,
    saveUninitialized: false, // ✅ IMPORTANT (change from true)
    cookie: {
        httpOnly: true,

        // ✅ Render uses HTTPS → secure must be true in production
        secure: process.env.NODE_ENV === "production",

        // ✅ Cross-site cookie for separate frontend/backend domains
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));

// ✅ Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Helmet
app.use(helmet());

// ✅ API routes
app.use("/api", apiRoutes);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err);
    const { statusCode = 500, message = "Something went wrong :(" } = err;
    res.status(statusCode).json({ success: false, error: message });
});

// ✅ 404 Not Found handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Not Found" });
});

// ✅ Start server
app.listen(port, () => {
    console.log(`✅ Server started on port ${port}`);
});
