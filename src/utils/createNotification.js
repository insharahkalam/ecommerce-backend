import Notifications from "../models/notifications.js"
import pusher from "../services/pusher.service.js";

export const createNotification = async ({ type, title, message, link, relatedId, notifyEnabled = true }) => {
  try {
    const notification = await Notifications.create({ type, title, message, link, relatedId });

    console.log("DEBUG notifyEnabled value being sent:", notifyEnabled); // TEMP

    await pusher.trigger("admin-notifications", "new-notification", {
      ...notification.toObject(),
      notifyEnabled,
    });

    return notification;
  } catch (err) {
    console.error("Notification create error:", err.message);
  }
};