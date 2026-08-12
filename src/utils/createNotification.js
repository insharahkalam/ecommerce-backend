import Notification from "../models/Notification.js";
import pusher from "../services/pusher.service.js";

export const createNotification = async ({ type, title, message, link, relatedId }) => {
  try {
    const notification = await Notification.create({ type, title, message, link, relatedId });

    await pusher.trigger("admin-notifications", "new-notification", notification);

    return notification;
  } catch (err) {
    console.error("Notification create error:", err.message);
  }
};