import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});



// Hàng đợi để lưu các yêu cầu bị lỗi 401, chờ refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && !config.url.includes("/dang-nhap") && !config.url.includes("/refresh")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi phản hồi
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại!";

    if (error.response) {
      errorMessage = error.response.data.message || `Lỗi server: ${error.response.status}`;
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/dang-nhap") &&
        !originalRequest.url.includes("/refresh")
      ) {
        if (isRefreshing) {
          // Nếu đang refresh, đưa yêu cầu vào hàng đợi
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const token = Cookies.get("token");
          if (!token) {
            throw new Error("Không tìm thấy token!");
          }

          // Kiểm tra thời gian hết hạn của token
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            const response = await apiClient.post("/auth/refresh", { token });
            const newToken = response.data.result.token;
            Cookies.set("token", newToken, { expires: 7 });
            Cookies.set("user", JSON.stringify(jwtDecode(newToken)), { expires: 7 });

            // Cập nhật header cho yêu cầu gốc
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            isRefreshing = false;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          Cookies.remove("token");
          Cookies.remove("user");
          window.location.href = "/dang-nhap";
          return Promise.reject(new Error("Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại."));
        }
      } else if (error.response.status === 400) {
        errorMessage = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại!";
      }
    } else if (error.request) {
      errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
    } else {
      errorMessage = error.message;
    }
    isRefreshing = false;
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Đăng nhập người dùng
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu người dùng
 * @returns {Promise<Object>} - Dữ liệu phản hồi từ server
 */
export const login = async (email, password) => {
  const response = await apiClient.post("/auth/dang-nhap", {
    email,
    password,
  });
  return response.data;
};

/**
 * Làm mới token
 * @param {string} token - Token hiện tại
 * @returns {Promise<Object>} - Dữ liệu phản hồi từ server
 */
export const refreshToken = async (token) => {
  const response = await apiClient.post("/auth/refresh", { token });
  return response.data;
};

/**
 * Đăng xuất người dùng
 * @returns {Promise<Object>} - Dữ liệu phản hồi từ server
 * @throws {Error} - Nếu token không tồn tại
 */
export const logout = async () => {
  const token = Cookies.get("token");
  if (!token) {
    Cookies.remove("token");
    Cookies.remove("user");
    return { code: 0, message: "Đăng xuất thành công (không có token)" };
  }

  try {
    const response = await apiClient.post("/auth/dang-xuat", { token });
    Cookies.remove("token");
    Cookies.remove("user");
    return response.data;
  } catch (error) {
    // Bỏ qua lỗi token hết hạn hoặc không hợp lệ, vẫn xóa cookies
    Cookies.remove("token");
    Cookies.remove("user");
    if (error.response && (error.response.status === 401 || error.response.data?.message.includes("UNAUTHENTICATED"))) {
      return { code: 0, message: "Đăng xuất thành công (token không hợp lệ)" };
    }
    throw new Error(error.response?.data?.message || "Đăng xuất thất bại!");
  }
};

