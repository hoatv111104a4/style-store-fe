import axios from 'axios';
import Cookies from "js-cookie";
const API_URL = 'http://localhost:8080/api/thong-ke';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 20000,
});

// Gọi thống kê theo tháng
export const thongKeTheoThang = async (thang, nam) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }
    const response = await apiClient.get(`/san-pham/thang`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      params: { thang, nam },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API thống kê theo tháng:", error);
    throw error;
  }
};


// Gọi thống kê theo năm
export const thongKeTheoNam = (nam) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }
    return apiClient.get(`/san-pham/nam`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      params: { nam },
    });
  } catch (error) {
    console.error("Lỗi khi gọi API thống kê theo năm:", error);
    throw error;
  }
};

// Gọi thống kê theo tuần
export const thongKeTheoTuan = (tuan, nam) => {
  try {
    const token = Cookies.get("adminToken");  
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }
    // Gọi API thống kê theo tuần
    return apiClient.get(`/san-pham/tuan`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      params: { tuan, nam },
    });
  } catch (error) {
    console.error("Lỗi khi gọi API thống kê theo tuần:", error);
    throw error;
  }
};