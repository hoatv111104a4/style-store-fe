import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin-san-pham-chi-tiet';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để gửi token xác thực
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 (token hết hạn)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Chuyển hướng đến trang đăng nhập hoặc làm mới token
      throw new Error('Phiên đăng nhập đã hết hạn');
    }
    return Promise.reject(error);
  }
);

// Hàm retry cho các API quan trọng
const retry = async (fn, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const getAllSanPhamCt = async (page = 0, size = 10) => {
  try {
    if (page < 0 || size <= 0) {
      throw new Error('Page hoặc size không hợp lệ');
    }
    const response = await retry(() =>
      axiosInstance.get('', {
        params: { page, size },
      })
    );
    return response.data; // Cập nhật nếu backend trả về Map
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải danh sách sản phẩm chi tiết'
    );
  }
};

export const getSanPhamCtByTrangThai = async (trangThai, page = 0, size = 10) => {
  try {
    if (!Number.isInteger(trangThai) || page < 0 || size <= 0) {
      throw new Error('Trạng thái, page hoặc size không hợp lệ');
    }
    const response = await retry(() =>
      axiosInstance.get(`/trang-thai/${trangThai}`, {
        params: { page, size },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải sản phẩm theo trạng thái'
    );
  }
};

export const searchSanPhamCtByTen = async (ten, page = 0, size = 10) => {
  try {
    if (page < 0 || size <= 0) {
      throw new Error('Page hoặc size không hợp lệ');
    }
    if (!ten || ten.trim().length === 0) {
      return await getAllSanPhamCt(page, size);
    }
    const response = await retry(() =>
      axiosInstance.get('/search', {
        params: { ten: ten.trim(), page, size },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tìm kiếm sản phẩm'
    );
  }
};

export const getSanPhamCtById = async (id) => {
  try {
    if (!id || id <= 0) {
      throw new Error('ID không hợp lệ');
    }
    const response = await retry(() => axiosInstance.get(`/${id}`));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lấy sản phẩm chi tiết'
    );
  }
};

export const getSanPhamCtByMa = async (ma) => {
  try {
    if (!ma || ma.trim().length === 0) {
      throw new Error('Mã không hợp lệ');
    }
    const response = await retry(() => axiosInstance.get(`/ma/${ma.trim()}`));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lấy sản phẩm theo mã'
    );
  }
};

export const getSanPhamCtBySanPhamId = async (sanPhamId, page = 0, size = 10) => {
  try {
    if (!sanPhamId || sanPhamId <= 0 || page < 0 || size <= 0) {
      throw new Error('ID sản phẩm, page hoặc size không hợp lệ');
    }
    const response = await retry(() =>
      axiosInstance.get(`/san-pham/${sanPhamId}`, {
        params: { page, size },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lấy danh sách sản phẩm chi tiết'
    );
  }
};

export const getSanPhamCtByMauSacId = async (mauSacId, page = 0, size = 10) => {
  try {
    if (!mauSacId || mauSacId <= 0 || page < 0 || size <= 0) {
      throw new Error('ID màu sắc, page hoặc size không hợp lệ');
    }
    const response = await retry(() =>
      axiosInstance.get(`/mau-sac/${mauSacId}`, {
        params: { page, size },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lấy danh sách sản phẩm chi tiết theo màu sắc'
    );
  }
};

export const addSanPhamCt = async (sanPhamCtDTO) => {
  try {
    if (!sanPhamCtDTO || typeof sanPhamCtDTO !== 'object') {
      throw new Error('Dữ liệu sản phẩm chi tiết không hợp lệ');
    }
    // Validation chi tiết cho SanPhamCtDTO
    if (!sanPhamCtDTO.sanPhamId || sanPhamCtDTO.sanPhamId <= 0) {
      throw new Error('ID sản phẩm không hợp lệ');
    }
    if (!sanPhamCtDTO.mauSacId || sanPhamCtDTO.mauSacId <= 0) {
      throw new Error('ID màu sắc không hợp lệ');
    }
    if (!sanPhamCtDTO.thuongHieuId || sanPhamCtDTO.thuongHieuId <= 0) {
      throw new Error('ID thương hiệu không hợp lệ');
    }
    if (!sanPhamCtDTO.kichThuocId || sanPhamCtDTO.kichThuocId <= 0) {
      throw new Error('ID kích thước không hợp lệ');
    }
    if (!sanPhamCtDTO.xuatXuId || sanPhamCtDTO.xuatXuId <= 0) {
      throw new Error('ID xuất xứ không hợp lệ');
    }
    if (!sanPhamCtDTO.chatLieuId || sanPhamCtDTO.chatLieuId <= 0) {
      throw new Error('ID chất liệu không hợp lệ');
    }
    if (sanPhamCtDTO.hinhAnhMauSacId && sanPhamCtDTO.hinhAnhMauSacId <= 0) {
      throw new Error('ID hình ảnh màu sắc không hợp lệ');
    }
    if (!sanPhamCtDTO.giaBan || isNaN(Number(sanPhamCtDTO.giaBan)) || Number(sanPhamCtDTO.giaBan) <= 0) {
      throw new Error('Giá bán phải là số và lớn hơn 0');
    }
    if (sanPhamCtDTO.soLuong === null || isNaN(Number(sanPhamCtDTO.soLuong)) || Number(sanPhamCtDTO.soLuong) < 0) {
      throw new Error('Số lượng phải là số và không được nhỏ hơn 0');
    }
    if (sanPhamCtDTO.giaNhap && (isNaN(Number(sanPhamCtDTO.giaNhap)) || Number(sanPhamCtDTO.giaNhap) < 0)) {
      throw new Error('Giá nhập phải là số và không âm');
    }
    const response = await retry(() => axiosInstance.post('', sanPhamCtDTO));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Thêm sản phẩm chi tiết thất bại'
    );
  }
};

export const updateSanPhamCt = async (id, sanPhamCtDTO) => {
  try {
    if (!id || id <= 0 || !sanPhamCtDTO || typeof sanPhamCtDTO !== 'object') {
      throw new Error('ID hoặc dữ liệu sản phẩm chi tiết không hợp lệ');
    }
    // Validation chi tiết cho SanPhamCtDTO
    if (!sanPhamCtDTO.sanPhamId || sanPhamCtDTO.sanPhamId <= 0) {
      throw new Error('ID sản phẩm không hợp lệ');
    }
    if (!sanPhamCtDTO.mauSacId || sanPhamCtDTO.mauSacId <= 0) {
      throw new Error('ID màu sắc không hợp lệ');
    }
    if (!sanPhamCtDTO.thuongHieuId || sanPhamCtDTO.thuongHieuId <= 0) {
      throw new Error('ID thương hiệu không hợp lệ');
    }
    if (!sanPhamCtDTO.kichThuocId || sanPhamCtDTO.kichThuocId <= 0) {
      throw new Error('ID kích thước không hợp lệ');
    }
    if (!sanPhamCtDTO.xuatXuId || sanPhamCtDTO.xuatXuId <= 0) {
      throw new Error('ID xuất xứ không hợp lệ');
    }
    if (!sanPhamCtDTO.chatLieuId || sanPhamCtDTO.chatLieuId <= 0) {
      throw new Error('ID chất liệu không hợp lệ');
    }
    if (sanPhamCtDTO.hinhAnhMauSacId && sanPhamCtDTO.hinhAnhMauSacId <= 0) {
      throw new Error('ID hình ảnh màu sắc không hợp lệ');
    }
    if (!sanPhamCtDTO.giaBan || isNaN(Number(sanPhamCtDTO.giaBan)) || Number(sanPhamCtDTO.giaBan) <= 0) {
      throw new Error('Giá bán phải là số và lớn hơn 0');
    }
    if (sanPhamCtDTO.soLuong === null || isNaN(Number(sanPhamCtDTO.soLuong)) || Number(sanPhamCtDTO.soLuong) < 0) {
      throw new Error('Số lượng phải là số và không được nhỏ hơn 0');
    }
    if (!sanPhamCtDTO.ma || sanPhamCtDTO.ma.trim().length === 0) {
      throw new Error('Mã sản phẩm chi tiết không hợp lệ');
    }
    const response = await retry(() => axiosInstance.put(`/${id}`, sanPhamCtDTO));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Cập nhật sản phẩm chi tiết thất bại'
    );
  }
};

export const deleteSanPhamCt = async (id) => {
  try {
    if (!id || id <= 0) {
      throw new Error('ID không hợp lệ');
    }
    await retry(() => axiosInstance.delete(`/${id}`));
    return { success: true, message: 'Xóa sản phẩm chi tiết thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Xóa sản phẩm chi tiết thất bại'
    );
  }
};
