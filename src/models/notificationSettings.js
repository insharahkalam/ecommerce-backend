import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
    {
        notifyOrders: { type: Boolean, default: true },
        notifyStock: { type: Boolean, default: true },
        notifySignups: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("NotificationSettings", notificationSettingsSchema);