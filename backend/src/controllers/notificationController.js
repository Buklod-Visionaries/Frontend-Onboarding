import Notification from "../models/notificationModel.js";

export async function createNotification(req, res) {
  const { user, title, message } = req.body;

  //check if the message is from the send reminder button
  if (title === "Onboarding Requirements Reminder") {
    //add cutoff date
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    //check if reminder is recent <24 hours
    const recentReminder = await Notification.findOne({
      user,
      title: "Onboarding Requirements Reminder",
      createdAt: { $gte: cutoff },
    }).sort({ createdAt: -1 });

    //set availability for the notification again after 24 hours
    if (recentReminder) {
      const availableAt = new Date(
        recentReminder.createdAt.getTime() + 24 * 60 * 60 * 1000,
      );

      return res.status(429).send({
        message: "A reminder can only be sent once every 24 hours.",
        availableAt,
      });
    }
  }

  const newNotification = new Notification({
    user,
    title,
    message,
  });

  if (!newNotification) {
    return res.status(404).send({ message: "No notification created" });
  }

  await newNotification.save();
  res.status(201).send(newNotification);
}

export async function getReminderStatus(req, res) {
  try {
    const { id } = req.params;

    const recentReminder = await Notification.findOne({
      user: id,
      title: "Onboarding Requirements Reminder",
    }).sort({ createdAt: -1 });

    if (!recentReminder) {
      return res.status(200).send({
        canSend: true,
        availableAt: null,
      });
    }

    const availableAt = new Date(
      recentReminder.createdAt.getTime() + 24 * 60 * 60 * 1000,
    );

    return res.status(200).send({
      canSend: Date.now() >= availableAt.getTime(),
      availableAt: Date.now() >= availableAt.getTime() ? null : availableAt,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Failed to check reminder status.",
    });
  }
}

export async function getAllNotifications(req, res) {
  const { limit } = req.query;

  //if theres a limit query
  const notifLimit = parseInt(limit) || 0;

  const notif = await Notification.find()
    .populate(
      "user",
      "username email _id", //only show these fields from users
    )
    .limit(notifLimit);

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

export async function readNotificationById(req, res) {
  const { id: userId } = req.user;
  const { id: notifId } = req.params;

  const readNotif = await Notification.findOneAndUpdate(
    { _id: notifId, user: userId },
    {
      $set: {
        isRead: true,
      },
    },
    { new: true }, //return new document
  );

  if (!readNotif) {
    return res
      .status(404)
      .send({ message: "No notification exist with return id" });
  }

  res.send(readNotif);
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
  const { limit } = req.query;

  //if theres a limit query
  const notifLimit = parseInt(limit) || 0;

  const notifications = await Notification.find({ user: req.user.id })
    .populate(
      "user",
      "username email _id", //only show these fields from users
    )
    .sort({
      createdAt: -1,
    })
    .limit(notifLimit);

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
