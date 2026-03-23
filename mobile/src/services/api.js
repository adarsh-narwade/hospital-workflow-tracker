import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://hospital-workflow-tracker.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login:    (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me:       ()     => api.get("/auth/me"),
};

export const patientAPI = {
  getAll:    (params)   => api.get("/patients", { params }),
  getOne:    (id)       => api.get(`/patients/${id}`),
  create:    (data)     => api.post("/patients", data),
  update:    (id, data) => api.patch(`/patients/${id}`, data),
  discharge: (id)       => api.patch(`/patients/${id}/discharge`),
};

export const bedAPI = {
  getAll:   (params)   => api.get("/beds", { params }),
  getStats: ()         => api.get("/beds/stats"),
  update:   (id, data) => api.patch(`/beds/${id}`, data),
};

export const taskAPI = {
  getAll:  (params)   => api.get("/tasks", { params }),
  create:  (data)     => api.post("/tasks", data),
  update:  (id, data) => api.patch(`/tasks/${id}`, data),
  remove:  (id)       => api.delete(`/tasks/${id}`),
};

export default api;