import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin-san-pham';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.warn('⚠️ Không tìm thấy token trong localStorage');
  }
  return token;
};

// Interceptor: tự động gắn token nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: xử lý lỗi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Token không hợp lệ hoặc đã hết hạn');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================= API =================

// Lấy danh sách tất cả sản phẩm
export const getAllSP = async (page = 0, size = 10) => {
  const response = await axiosInstance.get('/all', { params: { page, size } });
  return response.data;
};

// Lấy danh sách sản phẩm đang hoạt động
export const getActiveSP = async (page = 0, size = 10) => {
  const response = await axiosInstance.get('/active', { params: { page, size } });
  return response.data;
};

// Lấy danh sách sản phẩm đã xoá
export const getDeletedSP = async (page = 0, size = 10) => {
  const response = await axiosInstance.get('/deleted', { params: { page, size } });
  return response.data;
};

// Tìm kiếm sản phẩm (kèm số lượng)
export const searchSPWithQuantity = async (search = '', page = 0, size = 10) => {
  const response = await axiosInstance.get('/search', { params: { search, page, size } });
  return response.data;
};

// Lấy một sản phẩm theo ID
export const getOneSP = async (id) => {
  if (!id || isNaN(id)) throw new Error('ID không hợp lệ');
  const response = await axiosInstance.get(`/${id}`);
  return response.data;
};

// Thêm sản phẩm mới
export const addSP = async (sanPham) => {
  if (!sanPham || typeof sanPham !== 'object' || !sanPham.ten?.trim()) {
    throw new Error('Dữ liệu sản phẩm không hợp lệ');
  }
  const response = await axiosInstance.post('', sanPham);
  if (!response.data?.id) throw new Error('Phản hồi từ server không chứa ID sản phẩm');
  return response.data;
};

// Cập nhật sản phẩm
export const updateSP = async (id, sanPham) => {
  if (!id || isNaN(id) || !sanPham || typeof sanPham !== 'object') {
    throw new Error('ID hoặc dữ liệu không hợp lệ');
  }
  const response = await axiosInstance.put(`/${id}`, sanPham);
  return response.data;
};

// Chuyển đổi trạng thái (ẩn/hiện)
export const toggleStatusSP = async (id) => {
  if (!id || isNaN(id)) throw new Error('ID không hợp lệ');
  const response = await axiosInstance.put(`/toggle-status/${id}`);
  return response.data;
};

// Xóa sản phẩm (thật ra là cập nhật trạng thái)
export const deleteSP = async (id) => {
  if (!id || isNaN(id)) throw new Error('ID không hợp lệ');
  const response = await axiosInstance.put(`/${id}`);
  return response.data;
};

export default axiosInstance;
