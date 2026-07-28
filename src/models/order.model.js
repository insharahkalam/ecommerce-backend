import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },

    items: { type: [orderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },

    totalAmount: { type: Number, required: true },

    paymentMethod: {
        type: String,
        enum: ["COD", "Bank Transfer"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: function () {
            // COD is only "Paid" once delivered; Bank Transfer starts Pending until admin verifies the slip/reference
            return "Pending";
        }
    },

    // Only relevant when paymentMethod === "Bank Transfer"
    bankTransferDetails: {
        bankName: { type: String },
        accountTitle: { type: String },
        transactionId: { type: String },
        receiptImage: { type: String } // uploaded slip/screenshot URL, optional
    },

    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
    },

    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true }
    }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);