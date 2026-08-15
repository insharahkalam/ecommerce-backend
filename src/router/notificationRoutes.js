import express from "express";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../controllers/notifications.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", getNotifications);
notificationRouter.get("/unread-count", getUnreadCount);
notificationRouter.patch("/read-all", markAllAsRead);
notificationRouter.patch("/:id/read", markAsRead);

export default notificationRouter;