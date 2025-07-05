import axiosInstance from '../../axiosInstance'; // Giả định đã cấu hình interceptor cho token
import { toast } from 'react-toastify'; // Tùy chọn, nếu bạn dùng thư viện thông báo

const BASE_URL = 'http://localhost:8080'; // Đổi BASE_URL để không bao gồm /api cho tài nguyên tĩnh
const STATIC_URL = 'http://localhost:8080'; // Định nghĩa riêng cho tài nguyên tĩnh

// Lấy danh sách hình ảnh theo mauSacId
export const getHinhAnhByMauSacId = async (mauSacId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/api/hinh-anh-mau-sac/mau-sac/${mauSacId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((hinhAnh) => ({
        ...hinhAnh,
        hinhAnh: hinhAnh.hinhAnh.startsWith('http') ? hinhAnh.hinhAnh : `${STATIC_URL}${hinhAnh.hinhAnh}`,
      }));
    }
    throw new Error('Dữ liệu trả về không hợp lệ');
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hình ảnh:', error);
    if (error.response) {
      toast.error(`Lỗi: ${error.response.data.message || 'Không thể tải hình ảnh'}`);
    } else {
      toast.error(`Lỗi: ${error.message || 'Kết nối đến server thất bại'}`);
    }
    throw error; // Ném lỗi để xử lý ở component
  }
};

// Thêm mới hình ảnh (nếu cần, tùy thuộc vào yêu cầu backend)
export const addHinhAnhMauSac = async (hinhAnhData) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/api/hinh-anh-mau-sac`, hinhAnhData);
    toast.success('Thêm hình ảnh thành công');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm hình ảnh:', error);
    if (error.response) {
      toast.error(`Lỗi: ${error.response.data.message || 'Thêm hình ảnh thất bại'}`);
    } else {
      toast.error(`Lỗi: ${error.message || 'Kết nối đến server thất bại'}`);
    }
    throw error;
  }
};

// Cập nhật hình ảnh (nếu cần)
export const updateHinhAnhMauSac = async (id, hinhAnhData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/api/hinh-anh-mau-sac/${id}`, hinhAnhData);
    toast.success('Cập nhật hình ảnh thành công');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh:', error);
    if (error.response) {
      toast.error(`Lỗi: ${error.response.data.message || 'Cập nhật hình ảnh thất bại'}`);
    } else {
      toast.error(`Lỗi: ${error.message || 'Kết nối đến server thất bại'}`);
    }
    throw error;
  }
};

// Xóa hình ảnh (nếu cần)
export const deleteHinhAnhMauSac = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/api/hinh-anh-mau-sac/${id}`);
    toast.success('Xóa hình ảnh thành công');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa hình ảnh:', error);
    if (error.response) {
      toast.error(`Lỗi: ${error.response.data.message || 'Xóa hình ảnh thất bại'}`);
    } else {
      toast.error(`Lỗi: ${error.message || 'Kết nối đến server thất bại'}`);
    }
    throw error;
  }
};

export default {
  getHinhAnhByMauSacId,
  addHinhAnhMauSac,
  updateHinhAnhMauSac,
  deleteHinhAnhMauSac,
};