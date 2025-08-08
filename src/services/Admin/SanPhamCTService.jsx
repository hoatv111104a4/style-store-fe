import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin-san-pham-chi-tiet';
const PUBLIC_API_URL = 'http://localhost:8080/api';

// Tạo instance cho các endpoint yêu cầu xác thực
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tạo instance riêng cho các endpoint công khai
export const axiosPublicInstance = axios.create({
  baseURL: PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho axiosInstance (thêm token cho các endpoint yêu cầu xác thực)
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

// Interceptor xử lý lỗi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn');
    }
    return Promise.reject(error);
  }
);

// Hàm retry cho các yêu cầu
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

// Lấy hình ảnh theo màu sắc (endpoint công khai)
export const getHinhAnhByMauSacId = async (mauSacId) => {
  try {
    if (!mauSacId || mauSacId <= 0) {
      throw new Error('ID màu sắc không hợp lệ');
    }
    const response = await retry(() =>
      axiosPublicInstance.get(`/hinh-anh-mau-sac/mau-sac/${mauSacId}`)
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lấy danh sách hình ảnh theo màu sắc'
    );
  }
};

// Lấy tất cả sản phẩm chi tiết
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
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể tải danh sách sản phẩm chi tiết'
    );
  }
};

// Lấy sản phẩm chi tiết theo trạng thái
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

/// Tìm kiếm sản phẩm chi tiết theo mã
export const searchSanPhamCtByMa = async (ten, page = 0, size = 10) => {
  try {
    if (page < 0 || size <= 0) {
      throw new Error('Page hoặc size không hợp lệ');
    }

    // Nếu không nhập mã, gọi API lấy tất cả
    if (!ten || ten.trim().length === 0) {
      return await getAllSanPhamCt(page, size); // -> hàm này bạn đã định nghĩa trước
    }

    // Gọi API tìm kiếm theo mã
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

// Lấy sản phẩm chi tiết theo ID
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

// Lấy sản phẩm chi tiết theo mã
// export const getSanPhamCtByMa = async (ma) => {
//   try {
//     if (!ma || ma.trim().length === 0) {
//       throw new Error('Mã không hợp lệ');
//     }
//     const response = await retry(() => axiosInstance.get(`/ma/${ma.trim()}`));
//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.error || 'Không thể lấy sản phẩm theo mã'
//     );
//   }
// };

// Lấy sản phẩm chi tiết theo sanPhamId
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

// Lấy sản phẩm chi tiết theo mauSacId
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

// Lọc sản phẩm chi tiết
export const filterSanPhamCt = async ({
  sanPhamId = null,
  mauSacId = null,
  thuongHieuId = null,
  kichThuocId = null,
  xuatXuId = null,
  chatLieuId = null,
  minPrice = null,
  maxPrice = null,
  minQuantity = null,
  maxQuantity = null,
  startDate = null,
  endDate = null,
  page = 0,
  size = 10,
}) => {
  try {
    if (page < 0 || size <= 0) {
      throw new Error('Page hoặc size không hợp lệ');
    }
    if (minPrice && (isNaN(Number(minPrice)) || Number(minPrice) < 0)) {
      throw new Error('Giá tối thiểu không hợp lệ');
    }
    if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) < 0)) {
      throw new Error('Giá tối đa không hợp lệ');
    }
    if (minQuantity && (isNaN(Number(minQuantity)) || Number(minQuantity) < 0)) {
      throw new Error('Số lượng tối thiểu không hợp lệ');
    }
    if (maxQuantity && (isNaN(Number(maxQuantity)) || Number(maxQuantity) < 0)) {
      throw new Error('Số lượng tối đa không hợp lệ');
    }
    if (sanPhamId && sanPhamId <= 0) {
      throw new Error('ID sản phẩm không hợp lệ');
    }
    if (mauSacId && mauSacId <= 0) {
      throw new Error('ID màu sắc không hợp lệ');
    }
    if (thuongHieuId && thuongHieuId <= 0) {
      throw new Error('ID thương hiệu không hợp lệ');
    }
    if (kichThuocId && kichThuocId <= 0) {
      throw new Error('ID kích thước không hợp lệ');
    }
    if (xuatXuId && xuatXuId <= 0) {
      throw new Error('ID xuất xứ không hợp lệ');
    }
    if (chatLieuId && chatLieuId <= 0) {
      throw new Error('ID chất liệu không hợp lệ');
    }
    const response = await retry(() =>
      axiosInstance.get('/filter', {
        params: {
          sanPhamId,
          mauSacId,
          thuongHieuId,
          kichThuocId,
          xuatXuId,
          chatLieuId,
          minPrice,
          maxPrice,
          minQuantity,
          maxQuantity,
          startDate,
          endDate,
          page,
          size,
        },
      })
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Không thể lọc sản phẩm chi tiết'
    );
  }
};

