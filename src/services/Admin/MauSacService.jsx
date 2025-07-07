import axios from 'axios';

const API_URL = 'http://localhost:8080/api/mau-sac';

// Cấu hình axios với timeout, baseURL và xử lý lỗi chung
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm xử lý lỗi chung
const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Lỗi không xác định từ server';
  throw new Error(message);
};

// Lấy tất cả màu sắc với phân trang
export const getAllMauSac = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/all', {
      params: { page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    handleError(error);
  }
};

// Thêm màu sắc mới
export const addMauSac = async (mauSac) => {
  try {
    if (!mauSac || typeof mauSac !== 'object' || !mauSac.ma || !mauSac.ten) {
      throw new Error('Dữ liệu Màu Sắc không hợp lệ. Vui lòng cung cấp mã và tên.');
    }
    const response = await axiosInstance.post('', mauSac);
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    handleError(error);
  }
};

// Cập nhật màu sắc
export const updateMauSac = async (id, mauSac) => {
  try {
    if (!id || !mauSac || typeof mauSac !== 'object' || !mauSac.ma || !mauSac.ten) {
      throw new Error('ID hoặc dữ liệu Màu Sắc không hợp lệ. Vui lòng cung cấp mã và tên.');
    }
    const response = await axiosInstance.put(`/${id}`, mauSac);
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    handleError(error);
  }
};

// Xóa màu sắc
export const deleteMauSac = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
   const response = await axiosInstance.put(`/toggle-status/${id}`);
    return { success: true, message: 'Xóa Màu Sắc thành công' };
  } catch (error) {
    handleError(error);
  }
};

// Tìm kiếm màu sắc theo từ khóa (khớp với tên hoặc mã)
export const searchMauSacByKeyword = async (keyword = '', page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/search', {
      params: { keyword: keyword.trim(), page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    handleError(error);
  }
};