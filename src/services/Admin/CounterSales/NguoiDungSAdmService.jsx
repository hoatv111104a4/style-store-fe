import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/nguoi-dung';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Hàm lấy danh sách khach hàng theo số điện thoại
export const getKHBySdt = async (sdt) => {
    try {
        const response = await axiosInstance.get(`/sdt/${sdt}`);
        console.log(response.data); // kiểm tra dữ liệu
        return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tải hoá đơn theo số điện thoại'
        );
    }
};

export const getKHByEmail = async (sdt) => {
    try {
        const response = await axiosInstance.get(`/email/${email}`);
        console.log(response.data); // kiểm tra dữ liệu
        return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không tìm thấy khách hàng theo email'
        );
    }
};

//Hàm gọi API tìm kiếm User theo id
export const searchUserById = async (id) => {
    try {
        const response = await axiosInstance.get(`/searchID/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tìm kiếm người dùng theo ID'
        );
    }
}
// su dung dia chi
export const addNguoiDung = async (data) => {
    try {
        const response = await axiosInstance.post('/addND', data); // <-- dùng axiosInstance
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || 'Lỗi hệ thống');
    }
};

export const getDCNhan = async (id) => {
    try {
        const response = await axiosInstance.get(`/idDC/${id}`);
        console.log(response.data); // kiểm tra dữ liệu
        return response.data; // Trả luôn danh sách (array)
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không tìm thấy địa chỉ theo id khách hàng'
        );
    }
};


export const getDiaChiNhanByNguoiDungId = async (idNguoiDung) => {
    try {
        const response = await axiosInstance.get(`/dcn/${idNguoiDung}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy địa chỉ nhận theo id người dùng ${idNguoiDung}:`, error);
        throw error;
    }
};

export const addDiaChiNhan = async (diaChi) => {
    try {
        const response = await axiosInstance.post(`/addDCN`, diaChi);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm địa chỉ nhận:", error);
        throw error;
    }
};