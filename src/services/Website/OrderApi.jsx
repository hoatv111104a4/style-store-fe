import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/don-hang",
    timeout: 20000,
});

const vnpayClient = axios.create({
    baseURL: "http://localhost:8080/api/vnpay",
    timeout: 20000,
});

export const createOder = async (oderData) => {
    try {
        const token = Cookies.get("token");

        const headers = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await apiClient.post("/dat-hang-online-chua-thanh-toan", oderData, {
            headers,
        });

        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error.message || error);
        throw error;
    }
};


export const submitVNPayOrder = async (donHangData) => {
  try {
    const token = Cookies.get("token");

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await vnpayClient.post("/submitOrder", donHangData, {
      headers,
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


export const getLichSuDatHang = async ({
  page = 0,
  size = 10,
  trangThaiDonHang,
  trangThaiThanhToan,
  phuongThucThanhToan,
  maDonHang,
  tenSanPham,
  tuNgay,
  denNgay,
}) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Token không tồn tại trong cookie. Vui lòng đăng nhập lại.");
    }

    const params = {
      page,
      size,
      trangThaiDonHang,
      trangThaiThanhToan,
      phuongThucThanhToan,
      maDonHang,
      tenSanPham,
      tuNgay,   
      denNgay,   
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === null || params[key] === undefined || params[key] === "") &&
        delete params[key]
    );

    const response = await apiClient.get("/lich-su-dat-hang", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đặt hàng:", error.message || error);
    throw error;
  }
};

export const getChiTietDonHang = async (id, tenSanPham = "") => {
    try {
        console.log("Gửi yêu cầu với id:", id, "tenSanPham:", tenSanPham);
        const response = await apiClient.get(`/chi-tiet-don-hang/${id}`, {
            params: {
                tenSanPham: tenSanPham || undefined
            }
        });
        console.log("Phản hồi từ API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng theo id:", error.response?.data || error.message);
        throw error;
    }
};