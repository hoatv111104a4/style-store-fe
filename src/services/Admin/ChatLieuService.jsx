import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chat-lieu';

// Cấu hình axios với timeout và baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lấy danh sách chất liệu với hỗ trợ phân trang
export const getAllChatLieu = async (page = 0, size = 10) => {
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
export const addChatLieu = async (chatLieu) => {
  try {
    if (!chatLieu || typeof chatLieu !== 'object') {
      throw new Error('Dữ liệu chất liệu không hợp lệ');
    }
    const response = await axiosInstance.post('', chatLieu);
    return response.data; // Trả về dữ liệu từ server (nếu backend có trả về)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Thêm chất liệu thất bại'
    );
  }
};

// Cập nhật chất liệu
export const updateChatLieu = async (id, chatLieu) => {
  try {
    if (!id || !chatLieu || typeof chatLieu !== 'object') {
      throw new Error('ID hoặc dữ liệu chất liệu không hợp lệ');
    }
    const response = await axiosInstance.put(`/${id}`, chatLieu);
    return response.data; // Trả về dữ liệu từ server (nếu backend có trả về)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Cập nhật chất liệu thất bại'
    );
  }
};

// Xóa chất liệu
export const deleteChatLieu = async (id) => {
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
export const searchChatLieuByName = async (ten, page = 0, size = 10) => {
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