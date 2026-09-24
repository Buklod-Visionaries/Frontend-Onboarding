export function formatRole(role) {
  const roles = {
    hr: "HR",
    "dept-rep": "Department Representatives",
    employee: "Employee",
  };

  return roles[role] || role;
}
