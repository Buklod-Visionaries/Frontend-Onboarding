import EmployeeRequirementHistory from "../models/employeeRequirementHistoryModel.js";

export async function createHistory(req, res) {
  const { employeeRequirement, status, changedBy, note } = req.body;

  const newEmpReqHistory = new EmployeeRequirementHistory({
    employeeRequirement,
    status,
    changedBy,
    note,
  });

  //save to db
  await newEmpReqHistory.save();

  res.send({
    message: "Employee Requirement History created successfully",
    empReqHistory: newEmpReqHistory,
  });
}

//
export async function getAllEmpReqHistory(req, res) {
  //get all
  const allEmpReqHistory = await EmployeeRequirementHistory.find();

  res.status(200).send(allEmpReqHistory);
}

//
export async function getHistoryByEmployeeRequirement(req, res) {
  const { id: paramsId } = req.params;
  const empReqHistory = await EmployeeRequirementHistory.find({
    employeeRequirement: paramsId,
  });

  if (!empReqHistory) {
    return res.status(404).send({
      message: `No history found with employee requirement with id ${paramsId}`,
    });
  }

  res.send(empReqHistory);
}
