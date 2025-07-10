import axios from "axios";

/**
 * Lấy danh sách sản phẩm với các bộ lọc và phân trang.
 * @param {Object} params - Các tham số lọc và phân trang.
 * @param {number} params.page - Trang hiện tại (mặc định 0).
 * @param {number} params.size - Số lượng mỗi trang (mặc định 12).
 * @param {number} [params.tenSanPham]  tên sản phẩm (tùy chọn).
 * @param {number} [params.thuongHieuId] - ID thương hiệu (tùy chọn).
 * @param {number} [params.mauSacId] - ID màu sắc (tùy chọn).
 * @param {number} [params.chatLieuId] - ID chất liệu (tùy chọn).
 * @param {number} [params.kichThuocId] - ID kích thước (tùy chọn).
 * @param {number} [params.minPrice] - Giá tối thiểu (tùy chọn).
 * @param {number} [params.maxPrice] - Giá tối đa (tùy chọn).
 */

const apiClient = axios.create({
  baseURL: "http://localhost:8080/website/san-pham", 
  timeout: 5000, 
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
