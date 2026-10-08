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

export async function resetUserPassword(req, res) {
  //from the frontend
  const { tempPass } = req.body;
  //user id
  const { id } = req.params;

  if (!tempPass) {
    return res.send({ message: "Temporary password is empty" });
  }
  //update temp pass
  const user = await User.findByIdAndUpdate(id, {
    tempPass: tempPass,
    password: tempPass,
  });
  if (!user) {
    return res.status(404).send({ message: `No user found` });
  }

  res
    .status(200)
    .send({ message: `Successfully reset password of ${user.email}` });
}

export async function deleteUser(req, res) {
  //get the /:id from url params
  const { id } = req.params;

  const selectedUser = await User.findOne({ _id: id });
  if (!selectedUser) {
    return res.send({ message: "User doesn't exist" });
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
  res.send({ message: "Successfully deleted user with id", id: id });
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

export async function updateOwnUserPassword(req, res) {
  const { id } = req.user;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedUser) {
    return res.send({ message: "user doesnt exist" });
  }

  res.send({ message: "Successfully edited user" });
}

//
export async function changeUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  //validation
  if (!id) {
    return res.status(404).send({ message: "No user id provided" });
  }
  if (!status) {
    return res.status(404).send({ message: "No status provided" });
  }

  //if the status is deactivated
  if (status === "deactivated" || status === "active") {
    //find specific user
    const user = await User.findOne({ _id: id });

    // also set active employee data if user is an employee
    if (user.role === "employee") {
      await Employee.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            onboardingStatus:
              status === "active" ? "in_progress" : "deactivated", //if active then in_progress
          },
        },
      );
    }

    //set user data status
    user.status = status;
    user.save();

    return res.send({
      message: `Successfully set ${user.username} user${user.role === "employee" ? " and employee" : ""} status to ${status}`,
    });
  }
  res.send({ message: "Error, not a valid status" });
}
