import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin/san-pham-ct';
const PUBLIC_API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export const axiosPublicInstance = axios.create({
    baseURL: PUBLIC_API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, Promise.reject);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn');
        }
        return Promise.reject(error);
    }
);

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
        const response = await retry(() =>
            axiosInstance.get('', { params: { page, size } })
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể tải danh sách sản phẩm');
    }
};

export const getSanPhamCtByTrangThai = async (trangThai, page = 0, size = 10) => {
    try {
        const response = await retry(() =>
            axiosInstance.get(`/trang-thai/${trangThai}`, { params: { page, size } })
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể tải sản phẩm theo trạng thái');
    }
};

export const searchSanPhamCtByMa = async (ma, page = 0, size = 10) => {
    try {
        if (!ma || ma.trim() === '') return getAllSanPhamCt(page, size);
        const response = await retry(() =>
            axiosInstance.get('/ma', { params: { ma: ma.trim(), page, size } })
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể tìm kiếm sản phẩm theo mã');
    }
};

export const searchSanPhamCtByTen = async (ten, page = 0, size = 10) => {
    try {
        if (!ten || ten.trim() === '') return getAllSanPhamCt(page, size);
        const response = await retry(() =>
            axiosInstance.get('/ten', { params: { ten: ten.trim(), page, size } })
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể tìm kiếm sản phẩm theo tên');
    }
};

// API lọc nâng cao
export const filterSanPhamCtNangCao = async ({
    sanPhamMa,
    sanPhamTen,
    mauSacId,
    thuongHieuId,
    kichThuocId,
    xuatXuId,
    chatLieuId,
    page = 0,
    size = 10
}) => {
    try {
        const response = await axiosInstance.get(`/filter`, {
            params: {
                sanPhamMa,
                sanPhamTen,
                mauSacId,
                thuongHieuId,
                kichThuocId,
                xuatXuId,
                chatLieuId,
                page,
                size
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể lọc sản phẩm chi tiết'
        );
    }
};

