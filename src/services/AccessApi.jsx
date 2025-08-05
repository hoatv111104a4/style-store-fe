import axios from "axios";
import { toast } from "react-toastify";

// Tạo Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [1005].includes(error.response.status)) {
      const errorMessage = error.response.data?.result || "Bạn không có quyền truy cập!";
      toast.error(errorMessage);
      window.location.href = "/access-denied";
      return Promise.reject(new Error("Unauthorized or Forbidden"));
    }
    return Promise.reject(error);
  }
);

// Hàm gọi API với token
export const apiRequest = (method, url, data = null, config = {}) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  return axiosInstance({
    method,
    url,
    data,
    headers: { ...headers, ...config.headers },
    ...config,
  });
};

export default axiosInstance;