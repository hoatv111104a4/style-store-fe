import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/hoa-don-chi-tiet';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const addHDCT = async (data) => {
    try {
        const response = await axiosInstance.post('/addHDCTC', data);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.eror || 'Không thể thêm chi tiết hóa đơn'
        );
    }
};

// Hàm lấy danh sách hóa đơn chi tiết
export const getAllHDCT = async (page = 0, size = 10) => {
    try {
        const response = await axiosInstance.get('', {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Không thể tải dữ liệu từ server'
        );
    }
};

// Lấy danh sách hóa đơn chi tiết theo ID hóa đơn
export const getHoaDonCTByHoaDonId = async (id, page = 0, size = 10) => {
    try {
        if (!Number.isInteger(id) || page < 0 || size <= 0) {
            throw new Error('ID hóa đơn, page hoặc size không hợp lệ');
        }

        const response = await axiosInstance.get(`/idHD/${id}`, {
            params: { page, size },
        });

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tải chi tiết hóa đơn theo ID'
        );
    }
};
// sửa hdct
export const updateHDCT = async (id, data) => {
    try {
        if (!Number.isInteger(id)) {
            throw new Error('ID hóa đơn không hợp lệ');
        }

        const response = await axiosInstance.put(`/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể cập nhật hóa đơn chi tiết'
        );
    }
};

//xoá hdct
export const deleteHDCT = async (id) => {
    try {
        if (!id || typeof id !== 'number' || id <= 0) {
            throw new Error('ID không hợp lệ để xóa');
        }

        await axiosInstance.delete(`/delete/${id}`);
        return true; // hoặc trả về thông báo thành công nếu muốn
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể xóa hóa đơn chi tiết'
        );
    }
};