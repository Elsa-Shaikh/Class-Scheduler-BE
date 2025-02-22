const Notification = require("../Model/notificationModel.js");

const getNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
    const totalCount = await Notification.countDocuments({ user: userId });
    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
    const readCount = await Notification.countDocuments({
      user: userId,
      isRead: true,
    });
    return res.json({
      totalCount,
      unreadCount,
      readCount,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

const markNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return res.json({ message: "Notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

module.exports = { getNotifications, markNotifications };
