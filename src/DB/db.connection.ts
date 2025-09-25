import mongoose from "mongoose";

export async function dbConnection() {
    try {
        await mongoose.connect(process.env.DB_URL_LOCAL as string);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}