// Thêm sản phẩm chi tiết
export const addSanPhamCt = async (sanPhamCtDTO) => {
  try {
    if (!sanPhamCtDTO || typeof sanPhamCtDTO !== 'object') {
      throw new Error('Dữ liệu sản phẩm chi tiết không hợp lệ');
    }
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
    if (sanPhamCtDTO.soLuong === null || isNaN(Number(sanPhamCtDTO.soLuong)) || Number(sanPhamCtDTO.soLuong) <= 0) {
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
};// SanPhamCTService.jsx
// SanPhamCTService.jsx
// Cập nhật sản phẩm chi tiết
export const updateSanPhamCt = async (id, sanPhamCtDTO) => {
  try {
    // Kiểm tra ID và DTO
    if (!id || id <= 0 || !sanPhamCtDTO || typeof sanPhamCtDTO !== 'object') {
      throw new Error('ID hoặc dữ liệu sản phẩm chi tiết không hợp lệ');
    }
    // Kiểm tra các trường bắt buộc
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
    if (!sanPhamCtDTO.giaBanGoc || isNaN(Number(sanPhamCtDTO.giaBanGoc)) || Number(sanPhamCtDTO.giaBanGoc) <= 0) {
      throw new Error('Giá bán gốc phải là số và lớn hơn 0');
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
    console.error('API Error Response:', error.response, 'Data:', error.response?.data); // Log chi tiết
    // Xử lý các định dạng response lỗi từ backend
    let errorMessage = 'Cập nhật sản phẩm chi tiết thất bại';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data; // Backend trả về chuỗi trực tiếp
      } else {
        errorMessage = error.response.data.error || 
                       error.response.data.message || 
                       error.response.data.msg || 
                       JSON.stringify(error.response.data) || 
                       error.message || 
                       'Cập nhật sản phẩm chi tiết thất bại';
      }
    } else {
      errorMessage = error.message || 'Cập nhật sản phẩm chi tiết thất bại';
    }

    // Xử lý các lỗi cụ thể từ backend
    if (errorMessage.includes('Không thể cập nhật giá gốc khi sản phẩm đang trong đợt giảm giá')) {
      throw new Error('Không thể cập nhật giá gốc vì sản phẩm chi tiết đang trong đợt giảm giá');
    }
    if (errorMessage.includes('Sản phẩm chi tiết không tồn tại')) {
      throw new Error('Sản phẩm chi tiết không tồn tại');
    }
    if (errorMessage.includes('trạng thái 2')) {
      throw new Error('Không thể cập nhật sản phẩm chi tiết có trạng thái Tạm Ngưng hoặc thuộc sản phẩm Tạm Ngưng');
    }
    if (errorMessage.includes('Hình ảnh màu sắc không thuộc màu sắc đã chọn')) {
      throw new Error('Hình ảnh màu sắc không thuộc màu sắc đã chọn');
    }
    if (errorMessage.includes('Hình ảnh màu sắc không tồn tại hoặc không hoạt động')) {
      throw new Error('Hình ảnh màu sắc không tồn tại hoặc không hoạt động');
    }
    if (errorMessage.includes('Mã sản phẩm chi tiết đã tồn tại')) {
      throw new Error('Mã sản phẩm chi tiết đã tồn tại');
    }

    throw new Error(errorMessage);
  }
};
// Xóa (toggle trạng thái) sản phẩm chi tiết
export const deleteSanPhamCt = async (id) => {
  try {
    if (!id || id <= 0) {
      throw new Error('ID không hợp lệ');
    }
    const response = await retry(() => axiosInstance.put(`/toggle-status/${id}`));
    return { success: true, message: 'Cập nhật trạng thái sản phẩm chi tiết thành công' };
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Cập nhật trạng thái sản phẩm chi tiết thất bại'
    );
  }
};