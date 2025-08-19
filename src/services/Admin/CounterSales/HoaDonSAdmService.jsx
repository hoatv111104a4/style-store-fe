import axios from 'axios';
import Cookies from "js-cookie";
const API_URL = 'http://localhost:8080/api/admin/hoa-don';

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 20000,
});

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
const vnpayClient = axios.create({
    baseURL: "http://localhost:8080/api/vnpay",
    timeout: 20000,
});

// Hàm gọi API tạo đơn chờ
export const addHDC = async () => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }

        const response = await apiClient.post("/addHDC", {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo đơn chờ:', error);
        throw error;
    }
};

// Hàm lấy danh sách hóa đơn
export const getAllHDC = async (page = 0, size = 10) => {
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
// hàm lấy danh sách hoá đơn theo trạng thái
export const getHoaDonByTrangThai = async (trangThai, page = 0, size = 10) => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }
        if (!Number.isInteger(trangThai) || page < 0 || size <= 0) {
            throw new Error('Trạng thái, page hoặc size không hợp lệ');
        }
        const response = await apiClient.get(`/trang-thai/${trangThai}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: { page, size },
        }
        );
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy hóa đơn theo trạng thái:', error);
        throw error;
    }
};

// hàm lấy danh sách hoá đơn theo ma
export const getHoaDonByMa = async (ma) => {
    try {
        const response = await axiosInstance.get(`/ma/${ma}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tải hoá đơn theo mã'
        );
    }
};

// Hàm gọi API update Khach Hang
export const updateHDCTWithKH = async (hoaDonId, khachHangId, hinhThucNhanHang = 0, diaChiNhanId = null) => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {   
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }
        const response = await apiClient.put(
            `/updateKH/${hoaDonId}`,
            {
                khachHangId,
                hinhThucNhanHang,
                diaChiNhanId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể cập nhật khách hàng cho hóa đơn'
        );
    }
};


// Hàm gọi API cập nhật hoá đon
export const updateHoaDonFull = async (hoaDonId, hoaDonData) => {
    try {
        const token = Cookies.get("adminToken");
        console.log("Token:", token);
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }

        const response = await apiClient.put(`/updateHD/${hoaDonId}`, hoaDonData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật hóa đơn:', error);
        throw new Error(
            error.response?.data?.message || error.response?.data || 'Không thể cập nhật hóa đơn'
        );
    }
};

//Hàm gọi API tìm kiếm hóa đơn theo id
export const searchHoaDonById = async (id) => {
    try {
        const response = await axiosInstance.get(`/searchID/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.error || 'Không thể tìm kiếm hóa đơn theo ID'
        );
    }
}

// Hàm gọi API tìm kiếm hóa đơn theo số tháng gần đây
export const getHoaDonByMonths = async (months) => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }
        const response = await apiClient.get('/theo-thang', {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: { months },
        });
        return response.data;
    } catch (error) {
        console.log('Lỗi khi lấy hóa đơn theo số tháng:', error);
        throw error;
    }
};

// Hàm gọi API tìm kiếm hóa đơn theo ngày bắt đầu và kết thúc
export const getHoaDonByNgayBatDauVaKetThuc = async (startDate, endDate) => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }
        const response = await apiClient.get('/theo-ngay', {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: {
                start: startDate,
                end: endDate,
            },
        });
        return response.data;
    } catch (error) {
        console.log('Lỗi khi lấy hóa đơn theo khoảng ngày:', error);
        throw error;
    }
};

// Hàm gọi API tìm kiếm hóa đơn theo ngày bắt đầu và kết thúc k trangj thasi
export const getHoaDonByNgayBatDauVaKetThucT = async (startDate, endDate) => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }
        const response = await apiClient.get('/theo-ngayt', {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: {
                start: startDate,
                end: endDate,
            },
        });
        return response.data;
    } catch (error) {
        console.log('Lỗi khi lấy hóa đơn theo khoảng ngày:', error);
        throw error;
    }
};

//Hàm gọi API xoas hóa đơn theo id
export const deleteHD = async (id) => {
    try {
        const response = await axiosInstance.put(`/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xoá hóa đơn:', error);
        throw new Error(
            error.response?.data?.error || 'Không thể tìm kiếm hóa đơn theo ID'
        );
    }
}

export const submitVNPayOrder = async (donHangData) => {
    try {
        const token = Cookies.get("adminToken");
        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }

        const response = await vnpayClient.post("/submitOrder", donHangData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        console.log("Response từ VNPay API:", response.data);
        return response.data; // Trả về URL VNPay
    } catch (error) {
        console.error("Lỗi khi tạo yêu cầu thanh toán VNPay:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};