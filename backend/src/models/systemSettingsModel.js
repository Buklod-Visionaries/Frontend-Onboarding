import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    deadlineDays: {
      type: Number,
      default: 7,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true },
);

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
