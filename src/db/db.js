import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB is connected successfully!");
    } catch (error) {
        console.log("Error in connecting database", error);
    }
}

export default connectDB