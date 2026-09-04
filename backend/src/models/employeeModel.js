import mongoose from "mongoose";
import User from "./userModel.js";

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: User,
  },
  position: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: ["laboratory", "cardiovascular", "admin"],
    required: true,
  },
  onboardingStatus: {
    type: String,
    enum: ["in_progress", "completed"],
    default: "in_progress",
    required: true,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
