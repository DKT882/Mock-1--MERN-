import mongoose from "mongoose";

async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not set. Add it to backend/.env.')
        }
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB connected.')
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

export default connectDB;