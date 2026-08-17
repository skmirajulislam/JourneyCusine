import axios from "axios";

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL || "";
let base = rawEnvUrl.trim();

if (base.endsWith("/")) {
  base = base.slice(0, -1);
}

let apiBaseURL = "/api/";
if (base && !base.endsWith("/api")) {
  apiBaseURL = `${base}/api/`;
} else if (base.endsWith("/api")) {
  apiBaseURL = `${base}/`;
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

let isBackendReportedDown = false;

api.interceptors.response.use(
  (response) => {
    if (isBackendReportedDown) {
      isBackendReportedDown = false;
      window.dispatchEvent(
        new CustomEvent("backend-service-status", {
          detail: { isDown: false },
        })
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect server down (no response / network error / gateway errors 502, 503, 504)
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      (error.response?.status >= 502 && error.response?.status <= 504);

    if (isNetworkError && !isBackendReportedDown) {
      isBackendReportedDown = true;
      window.dispatchEvent(
        new CustomEvent("backend-service-status", {
          detail: { isDown: true, message: error.message },
        })
      );
    }

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
