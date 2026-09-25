import EmployeeRequirement from "../models/employeeRequirement.js";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import Document from "../models/documentModel.js";
import Requirement from "../models/requirementModel.js";
import supabase from "../lib/supabase.js";

export async function getAllEmpReq(req, res) {
  const allEmpReq = await EmployeeRequirement.find()
    .populate({
      path: "requirement",
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    })
    .populate("verifiedBy");
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
  })
    .populate({
      path: "requirement",
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    })
    .populate("verifiedBy"); // populate replace objectId with the actual documents :D

  res.send(myEmpReq);
}
//for employee access
export async function getOwnSpecificEmpReq(req, res) {
  const { id } = req.params;
  const empReq = await EmployeeRequirement.findOne({
    _id: id,
  })
    .populate({
      path: "requirement",
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    })
    .populate("verifiedBy");
  if (!empReq) {
    return res.send(`employee requirements doesnt exist with id ${id}`);
  }

  res.send(empReq);
}

//for hr access
export async function getSpecificEmpReq(req, res) {
  const { id } = req.params;
  const empReq = await EmployeeRequirement.findOne({
    _id: id,
  })
    .populate({
      path: "requirement",
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    })
    .populate("verifiedBy");

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
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    })
    .populate("verifiedBy");

  //filter only show task not documents
  const taskEmpReq = allEmpReq.filter(
    (req) => req.requirement.type === "activity",
  );

  res.send(taskEmpReq);
}

export async function getSpecificDepEmpReq(req, res) {
  const { id } = req.params;

  const depEmpReq = await EmployeeRequirement.findOne({
    _id: id,
  })
    .populate({
      path: "requirement",
    })
    .populate({
      //populate 1st level
      path: "employee",
      populate: {
        // populate 2nd level
        path: "user",
      },
    })
    .populate("verifiedBy");

  if (!depEmpReq) {
    return res.send("Employee Requirement doesnt exist");
  }

  res.send(depEmpReq);
}

export async function getEmpReqByEmpId(req, res) {
  const { id: paramsId } = req.params; //the id of employee

  const empReq = await EmployeeRequirement.find({
    employee: paramsId, //find empReq by employeeId
  })
    .populate({ path: "employee", populate: { path: "user" } })
    .populate("verifiedBy")
    .populate("requirement");
  if (!empReq) {
    return res
      .status(404)
      .send(
        `Employee Requirement doesnt exist with employee with id ${paramsId}`,
      );
  }

  //
  res.send(empReq);
}

export async function editEmpReq(req, res) {
  const { id: userId } = req.user;
  const { id: paramsId } = req.params;
  const { status, resubmissionReason } = req.body;

  const currentDate = new Date();

  if (status === "resubmission-required" && !resubmissionReason) {
    return res.status(400).send({
      message: "resubmission reason is required",
    });
  }

  if (status === "in-progress") {
  }

  const editedReq = await EmployeeRequirement.findByIdAndUpdate(
    paramsId,
    {
      status,
      resubmissionReason,
      verifiedBy: userId,
      verifiedAt: currentDate,
    },
    { returnDocument: "after" }, //return the edited
  );

  //
  if (editedReq.status === "resubmission-required") {
    const doc = await Document.findOne({ employeeRequirement: editedReq._id });
    if (!doc) {
      return res
        .status("404")
        .send(
          `No document found with employee requirements id ${editedReq._id}`,
        );
    }

    //actual deletion

    //delete document file from supabase
    const { error: uploadError } = await supabase.storage
      .from("employee-files") //supabase bucket name
      .remove([doc.fileUrl]);

    if (uploadError) {
      console.log(uploadError);
      return res.send({ message: "Failed to delete file" });
    }

    //delete the document file after
    const deletedDocs = await Document.findOneAndDelete({ _id: doc._id });
    if (!deletedDocs) {
      return res.send("Failed deleting document");
    }
    return res.send({
      message: `successfully changed status of empReq ${editedReq}`,
      deletedDocument: `${deletedDocs}`,
    });
  }

  res.send(editedReq);
}

export async function deleteSpecificEmpReq(req, res) {
  const { id: paramsId } = req.params;

  const delEmpReq = await EmployeeRequirement.findByIdAndDelete(paramsId);

  if (!delEmpReq) {
    return res.send("Can't delete employee requirement it might not exist");
  }

  res.send(delEmpReq);
}
