import axios from "axios";

const API_URL = 'http://localhost:8080/api/thong-ke';

// Tạo axios instance chung
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dịch vụ gọi API thống kê
const ThongKeService = {
  // Lấy thống kê doanh thu theo ngày
  async getDoanhThuTheoNgay(date) {
    try {
      const response = await axiosInstance.get('/doanh-thu/ngay', {
        params: date ? { date } : {}, // Chỉ gửi date nếu có
      });
      return response.data; // Trả về danh sách DoanhThuDTO
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu theo ngày:', error.response?.data || error.message);
      throw error; // Ném lỗi để xử lý ở nơi gọi
    }
  },

  // Lấy thống kê doanh thu theo tuần
  async getDoanhThuTheoTuan() {
    try {
      const response = await axiosInstance.get('/doanh-thu/tuan');
      return response.data; // Trả về danh sách DoanhThuDTO
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu theo tuần:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy thống kê doanh thu theo tháng
  async getDoanhThuTheoThang() {
    try {
      const response = await axiosInstance.get('/doanh-thu/thang');
      return response.data; // Trả về danh sách DoanhThuDTO
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu theo tháng:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy thống kê doanh thu theo năm
  async getDoanhThuTheoNam() {
    try {
      const response = await axiosInstance.get('/doanh-thu/nam');
      return response.data; // Trả về danh sách DoanhThuDTO
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu theo năm:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy thống kê sản phẩm bán chạy
  async getSanPhamBanChay() {
    try {
      const response = await axiosInstance.get('/san-pham-ban-chay');
      return response.data; // Trả về danh sách SanPhamBanChayDTO
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm bán chạy:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Xuất dịch vụ để sử dụng trong ứng dụng
export default ThongKeService;