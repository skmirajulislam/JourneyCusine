import axios from "axios";

export const API = "http://localhost:5001/";
// export const API = "https://backend-api-jc-production.up.railway.app/";

const api = axios.create({
  baseURL: "http://localhost:5001/",
  // baseURL: "https://backend-api-jc-production.up.railway.app/",
});

api.interceptors.request.use(
  (config) => {
    const accessToken = JSON.parse(localStorage.getItem("accessToken"));

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
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));
        const response = await axios.post(`${API}auth/refresh_token`, {
          refreshToken,
        });
        console.log(response);
        console.log('Api Working Frontent!');

        const newAccessToken = response.data.accessToken;

        localStorage.setItem("accessToken", JSON.stringify(newAccessToken));

        originalRequest.headers["authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh access token:", refreshError);
        // toast.error("Please log in!");
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
