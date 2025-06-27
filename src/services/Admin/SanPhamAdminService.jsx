
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin-san-pham';

// Cấu hình axios với timeout và baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllSP = async (page = 0, size = 10) => {
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

export const getActiveSP = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/active', {
      params: { page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Không thể tải dữ liệu hoạt động từ server'
    );
  }
};

export const getDeletedSP = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/deleted', {
      params: { page, size },
    });
    return response.data; // Trả về dữ liệu phân trang từ server
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Không thể tải dữ liệu đã xóa từ server'
    );
  }
};

export const searchSPWithQuantity = async (search = '', page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/search', {
      params: { search, page, size },
    });
    return response.data; // Trả về dữ liệu phân trang với tổng số lượng
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Không thể tìm kiếm sản phẩm từ server'
    );
  }
};

export const getOneSP = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    const response = await axiosInstance.get(`/${id}`);
    return response.data; // Trả về sản phẩm theo ID
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Không thể lấy sản phẩm từ server'
    );
  }
};

export const addSP = async (sanPham) => {
  try {
    if (!sanPham || typeof sanPham !== 'object') {
      throw new Error('Dữ liệu không hợp lệ');
    }
    console.log('Sending addSP request:', sanPham); // Debug dữ liệu gửi đi
    const response = await axiosInstance.post('', sanPham);
    console.log('addSP response:', response); // Debug toàn bộ phản hồi
    console.log('addSP response.data:', response.data); // Debug dữ liệu phản hồi
    if (!response.data?.id) {
      throw new Error('Phản hồi từ server không chứa ID sản phẩm');
    }
    return response.data; // Trả về dữ liệu phản hồi
  } catch (error) {
    console.error('addSP error:', error.response?.data || error.message); // Debug lỗi
    throw new Error(
      error.response?.data?.message || 'Thêm sản phẩm thất bại'
    );
  }
};
export const updateSP = async (id, sanPham) => {
  try {
    if (!id || !sanPham || typeof sanPham !== 'object') {
      throw new Error('ID hoặc dữ liệu không hợp lệ');
    }
    const response = await axiosInstance.put(`/${id}`, sanPham);
    return response.data || { success: true, message: 'Cập nhật thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Cập nhật thất bại'
    );
  }
};

export const deleteSP = async (id) => {
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
