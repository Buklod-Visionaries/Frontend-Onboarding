import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Task from "../models/requirementModel.js";
import Employee from "../models/employeeModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";

export async function getAllUser(req, res) {
  //get all user from db
  const users = await User.find();
  res.status(200).send(users);
}

export async function getOwnUser(req, res) {
  //gets id from token req.user
  const { id } = req.user;
  //find the matching id from DB
  const me = await User.findOne({
    _id: id,
  });
  res.status(200).send(me);
}

export async function deleteUser(req, res) {
  //get the /:id from url params
  const { id } = req.params;

  const selectedUser = await User.findOne({ _id: id });
  if (!selectedUser) {
    return res.send("User doesn't exist");
  }

  //also delete related data if Employee role
  if (selectedUser.role === "employee") {
    // //finds the employee
    const employee = await Employee.findOne({ user: id });
    //   //also delete all employeeRequirements
    const empReq = await EmployeeRequirement.deleteMany({
      employee: employee._id,
    });

    //   // also delete the employee data if its an employee role
    const deletedEmployee = await Employee.deleteOne({ user: id });
    console.log("Also deleted Employee Data and EmployeeReq data");
  }
  await User.deleteOne({ _id: id });
  res.send("Successfully deleted user");
}

export async function getSpecificUser(req, res) {
  // gets the /:id from url params
  const { id } = req.params;

  //finds the user that matches id from DB
  const user = await User.findOne({
    _id: id,
  });
  if (!user) {
    return res.status(404).send({ message: "User doesnt exist" });
  }

  //sends the user with matching ID
  console.log(user);
  res.status(200).send(user);
}
