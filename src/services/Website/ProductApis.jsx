import axios from "axios";

import Cookies from "js-cookie";


/**
 * Lấy danh sách sản phẩm với các bộ lọc và phân trang.
 * @param {Object} params - Các tham số lọc và phân trang.
 * @param {number} params.page - Trang hiện tại (mặc định 0).
 * @param {number} params.size - Số lượng mỗi trang (mặc định 12).
 * @param {string} [params.tenSanPham] - Tên sản phẩm (tùy chọn).
 * @param {number} [params.thuongHieuId] - ID thương hiệu (tùy chọn).
 * @param {number} [params.mauSacId] - ID màu sắc (tùy chọn).
 * @param {number} [params.chatLieuId] - ID chất liệu (tùy chọn).
 * @param {number} [params.kichThuocId] - ID kích thước (tùy chọn).
 * @param {number} [params.xuatXuId] - ID xuất xứ (tùy chọn). // <-- BỔ SUNG DÒNG NÀY
 * @param {number} [params.minPrice] - Giá tối thiểu (tùy chọn).
 * @param {number} [params.maxPrice] - Giá tối đa (tùy chọn).
 */

const apiClient = axios.create({
  baseURL: "http://localhost:8080/website/san-pham", 
  timeout: 20000, 
});


export const getAllSanPham = async (params = {}) => {
  // Loại bỏ các trường có giá trị rỗng, null, undefined
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
      cleanParams[key] = params[key];
    }
  });

  try {
    const response = await apiClient.get("/hien-thi", {
      params: cleanParams,
    });
    console.log("Dữ liệu sản phẩm nhận được", response.data);
    return response.data || { content: [], totalPages: 0 };
  } catch (error) {
    throw new Error(error.response?.data || "Lỗi khi lấy danh sách sản phẩm");
  }
};

export const listThuongHieu = async () =>{
    try {
        const response = await apiClient.get("/danh-sach-thuong-hieu")
        return response.data;
    } catch (error) {
        console.log("Lỗi khi lấy danh sách thương hiệu ",error);
        throw error;
    }
};

export const listMauSac = async () =>{
    try {
        const response = await apiClient.get("/danh-sach-mau-sac")
        return response.data;
    } catch (error) {
        console.log("Lỗi khi lấy danh sách màu sắc ",error);
        throw error;
    }
};

export const listKichCo = async () =>{
    try {
        const response = await apiClient.get("/danh-sach-kick-co")
        return response.data;
    } catch (error) {
        console.log("Lỗi khi lấy danh sách kích cỡ ",error);
        throw error;
    }
};

export const listChatLieu = async () =>{
    try {
        const response = await apiClient.get("/danh-sach-chat-lieu")
        return response.data;
    } catch (error) {
        console.log("Lỗi khi lấy danh sách chất liệu ",error);
        throw error;
    }
};

export const getByIdSanPhamCt = async (id) =>{
    try {
        const response = await apiClient.get(`/chi-tiet-san-pham/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm ",error);
        throw error;
    }
};
export const listSanPham = async (id) =>{
    try {
        const response = await apiClient.get("/danh-sach-san-pham");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm ",error);
        throw error;
    }
};

export const getPageSanPham = async(page = 0,size = 5)=>{
    try {
        const response = await apiClient.get("/page-san-pham",{
            params:{
                page:page,
                size:size
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API phân trang",error);
        throw error;
    }
};


export const getListSanPhamGiamGia = async (filters = {}) => {
    try {
        const response = await apiClient.get("/hien-thi-san-pham-giam-gia", {
            params: {
                tenSanPham: filters.tenSanPham || null,
                thuongHieuId: filters.thuongHieuId || null,
                mauSacId: filters.mauSacId || null,
                chatLieuId: filters.chatLieuId || null,
                kichThuocId: filters.kichThuocId || null,
                minPrice: filters.minPrice || null,
                maxPrice: filters.maxPrice || null,
                sortOrder: filters.sortOrder || "",  
                sanPhamId: filters.sanPhamId || null,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API sản phẩm giảm giá:", error);
        throw error;
    }
};


export const getPageSanPhamAdmin = async (id, filters = {}) => {
  if (!id) {
    throw new Error("sanPhamId là bắt buộc");
  }

  // Xóa các trường null/undefined/""
  const cleanParams = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
      cleanParams[key] = filters[key];
    }
  });

  try {
    const response = await apiClient.get(`/hien-thi-san-pham-admin/${id}`, {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API hiển thị sản phẩm admin:", error);
    throw error;
  }
};

export const listXuatXu = async () => {
    try {
        const response = await apiClient.get("/danh-sach-xuat-xu");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách xuất xứ", error);
        throw error;
    }
};

export const listHinhAnh = async () => {
    try {
        const response = await apiClient.get("/danh-sach-hinh-anh");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hình ảnh", error);
        throw error;
    }
};

export const addSanPhamChiTiet = async (requestData) => {
    try {
        const response = await apiClient.post("/them-san-pham-chi-tiet", requestData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm chi tiết:", error);
        throw error;
    }
};

export const getByIdSanPhamCtAdmin = async (id) =>{
    try {
        const response = await apiClient.get(`/chi-tiet-san-pham-admin/${id}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm ",error);
        throw error;
    }
};

export const updateSanPhamCtAdmin = async (id, requestData) => {
    if (!id) {
        throw new Error("ID sản phẩm chi tiết là bắt buộc");
    }
    try {
        const response = await apiClient.put(`/cap-nhat-thong-tin-san-pham-chi-tiet/${id}`, requestData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm chi tiết admin:", error);
        throw error;
    }
};


export const getPageSanPhamAdmin2 = async (id, filters = {}) => {
  if (!id) {
    throw new Error("sanPhamId là bắt buộc");
  }

  // Xóa các trường null/undefined/""
  const cleanParams = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
      cleanParams[key] = filters[key];
    }
  });

  try {
    const response = await apiClient.get(`/hien-thi-san-pham-admin2/${id}`, {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API hiển thị sản phẩm admin:", error);
    throw error;
  }
};


// Thêm vào file apiClient.js
export const chuyenTrangThaiSPCT = async (id) => {
  try {
    const response = await apiClient.get(`/chuyen-trang-thai-spct/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chuyển trạng thái sản phẩm chi tiết:", error);
    throw error;
  }
};

export const chuyenTrangThaiSP = async (id) => {
  try {
    const response = await apiClient.get(`/chuyen-trang-thai-sp/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chuyển trạng thái sản phẩm :", error);
    throw error;
  }
};

export const uploadHinhAnh = async (file, moTa = "") => {
  try {
    const token = Cookies.get("adminToken");
    if (!token) throw new Error("Token không tồn tại, vui lòng đăng nhập lại.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("moTa", moTa);

    const response = await apiClient.post("/upload-hinh-anh", formData, {
      headers: {
        "Authorization": `Bearer ${token}`, // chỉ để Authorization thôi
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi upload hình ảnh:", error.response?.data || error.message);
    throw error;
  }
};
