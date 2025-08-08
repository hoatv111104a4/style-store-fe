import axios from 'axios';
import Cookies from "js-cookie";
const API_URL = 'http://localhost:8080/api/admin/hoa-don';

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 20000,
});

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Hàm gọi API tạo đơn chờ
export const addHDC = async () => {
    try {
        const token = Cookies.get("token");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }
        
        const response = await apiClient.post("/addHDC",{},{
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, 
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tạo hóa đơn'
        );
    }
};

// Hàm lấy danh sách hóa đơn
export const getAllHDC = async (page = 0, size = 10) => {
    try {
        const response = await axiosInstance.get('', {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Không thể tải dữ liệu từ server'
        );
    }
};
// hàm lấy danh sách hoá đơn theo trạng thái
export const getHoaDonByTrangThai = async (trangThai, page = 0, size = 10) => {
  try {
    if (!Number.isInteger(trangThai) || page < 0 || size <= 0) {
      throw new Error('Trạng thái, page hoặc size không hợp lệ');
    }
      const response = await axiosInstance.get(`/trang-thai/${trangThai}`, {
        params: { page, size },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải hoá theo trạng thái'
    );
  }
};

// hàm lấy danh sách hoá đơn theo ma
export const getHoaDonByMa = async (ma) => {
    try {
        const response = await axiosInstance.get(`/ma/${ma}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tải hoá đơn theo mã'
        );
    }
};

// Hàm gọi API update Khach Hang
export const updateHDCTWithKH = async (hoaDonId, khachHangId, hinhThucNhanHang = 0, diaChiNhanId = null) => {
    try {
        const response = await axiosInstance.put(`/updateKH/${hoaDonId}`, {
            khachHangId,
            hinhThucNhanHang,
            diaChiNhanId
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể cập nhật khách hàng cho hóa đơn'
        );
    }
};


// Hàm gọi API cập nhật hoá đon
export const updateHoaDonFull = async (hoaDonId, hoaDonData) => {
    try {
        const token = Cookies.get("token");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }

        const response = await apiClient.put(`/updateHD/${hoaDonId}`, hoaDonData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật hóa đơn:', error);
        throw new Error(
            error.response?.data?.message || error.response?.data || 'Không thể cập nhật hóa đơn'
        );
    }
};

//Hàm gọi API tìm kiếm hóa đơn theo id
export const searchHoaDonById = async (id) => {
    try {
        const response = await axiosInstance.get(`/searchID/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tìm kiếm hóa đơn theo ID'
        );
    }
}

// Hàm gọi API tìm kiếm hóa đơn theo số tháng gần đây
export const getHoaDonByMonths = async (months) => {
    try {
        const response = await axiosInstance.get('/theo-thang', {
            params: { months },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể lấy hóa đơn theo số tháng'
        );
    }
};

// Hàm gọi API tìm kiếm hóa đơn theo ngày bắt đầu và kết thúc
export const getHoaDonByNgayBatDauVaKetThuc = async (startDate, endDate) => {
    try {
        const response = await axiosInstance.get('/theo-ngay', {
            params: {
                start: startDate,
                end: endDate,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể lấy hóa đơn theo khoảng ngày'
        );
    }    
};

// Hàm gọi API tìm kiếm hóa đơn theo ngày bắt đầu và kết thúc k trangj thasi
export const getHoaDonByNgayBatDauVaKetThucT = async (startDate, endDate) => {
    try {
        const response = await axiosInstance.get('/theo-ngayt', {
            params: {
                start: startDate,
                end: endDate,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể lấy hóa đơn theo khoảng ngày'
        );
    }
};

//Hàm gọi API xoas hóa đơn theo id
export const deleteHD = async (id) => {
    try {
        const response = await axiosInstance.put(`/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xoá hóa đơn:', error);
        throw new Error(
            error.response?.data?.error || 'Không thể tìm kiếm hóa đơn theo ID'
        );
    }
}

