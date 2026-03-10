import api from "../api/api";
export const getAllTasks = () => api.get("/task/getAllTasks");
export const getTasksAssignedByAdmin = () => api.get("/task/assignedByAdmin");
export const getTasksAssignedToEmployee = () => api.get("/task/assignedToEmployee");
export const createTask = (p) => api.post("/task/createTask", p);
export const updateTask = (id,p) => api.put(`/task/updateTask/${id}`, p);
export const deleteTask = (id) => api.delete(`/task/deleteTask/${id}`);
export const updateTaskStatus = (id,status) => api.patch(`/task/updateStatus/${id}`, { status });
