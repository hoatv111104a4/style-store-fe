import axios from 'axios';
const API_URL = 'http://localhost:8080/api/admin-san-pham';
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const getAllSP = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/all', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải danh sách sản phẩm'
    );
  }
};

export const getActiveSP = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/active', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải danh sách sản phẩm hoạt động'
    );
  }
};

export const getDeletedSP = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/deleted', {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải danh sách sản phẩm đã xóa'
    );
  }
};

export const searchSPWithQuantity = async (search = '', page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get('/search', {
      params: { search, page, size },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tìm kiếm sản phẩm'
    );
  }
};

export const getOneSP = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lấy sản phẩm'
    );
  }
};

export const addSP = async (sanPham) => {
  try {
    if (!sanPham || typeof sanPham !== 'object') {
      throw new Error('Dữ liệu không hợp lệ');
    }
    console.log('Sending addSP request:', sanPham);
    const response = await axiosInstance.post('', sanPham);
    console.log('addSP response:', response);
    console.log('addSP response.data:', response.data);
    if (!response.data?.id) {
      throw new Error('Phản hồi từ server không chứa ID sản phẩm');
    }
    return response.data;
  } catch (error) {
    console.error('addSP error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || 'Thêm sản phẩm thất bại'
    );
  }
};

export const updateSP = async (id, sanPham) => {
  try {
    if (!id || !sanPham || typeof sanPham !== 'object') {
      throw new Error('ID hoặc dữ liệu không hợp lệ');
    }
    const response = await axiosInstance.put(`/${id}`, sanPham);
    return response.data || { success: true, message: 'Cập nhật sản phẩm thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Cập nhật sản phẩm thất bại'
    );
  }
};

export const toggleStatusSP = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    const response = await axiosInstance.put(`/toggle-status/${id}`);
    return response.data || { success: true, message: 'Chuyển đổi trạng thái sản phẩm thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Chuyển đổi trạng thái sản phẩm thất bại'
    );
  }
};
