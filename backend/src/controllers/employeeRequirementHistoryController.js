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
  const { limit } = req.query;

  //if theres a limit query
  const historyLimit = parseInt(limit) || 5;

  //get all
  const allEmpReqHistory = await EmployeeRequirementHistory.find()
    .populate({
      path: "changedBy",
    })
    .sort({
      createdAt: -1,
    })
    .limit(historyLimit);

  res.status(200).send(allEmpReqHistory);
}

//
export async function getHistoryByEmployeeRequirement(req, res) {
  const { id: paramsId } = req.params;
  const empReqHistory = await EmployeeRequirementHistory.find({
    employeeRequirement: paramsId,
  }).populate({
    path: "changedBy",
  });

  if (!empReqHistory) {
    return res.status(404).send({
      message: `No history found with employee requirement with id ${paramsId}`,
    });
  }

  res.send(empReqHistory);
}
