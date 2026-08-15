import express from "express";
import { getNotificationSettings, updateNotificationSettings } from "../controllers/notificationsettings.controller.js";

const settingRouter = express.Router();

settingRouter.get("/", getNotificationSettings);
settingRouter.patch("/", updateNotificationSettings);

export default settingRouter;