import EmployeeRequirement from "../models/employeeRequirement.js";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";

export async function getAllEmpReq(req, res) {
  const allEmpReq = await EmployeeRequirement.find().populate("requirement");
  res.send(allEmpReq);
}

export async function getOwnEmpReq(req, res) {
  //get the current id of user from token
  const { id } = req.user;
  //get the user from id
  const myUser = await User.findOne({
    _id: id,
  });

  //get the employee from userid
  const myEmployee = await Employee.findOne({
    user: myUser._id,
  });

  //get the specific emprequirements from employee id
  const myEmpReq = await EmployeeRequirement.find({
    employee: myEmployee._id,
  }).populate("requirement"); // populate replace objectId with the actual documents :D

  res.send(myEmpReq);
}

export async function getSpecificEmpReq(req, res) {
  const { id } = req.params;
  const empReq = await EmployeeRequirement.find({
    _id: id,
  });

  res.send(empReq);
}

//Get all department specific requirements task
export async function getDepEmpReq(req, res) {
  const { id } = req.user;

  const currentDepRep = await User.findOne({ _id: id });
  if (!currentDepRep) {
    return res.send("Department Rep doesnt exist");
  }
  const depEmployees = await Employee.find({
    department: currentDepRep.department,
  });

  //give array of all employee Ids
  const employeeID = depEmployees.map((employee) => employee._id);

  const allEmpReq = await EmployeeRequirement.find({
    employee: { $in: employeeID }, // find the match through an array
  })
    .populate({
      path: "requirement",
      match: { type: "task" },
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    });

  //filter only show task not documents
  const taskEmpReq = allEmpReq.filter((req) => req.requirement !== null);

  res.send(taskEmpReq);
}

export async function getSpecificDepEmpReq(req, res) {
  const { id } = req.params;

  const depEmpReq = await EmployeeRequirement.findOne({
    _id: id,
  });

  if (!depEmpReq) {
    return res.send("Employee Requirement doesnt exist");
  }

  res.send(depEmpReq);
}

export async function editEmpReq(req, res) {
  const { id: userId } = req.user;
  const { id: paramsId } = req.params;
  const { status } = req.body;

  const currentDate = new Date();

  const editedReq = await EmployeeRequirement.findByIdAndUpdate(
    paramsId,
    {
      status,
      verifiedBy: userId,
      verifiedAt: currentDate,
    },
    { returnDocument: "after" }, //return the edited
  );

  res.send(editedReq);
}
