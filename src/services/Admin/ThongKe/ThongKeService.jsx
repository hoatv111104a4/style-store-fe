import axios from 'axios';

const API_URL = 'http://localhost:8080/api/thong-ke';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gọi thống kê theo tháng
export const thongKeTheoThang = (thang, nam) => {
  return axiosInstance.get(`/san-pham/thang`, {
    params: { thang, nam },
  });
};

// Gọi thống kê theo năm
export const thongKeTheoNam = (nam) => {
  return axiosInstance.get(`/san-pham/nam`, {
    params: { nam },
  });
};

// Gọi thống kê theo tuần
export const thongKeTheoTuan = (tuan, nam) => {
  return axiosInstance.get(`/san-pham/tuan`, {
    params: { tuan, nam },
  });
};