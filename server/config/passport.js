require("dotenv").config(); // Ensure environment variables are loaded first
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const authController = require("../controllers/authController");

// Debugging - Log environment variables (remove in production)
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL);

// Ensure required environment variables exist
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    console.error("❌ Missing Google OAuth environment variables!");
    process.exit(1); // Stop execution if variables are missing
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        userType: "user",
                    });
                    await user.save();
                } else if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }

                const token = authController.generateToken(user);
                user.token = token;

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user (retrieve user by ID from database)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error("❌ Error deserializing user:", error);
        done(error, null);
    }
});

module.exports = passport;
