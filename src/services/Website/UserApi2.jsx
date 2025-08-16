import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/nguoi-dung",
    timeout: 10000,
});

// Đăng ký người dùng
export const registerUser = async (userCreationRequest) => {
    try {
        const response = await apiClient.post("/dang-ky", userCreationRequest);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API đăng ký người dùng", error);
        throw error;
    }
};

// Thêm nhân viên
export const createNhanVien = async (userCreationRequest) => {
    try {
        const response = await apiClient.post("/them-nhan-vien", userCreationRequest);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API thêm nhân viên", error);
        throw error;
    }
};

export const createKhachHang = async (userCreationRequest) => {
    try {
        const response = await apiClient.post("/them-khach-hang", userCreationRequest);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API thêm khách hàng", error);
        throw error;
    }
};

// Lấy danh sách nhân viên
export const getPageNhanVien = async (
    page = 0,
    size = 5,
    hoTenOrSoDTOrEmail = "",
    gioiTinh = null,
    trangThai = null
) => {
    try {
        const response = await apiClient.get("/danh-sach-nhan-vien", {
            params: {
                page,
                size,
                hoTenOrSoDTOrEmail: hoTenOrSoDTOrEmail || undefined,
                gioiTinh: gioiTinh !== null ? gioiTinh : undefined,
                trangThai: trangThai !== null ? trangThai : undefined,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API danh sách nhân viên", error);
        throw error;
    }
};

// Lấy danh sách khách hàng
export const getPageKhachHang = async (
    page = 0,
    size = 5,
    hoTenOrSoDTOrEmail = "",
    gioiTinh = null,
    trangThai = null
) => {
    try {
        const response = await apiClient.get("/danh-sach-khach-hang", {
            params: {
                page,
                size,
                hoTenOrSoDTOrEmail: hoTenOrSoDTOrEmail || undefined,
                gioiTinh: gioiTinh !== null ? gioiTinh : undefined,
                trangThai: trangThai !== null ? trangThai : undefined,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API danh sách khách hàng", error);
        throw error;
    }
};

// Lấy chi tiết người dùng
export const getUserDetail = async (id) => {
    try {
        const response = await apiClient.get(`/chi-tiet/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API chi tiết người dùng", error);
        throw error;
    }
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, userUpdateRequest) => {
    try {
        const response = await apiClient.put(`/sua-thong-tin/${id}`, userUpdateRequest);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API cập nhật thông tin người dùng", error);
        throw error;
    }
};


export const deleteUser = (id) => {
  return apiClient.delete(`/xoa-nguoi-dung/${id}`);
};








export const getMyInfo = async () => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    const response = await apiClient.get("/thong-tin-cua-toi", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API lấy thông tin người dùng hiện tại:", error.message || error);
    throw error;
  }
};

export const updateMyInfo = async (userUpdateRequest) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    const response = await apiClient.put("/cap-nhat-thong-tin-cua-toi", userUpdateRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API cập nhật thông tin người dùng hiện tại:", error.message || error);
    throw error;
  }
};



export const getMyInfoAdmin = async () => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    const response = await apiClient.get("/thong-tin-cua-toi", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API lấy thông tin người dùng hiện tại:", error.message || error);
    throw error;
  }
};

export const updateMyInfoAdmin = async (userUpdateRequest) => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    const response = await apiClient.put("/cap-nhat-thong-tin-cua-toi", userUpdateRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API cập nhật thông tin người dùng hiện tại:", error.message || error);
    throw error;
  }
};

