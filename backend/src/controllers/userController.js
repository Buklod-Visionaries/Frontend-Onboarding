import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Task from "../models/requirementModel.js";
import Employee from "../models/employeeModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";
import Notification from "../models/notificationModel.js";
import supabase from "../lib/supabase.js";

export async function getAllUser(req, res) {
  //get all user from db
  const users = await User.aggregate([
    {
      $addFields: {
        statusPriority: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$passwordResetRequested", true] },
                then: 0,
              },
              {
                case: {
                  $and: [
                    { $eq: ["$status", "active"] },
                    { $eq: ["$isFirstLogin", true] },
                  ],
                },
                then: 1,
              },
              {
                case: { $eq: ["$status", "active"] },
                then: 2,
              },
            ],
            default: 3,
          },
        },
      },
    },
    {
      $sort: {
        statusPriority: 1,
        lastSignIn: -1,
        createdAt: -1,
      },
    },
    {
      $project: {
        statusPriority: 0,
      },
    },
  ]);
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

import Document from "../models/documentModel.js";
import EmployeeRequirementHistory from "../models/employeeRequirementHistoryModel.js";
// Import supabase from your existing Supabase client file.
// Example: import { supabase } from "../config/supabase.js";

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // 1. Find the user
    const selectedUser = await User.findById(id);

    if (!selectedUser) {
      return res.status(404).json({
        message: "User doesn't exist",
      });
    }

    let deletedEmployeeId = null;
    let deletedRequirementsCount = 0;
    let deletedDocumentsCount = 0;

    // 2. Cascade cleanup for employee accounts only
    if (selectedUser.role === "employee") {
      const employee = await Employee.findOne({ user: id });

      if (employee) {
        deletedEmployeeId = employee._id;

        // Find all requirements belonging to this employee
        const employeeRequirements = await EmployeeRequirement.find({
          employee: employee._id,
        }).select("_id");

        const requirementIds = employeeRequirements.map((item) => item._id);

        deletedRequirementsCount = requirementIds.length;

        if (requirementIds.length > 0) {
          // Find documents associated with these requirements
          const documents = await Document.find({
            employeeRequirement: { $in: requirementIds },
          });

          // 3. Delete files from Supabase storage
          // fileUrl must contain a bucket-relative path.
          const filePaths = documents.map((doc) => doc.fileUrl).filter(Boolean);

          if (filePaths.length > 0) {
            const { error } = await supabase.storage
              .from("employee-files")
              .remove(filePaths);

            if (error) {
              console.error("Supabase deletion failed:", error);

              return res.status(500).json({
                message:
                  "Failed to delete employee files. No MongoDB records were deleted.",
              });
            }
          }

          // 4. Delete document records
          const deletedDocuments = await Document.deleteMany({
            employeeRequirement: { $in: requirementIds },
          });

          deletedDocumentsCount = deletedDocuments.deletedCount;

          // 5. Delete histories linked to employee requirements
          await EmployeeRequirementHistory.deleteMany({
            employeeRequirement: { $in: requirementIds },
          });

          // 6. Delete employee requirements
          await EmployeeRequirement.deleteMany({
            employee: employee._id,
          });
        }

        // 7. Delete the employee record
        await Employee.deleteOne({ _id: employee._id });
      }
    }

    // 8. Delete notifications belonging to this user
    await Notification.deleteMany({ user: selectedUser._id });

    // 9. Finally, delete the user account
    await User.deleteOne({ _id: selectedUser._id });

    return res.status(200).json({
      message: "Successfully deleted user and related data",
      deletedUserId: id,
      deletedEmployeeId,
      deletedRequirements: deletedRequirementsCount,
      deletedDocuments: deletedDocumentsCount,
    });
  } catch (error) {
    console.error("Failed to delete user:", error);

    return res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
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
  const { currentPass, password } = req.body;

  const user = await User.findById(id);

  const currentPassMatched = await bcrypt.compare(currentPass, user.password);

  //add layer of current password checker to add security
  if (!currentPassMatched) {
    return res
      .status(400)
      .send({ message: "The current password is incorrect" });
  }

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

    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }

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
    await user.save();

    if (status === "active") {
      //create notification to the user
      const notif = new Notification({
        user: user._id,
        title: "Account Reactivated",
        message:
          "Your account has been reactivated by HR. You can now access the system using your existing login credentials.",
      });
      //save to DB and send
      await notif.save();
    }

    return res.send({
      message: `Successfully set ${user.username} user${user.role === "employee" ? " and employee" : ""} status to ${status}`,
    });
  }
  res.send({ message: "Error, not a valid status" });
}
