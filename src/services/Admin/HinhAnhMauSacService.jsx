import axios from 'axios';
import { toast } from 'react-toastify'; // Tùy chọn, nếu bạn dùng thư viện thông báo

// Định nghĩa URL với biến môi trường Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const STATIC_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:8080';

// Lấy danh sách hình ảnh theo mauSacId
export const getHinhAnhByMauSacId = async (mauSacId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/hinh-anh-mau-sac/mau-sac/${mauSacId}`, {
      timeout: 10000,
    });
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((hinhAnh) => ({
        ...hinhAnh,
        hinhAnh: hinhAnh.hinhAnh.startsWith('/uploads/')
          ? `${STATIC_URL}${hinhAnh.hinhAnh}`
          : `${STATIC_URL}/uploads/${hinhAnh.hinhAnh}`, // đảm bảo frontend luôn có ảnh đầy đủ
      }));
    }
    throw new Error('Dữ liệu trả về không hợp lệ');
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hình ảnh:', error);
    toast.error(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể tải hình ảnh'}`);
    throw error;
  }
};

// ✅ Upload hình ảnh và TRẢ VỀ TÊN FILE (VD: "balo81.jpg")
export const uploadHinhAnhMauSac = async (file, mauSacId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mauSacId', mauSacId);

    const response = await axios.post(`${BASE_URL}/api/hinh-anh-mau-sac/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    console.log('📦 Upload response:', response.data);

    if (response.data && typeof response.data === 'string') {
      toast.success('Tải ảnh thành công');
      return response.data; // chỉ là "balo81.jpg"
    }

    throw new Error('Phản hồi từ server không hợp lệ');
  } catch (error) {
    console.error('Lỗi khi upload ảnh:', error);
    toast.error(`Lỗi: ${error.response?.data?.message || error.message || 'Upload thất bại'}`);
    throw error;
  }
};

// ✅ Thêm hình ảnh (chỉ gửi tên file, không có /uploads/)
export const addHinhAnhMauSac = async (hinhAnhData) => {
  try {
    const payload = {
      ...hinhAnhData,
      hinhAnh: hinhAnhData.hinhAnh?.replace('/uploads/', '') || '',
    };

    const response = await axios.post(`${BASE_URL}/api/hinh-anh-mau-sac`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    toast.success('Thêm hình ảnh thành công');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm hình ảnh:', error);
    toast.error(`Lỗi: ${error.response?.data?.message || error.message || 'Thêm thất bại'}`);
    throw error;
  }
};

// Cập nhật hình ảnh
export const updateHinhAnhMauSac = async (id, hinhAnhData) => {
  try {
    const payload = {
      ...hinhAnhData,
      hinhAnh: hinhAnhData.hinhAnh?.replace('/uploads/', '') || '',
    };

    const response = await axios.put(`${BASE_URL}/api/hinh-anh-mau-sac/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    toast.success('Cập nhật hình ảnh thành công');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật hình ảnh:', error);
    toast.error(`Lỗi: ${error.response?.data?.message || error.message || 'Cập nhật thất bại'}`);
    throw error;
  }
};

// Xóa mềm hình ảnh
export const deleteHinhAnhMauSac = async (id) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/hinh-anh-mau-sac/toggle-status/${id}`,
      null,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    toast.success('Xóa hình ảnh thành công');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa hình ảnh:', error);
    toast.error(`Lỗi: ${error.response?.data?.message || error.message || 'Xóa thất bại'}`);
    throw error;
  }
};

// Export tất cả
export default {
  getHinhAnhByMauSacId,
  addHinhAnhMauSac,
  updateHinhAnhMauSac,
  deleteHinhAnhMauSac,
  uploadHinhAnhMauSac,
};
