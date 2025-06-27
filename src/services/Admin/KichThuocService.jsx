import axios from 'axios';

const API_URL = 'http://localhost:8080/api/kich-thuoc';

// Cấu hình axios với timeout và baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy danh sách chất liệu với hỗ trợ phân trang
export const getAllKichThuoc = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/all', {
      params: { page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Không thể tải dữ liệu từ server'
    );
  }
};

// Thêm chất liệu mới
export const addKichThuoc = async (kichThuoc) => {
  try {
    if (!kichThuoc || typeof kichThuoc !== 'object') {
      throw new Error('Dữ liệu chất liệu không hợp lệ');
    }
    const response = await axiosInstance.post('', kichThuoc);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Thêm thất bại'
    );
  }
};

// Cập nhật chất liệu
export const updateKichThuoc = async (id, kichThuoc) => {
  try {
    if (!id || !kichThuoc || typeof kichThuoc !== 'object') {
      throw new Error('ID hoặc dữ liệu chất liệu không hợp lệ');
    }
    const response = await axiosInstance.put(`/${id}`, kichThuoc);
    return response.data; // Trả về dữ liệu từ server (nếu backend có trả về)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Cập nhật chất liệu thất bại'
    );
  }
};

// Xóa chất liệu
export const deleteKichThuoc = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    await axiosInstance.delete(`/${id}`);
    return { success: true, message: 'Xóa chất liệu thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Xóa chất liệu thất bại'
    );
  }
};