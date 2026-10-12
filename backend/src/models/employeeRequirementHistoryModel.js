import mongoose from "mongoose";
import User from "./userModel.js";
import EmployeeRequirement from "./employeeRequirement.js";

const employeeRequirementHistorySchema = new mongoose.Schema(
  {
    employeeRequirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: EmployeeRequirement,
      required: true,
    },

    status: {
      type: String,
      enum: ["in-progress", "pending", "completed", "resubmission-required"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
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

const EmployeeRequirementHistory = mongoose.model(
  "EmployeeRequirementHistory",
  employeeRequirementHistorySchema,
);

export default EmployeeRequirementHistory;
