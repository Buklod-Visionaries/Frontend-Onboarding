export function formatRole(role) {
  const roles = {
    hr: "HR",
    "dept-rep": "Department Representative",
    employee: "Employee",
  };

  return roles[role] || role;
}

export function formatStatus(status) {
  const statuses = {
    "in-progress": "In Progress",
    in_progress: "In Progress",
    completed: "Completed",
    "resubmission-required": "Resubmission Required",
    pending: "Pending",
    deactivated: "Deactivated",
  };

  return statuses[status] || status;
}

export function formatDepartment(department) {
  const dep = {
    laboratory: "Laboratory",
    cardiovascular: "Cardiovascular",
    imaging: "Imaging",
    administration: "Administration",
  };

  return dep[department] || department;
}
