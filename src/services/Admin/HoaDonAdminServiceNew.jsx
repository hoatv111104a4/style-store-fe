import axios from "axios";
import Cookies from "js-cookie"; // Ensure Cookies is imported

const apiClient = axios.create({
  baseURL: "http://localhost:8080/admin/hoa-don-admin",
  timeout: 20000,
});

export const pageHoaDonAdmin = async ({
  page = 0,
  size = 10,
  maHoaDonOrTenKhachHang0rSoDienThoai = "",
  trangThaiDonHang = null,
  trangThaiThanhToan = null,
  phuongThucThanhToan = null,
} = {}) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.get("/danh-sach-hoa-don", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page,
        size,
        maHoaDonOrTenKhachHang0rSoDienThoai: maHoaDonOrTenKhachHang0rSoDienThoai || undefined,
        trangThaiDonHang: trangThaiDonHang !== null ? trangThaiDonHang : undefined,
        trangThaiThanhToan: trangThaiThanhToan !== null ? trangThaiThanhToan : undefined,
        phuongThucThanhToan: phuongThucThanhToan !== null ? phuongThucThanhToan : undefined,
      },
    });
    return {
      content: response.data.result.content || [],
      totalPages: response.data.result.totalPages || 0,
      totalElements: response.data.result.totalElements || 0,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    throw error;
  }
};

export const getHoaDonById = async (id) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.get(`/chi-tiet/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin hóa đơn:", error);
    throw error;
  }
};

export const addSanPhamHoaDon = async (request) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.post("/them-san-pham-hoa-don", request, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào hóa đơn:", error);
    throw error;
  }
};

export const deleteSanPhamHoaDon = async (id) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.delete(`/xoa-san-pham-hoa-don/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi hóa đơn:", error);
    throw error;
  }
};

export const getHoaDonUDDetail = async (id) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.get(`/chi-tiet-thong-tin-van-chuyen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin vận chuyển hóa đơn:", error);
    throw error;
  }
};

export const updateHoaDonUDDetail = async (id, request) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.put(`/cap-nhat-thong-tin-van-chuyen/${id}`, request, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin vận chuyển hóa đơn:", error);
    throw error;
  }
};

export const chuyenTrangThaiDonHang = async (id) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.get(`/chuyen-trang-thai-don-hang/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chuyển trạng thái đơn hàng:", error);
    throw error;
  }
};

export const getLichSuDonHang = async (id) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    const response = await apiClient.get(`/lich-su-don-hang/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
    throw error;
  }
};


export const huyDonHang = async (id) => {
  try {
    const token = Cookies.get("adminToken");

    const response = await apiClient.get(`/huy-don-hang/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    throw error;
  }
};

