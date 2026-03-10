import api from "../api/api";

export const getAllEmployees = () => api.get("/employee/getAllEmployees");
export const getEmployeeById = (id) => api.get(`/employee/getEmployeeById/${id}`);
export const addEmployee = (payload) => api.post("/employee/addEmployee", payload);
export const addMultipleEmployees = (payload) => api.post("/employee/addMultipleEmployees", payload);
export const updateEmployee = (id, payload) => api.put(`/employee/updateEmployee/${id}`, payload);
export const deleteEmployee = (id) => api.delete(`/employee/deleteEmployee/${id}`);
export const searchByEmail = (email) => api.get(`/employee/searchByEmail?email=${encodeURIComponent(email)}`);
export const getEmployeesByDepartment = (deptId) => api.get(`/department/employees/${deptId}`);
