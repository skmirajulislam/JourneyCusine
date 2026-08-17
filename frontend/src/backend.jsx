import axios from "axios";

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;
let apiBaseURL = "/api/";

if (rawEnvUrl && rawEnvUrl.trim() && rawEnvUrl.trim() !== "/") {
  let base = rawEnvUrl.trim();
  if (base.endsWith("/")) base = base.slice(0, -1);
  if (!base.endsWith("/api")) {
    apiBaseURL = `${base}/api/`;
  } else {
    apiBaseURL = `${base}/`;
  }
} else if (import.meta.env.DEV) {
  apiBaseURL = "http://localhost:5001/api/";
} else {
  apiBaseURL = "/api/";
}

const getStoredToken = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const API = apiBaseURL;

const api = axios.create({
  baseURL: apiBaseURL,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getStoredToken("accessToken");

    // Set the access token in the Authorization header
    if (accessToken) {
      config.headers["authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh_token") &&
      !originalRequest.url?.includes("/auth/log_in") &&
      !originalRequest.url?.includes("/auth/get_user_details")
    ) {
      originalRequest._retry = true;
      const refreshToken = getStoredToken("refreshToken");
      
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API}auth/refresh_token`, {
          refreshToken,
        });
        const newAccessToken = response.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("No access token returned from refresh");
        }

        localStorage.setItem("accessToken", JSON.stringify(newAccessToken));

        originalRequest.headers["authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth-session-expired"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// This module intentionally exports an Axios client rather than a React component.
// eslint-disable-next-line react-refresh/only-export-components
export default api;
