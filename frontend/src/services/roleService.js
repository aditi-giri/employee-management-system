import api from "../api/api";

// ✅ Fetch all roles (SUPERADMIN only)
export const getAllRoles = async () => {
  return await api.get("/role/getAllRoles");
};

// ✅ Add new role (optional, SUPERADMIN only)
export const addRole = async (roleName) => {
  return await api.post("/role/addRole", { roleName });
};
