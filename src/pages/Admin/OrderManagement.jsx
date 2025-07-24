import React, { useEffect, useState, useCallback } from "react";
import { listHoaDon } from "../../services/Admin/HoaDonService";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import toast và ToastContainer
import "react-toastify/dist/ReactToastify.css";

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  useMediaQuery,
  Pagination,
  // Bỏ Alert và Snackbar vì đã dùng react-toastify
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Định nghĩa màu sắc
const orange = "#ff8800";
const black = "#222";
const white = "#fff";

const OrderManagement = () => {
  const [allHoaDon, setAllHoaDon] = useState([]);
  const [hoaDonList, setHoaDonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMa, setSearchMa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeStatus, setActiveStatus] = useState(null);
  // Bỏ alertMessage và alertType vì đã dùng react-toastify
  // const [alertMessage, setAlertMessage] = useState("");
  // const [alertType, setAlertType] = useState("success");

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Hàm lấy danh sách hóa đơn từ service
  const fetchAllHoaDon = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listHoaDon();
      setAllHoaDon(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách hóa đơn");
      setAllHoaDon([]);
      toast.error("Không thể tải danh sách hóa đơn.", {
        // Hiển thị toast khi có lỗi
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllHoaDon();
  }, [fetchAllHoaDon]);

  // Lọc và phân trang dữ liệu (giữ nguyên)
  useEffect(() => {
    let filteredData = [...allHoaDon];

    if (searchTerm.trim()) {
      filteredData = filteredData.filter((hd) =>
        hd.ma.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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

    const totalFilteredElements = filteredData.length;
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setHoaDonList(paginatedData);
    setTotalElements(totalFilteredElements);
    setTotalPages(Math.ceil(totalFilteredElements / pageSize));
  }, [
    searchTerm,
    startDate,
    endDate,
    activeStatus,
    allHoaDon,
    currentPage,
    pageSize,
  ]);

  // Bỏ useEffect tự động xóa thông báo vì react-toastify tự quản lý
  // useEffect(() => {
  //   if (alertMessage) {
  //     const timer = setTimeout(() => setAlertMessage(""), 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [alertMessage]);

  // Hàm hiển thị badge trạng thái (giữ nguyên)
  const renderTrangThaiBadge = (trangThai) => {
    let label = "";
    let color = "";
    switch (trangThai) {
      case 0:
        label = "Chờ xác nhận";
        color = "#ffc107"; // Vàng
        break;
      case 1:
        label = "Chờ vận chuyển";
        color = "#17a2b8"; // Xanh lam
        break;
      case 2:
        label = "Đang vận chuyển";
        color = "#007bff"; // Xanh dương
        break;
      case 3:
        label = "Đã hoàn thành";
        color = "#28a745"; // Xanh lá
        break;
      case 4:
        label = "Đã hủy";
        color = "#dc3545"; // Đỏ
        break;
      case 5:
        label = "Hoàn tiền / Trả hàng";
        color = "#343a40"; // Đen
        break;
      case 6:
        label = "Chờ xác nhận tại quầy";
        color = "#6610f2"; // Tím
        break;
      default:
        label = "Không xác định";
        color = "#6c757d"; // Xám
    }
    return (
      <Chip
        label={label}
        sx={{
          bgcolor: color,
          color: white,
          fontWeight: 600,
          px: 1,
          fontSize: 11,
          borderRadius: "12px",
          height: 24,
        }}
      />
    );
  };

  // Danh sách tab trạng thái (giữ nguyên)
  const statusTabs = [
    { label: "Tất cả", status: null },
    { label: "Chờ xác nhận", status: 0 },
    { label: "Chờ vận chuyển", status: 1 },
    { label: "Đang vận chuyển", status: 2 },
    { label: "Đã hoàn thành", status: 3},
    { label: "Đã hủy", status: 4 },
    { label: "Hoàn tiền / Trả hàng", status: 5 }, // Thêm trạng thái này
    { label: "Chờ tại quầy", status: 6 }, // Thêm trạng thái này
  ];

  // Hàm đếm số lượng hóa đơn theo trạng thái (giữ nguyên)
  const getStatusCount = (status) => {
    if (status === null) return allHoaDon.length;
    return allHoaDon.filter((hd) => hd.trangThai === status).length;
  };

  // Hàm xóa bộ lọc ngày (giữ nguyên)
  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // Hàm xử lý thay đổi trang (giữ nguyên)
  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value - 1);
  }, []);

  // Hàm xử lý nhập liệu tìm kiếm (giữ nguyên)
  const handleSearchInput = useCallback((e) => {
    setSearchMa(e.target.value);
    setError(null);
  }, []);

  // Hàm xử lý tìm kiếm (giữ nguyên)
  const handleSearch = useCallback(() => {
    setSearchTerm(searchMa);
    setCurrentPage(0);
  }, [searchMa]);

  // Hàm xóa tìm kiếm (giữ nguyên)
  const handleClearSearch = useCallback(() => {
    setSearchMa("");
    setSearchTerm("");
    setCurrentPage(0);
    setError(null);
  }, []);

  // Hàm xử lý phím Enter để tìm kiếm (giữ nguyên)
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && searchMa.trim()) {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Hàm xử lý xem chi tiết hóa đơn
  const handleViewDetails = (id) => {
    navigate(`/admin/orders/${id}`);
    toast.info(`Đang chuyển đến chi tiết hóa đơn ID: ${id}`, {
      // Dùng toast thay vì setAlertMessage
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
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", p: isMobile ? 1 : 3 }}>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        fontWeight={700}
        color={black}
        align="center"
        sx={{ letterSpacing: 1.5, mb: 2 }}
      >
        QUẢN LÝ ĐƠN HÀNG
      </Typography>

      <Box mb={2}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Nhập mã hóa đơn..."
                value={searchMa}
                onChange={handleSearchInput}
                onKeyPress={handleKeyPress}
                error={!!error}
                helperText={error}
                sx={{
                  borderRadius: 2,
                  bgcolor: "#fafafa",
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
                InputProps={{
                  endAdornment: (
                    <>
                      {searchMa && (
                        <IconButton
                          color="default"
                          onClick={handleClearSearch}
                          edge="end"
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="warning"
                        onClick={handleSearch}
                        disabled={!!error || !searchMa.trim()}
                        edge="end"
                        size="small"
                      >
                        <SearchIcon />
                      </IconButton>
                    </>
                  ),
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color={black}
                sx={{ minWidth: 80 }}
              >
                Khoảng ngày:
              </Typography>
              <TextField
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 120 }}
              />
              <Typography fontWeight={600}>~</Typography>
              <TextField
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 120 }}
              />
              {(startDate || endDate) && (
                <IconButton
                  color="error"
                  onClick={resetDateFilter}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
        {statusTabs.map((tab) => (
          <Chip
            key={tab.label}
            label={`${tab.label} (${getStatusCount(tab.status)})`}
            clickable
            onClick={() => setActiveStatus(tab.status)}
            sx={{
              bgcolor: activeStatus === tab.status ? orange : "#f0f0f0",
              color: activeStatus === tab.status ? white : black,
              fontWeight: 600,
              px: 1.5,
              fontSize: 14,
              borderRadius: "16px",
              transition: "background-color 0.2s, color 0.2s",
              "&:hover": {
                bgcolor: activeStatus === tab.status ? "#ff9900" : "#e0e0e0",
              },
            }}
          />
        ))}
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          border: "1px solid #ffe0b2",
          mt: 1,
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: orange }}>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, border: 0, width: "5%" }}
              >
                #
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, border: 0, width: "12%" }}
              >
                MÃ HÓA ĐƠN
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, border: 0, width: "15%" }}
              >
                NGƯỜI ĐẶT HÀNG
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, border: 0, width: "15%" }}
              >
                NGƯỜI NHẬN HÀNG
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, border: 0, width: "12%" }}
              >
                NGÀY ĐẶT
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, border: 0, width: "12%" }}
              >
                NGÀY NHẬN
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, border: 0, width: "8%" }}
              >
                SỐ LƯỢNG SP
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, border: 0, width: "12%" }}
              >
                TỔNG TIỀN
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, border: 0, width: "15%" }}
              >
                TRẠNG THÁI
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, border: 0, width: "11%" }}
              >
                HÀNH ĐỘNG
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hoaDonList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary" fontSize={18}>
                    {searchTerm
                      ? `Không tìm thấy đơn hàng phù hợp với "${searchTerm}"`
                      : "Không có đơn hàng nào"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              hoaDonList.map((hd, idx) => (
                <TableRow
                  key={hd.id}
                  hover
                  sx={{
                    transition: "background 0.2s",
                    "&:hover": { backgroundColor: "#fffaf3" },
                    borderBottom: "1px solid #ffe0b2",
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      color: black,
                      border: 0,
                      width: "5%",
                    }}
                  >
                    {idx + 1 + currentPage * pageSize}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: black,
                      border: 0,
                      width: "12%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={hd.ma || "-"} arrow>
                      <span>{hd.ma}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: black,
                      fontWeight: 500,
                      border: 0,
                      width: "15%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={hd.nguoiDatHang || "-"} arrow>
                      <span>{hd.nguoiDatHang || "-"}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: black,
                      fontWeight: 500,
                      border: 0,
                      width: "15%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={hd.nguoiNhanHang || "-"} arrow>
                      <span>{hd.nguoiNhanHang || "-"}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0, width: "12%" }}>
                    {hd.ngayDat
                      ? new Date(hd.ngayDat).toLocaleDateString("vi-VN")
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0, width: "12%" }}>
                    {hd.ngayNhan
                      ? new Date(hd.ngayNhan).toLocaleDateString("vi-VN")
                      : "-"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      color: black,
                      border: 0,
                      width: "8%",
                    }}
                  >
                    {hd.tongSoLuongSp ?? 0}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: black,
                      border: 0,
                      width: "12%",
                    }}
                  >
                    {hd.tongTien?.toLocaleString()} VNĐ
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0, width: "15%" }}>
                    {renderTrangThaiBadge(hd.trangThai)}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0, width: "11%" }}>
                    <Tooltip title="Xem chi tiết" arrow>
                      <IconButton
                        sx={{
                          color: "#1976d2",
                          bgcolor: "#f4f8fd",
                          borderRadius: "50%",
                          width: 30,
                          height: 30,
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "#e3f2fd", color: "#0d47a1" },
                        }}
                        onClick={() => handleViewDetails(hd.id)}
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={3}
        flexWrap="wrap"
        gap={2}
      >
        <Pagination
          count={totalPages}
          page={currentPage + 1}
          onChange={handlePageChange}
          color="warning"
          shape="rounded"
        />
        <Typography>
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} (
          {totalElements} đơn hàng)
        </Typography>
      </Box>

      {/* Thay thế Snackbar bằng ToastContainer */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default OrderManagement;
