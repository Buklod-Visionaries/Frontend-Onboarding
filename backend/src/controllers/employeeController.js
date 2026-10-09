import mongoose from "mongoose";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import Requirement from "../models/requirementModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";
import Document from "../models/documentModel.js";
import EmployeeRequirementHistory from "../models/employeeRequirementHistoryModel.js";
import Notification from "../models/notificationModel.js";
import supabase from "../lib/supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function getAllEmployees(req, res) {
  //get all employees
  const employees = await Employee.find({}).populate("user");
  res.status(200).send(employees);
}

export async function getOwnEmployee(req, res) {
  //get the id from token current user
  const { id } = req.user;
  const me = await User.findOne({
    _id: id, // get the User ID
  });
  const employeeMe = await Employee.findOne({
    user: me.id, // find the Employee with matching ID from User
  }).populate("user");
  res.status(200).send(employeeMe);
}

//get dep reps assigned employees
export async function getDepartmentEmployees(req, res) {
  //get id from user token
  const { id } = req.user;

  //find the current dep rep
  const currentDepRep = await User.findOne({ _id: id });

  //find all employees in the same department
  const allDepEmployee = await Employee.find({
    department: currentDepRep.department,
  }).populate("user");

  res.send(allDepEmployee);
}

export async function addEmployee(req, res) {
  //first is creating a User minus the role because its specifically creating employee
  const { username, email, tempPass, startDate, phone, department, position } =
    req.body;
  //get the HR user
  const { id } = req.user;
  const hrId = id; // assign to be readable

  // const hashedPass = await bcrypt.hash(password, 10);

  const userAlreadyInDB = await User.findOne({
    $or: [
      // finds either matching username, or email
      { username },
      { email },
    ],
  });

  //avoid duplicates of user
  if (userAlreadyInDB) {
    return res.send({
      message: "Username or email already exist in the database",
    });
  }

  //create User first before passing it to Employee model
  const newUser = new User({
    username,
    email,
    password: tempPass, //pass the tempPass
    department,
    role: "employee", // always creating employee
  });

  //creates Employee after User and passing User id to Employee
  const newEmployee = new Employee({
    user: newUser._id,
    position,
    startDate,
    phone,
    department,
  });

  //get the department-specific requirements
  const depRequirements = await Requirement.find({
    department,
  });

  //maps through all department requirements to create multiple EmployeeRequirements
  const newEmployeeReq = depRequirements.map((requirements) => {
    let currentDate = new Date();
    let reqDueDate = currentDate.setDate(
      currentDate.getDate() + requirements.deadlineDays,
    );
    return new EmployeeRequirement({
      employee: newEmployee._id,
      requirement: requirements._id, //pass the depRequirements id from map
      dueDate: reqDueDate, // current date plus deadline days
    });
  });

  //when creating multiple documents access the model itself
  //save to DB
  await newUser.save();
  await newEmployee.save();
  await EmployeeRequirement.insertMany(newEmployeeReq); // insert multiple employeeRequirements using model itself

  //create notification to dept rep

  //find all dept rep on same department as employee
  const deptRep = await User.find({
    role: "dept-rep",
    department: newEmployee.department,
  });

  //create notif to depReps
  const depRepNotif = deptRep.map((deptRepUser) => {
    return new Notification({
      user: deptRepUser._id,
      title: "New Employee Assigned",
      message: `A new employee, ${newUser.username}, has been assigned to your department. Please review their assigned onboarding activities.`,
    });
  });
  //save dept rep notif to DB
  await Notification.insertMany(depRepNotif);

  //create notif to all HR
  const hr = await User.find({ role: "hr" });
  const hrNotif = hr.map((hrUser) => {
    return new Notification({
      user: hrUser._id,
      title: `${newUser.username} added as an Employee`,
      message: `A new employee has been assigned to the ${department} department. Their onboarding requirements are ready for tracking.`,
    });
  });
  //save hr notif to DB
  await Notification.insertMany(hrNotif);

  res.send({
    message: "successfully created new employee",
    newEmployee: newEmployee,
    newUser: newUser,
  });
}

