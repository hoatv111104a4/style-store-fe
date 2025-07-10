import axios from "axios";

const API_URL = 'http://localhost:8080/api/hoa-don';

// Tạo axios instance chung
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào mỗi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // hoặc sessionStorage nếu bạn lưu ở đó
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// —————— Lấy danh sách tất cả hóa đơn (có phân trang) ——————
export const listHoaDon = async (page = 0, size = 20) => {
  try {
    const response = await axiosInstance.get("", {
      params: { page, size },
    });
    return response.data.content; // hoặc trả cả response.data nếu cần phân trang
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    throw error;
  }
};

// —————— Lấy hóa đơn theo ID ——————
export const getHoaDonById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy hóa đơn với id=${id}:`, error);
    throw error;
  }
};

// —————— Tìm kiếm hóa đơn theo mã (có phân trang) ——————
export const searchHoaDon = async (ma, page = 0) => {
  try {
    const response = await axiosInstance.get("/search", {
      params: { ma, page },
    });
    return response.data.content || response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm hóa đơn:", error);
    throw error;
  }
};

// —————— Thêm mới hóa đơn ——————
export const addHoaDon = async (hoaDonData) => {
  try {
    const response = await axiosInstance.post("", hoaDonData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm hóa đơn:", error);
    throw error;
  }
};

// —————— Cập nhật hóa đơn ——————
export const updateHoaDon = async (id, hoaDonData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, hoaDonData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật hóa đơn:", error);
    throw error;
  }
};

// —————— Xóa hóa đơn ——————
export const deleteHoaDon = async (id) => {
  try {
    await axiosInstance.delete(`/${id}`);
  } catch (error) {
    console.error(`Lỗi khi xóa hóa đơn với id=${id}:`, error);
    throw error;
  }
};
