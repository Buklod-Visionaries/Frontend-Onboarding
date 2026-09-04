import mongoose from "mongoose";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import Requirement from "../models/requirementModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";
import Document from "../models/documentModel.js";
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
  const { username, email, password, department, position } = req.body;
  //get the HR user
  const { id } = req.user;
  const hrId = id; // assign to be readable

  const hashedPass = await bcrypt.hash(password, 10);

  const userAlreadyInDB = await User.findOne({
    username,
    email,
  });

  //avoid duplicates of user
  if (userAlreadyInDB) {
    return res.send({ message: "User already in the database" });
  }

  //create User first before passing it to Employee model
  const newUser = new User({
    username,
    email,
    password: hashedPass, //pass the hashedPass
    department,
    role: "employee", // always creating employee
  });

  //creates Employee after User and passing User id to Employee
  const newEmployee = new Employee({
    user: newUser._id,
    position,
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
      verifiedBy: hrId, // current user id from token
      verifiedAt: currentDate, // current date
    });
  });

  //when creating multiple documents access the model itself
  //save to DB
  await newUser.save();
  await newEmployee.save();
  await EmployeeRequirement.insertMany(newEmployeeReq); // insert multiple employeeRequirements using model itself

  res.send(newEmployee);
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

export async function deleteSpecificEmployee(req, res) {
  const { id } = req.params;
  const deletedEmployee = await Employee.findOneAndDelete({
    _id: id,
  });
  if (!deletedEmployee) {
    return res
      .status(404)
      .send({ message: "Cannot delete, employee doesn't exist" });
  }

  //

  res.status(200).send(deletedEmployee);
}
