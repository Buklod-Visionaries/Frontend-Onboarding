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
  const notif = await Notification.find().populate(
    "user",
    "username email _id", //only show these fields from users
  );

  if (!notif) {
    return res.status(404).send({ message: "No notifications" });
  }

  res.send(notif);
}

export async function readAllOwnNotifications(req, res) {
  const { id } = req.user;

  const readNotifs = await Notification.updateMany(
    {
      user: id, //all notif of user
      isRead: false, // all unreads
    },
    {
      $set: {
        isRead: true, //set to read
      },
    },
  );

  res.send(readNotifs);
}

export async function deleteAllOwnNotifications(req, res) {
  const { id } = req.user;

  const deletedNotifs = await Notification.deleteMany({ user: id });

  res.send({
    message: "Successfully deleted all notifs",
    deletedNotifs: deletedNotifs,
  });
}

export async function getAllOwnNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user.id })
    .populate(
      "user",
      "username email _id", //only show these fields from users
    )
    .sort({
      createdAt: -1,
    });
  res.send(notifications);
}

export async function getNotificationById(req, res) {
  const notification = await Notification.findById(req.params.id).populate(
    "user",
    "username email _id", //only show these fields from users
  );

  if (!notification) {
    return res.status(404).send({ message: "Notification not found" });
  }

  res.send(notification);
}

export async function updateNotification(req, res) {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  res.send(notification);
}

export async function deleteNotification(req, res) {
  await Notification.findByIdAndDelete(req.params.id);
  res.send({ message: "Notification deleted successfully" });
}
