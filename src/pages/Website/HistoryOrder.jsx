import React, { useEffect, useState } from "react";
import {getLichSuDatHang} from "../../services/Website/OrderApi";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import selectNoBorderSx from "../../components/selectNoBorderSx";

const HistoryOrder = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [tenSanPham, setTenSanPham] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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
    trangThaiDonHang: trangThai || undefined,
    tuNgay: startDate || undefined,
    denNgay: endDate || undefined,
  });
};

  const handleClearAll = () => {
  setSearch("");
  setTenSanPham("");
  setTrangThai("");
  setStartDate("");
  setEndDate("");
  setPage(1);

  // Gọi fetch với dữ liệu rõ ràng, không phụ thuộc state
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
          value={trangThai}
          onChange={(e) => setTrangThai(e.target.value)}
          displayEmpty
          sx={selectNoBorderSx}
          MenuProps={{
                disableScrollLock: true, 
            }}
          renderValue={(selected) => {
            if (!selected) return "Trạng thái";
            return selected === "0" ? "Chờ xác nhận" : selected === "1" ? "Đã xác nhận" : "Khác";
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="0">Chờ xác nhận</MenuItem>
          <MenuItem value="1">Đã xác nhận</MenuItem>
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
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{(page - 1) * 5 + index + 1}</td>
                    <td>{order.maDonHang}</td>
                    <td>{order.tenKhachHang}</td>
                    <td>{order.soLuongSanPham} sản phẩm</td>
                    <td>{new Date(order.ngayDatHang).toLocaleDateString("vi-VN")}</td>
                    <td style={{ color: "#d63384", fontWeight: 600 }}>{order.tongTien.toLocaleString()}₫</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          backgroundColor: order.trangThai === 0 ? "#f8d7da" : "#d1e7dd",
                          color: order.trangThai === 0 ? "#842029" : "#0f5132",
                        }}
                      >
                        {order.trangThai === 0 ? "Chờ xác nhận" : "Đã xác nhận"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-muted py-4">
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
