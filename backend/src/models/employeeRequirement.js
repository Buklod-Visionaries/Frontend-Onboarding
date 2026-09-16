import mongoose from "mongoose";
import Employee from "./employeeModel.js";
import Requirement from "./requirementModel.js";
import User from "./userModel.js";

const employeeRequirementSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.ObjectId,
      ref: Employee,
      required: true,
    },
    requirement: {
      type: mongoose.Schema.ObjectId,
      ref: Requirement,
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "pending", "completed", "resubmission-required"],
      default: "in-progress",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: User,
    },
    verifiedAt: {
      type: Date,
    },
    resubmissionReason: {
      type: String,
    },
  },
  { timestamps: true },
);

const EmployeeRequirement = mongoose.model(
  "EmployeeRequirement",
  employeeRequirementSchema,
);

export default EmployeeRequirement;
