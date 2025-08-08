import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPageGiamGia } from "../../services/Website/VocherApi";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import selectNoBorderSx from "../../components/selectNoBorderSx";

const Discounts = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [discountOptions, setDiscountOptions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getPageGiamGia(
        pageNum - 1,
        5,
        search || undefined,
        statusFilter || undefined,
        discountFilter || undefined,
        startDate || undefined,
        endDate || undefined
      );
      if (data && data.content) {
        const uniqueDiscounts = [...new Set(data.content.map(v => v.giamGia).filter(g => g != null))];
        setDiscountOptions(uniqueDiscounts);
        setVouchers(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setVouchers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error.response?.status, error.message);
      if (error.response && error.response.status === 401 || error.response.status === 403) {
      navigate("/access-denied");
      }else { 
      console.error("Lỗi khi tải dữ liệu:", error);
      setVouchers([]);
      setTotalPages(1);}
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
    await fetchData(1);
  };

  const handleClearSearch = () => setSearch("");

  const handleClearAll = async () => {
    setSearch("");
    setStatusFilter("");
    setDiscountFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    await fetchData(1);
  };

  const handlePageChange = (e, value) => {
    setPage(value);
    fetchData(value);
  };

  return (
    <section className="mt-4">
      <h3 className="mb-3 text-center" style={{ color: "#ff6600" }}>Danh sách phiếu giảm giá</h3>

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/giam-gia/them-phieu-giam-gia")}
          style={{ backgroundColor: "#ff6600", border: "none" }}
        >
          <i className="bi bi-plus-lg me-2"></i> Thêm phiếu giảm giá
        </button>
      </div>

      <div className="d-flex gap-3 mb-4 align-items-center">
        <form className="d-flex" onSubmit={handleSearch}>
          <TextField
            variant="outlined"
            placeholder="Nhập tên phiếu giảm giá"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 300, background: "#fff", borderRadius: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={handleClearSearch} disabled={!search}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={selectNoBorderSx}
          renderValue={(selected) => selected ? (selected === "1" ? "Hoạt động" : "Không hoạt động") : "Trạng thái"}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="1">Hoạt động</MenuItem>
          <MenuItem value="0">Không hoạt động</MenuItem>
        </Select>

        <Select
          value={discountFilter}
          onChange={(e) => setDiscountFilter(e.target.value)}
          displayEmpty
          sx={selectNoBorderSx}
          renderValue={(selected) => {
            if (!selected) return "Giảm giá";
            const discount = discountOptions.find(opt => opt === parseFloat(selected));
            return discount ? `${Math.round(discount)}%` : "Giảm giá";
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {discountOptions.map((discount, index) => (
            <MenuItem key={index} value={discount}>{`${Math.round(discount)}%`}</MenuItem>
          ))}
        </Select>

        <TextField
          variant="outlined"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ minWidth: 150, background: "#fff", borderRadius: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          variant="outlined"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ minWidth: 150, background: "#fff", borderRadius: 2 }}
          InputLabelProps={{ shrink: true }}
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
          <div className="spinner-border" role="status" style={{ width: "1.5rem", height: "1.5rem" }}></div>
        </div>
      ) : (
        <div className="table-responsive" style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}>
          <table className="table table-hover" style={{ textAlign: "center" }}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên phiếu</th>
                <th>Giá trị giảm</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length > 0 ? vouchers.map((voucher, index) => (
                <tr key={voucher.id}>
                  <th>{(page - 1) * 5 + index + 1}</th>
                  <td style={{ fontWeight: 500 }}>{voucher.tenDotGiam}</td>
                  <td style={{ fontWeight: "bold", color: "#d63384" }}>{voucher.giamGia ? `${Math.round(voucher.giamGia)}%` : "N/A"}</td>
                  <td>{voucher.ngayBatDau ? new Date(voucher.ngayBatDau).toLocaleDateString("vi-VN") : "N/A"}</td>
                  <td>{voucher.ngayKetThuc ? new Date(voucher.ngayKetThuc).toLocaleDateString("vi-VN") : "N/A"}</td>
                  <td>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      backgroundColor: voucher.trangThai == "1" ? "#d1e7dd" : voucher.trangThai == "0" ? "#f8d7da" : "#eee",
                      color: voucher.trangThai == "1" ? "#0f5132" : voucher.trangThai == "0" ? "#842029" : "#555"
                    }}>
                      {voucher.trangThai == "1" ? "Đã áp dụng" : voucher.trangThai == "0" ? "Đã huỷ" : "Không xác định"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/admin/giam-gia/chi-tiet/${voucher.id}`)}
                      style={{ backgroundColor: "#212529", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px" }}
                    >
                      <i className="bi bi-eye-fill me-1"></i> Xem
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">Không có phiếu giảm giá</td>
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

export default Discounts;