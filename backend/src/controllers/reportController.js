import Employee from "../models/employeeModel.js";
import EmployeeRequirement from "../models/employeeRequirement.js";

export async function generateReports(req, res) {
  const { type, department } = req.query;

  if (!type && !department) {
    return res.status(404).send({ message: "No reports" });
  }

  //accepted types
  //employee-onboarding-status
  //completed-requirements
  //pending-requirements
  //overdue-requirements
  //in-progress-requirements

  //accepted department
  //all
  //laboratory
  //imaging
  //cardiovascular
  //administration

  if (type === "employee-onboarding-status" && department === "all") {
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
      employees.map(async (employee) => {
        const empReqs = await EmployeeRequirement.find({
          employee: employee._id,
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
        const completed = empReqs.filter(
          (req) => req.status === "completed",
        ).length;
        const inProgress = empReqs.filter(
          (req) => req.status === "in-progress",
        ).length;
        const pending = empReqs.filter(
          (req) => req.status === "pending",
        ).length;
        return {
          employee: employee.user.username,
          position: employee.position,
          department: employee.department,
          completed,
          inProgress,
          pending,
          onboardingStatus: employee.onboardingStatus,
        };
      }),
    );

    return res.status(200).send(reports);
  }

  res.send("Ok");
}
