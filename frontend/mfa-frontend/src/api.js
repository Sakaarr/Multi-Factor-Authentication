import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:8000/api"  ??Uncomment this line for local development,   
  baseURL:  "https://sakar1234.pythonanywhere.com/api/",
  timeout: 10000,
});

// Add token to requests if logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const response = await axios.post("http://localhost:8000/api/token/refresh/", {
            refresh: refreshToken,
          });
          localStorage.setItem("access", response.data.access);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios.request(error.config);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;