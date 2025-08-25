import axios from "axios";
import Cookies from "js-cookie";

// Tạo instance Axios với base URL và timeout
const apiClient = axios.create({
  baseURL: "http://localhost:8080/admin/giam-gia",
  timeout: 10000,
});

const getAuthHeaders = () => {
  const token = Cookies.get("adminToken");
  if (!token) {
    throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Tạo phiếu giảm giá
export const createVoucher = async (voucherData) => {
  try {
    const response = await apiClient.post("/them-phieu-giam-gia", voucherData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo phiếu giảm giá:", error);
    throw error;
  }
};

export const applyVoucher = async (applyData) => {
  try {
    const token = Cookies.get("adminToken");

    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }

    const response = await apiClient.post("/ap-phieu-giam-gia", applyData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi áp dụng phiếu giảm giá:", error.message || error);
    throw error;
  }
};
export const updateGiamGia = async (id, apDungGGUpdateRequest) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }
    const response = await apiClient.put(`/cap-nhat/${id}`, apDungGGUpdateRequest, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API cập nhật mã giảm giá", error);
    throw error;
  }
};

export const getGiamGiaDetail = async (id) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }
    const response = await apiClient.get(`/chi-tiet/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API lấy chi tiết mã giảm giá", error);
    throw error;
  }
};
export const getPageGiamGia = async (
  page = 0,
  size = 5,
  tenGiamGia = "",
  idTrangThai,
  giamGia,
  ngayBatDau,
  ngayKetThuc
) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }
    const response = await apiClient.get("/hien-thi", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      params: {
        page,
        size,
        ...(tenGiamGia && { tenGiamGia }),
        ...(idTrangThai && { idTrangThai }),
        ...(giamGia && { giamGia }),
        ...(ngayBatDau && { ngayBatDau: ngayBatDau.split("T")[0] }),
        ...(ngayKetThuc && { ngayKetThuc: ngayKetThuc.split("T")[0] }),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API phân trang phiếu giảm giá:", error);
    throw error;
  }
};