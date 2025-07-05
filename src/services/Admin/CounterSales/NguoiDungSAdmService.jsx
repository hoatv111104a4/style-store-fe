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