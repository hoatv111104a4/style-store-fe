import axios from "axios";
import Cookies from "js-cookie";

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000, // Timeout 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header nếu cần
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && config.url.includes("/dang-xuat")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi phản hồi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại!";
    if (error.response) {
      // Lỗi từ server (4xx, 5xx)
      errorMessage = error.response.data.message || `Lỗi server: ${error.response.status}`;
      if (error.response.status === 401) {
        errorMessage = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn!";
      } else if (error.response.status === 400) {
        errorMessage = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại!";
      }
    } else if (error.request) {
      // Không nhận được phản hồi
      errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
    } else {
      // Lỗi khác
      errorMessage = error.message;
    }
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
  const response = await axios.post("http://localhost:8080/auth/dang-nhap", {
    email,
    password,
  });
  return response.data;
};

/**
 * Đăng xuất người dùng
 * @returns {Promise<Object>} - Dữ liệu phản hồi từ server
 * @throws {Error} - Nếu token không tồn tại hoặc API thất bại
 */
export const logout = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Không tìm thấy token đăng nhập!");
  }

  try {
    const response = await apiClient.post("/auth/dang-xuat", { token });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || "Đăng xuất thất bại!");
    }
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};