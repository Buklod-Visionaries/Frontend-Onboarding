import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    deadlineDays: {
      type: Number,
      enum: [7, 10, 14],
      default: 7,
    },
    reminderDaysBefore: {
      type: Number,
      enum: [1, 3, 5],
      default: 3,
    },
  },
  { timestamps: true },
);

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
