import axios from 'axios';

const API_URL = 'http://localhost:8080/api/thuong-hieu';

// Cấu hình axios với timeout và baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getAllThuongHieu = async (page = 0, size = 10) => {
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
export const addThuongHieu = async (thuongHieu) => {
  try {
    if (!thuongHieu || typeof thuongHieu !== 'object') {
      throw new Error('Dữ liệu không hợp lệ');
    }
    const response = await axiosInstance.post('', thuongHieu);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Thêm thất bại'
    );
  }
};

// Cập nhật chất liệu
export const updateThuongHieu = async (id, thuongHieu) => {
  try {
    if (!id || !thuongHieu || typeof thuongHieu !== 'object') {
      throw new Error('ID hoặc dữ liệu không hợp lệ');
    }
    const response = await axiosInstance.put(`/${id}`, thuongHieu);
    return response.data; // Trả về dữ liệu từ server (nếu backend có trả về)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Cập nhật thất bại'
    );
  }
};

// Xóa chất liệu
export const deleteThuongHieu = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    await axiosInstance.delete(`/${id}`);
    return { success: true, message: 'Xóa thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Xóa thất bại'
    );
  }
};