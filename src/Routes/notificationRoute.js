const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware.js");
const { getNotifications, markNotifications } = require("../Controller/notificationController.js");

const router = express.Router();

router.get("/get/:id", authMiddleware, getNotifications);
router.put("/:id", authMiddleware, markNotifications);

module.exports = router;
