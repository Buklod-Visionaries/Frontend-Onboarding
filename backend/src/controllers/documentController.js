import mongoose from "mongoose";
import Document from "../models/documentModel.js";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";

export async function getAllDocuments(req, res) {
  const allDocs = await Document.find();
  res.send(allDocs);
}

export async function submitDocument(req, res) {
  const { id } = req.user;
  const { reqUrl, fileName, fileUrl } = req.body;

  const currentUser = await User.findOne({ _id: id });
  const currentEmployee = await Employee.findOne({ user: currentUser._id });

  //find the current requirements
  const currentEmpReq = await EmployeeRequirement.findOne({
    employee: currentEmployee._id,
    requirement: reqUrl,
  }).populate({
    path: "requirement",
    match: { type: "document" },
  });

  //
  //runs when requirement is empty so not a document
  if (!currentEmpReq) {
    return res.send("Requirement doesnt exist");
  }
  //runs when requirement is empty so not a document
  if (!currentEmpReq.requirement) {
    return res.send("Requirement is not a document type");
  }

  //find duplicates employee requirement that has already a document in DB
  const docsAlreadyInDB = await Document.findOne({
    employeeRequirement: currentEmpReq,
  });
  //prevent duplication
  if (docsAlreadyInDB) {
    return res.send("Cannot submit on the document");
  }

  //create documents that link to employee and their requirements
  const docs = new Document({
    employee: currentEmployee._id,
    employeeRequirement: currentEmpReq,
    fileName,
    fileUrl,
  });

  //save to DB
  await docs.save();

  res.send(docs);
}
