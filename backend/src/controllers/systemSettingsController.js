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
    return res.send({
      message: "No deadline days or reminder days before provided.",
    });
  }
  //
  if (
    ![7, 10, 14].includes(deadlineDays) ||
    ![1, 3, 5].includes(reminderDaysBefore)
  ) {
    return res.status(400).json({
      message: "Invalid deadline or reminder setting.",
    });
  }

  const updatedSettings = await SystemSettings.findOneAndUpdate(
    {}, //since theres only one settings data
    {
      $set: {
        deadlineDays, //set new deadline days
        reminderDaysBefore, //set new  reminder days before
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
