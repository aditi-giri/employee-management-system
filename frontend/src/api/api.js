import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8083",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

//  Add token automatically for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto-handle 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // logout ONLY when token is invalid or expired
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("id");

      if (typeof window !== "undefined") window.location.href = "/login";
    }

    // 403 should NOT logout → user is authorized but forbidden for that endpoint
    return Promise.reject(err);
  }
);



export default api;
