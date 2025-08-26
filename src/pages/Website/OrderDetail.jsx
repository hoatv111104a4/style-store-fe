import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getChiTietDonHang } from "../../services/Website/OrderApi";
import OrderTimeline from "../../components/OrderTimeline";
import Swal from "sweetalert2";
import { huyDonHang } from "../../services/Admin/HoaDonAdminServiceNew";

const OrderDetail = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [tenSanPham, setTenSanPham] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trangThaiDonHang, setTrangThaiDonHang] = useState(location.state?.trangThaiDonHang || null);

  const fetchData = async (searchName = "") => {
    if (!orderId) {
      setError("Không tìm thấy ID đơn hàng");
      setDetails([]);
      setTrangThaiDonHang(null);
      setLoading(false);
      return;
    }



    try {
      setLoading(true);
      console.log("Gửi yêu cầu với orderId:", orderId, "tenSanPham:", searchName);
      const res = await getChiTietDonHang(orderId, searchName);
      console.log("Phản hồi từ API:", res);
      console.log("location.state.trangThaiDonHang:", location.state?.trangThaiDonHang);
      setDetails(res.result || []);
      // Ép kiểu trangThaiDonHang từ API thành số, ưu tiên location.state nếu API không trả về
      const apiTrangThai = res.trangThaiDonHang || res.order?.trangThaiDonHang;
      setTrangThaiDonHang(apiTrangThai ? Number(apiTrangThai) : Number(location.state?.trangThaiDonHang) || 0);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err.response?.data || err.message);
      setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại.");
      setDetails([]);
      setTrangThaiDonHang(Number(location.state?.trangThaiDonHang) || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(tenSanPham);
  };

  const handleClear = () => {
    setTenSanPham("");
    fetchData("");
  };

  const handleBack = () => {
    navigate("/website/dat-hang/lich-su-dat-hang");
  };

  if (error) return <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>{error}</div>;

  const handleCancelOrder = async () => {
  try {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn hủy đơn hàng này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hủy đơn",
      cancelButtonText: "Thoát",
    });

    if (result.isConfirmed) {
      await huyDonHang(orderId);
      Swal.fire("Đã hủy!", "Đơn hàng của bạn đã được hủy.", "success");
      setTrangThaiDonHang(4); // cập nhật trạng thái về HỦY
      fetchData(); // reload lại chi tiết đơn hàng
    }
  } catch (err) {
    console.error("Lỗi khi hủy đơn hàng:", err);
    Swal.fire("Thất bại", "Không thể hủy đơn hàng. Vui lòng thử lại!", "error");
  }
};


  return (
    <section className="mt-4">
      <h3 className="mb-3 text-center" style={{ color: "#ff6600" }}>
        Chi tiết đơn hàng 
      </h3>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2, color: "#ff6600", borderColor: "#ff6600" }}
      >
        Quay lại
      </Button>
      {(trangThaiDonHang === 0 || trangThaiDonHang === 1) && (
        <Button
          variant="contained"
          color="error"
          onClick={handleCancelOrder}
          sx={{ mb: 2, ml: 2 }}
        >
          Hủy Đơn
        </Button>
      )}

      {trangThaiDonHang !== null && <OrderTimeline trangThaiDonHang={trangThaiDonHang} />}
      <form className="d-flex gap-2 mb-4" onSubmit={handleSearch}>
        <TextField
          variant="outlined"
          placeholder="Tìm tên sản phẩm"
          size="small"
          value={tenSanPham}
          onChange={(e) => setTenSanPham(e.target.value)}
          sx={{ minWidth: 250, background: "#fff", borderRadius: 2 }}
        />
        <IconButton type="submit" sx={{ backgroundColor: "#ff6600", color: "#fff", borderRadius: 2 }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={handleClear} sx={{ backgroundColor: "#888", color: "#fff", borderRadius: 2 }}>
          <ClearIcon />
        </IconButton>
      </form>

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <div className="spinner-border" role="status" />
        </div>
      ) : (
        <div className="table-responsive" style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}>
          <table className="table table-hover text-center">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ảnh sản phẩm</th>
                <th>Tên sản phẩm</th>
                <th>Màu sắc</th>
                <th>Kích thước</th>
                <th>Chất liệu</th>
                <th>Thương hiệu</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? (
                details.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <img
                      src={item.hinhAnh ? `http://localhost:8080/uploads/${item.hinhAnh}` : "/placeholder-image.png"}
                      className="card-img-top product-image"
                      alt={item.tenSanPham}
                      style={{ objectFit: "cover", height: "80px", width: "80px", borderRadius: "8px" }}
                    />
                    <td>{item.tenSanPham}</td>
                    <td>{item.tenMauSac}</td>
                    <td>{item.tenKichThuoc}</td>
                    <td>{item.tenChatLieu}</td> 
                    <td>{item.tenThuongHieu}</td> 

                    <td>{item.soLuong}</td>

                    <td>{item.giaTien?.toLocaleString()}₫</td>
                    <td>{(item.soLuong * item.giaTien)?.toLocaleString()}₫</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-muted py-4">
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OrderDetail;