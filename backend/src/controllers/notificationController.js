import Notification from "../models/notificationModel.js";

export async function createNotification(req, res) {
  const { user, title, message } = req.body;
  
  const newNotification = new Notification({
    user,
    title,
    message,
  });
  
  await newNotification.save();
  res.status(201).send(newNotification);
}

export async function getAllNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.send(notifications);
}

export async function getNotificationById(req, res) {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).send({ message: "Notification not found" });
  }
  
  res.send(notification);
}

export async function updateNotification(req, res) {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  res.send(notification);
}

export async function deleteNotification(req, res) {
  await Notification.findByIdAndDelete(req.params.id);
  res.send({ message: "Notification deleted successfully" });
}