const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const config = require("./config/env.js");
const { logger, httpLogger } = require("./config/logger.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const hostRouter = require("./routes/host.js");
const adminRouter = require("./routes/admin.js");
const paymentRouter = require("./routes/payment.js");

// Trust proxy for platforms behind reverse proxies like Render
app.set("trust proxy", 1);

// Structured HTTP logging
app.use(httpLogger);

async function main() {
    await mongoose.connect(config.dbUrl);
}

main()
    .then(() => {
        logger.info("Connected to MongoDB successfully");
        const server = app.listen(config.port, () => {
            logger.info(`Server is listening on port ${config.port} in ${config.env} mode`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal) => {
            logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                await mongoose.connection.close();
                logger.info("Database connection closed. Exiting process.");
                process.exit(0);
            });
        };

        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    })
    .catch((err) => {
        logger.error({ err }, "MongoDB connection error");
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Security Headers & Sanitization (Express 5 compatible)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

app.use(hpp());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: config.dbUrl,
    crypto: {
        secret: config.secret,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    logger.error({ err }, "Error in Mongo session store");
});

const sessionOptions = {
    store,
    name: "wl.sid",
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: config.env === "production",
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Authentication (Passport)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: "Too many authentication requests from this IP, please try again after 15 minutes.",
});
app.use("/login", authLimiter);
app.use("/signup", authLimiter);

// Global flash & user context
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// Health check endpoint (Liveness)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Readiness check endpoint (Checks DB connectivity)
app.get("/ready", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
        return res.status(200).json({ status: "ready", database: "connected" });
    }
    return res.status(503).json({ status: "not ready", database: "disconnected" });
});

// App Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/host", hostRouter);
app.use("/admin", adminRouter);
app.use("/", paymentRouter);
app.use("/", bookingRouter);
app.use("/", userRouter);

// 404 Route handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Central Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    if (statusCode >= 500) {
        logger.error({ err, path: req.path }, "Internal Server Error");
    }
    res.locals.currUser = req.user || null;
    res.status(statusCode).render("error.ejs", { message });
});