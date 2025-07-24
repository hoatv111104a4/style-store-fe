import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/dia-chi-nhan",
  timeout: 5000,
});

// Hàm lấy token từ cookie (thống nhất sử dụng cookie)
const getToken = () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
  }
  return token;
};

export const createDiaChiNhan = async (diaChiNhanData) => {
  try {
    const token = getToken();
    const response = await apiClient.post("/them-dia-chi-nhan", diaChiNhanData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm địa chỉ nhận:", error.message || error);
    throw error;
  }
};

export const getAllDiaChiNhan = async () => {
  try {
    const token = getToken();
    const response = await apiClient.get("/hien-thi-dia-chi-nhan", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ nhận:", error);
    throw error;
  }
};


export const deleteDiaChiNhan = async (id) => {
  try {
    const token = getToken();
    const response = await apiClient.delete(`/xoa-dia-chi-nhan/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa địa chỉ nhận với id ${id}:`, error);
    throw error;
  }
};

export const getDiaChiNhanById = async (id) => {
  try {
    const response = await apiClient.get(`/chon-dia-chi-nhan/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin địa chỉ nhận với id ${id}:`, error);
    throw error;
  }
};

