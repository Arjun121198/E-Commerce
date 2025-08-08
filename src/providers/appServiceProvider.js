const mongoose = require('mongoose');
const RouteProvider = require('../providers/routeServiceProvider');


require('dotenv').config();

class AppServiceProvider {

    static async connectDatabase() {
        try {
            const uri = process.env.MONGO_DB_URI;
            if (!uri) {
                console.warn("MONGO_DB_URI not set. Skipping MongoDB connection.");
                return;
            }
            await mongoose.connect(uri);
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Database connection error", error);
            // Do not throw to allow server to boot without DB for local/dev
        }
    }

    static initializeProviders(app) {
        RouteProvider.registerRoutes(app);
        console.log("Initializing providers...");
    }
}

module.exports = AppServiceProvider;
