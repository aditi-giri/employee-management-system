import api from "../api/api";
import { jwtDecode } from "jwt-decode";

export const loginService = async (email, password) => {
  const response = await api.post("/employee/login", {
    email,
    password,
  });
  const data = response.data;

  // Save authentication info
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("id", data.id);

  // 🔥 ADD THIS — SAVE DEPT ID
  localStorage.setItem("deptId", data.deptId);

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("id");
  localStorage.removeItem("deptId");
  window.location.href = "/login";
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
