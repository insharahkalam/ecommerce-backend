import NotificationSettings from "../models/notificationSettings.js";

async function getOrCreateSettings() {
    let settings = await NotificationSettings.findOne();
    if (!settings) {
        settings = await NotificationSettings.create({});
    }
    return settings;
}

const getNotificationSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json({ settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateNotificationSettings = async (req, res) => {
    try {
        const { notifyOrders, notifyStock, notifySignups } = req.body;
        const settings = await getOrCreateSettings();

        if (notifyOrders !== undefined) settings.notifyOrders = notifyOrders;
        if (notifyStock !== undefined) settings.notifyStock = notifyStock;
        if (notifySignups !== undefined) settings.notifySignups = notifySignups;

        await settings.save();
        res.json({ settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export { getNotificationSettings, updateNotificationSettings };