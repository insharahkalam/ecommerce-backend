// import Notifications from "../models/notifications.js"
// import pusher from "../services/pusher.service.js";

// export const createNotification = async ({ type, title, message, link, relatedId }) => {
//   try {
//     const notification = await Notifications.create({ type, title, message, link, relatedId });

//     await pusher.trigger("admin-notifications", "new-notification", notification);

//     return notification;
//   } catch (err) {
//     console.error("Notification create error:", err.message);
//   }
// };

import Notifications from "../models/notifications.js"
import pusher from "../services/pusher.service.js";

// notifyEnabled defaults to true so any existing caller that doesn't pass it
// keeps behaving exactly like before (toast still shows).
// It is NOT saved on the notification document — it's a transient flag only
// sent over pusher so the frontend knows whether to pop a toast.
// The notification itself is always created, so unread count always increments.
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