import axios from 'axios';

const API_URL = 'http://localhost:8080/api/mau-sac';

// Cấu hình axios với timeout và baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getAllMauSac = async (page = 0, size = 10) => {
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
export const addMauSac = async (mauSac) => {
  try {
    if (!mauSac || typeof mauSac !== 'object') {
      throw new Error('Dữ liệu Màu Sắc không hợp lệ');
    }
    const response = await axiosInstance.post('', mauSac);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Thêm thất bại'
    );
  }
};

// Cập nhật chất liệu
export const updateMauSac = async (id, mauSac) => {
  try {
    if (!id || !mauSac || typeof mauSac !== 'object') {
      throw new Error('ID hoặc dữ liệu Màu Sắc không hợp lệ');
    }
    const response = await axiosInstance.put(`/${id}`, mauSac);
    return response.data; // Trả về dữ liệu từ server (nếu backend có trả về)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Cập nhật Màu Sắc thất bại'
    );
  }
};

// Xóa chất liệu
export const deleteMauSac = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    await axiosInstance.delete(`/${id}`);
    return { success: true, message: 'Xóa Màu Sắc thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Xóa Màu Sắc thất bại'
    );
  }
};