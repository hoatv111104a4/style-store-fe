import React, { useEffect, useState } from "react";
import { pageHoaDonAdmin } from "../../services/Admin/HoaDonAdminServiceNew";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useNavigate } from "react-router-dom";

// Định nghĩa style cho Select không có viền
const selectNoBorderSx = {
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
  backgroundColor: "#fff",
  borderRadius: 2,
  minWidth: 150,
};

const HoaDonAdminList = () => {
  const [hoaDons, setHoaDons] = useState([]);
  const [search, setSearch] = useState("");
  const [trangThaiDonHang, setTrangThaiDonHang] = useState("");
  const [trangThaiThanhToan, setTrangThaiThanhToan] = useState("");
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const navigate = useNavigate();

  // Hàm lấy danh sách hóa đơn từ API
  const fetchHoaDons = async (pageNum = 1, filters = {}) => {
    try {
      setLoading(true);
      const res = await pageHoaDonAdmin({
        page: pageNum - 1,
        size: 5,
        ...filters,
      });

      // Đảm bảo hoaDons luôn là mảng, ngay cả khi API trả về null
      setHoaDons(res.content ? res.content : []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hóa đơn:", err);
      setHoaDons([]); // Đặt mảng rỗng khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchHoaDons(1);
  }, []);

  // Xử lý tìm kiếm và lọc
  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);

    await fetchHoaDons(1, {
      maHoaDonOrTenKhachHang0rSoDienThoai: search || undefined,
      trangThaiDonHang: activeTab || undefined,
      trangThaiThanhToan: trangThaiThanhToan || undefined,
      phuongThucThanhToan: phuongThucThanhToan || undefined,
    });
  };

  // Xử lý reset bộ lọc
  const handleClearAll = () => {
    setSearch("");
    setTrangThaiDonHang("");
    setTrangThaiThanhToan("");
    setPhuongThucThanhToan("");
    setActiveTab("");
    setPage(1);

    fetchHoaDons(1, {
      maHoaDonOrTenKhachHang0rSoDienThoai: undefined,
      trangThaiDonHang: undefined,
      trangThaiThanhToan: undefined,
      phuongThucThanhToan: undefined,
    });
  };

  // Xử lý thay đổi trang
  const handlePageChange = (e, value) => {
    setPage(value);
    fetchHoaDons(value, {
      maHoaDonOrTenKhachHang0rSoDienThoai: search || undefined,
      trangThaiDonHang: activeTab || undefined,
      trangThaiThanhToan: trangThaiThanhToan || undefined,
      phuongThucThanhToan: phuongThucThanhToan || undefined,
    });
  };

  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
    fetchHoaDons(1, {
      maHoaDonOrTenKhachHang0rSoDienThoai: search || undefined,
      trangThaiDonHang: newValue || undefined,
      trangThaiThanhToan: trangThaiThanhToan || undefined,
      phuongThucThanhToan: phuongThucThanhToan || undefined,
    });
  };

  return (
    <section className="mt-4">
      <h3 className="mb-3 text-center" style={{ color: "#ff6600" }}>
        Danh sách hóa đơn
      </h3>

      <div className="d-flex gap-3 mb-4 align-items-center">
        <form className="d-flex" onSubmit={handleSearch}>
          <TextField
            variant="outlined"
            placeholder="Mã hóa đơn, tên khách, số điện thoại"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 250, background: "#fff", borderRadius: 2 }}
          />
          <IconButton
            type="submit"
            sx={{ backgroundColor: "#ff6600", color: "#fff", borderRadius: 2, ml: 1 }}
          >
            <SearchIcon />
          </IconButton>
        </form>

        <Select
          value={trangThaiThanhToan}
          onChange={(e) => setTrangThaiThanhToan(e.target.value)}
          displayEmpty
          sx={selectNoBorderSx}
          MenuProps={{ disableScrollLock: true }}
          renderValue={(selected) => {
            if (!selected) return "Trạng thái thanh toán";
            return selected === "0" ? "Chưa thanh toán" : "Đã thanh toán";
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="0">Chưa thanh toán</MenuItem>
          <MenuItem value="1">Đã thanh toán</MenuItem>
        </Select>

        <Select
          value={phuongThucThanhToan}
          onChange={(e) => setPhuongThucThanhToan(e.target.value)}
          displayEmpty
          sx={selectNoBorderSx}
          MenuProps={{ disableScrollLock: true }}
          renderValue={(selected) => {
            if (!selected) return "Phương thức thanh toán";
            return selected === "1" ? "Ship COD" :
                   selected === "2" ? "Tại quầy" :
                   selected === "3" ? "Online" : "Không xác định";
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="1">Ship cod</MenuItem>
          <MenuItem value="2">Tại quầy</MenuItem>
          <MenuItem value="3">Online</MenuItem>
        </Select>

        <IconButton
          onClick={handleClearAll}
          sx={{ backgroundColor: "#888", color: "#fff", borderRadius: 2 }}
        >
          <ClearIcon />
        </IconButton>
      </div>

      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
        <Tab label="Tất cả" value="" />
        <Tab label="Chờ xác nhận" value="0" />
        <Tab label="Chờ lấy hàng" value="1" />
        <Tab label="Đang giao hàng" value="2" />
        <Tab label="Đã hoàn thành" value="3" />
        <Tab label="Đã hủy" value="4" />
        <Tab label="Đã hoàn trả" value="5" />
      </Tabs>

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
                <th>Mã hóa đơn</th>
                <th>Khách hàng</th>
                <th>Sdt khách</th>
                <th>Số lượng SP</th>
                <th>Ngày đặt</th>
                
                <th>Trạng thái</th>
                <th>Trạng thái thanh toán</th>
                <th>Tổng tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {hoaDons.length > 0 ? (
                hoaDons.map((hoaDon, index) => (
                  <tr key={hoaDon.id}>
                    <td>{(page - 1) * 5 + index + 1}</td>
                    <td>{hoaDon.ma || "N/A"}</td>
                    <td>{hoaDon.nguoiDatHang || "N/A"}</td>
                    <td>{hoaDon.soDtNguoiNhan || "N/A"}</td>
                    <td>{hoaDon.tongSoLuongSp || 0}</td>
                    <td>{hoaDon.ngayDat ? new Date(hoaDon.ngayDat).toLocaleDateString("vi-VN") : "N/A"}</td>
                    
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor:
                            hoaDon.trangThai === 0 ? "#f8d7da" :
                            hoaDon.trangThai === 1 ? "#fff3cd" :
                            hoaDon.trangThai === 2 ? "#cfe2ff" :
                            hoaDon.trangThai === 3 ? "#d1e7dd" :
                            hoaDon.trangThai === 4 ? "#e2e3e5" :
                            hoaDon.trangThai === 5 ? "#d3d3d3" : "#f8d7da",
                          color:
                            hoaDon.trangThai === 0 ? "#842029" :
                            hoaDon.trangThai === 1 ? "#664d03" :
                            hoaDon.trangThai === 2 ? "#084298" :
                            hoaDon.trangThai === 3 ? "#0f5132" :
                            hoaDon.trangThai === 4 ? "#383d41" :
                            hoaDon.trangThai === 5 ? "#343a40" : "#842029",
                        }}
                      >
                        {hoaDon.trangThai === 0 ? "Chờ xác nhận" :
                         hoaDon.trangThai === 1 ? "Chờ lấy hàng" :
                         hoaDon.trangThai === 2 ? "Đang giao hàng" :
                         hoaDon.trangThai === 3 ? "Đã hoàn thành" :
                         hoaDon.trangThai === 4 ? "Đã hủy" :
                         hoaDon.trangThai === 6 ? "Hoá đơn chờ" :
                         hoaDon.trangThai === 5 ? "Đã hoàn trả" : "Không xác định"}
                      </span>
                    </td>
                    <td>
                      {hoaDon.trangThaiThanhToan === 0 ? "Chưa thanh toán" : hoaDon.trangThaiThanhToan === 1 ? "Đã thanh toán" : "N/A"}
                    </td>
                    
                    <td style={{ color: "#d10404ff", fontWeight: 600 }}>
                      {(hoaDon.tongTien + (hoaDon.tienThue || 0)).toLocaleString()}₫
                    </td>
                    
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                        onClick={() =>
                          navigate(`/admin/hoa-don/chi-tiet-hoa-don/${hoaDon.id}`, {
                            state: { trangThaiDonHang: hoaDon.trangThai },
                          })
                        }
                      >
                        <i className="bi bi-eye-fill me-1"></i> Xem
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-muted py-4">
                    Không có hóa đơn nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": { color: "#333" },
                  "& .Mui-selected": { backgroundColor: "#ff6600 !important", color: "#fff" },
                }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HoaDonAdminList;