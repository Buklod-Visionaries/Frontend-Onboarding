import mongoose from "mongoose";
import Document from "../models/documentModel.js";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";
import supabase from "../lib/supabase.js";

export async function getAllDocuments(req, res) {
  const allDocs = await Document.find()
    .populate({ path: "employee", populate: { path: "user" } })
    .populate({
      path: "employeeRequirement",
      populate: { path: "requirement" },
    });
  res.send(allDocs);
}

export async function submitDocument(req, res) {
  const { id } = req.user;
  const { employeeRequirementId } = req.body;
  const file = req.file;

  if (!file) {
    return res.send({ message: "No file uploaded" });
  }

  const currentUser = await User.findOne({ _id: id });
  const currentEmployee = await Employee.findOne({ user: currentUser._id });

  //find the current requirements
  const currentEmpReq = await EmployeeRequirement.findOne({
    employee: currentEmployee._id,
    _id: employeeRequirementId,
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

  //create unique file url
  const fileUrl = `${currentEmployee._id}/${currentEmpReq._id}/${Date.now()}-${file.originalname}`;

  console.log(fileUrl);

  //upload to supabase
  const { error: uploadError } = await supabase.storage
    .from("employee-files") //supabase bucket name
    .upload(fileUrl, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    console.log(uploadError);
    return res.send({ message: "Failed to upload file" });
  }

  // //create documents that link to employee and their requirements
  const docs = new Document({
    employee: currentEmployee._id,
    employeeRequirement: currentEmpReq,
    fileName: file.originalname,
    fileUrl,
    fileType: file.mimetype,
  });

  //save to DB
  await docs.save();

  //set status in progress
  currentEmpReq.status = "pending";
  await currentEmpReq.save();
  res.send({ message: "Document uploaded successfully", document: docs });
}

export async function getEmpReqSpecificDocument(req, res) {
  const { id } = req.params;
  const empReq = await EmployeeRequirement.findOne({ _id: id }).populate(
    "requirement",
  );
  if (!empReq) {
    return res.send(`empReq doesn't exist with id ${id}`);
  }

  const empReqDocument = await Document.findOne({
    employeeRequirement: empReq._id,
  })
    .populate({
      path: "employee",
      populate: {
        path: "user",
      },
    })
    .populate({
      path: "employeeRequirement",
      populate: {
        path: "requirement",
      },
    });

  if (!empReqDocument) {
    return res.send(`documents doesn't exist with empReq id ${id}`);
  }

  //create a signed URL to be viewable since its stored in a private bucket
  const { data, error } = await supabase.storage
    .from("employee-files")
    .createSignedUrl(empReqDocument.fileUrl, 60 * 10);

  if (error) {
    return res.status(500).json({
      message: error.message,
    });
  }

  //return a json where the fileUrl is signed so its viewable
  res.json({
    ...empReqDocument.toObject(),
    fileUrl: data.signedUrl,
  });
}

//
export async function deleteSpecificDocByEmpReqId(req, res) {
  const { id: paramsId } = req.params;
  const empReq = await EmployeeRequirement.findOne({ _id: paramsId });
  if (!empReq) {
    return res.status("404").send(`No emp req with id ${empReq._id}`);
  }

  const doc = await Document.findOne({ employeeRequirement: empReq._id });
  if (!doc) {
    return res
      .status("404")
      .send(`No document found with employee requirements id ${empReq._id}`);
  }

  //actual deletion

  //delete file from supabase
  const { error: uploadError } = await supabase.storage
    .from("employee-files") //supabase bucket name
    .remove([doc.fileUrl]);

  if (uploadError) {
    console.log(uploadError);
    return res.send({ message: "Failed to delete file" });
  }

  //delete the document file after
  const deletedDocs = await Document.findOneAndDelete({ _id: doc._id });
  if (!deletedDocs) {
    return res.send("Failed deleting document");
  }
  res.send(`successfully deleted document with id: ${doc._id}`);
}

export async function getSpecificDocument(req, res) {
  const { id } = req.params;

  const doc = await Document.findOne({ _id: id })
    .populate({
      path: "employee",
      populate: {
        path: "user",
      },
    })
    .populate({
      path: "employeeRequirement",
      populate: {
        path: "requirement",
      },
    });
  if (!doc) {
    return res.send("document doesn't exist");
  }
  res.send(doc);
}

export async function deleteSpecificDocument(req, res) {
  const { id: paramsId } = req.params;

  const doc = await Document.findOne({ _id: paramsId })
    .populate({
      path: "employee",
      populate: {
        path: "user",
      },
    })
    .populate({
      path: "employeeRequirement",
      populate: {
        path: "requirement",
      },
    });
  if (!doc) {
    return res.send("document doesn't exist");
  }

  //delete file from supabase
  const { error: uploadError } = await supabase.storage
    .from("employee-files") //supabase bucket name
    .remove([doc.fileUrl]);

  if (uploadError) {
    console.log(uploadError);
    return res.send({ message: "Failed to delete file" });
  }

  //delete the document file after
  const deletedDocs = await Document.findOneAndDelete({ _id: doc._id });
  if (!deletedDocs) {
    return res.send("Failed deleting document");
  }
  res.send(`successfully deleted document with id: ${doc._id}`);
}
