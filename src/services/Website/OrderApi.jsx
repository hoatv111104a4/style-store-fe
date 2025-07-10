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
