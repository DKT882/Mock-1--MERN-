import mongoose from "mongoose";

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connection successfullt")
    }catch(error){
        console.error("MongoDB connection faild:", error.message)
        process.exit()
    }
}

export default connectDB;