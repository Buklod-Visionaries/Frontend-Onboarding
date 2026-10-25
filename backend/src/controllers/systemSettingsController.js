import SystemSettings from "../models/systemSettingsModel.js";

export async function getSystemSettings(req, res) {
  //
  let settings = await SystemSettings.findOne({});
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  //
  res.status(200).send(settings);
}

export async function updateSystemSettings(req, res) {
  const { deadlineDays, reminderDaysBefore } = req.body;

  if (!deadlineDays || !reminderDaysBefore) {
    return res.status(400).send({
      message: "No deadline days or reminder days before provided.",
    });
  }
  //
  // Ensure inputs are whole numbers (integers)
  const deadline = parseInt(deadlineDays, 10);
  const reminder = parseInt(reminderDaysBefore, 10);

  if (
    isNaN(deadline) ||
    deadline < 1 ||
    deadline > 90 ||
    isNaN(reminder) ||
    reminder < 1 ||
    reminder > 30 ||
    reminder >= deadline // 💡 Logic check: Reminder must happen BEFORE the deadline!
  ) {
    return res.status(400).json({
      message: `Deadline must be 1–90 days. Reminder must be 1–30 days and earlier than the deadline.`,
    });
  }

  const updatedSettings = await SystemSettings.findOneAndUpdate(
    {}, //since theres only one settings data
    {
      $set: {
        deadlineDays: deadline, //set new deadline days
        reminderDaysBefore: reminder, //set new  reminder days before
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  res.send(updatedSettings);
}
