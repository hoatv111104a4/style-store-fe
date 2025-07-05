import axios from 'axios';

const API_URL = 'http://localhost:8080/api/kich-thuoc';

// Cấu hình axios với timeout và baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👇 Gắn token Authorization cho mọi request (nếu có)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // hoặc 'access_token', tùy bạn lưu key nào
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
export const deleteKichThuoc = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }

     const response = await axiosInstance.put(`/toggle-status/${id}`);
    return { success: true, message: 'Xóa kích thước thành công' };
  } catch (error) {
    console.error('🔥 Lỗi khi xóa kích thước:', error); // 👈 Thêm dòng này để in lỗi chi tiết
    throw new Error(
      error.response?.data?.message || 'Xóa kích thước thất bại'
    );
  }
};




// Tìm kiếm chất liệu theo tên
export const searchKichThuocByName = async (ten, page = 0, size = 10) => {
  try {
    if (!ten || typeof ten !== 'string' || ten.trim() === '') {
      throw new Error('Tên chất liệu tìm kiếm không hợp lệ');
    }
    const response = await axiosInstance.get('/search', {
      params: { ten, page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Tìm kiếm chất liệu thất bại'
    );
  }
};

// Tìm kiếm chất liệu theo tên hoặc mã
export const searchKichThuocByNameOrCode = async (keyword, page = 0, size = 10) => {
  try {
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      throw new Error('Từ khóa tìm kiếm không hợp lệ');
    }
    const response = await axiosInstance.get('/search-by-name-or-code', {
      params: { keyword, page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Tìm kiếm chất liệu thất bại'
    );
  }
};