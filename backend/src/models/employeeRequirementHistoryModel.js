import mongoose from "mongoose";

const employeeRequirementHistorySchema = new mongoose.Schema(
  {
    employeeRequirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeRequirement",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "in-progress",
        "completed",
        "resubmission-required",
      ],
      required: true,
    },
 changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "EmployeeRequirementHistory",
  employeeRequirementHistorySchema,
);
