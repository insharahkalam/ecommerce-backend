import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    brand: {
        type: String,
    },

    stock: {
        type: Number,
        default: 0,
    },

    image: {
        type: String,
        required: true,
    },

    public_id: String,

    // Dynamic Features
    specifications: {
        type: Map,
        of: String,
    },

    featured: {
        type: Boolean,
        default: false,
    }
},
    { timestamps: true }
);

const products = mongoose.model("products", productSchema)
export default products