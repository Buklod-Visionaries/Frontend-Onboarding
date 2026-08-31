import mongoose, { Mongoose } from "mongoose";

const requirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["document", "task"],
    required: true,
  },
  department: {
    type: String,
    enum: ["laboratory", "cardiovascular", "admin"],
    required: true,
  },
  deadlineDays: {
    type: Number,
    required: true,
  },
});

const Requirement = mongoose.model("Requirement", requirementSchema);

export default Requirement;
