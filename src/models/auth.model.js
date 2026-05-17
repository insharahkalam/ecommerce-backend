import mongoose from "mongoose";

const authSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 4,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
},
    { timestamps: true })

const User = mongoose.model("users", authSchema)
export default User