import mongoose from "mongoose";
import Employee from "./employeeModel.js";
import EmployeeRequirement from "./employeeRequirement.js";

const documentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.ObjectId,
      ref: Employee,
      required: true,
    },
    employeeRequirement: {
      type: mongoose.Schema.ObjectId,
      ref: EmployeeRequirement,
      required: true,
    },
    fileName: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
