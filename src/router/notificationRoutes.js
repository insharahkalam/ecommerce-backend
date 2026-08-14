import express from "express";
import Notification from "../models/notifications.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification.countDocuments({ isRead: false });
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch("/:id/read", async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch("/read-all", async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/unread-count", async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({ isRead: false });
        res.json({ unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;