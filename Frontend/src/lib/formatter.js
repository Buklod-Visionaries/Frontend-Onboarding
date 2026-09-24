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
  };

  return statuses[status] || status;
}
