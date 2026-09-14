import express from "express";
import mongoose from "mongoose";
import Requirement from "../models/requirementModel.js";

export async function getAllRequirements(req, res) {
  const requirements = await Requirement.find();
  res.send(requirements);
}

export async function addRequirement(req, res) {
  //destructure data from json
  const { name, type, department, activity, deadlineDays } = req.body;

  //
  const existingReq = await Requirement.findOne({
    name,
    department,
  });
  //avoid duplicates
  if (existingReq) {
    return res.status(409).send({
      message: "ERROR ADDING REQUIREMENTS: duplicate requirements found",
      duplicate: existingReq,
    });
  }
  //creates new requirement from the data requested
  const newRequirement = new Requirement({
    name,
    type,
    activity,
    department,
    deadlineDays,
  });
  //saved to DB
  await newRequirement.save();
  res.status(201).send(newRequirement);

  res.send(newRequirement);
}

export async function getSpecificRequirement(req, res) {
  //get params ID
  const { id } = req.params;
  //find requirement with the same ID
  const requirement = await Requirement.findOne({
    _id: id,
  });
  if (!requirement) {
    return res.send("requirement doesn't exist");
  }
  res.send( requirement );
}

export async function updateRequirement(req, res) {
  //destructure data from json
  const { name, type, activity, department, hasDeadline, deadlineDays } =
    req.body;
  //gets the params ID
  const { id } = req.params;
  //update the requirement with the same ID as params
  const updatedRequirement = await Requirement.findByIdAndUpdate(
    id,
    {
      name,
      type,
      activity,
      department,
      hasDeadline,
      deadlineDays,
    },
    {
      // returns the updated values on response instead of the before update
      returnDocument: "after",
    },
  );
  res.send(updatedRequirement);
}

export async function deleteRequirement(req, res) {
  const { id } = req.params;

  const deletedRequirement = await Requirement.findByIdAndDelete(id);
  if (!deletedRequirement) {
    return res.send("cannot delete, requirement doesn't exist");
  }
  res.send({
    message: "successfully deleted requirement",
    deleted: deletedRequirement,
  });
}