//dep specific emp
export async function getDepSpecificEmployees(req, res) {
  const { id: paramsId } = req.params;

  const emp = await Employee.findOne({ _id: paramsId }).populate("user");

  if (!emp) {
    return res.send({ message: "employee doesnt exist" });
  }

  res.send(emp);
}

export async function getSpecificEmployee(req, res) {
  const { id } = req.params;
  const employee = await Employee.findOne({
    _id: id,
  }).populate("user");
  //if employee doesnt exist
  if (!employee) {
    return res.status(404).send({ message: "Employee doesn't exist" });
  }
  res.status(200).send(employee);
}

export async function updateEmployee(req, res) {
  const { onboardingStatus } = req.body;
  const { id } = req.params;
  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    {
      onboardingStatus,
    },
    { runValidators: true, returnDocument: "after" }, //enforce enum check and return the new edit
  );
  res.send(updatedEmployee);
}

// export async function deleteSpecificEmployee(req, res) {
//   const { id } = req.params;
//   const employee = await Employee.findOne({ _id: id }).populate("user");

//   // const deletedEmployee = await Employee.findOneAndDelete({
//   //   _id: id,
//   // });
//   // if (!deletedEmployee) {
//   //   return res
//   //     .status(404)
//   //     .send({ message: "Cannot delete, employee doesn't exist" });
//   // }

//   //

//   res.status(200).send(employee);
// }

//
export async function deleteSpecificEmployee(req, res) {
  try {
    // Get the user ID from /:id
    const { id } = req.params;

    // 1. Find the user
    const selectedUser = await User.findById(id);

    if (!selectedUser) {
      return res.status(404).send({
        message: "User doesn't exist",
      });
    }

    // 2. Make sure the user is an employee
    if (selectedUser.role !== "employee") {
      return res.status(400).send({
        message: "Cannot delete non-employee user",
      });
    }

    // 3. Find the employee record
    const employee = await Employee.findOne({
      user: id,
    });

    if (!employee) {
      return res.status(404).send({
        message: "Employee record doesn't exist",
      });
    }

    // 4. Find ALL employee requirements belonging to this employee
    const employeeRequirements = await EmployeeRequirement.find({
      employee: employee._id,
    });

    // Get all EmployeeRequirement IDs
    const employeeRequirementIds = employeeRequirements.map(
      (empReq) => empReq._id,
    );

    // 5. Find ALL documents tied to those requirements
    const documents = await Document.find({
      employeeRequirement: { $in: employeeRequirementIds },
    });

    // 6. Collect all Supabase file paths
    const filePaths = documents.map((doc) => doc.fileUrl);

    // 7. Delete files from Supabase
    if (filePaths.length > 0) {
      const { error: uploadError } = await supabase.storage
        .from("employee-files")
        .remove(filePaths);

      if (uploadError) {
        console.error(uploadError);

        return res.status(500).send({
          message: "Failed to delete employee files from Supabase",
        });
      }
    }

    // 8. Delete all Document records
    await Document.deleteMany({
      employeeRequirement: { $in: employeeRequirementIds },
    });

    // 9. Delete ALL EmployeeRequirementHistory records
    await EmployeeRequirementHistory.deleteMany({
      employeeRequirement: { $in: employeeRequirementIds },
    });

    // 10. Delete ALL EmployeeRequirement records
    await EmployeeRequirement.deleteMany({
      employee: employee._id,
    });

    // 11. Delete the Employee record
    await Employee.deleteOne({
      _id: employee._id,
    });

    // 12. Finally delete the User record
    await User.deleteOne({
      _id: id,
    });

    return res.status(200).send({
      message: "Successfully deleted employee and all related data",
      deletedUserId: id,
      deletedEmployeeId: employee._id,
      deletedEmployeeRequirements: employeeRequirementIds.length,
      deletedDocuments: documents.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      message: "Failed to delete employee",
      error: error.message,
    });
  }
}
