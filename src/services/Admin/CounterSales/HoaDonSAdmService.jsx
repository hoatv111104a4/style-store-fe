import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/hoa-don';

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
        const response = await axiosInstance.post('/addHDC', {
            nguoiTaoId: 1, // Gán trực tiếp ID người tạo
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
export const updateHDCTWithKH = async (hoaDonId, khachHangId, hinhThucNhanHang = 0) => {
    try {
        const response = await axiosInstance.put(`/updateKH/${hoaDonId}`, {
            khachHangId,
            hinhThucNhanHang
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
        const response = await axiosInstance.put(`/updateHD/${hoaDonId}`, hoaDonData);
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
