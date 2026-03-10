import api from "../api/api";

// SUPERADMIN
export const getEmployeesByDepartmentChart = () =>
  api.get("/employee/charts/department");

export const getEmployeesByRoleChart = () =>
  api.get("/employee/charts/roles");

// SUPERADMIN + ADMIN
export const getEmployeeStatusChart = () =>
  api.get("/employee/charts/status");

  export const getAdminTaskStatusChart = () =>
  api.get("/task/charts/assignedByAdmin");