import api from "../api/api";
export const getAllDepartments = () => api.get("/department/getAllDepartments");
export const addDepartment = (p) => api.post("/department/addDepartment", p);
export const updateDepartment = (id, p) => api.put(`/department/updateDepartment/${id}`, p);
export const deleteDepartment = (id) => api.delete(`/department/deleteDepartment/${id}`);
export const getDepartmentById = (id) =>
    api.get(`/department/getDepartment/${id}`);
