import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

const apiClient = axios.create({
    baseURL: "http://localhost:8080/don-hang",
    timeout: 20000,
});

export const createOder = async (oderData) => {
    try {
        const token = Cookies.get("token");

        if (!token) {
            throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
        }

        const response = await apiClient.post("/dat-hang-online-chua-thanh-toan", oderData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, 
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error.message || error);
        throw error;
    }
};