// src/services/profileService.js
import api from "../api/api";

// Get logged-in user's profile
export const getMyProfile = () => {
  return api.get("/employee/myProfile");
};

// Upload profile image
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/employee/uploadProfileImage", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const changePassword = (payload) => {
  return api.post("/employee/changePassword", payload);
};

