import Employee from "../models/employeeModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";

export async function generateReports(req, res) {
  const { department } = req.query;

  if (!department) {
    return res.status(404).send({ message: "No reports" });
  }

  //accepted department
  //all
  //laboratory
  //imaging
  //cardiovascular
  //administration
  const employees = await Employee.find(
    {},
    { startDate: 0, phone: 0 }, //exclude fields
  ).populate({
    path: "user",
    select: {
      password: 0,
      role: 0,
      lastSignIn: 0,
      createdAt: 0,
      updatedAt: 0,
      isFirstLogin: 0,
    },
  });

  const reports = await Promise.all(
    employees
      .filter((employee) =>
        department === "all" ? employee : employee.department === department,
      )
      .map(async (employee) => {
        const empReqs = await EmployeeRequirement.find({
          employee: employee._id, //only gets the requirements for each employee
        }).populate({
          path: "employee",
          populate: {
            path: "user",
            select: {
              password: 0,
              role: 0,
              lastSignIn: 0,
              createdAt: 0,
              updatedAt: 0,
              isFirstLogin: 0,
            },
          },
        });
        //requirement status filters
        const total = empReqs.length;
        const completed = empReqs.filter(
          (req) => req.status === "completed",
        ).length;
        const inProgress = empReqs.filter(
          (req) =>
            req.status === "in-progress" ||
            req.status === "resubmission-required",
        ).length;
        const pending = empReqs.filter(
          (req) => req.status === "pending",
        ).length;
        //payload data for reports
        return {
          employee: employee.user.username,
          position: employee.position,
          department: employee.department,
          completed,
          inProgress,
          pending,
          total,
          onboardingStatus: employee.onboardingStatus,
        };
      }),
  );

  res.send(reports);
}
