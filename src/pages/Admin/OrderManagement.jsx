import React, { useEffect, useState, useCallback } from "react";
import { listHoaDon, searchHoaDon } from "../../services/Admin/HoaDonService";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

const OrderManagement = () => {
  const [hoaDonList, setHoaDonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMa, setSearchMa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeStatus, setActiveStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const fetchHoaDon = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (searchTerm.trim()) {
        // Tìm kiếm theo mã hóa đơn
        data = await searchHoaDon(searchTerm, currentPage, pageSize);
      } else {
        // Lấy danh sách hóa đơn phân trang
        data = await listHoaDon(currentPage, pageSize);
      }

      // Lọc theo ngày và trạng thái trên client-side
      let filteredData = data.content || [];
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter((hd) => {
          const ngayTao = new Date(hd.ngayTao);
          return ngayTao >= start && ngayTao <= end;
        });
      }

      if (activeStatus !== null) {
        filteredData = filteredData.filter((hd) => hd.trangThai === activeStatus);
      }

      setHoaDonList(filteredData);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/access-denied");
      } else {
        setError(err.message || "Không thể tải danh sách hóa đơn");
        setHoaDonList([]);
        toast.error("Không thể tải danh sách hóa đơn.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, searchTerm, currentPage, startDate, endDate, activeStatus]);

  useEffect(() => {
    fetchHoaDon();
  }, [fetchHoaDon]);

  const renderTrangThaiBadge = (trangThai) => {
    let label = "";
    let backgroundColor = "";
    let textColor = "";
    switch (trangThai) {
      case 0:
        label = "Chờ xác nhận";
        backgroundColor = "#f8d7da";
        textColor = "#842029";
        break;
      case 1:
        label = "Chờ vận chuyển";
        backgroundColor = "#fff3cd";
        textColor = "#664d03";
        break;
      case 2:
        label = "Đang vận chuyển";
        backgroundColor = "#cfe2ff";
        textColor = "#084298";
        break;
      case 3:
        label = "Đã hoàn thành";
        backgroundColor = "#d1e7dd";
        textColor = "#0f5132";
        break;
      case 4:
        label = "Đã hủy";
        backgroundColor = "#e2e3e5";
        textColor = "#383d41";
        break;
      case 5:
        label = "Hoàn tiền / Trả hàng";
        backgroundColor = "#d3d3d3";
        textColor = "#343a40";
        break;
      case 6:
        label = "Chờ tại quầy";
        backgroundColor = "#f5f0ff";
        textColor = "#4b0082";
        break;
      default:
        label = "Không xác định";
        backgroundColor = "#f8d7da";
        textColor = "#842029";
    }
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: "0.75rem",
          fontWeight: 500,
          backgroundColor,
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    );
  };

  const statusTabs = [
    { label: "Tất cả", status: null },
    { label: "Chờ xác nhận", status: 0 },
    { label: "Chờ vận chuyển", status: 1 },
    { label: "Đang vận chuyển", status: 2 },
    { label: "Đã hoàn thành", status: 3 },
    { label: "Đã hủy", status: 4 },
    { label: "Hoàn tiền / Trả hàng", status: 5 },
    { label: "Chờ tại quầy", status: 6 },
  ];

  const getStatusCount = (status) => {
    return hoaDonList.filter((hd) => hd.trangThai === status).length;
  };

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(0);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value - 1);
  };

  const handleSearchInput = (e) => {
    setSearchMa(e.target.value);
    setError(null);
  };

  const handleSearch = () => {
    setSearchTerm(searchMa);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchMa("");
    setSearchTerm("");
    setCurrentPage(0);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchMa.trim()) {
      handleSearch();
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/orders/${id}`);
    toast.info(`Đang chuyển đến chi tiết hóa đơn ID: ${id}`, {
      position: "top-right",
      autoClose: 1500,
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <div className="spinner-border" role="status" style={{ color: "#ff6600" }} />
      </Box>
    );
  }

  return (
    <section className="mt-4">
      <ToastContainer position="top-right" />
      <Typography
        variant={isMobile ? "h6" : "h5"}
        fontWeight={700}
        color="#ff6600"
        align="center"
        sx={{ letterSpacing: 1.5, mb: 3 }}
      >
        QUẢN LÝ ĐƠN HÀNG
      </Typography>

      <div className="d-flex gap-3 mb-4 align-items-center flex-wrap">
        <form className="d-flex" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <TextField
            variant="outlined"
            placeholder="Nhập mã hóa đơn"
            size="small"
            value={searchMa}
            onChange={handleSearchInput}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            sx={{ minWidth: 200, background: "#fff", borderRadius: 2 }}
            InputProps={{
              endAdornment: (
                <>
                  {searchMa && (
                    <IconButton
                      onClick={handleClearSearch}
                      sx={{ color: "#888" }}
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={handleSearch}
                    disabled={!!error || !searchMa.trim()}
                    sx={{ backgroundColor: "#ff6600", color: "#fff", borderRadius: 2, "&:hover": { backgroundColor: "#e65c00" } }}
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </>
              ),
            }}
          />
        </form>

        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150, background: "#fff", borderRadius: 2 }}
          />
          <Typography fontWeight={600}>~</Typography>
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150, background: "#fff", borderRadius: 2 }}
          />
          {(startDate || endDate) && (
            <IconButton
              onClick={resetDateFilter}
              sx={{ backgroundColor: "#888", color: "#fff", borderRadius: 2, "&:hover": { backgroundColor: "#666" } }}
              size="small"
            >
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </div>

      <Box mb={3} className="d-flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <span
            key={tab.label}
            onClick={() => setActiveStatus(tab.status)}
            style={{
              padding: "6px 12px",
              borderRadius: 16,
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: activeStatus === tab.status ? "#ff6600" : "#f0f0f0",
              color: activeStatus === tab.status ? "#fff" : "#222",
              cursor: "pointer",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseOver={(e) => {
              if (activeStatus !== tab.status) e.target.style.backgroundColor = "#e0e0e0";
            }}
            onMouseOut={(e) => {
              if (activeStatus !== tab.status) e.target.style.backgroundColor = "#f0f0f0";
            }}
          >
            {`${tab.label} (${getStatusCount(tab.status)})`}
          </span>
        ))}
      </Box>

      <div className="table-responsive" style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}>
        <table className="table table-hover text-center">
          <thead>
            <tr style={{ backgroundColor: "#ff6600" }}>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "5%" }}>#</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "12%" }}>MÃ HÓA ĐƠN</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "15%" }}>NGƯỜI ĐẶT HÀNG</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "15%" }}>NGƯỜI NHẬN HÀNG</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "12%" }}>NGÀY ĐẶT</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "12%" }}>NGÀY NHẬN</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "8%" }}>SỐ LƯỢNG SP</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "10%" }}>TỔNG TIỀN</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "17%" }}>TRẠNG THÁI</th>
              <th style={{ color: "black", fontWeight: 700, border: 0, width: "11%" }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {hoaDonList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-muted py-4">
                  {searchTerm
                    ? `Không tìm thấy đơn hàng phù hợp với "${searchTerm}"`
                    : "Không có đơn hàng nào"}
                </td>
              </tr>
            ) : (
              hoaDonList.map((hd, idx) => (
                <tr key={hd.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ fontWeight: 600, color: "#222", border: 0, width: "5%" }}>
                    {idx + 1 + currentPage * pageSize}
                  </td>
                  <td style={{ fontWeight: 600, color: "#222", border: 0, width: "12%" }}>
                    {hd.ma || "-"}
                  </td>
                  <td style={{ fontWeight: 500, color: "#222", border: 0, width: "15%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hd.nguoiDatHang || "-"}
                  </td>
                  <td style={{ fontWeight: 500, color: "#222", border: 0, width: "15%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hd.nguoiNhanHang || "-"}
                  </td>
                  <td style={{ color: "#222", border: 0, width: "12%" }}>
                    {hd.ngayTao
                      ? new Date(hd.ngayTao).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={{ color: "#222", border: 0, width: "12%" }}>
                    {hd.ngayNhan
                      ? new Date(hd.ngayNhan).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={{ fontWeight: 600, color: "#222", border: 0, width: "8%" }}>
                    {hd.tongSoLuongSp ?? 0}
                  </td>
                  <td style={{ fontWeight: 600, color: "#d63384", border: 0, width: "10%" }}>
                    {hd.tongTien?.toLocaleString()}₫
                  </td>
                  <td style={{ border: 0, width: "17%" }}>
                    {renderTrangThaiBadge(hd.trangThai)}
                  </td>
                  <td style={{ border: 0, width: "11%" }}>
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center mx-auto"
                      onClick={() => handleViewDetails(hd.id)}
                    >
                      <i className="bi bi-eye-fill me-1"></i> Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination
            count={totalPages}
            page={currentPage + 1}
            onChange={handlePageChange}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": { color: "#333" },
              "& .Mui-selected": { backgroundColor: "#ff6600 !important", color: "#fff" },
            }}
          />
        </div>
      )}
    </section>
  );
};

export default OrderManagement;