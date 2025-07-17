import React, { useEffect, useState } from "react";
import { getLichSuDatHang } from "../../services/Website/OrderApi";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import selectNoBorderSx from "../../components/selectNoBorderSx";
import { useNavigate } from "react-router-dom";

const HistoryOrder = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [tenSanPham, setTenSanPham] = useState("");
  const [trangThaiDonHang, setTrangThaiDonHang] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Chưa thanh toán, 1: Đã thanh toán

  const navigate = useNavigate();

  const fetchData = async (pageNum = 1, filters = {}) => {
    try {
      setLoading(true);
      const res = await getLichSuDatHang({
        page: pageNum - 1,
        size: 5,
        ...filters,
      });

      setOrders(res.result.content || []);
      setTotalPages(res.result.totalPages || 1);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);

    await fetchData(1, {
      maDonHang: search || undefined,
      tenSanPham: tenSanPham || undefined,
      trangThaiDonHang: trangThaiDonHang || undefined,
      tuNgay: startDate || undefined,
      denNgay: endDate || undefined,
    });
  };

  const handleClearAll = () => {
    setSearch("");
    setTenSanPham("");
    setTrangThaiDonHang("");
    setStartDate("");
    setEndDate("");
    setPage(1);

    fetchData(1, {
      maDonHang: undefined,
      tenSanPham: undefined,
      trangThaiDonHang: undefined,
      tuNgay: undefined,
      denNgay: undefined,
    });
  };

  const handlePageChange = (e, value) => {
    setPage(value);
    fetchData(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Có thể thêm logic lọc theo trangThaiThanhToan nếu API hỗ trợ
    // Hiện tại, lọc client-side dựa trên orders
  };

  // Lọc orders theo tab
  const filteredOrders = orders.filter(order => {
    if (activeTab == 0) return order.trangThaiThanhToan != "1"; // Chưa thanh toán
    if (activeTab == 1) return order.trangThaiThanhToan == "1"; // Đã thanh toán
    return true; // Default (không lọc)
  });

  return (
    <section className="mt-4">
      <h3 className="mb-3 text-center" style={{ color: "#ff6600" }}>
        Lịch sử đơn hàng
      </h3>

      <div className="d-flex gap-3 mb-4 align-items-center">
        <form className="d-flex" onSubmit={handleSearch}>
          <TextField
            variant="outlined"
            placeholder="Mã đơn hàng"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200, background: "#fff", borderRadius: 2 }}
          />
        </form>

        <TextField
          variant="outlined"
          placeholder="Tên sản phẩm"
          size="small"
          value={tenSanPham}
          onChange={(e) => setTenSanPham(e.target.value)}
          sx={{ minWidth: 200, background: "#fff", borderRadius: 2 }}
        />

        <Select
          value={trangThaiDonHang}
          onChange={(e) => setTrangThaiDonHang(e.target.value)}
          displayEmpty
          sx={selectNoBorderSx}
          MenuProps={{ disableScrollLock: true }}
          renderValue={(selected) => {
            if (!selected) return "Trạng thái";
            return selected == "0" ? "Chờ xác nhận" :
                  selected == "1" ? "Chờ lấy hàng" :
                  selected == "2" ? "Đang giao hàng" :
                  selected == "3" ? "Đã hoàn thành" :
                  selected == "4" ? "Đã hủy" :
                  selected == "5" ? "Đã hoàn trả" : "Khác";
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="0">Chờ xác nhận</MenuItem>
          <MenuItem value="1">Chờ lấy hàng</MenuItem>
          <MenuItem value="2">Đang giao hàng</MenuItem>
          <MenuItem value="3">Đã hoàn thành</MenuItem>
          <MenuItem value="4">Đã hủy</MenuItem>
          <MenuItem value="5">Đã hoàn trả</MenuItem>
        </Select>

        <TextField
          variant="outlined"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ minWidth: 150, background: "#fff", borderRadius: 2 }}
        />
        <TextField
          variant="outlined"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ minWidth: 150, background: "#fff", borderRadius: 2 }}
        />

        <IconButton onClick={handleSearch} sx={{ backgroundColor: "#ff6600", color: "#fff", borderRadius: 2 }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={handleClearAll} sx={{ backgroundColor: "#888", color: "#fff", borderRadius: 2 }}>
          <ClearIcon />
        </IconButton>
      </div>

      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
        <Tab label="Chưa thanh toán" />
        <Tab label="Đã thanh toán" />
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
                <th>Mã đơn</th>
                <th>Tên khách</th>
                <th>Sản phẩm</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền hàng</th>
                <th>Tiền ship</th>
                <th>Trạng thái</th>
                <th>Trạng thái thanh toán</th>
                <th>Tổng tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{(page - 1) * 5 + index + 1}</td>
                    <td>{order.maDonHang}</td>
                    <td>{order.tenKhachHang}</td>
                    <td>{order.soLuongSanPham} sản phẩm</td>
                    <td>{new Date(order.ngayDatHang).toLocaleDateString("vi-VN")}</td>
                    <td style={{ color: "#d63384", fontWeight: 600 }}>{order.tongTien.toLocaleString()}₫</td>
                    <td style={{ color: "#d63384", fontWeight: 600 }}>{order.tienThue.toLocaleString()}₫</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor: 
                            order.trangThaiDonHang == "0" ? "#f8d7da" : 
                            order.trangThaiDonHang == "1" ? "#fff3cd" : 
                            order.trangThaiDonHang == "2" ? "#cfe2ff" : 
                            order.trangThaiDonHang == "3" ? "#d1e7dd" : 
                            order.trangThaiDonHang == "4" ? "#e2e3e5" : 
                            order.trangThaiDonHang == "5" ? "#d3d3d3" : 
                            "#f8d7da",
                          color: 
                            order.trangThaiDonHang == "0" ? "#842029" : 
                            order.trangThaiDonHang == "1" ? "#664d03" : 
                            order.trangThaiDonHang == "2" ? "#084298" : 
                            order.trangThaiDonHang == "3" ? "#0f5132" : 
                            order.trangThaiDonHang == "4" ? "#383d41" : 
                            order.trangThaiDonHang == "5" ? "#343a40" : 
                            "#842029",
                        }}
                      >
                        {order.trangThaiDonHang == "0" ? "Chờ xác nhận" :
                        order.trangThaiDonHang == "1" ? "Đang chờ lấy hàng" :
                        order.trangThaiDonHang == "2" ? "Đang giao hàng" :
                        order.trangThaiDonHang == "3" ? "Đã hoàn thành" :
                        order.trangThaiDonHang == "4" ? "Đã hủy" :
                        order.trangThaiDonHang == "5" ? "Đã hoàn trả" :
                        "Không xác định"}
                      </span>
                    </td>
                    <td>
                      {order.trangThaiThanhToan == "1" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </td>
                    <td style={{ color: "#d10404ff", fontWeight: 600 }}>
                      {(order.tongTien + order.tienThue).toLocaleString()}₫
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                        onClick={() =>
                          navigate(`/website/dat-hang/lich-su-dat-hang/chi-tiet-don-hang/${order.id}`, {
                            state: { trangThaiDonHang: order.trangThaiDonHang },
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
                  <td colSpan="9" className="text-muted py-4">
                    Không có đơn hàng nào
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

export default HistoryOrder;