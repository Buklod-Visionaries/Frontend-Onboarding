import mongoose, { Mongoose } from "mongoose";

const requirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["document", "activity"],
    required: true,
  },
  activity: {
    type: String,
    enum: ["orientation", "dept-training", "team-intro"],
    required: function () {
      return this.type === "activity"; // only required for task requirements
    },
  },
  department: {
    type: String,
    enum: ["laboratory", "imaging", "cardiovascular", "administration"],
    required: true,
  },
  deadlineDays: {
    type: Number,
    default: 7,
    required: true,
  },
});

const Requirement = mongoose.model("Requirement", requirementSchema);

export default Requirement;
