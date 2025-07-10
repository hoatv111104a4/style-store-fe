import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listHoaDon } from "../../services/Admin/HoaDonService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  useMediaQuery,
  styled,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const orange = "#ff8800";
const black = "#222";
const white = "#fff";

const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: orange,
  color: white,
  "&:hover": {
    backgroundColor: "#ff9900",
  },
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "0 2px 8px rgba(255,136,0,0.08)",
}));

const OrderManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [allHoaDon, setAllHoaDon] = useState([]);
  const [hoaDonList, setHoaDonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMa, setSearchMa] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeStatus, setActiveStatus] = useState(null);

  const fetchAllHoaDon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listHoaDon();
      setAllHoaDon(data || []);
      setHoaDonList(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách hóa đơn");
      setAllHoaDon([]);
      setHoaDonList([]);
      toast.error("Không thể tải danh sách hóa đơn", {
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

  useEffect(() => {
    let filteredData = [...allHoaDon];
    if (searchMa.trim()) {
      filteredData = filteredData.filter((hd) =>
        hd.ma.toLowerCase().includes(searchMa.toLowerCase())
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
    setHoaDonList(filteredData);
  }, [searchMa, startDate, endDate, activeStatus, allHoaDon]);

  const renderTrangThaiBadge = (trangThai) => {
    let label = "";
    let bgcolor = "#6c757d";
    let color = white;
    switch (trangThai) {
      case 0:
        label = "Chờ xác nhận";
        bgcolor = "#ffca28";
        color = black;
        break;
      case 1:
        label = "Đã thanh toán";
        bgcolor = "#43a047"; // xanh lá cây đậm
        color = white;
        break;
      case 2:
        label = "Đang vận chuyển";
        bgcolor = "#1976d2";
        color = white;
        break;
      case 3:
        label = "Chờ vận chuyển";
        bgcolor = "#a3e635";
        color = "#1a2e05";
        break;
      case 4:
        label = "Đã hủy";
        bgcolor = "#e53935";
        color = white;
        break;
      case 5:
        label = "Hoàn tiền / Trả hàng";
        bgcolor = "#343a40";
        color = white;
        break;
      default:
        label = "Không xác định";
    }
    return (
      <Chip
        label={label}
        sx={{
          bgcolor,
          color,
          fontWeight: 600,
          px: 1.5,
          fontSize: 14,
          borderRadius: "16px",
        }}
      />
    );
  };

  const statusTabs = [
    { label: "Tất cả", status: null },
    { label: "Chờ xác nhận", status: 0 },
    { label: "Đã thanh toán", status: 1 },
    { label: "Chờ vận chuyển", status: 3 },
    { label: "Đang vận chuyển", status: 2 },
    { label: "Đã hủy", status: 4 },
    { label: "Hoàn tiền / Trả hàng", status: 5 },
  ];

  const getStatusCount = (status) =>
    status === null
      ? allHoaDon.length
      : allHoaDon.filter((hd) => hd.trangThai === status).length;

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    toast.info("Đã xóa bộ lọc ngày", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleSearch = () => {
    if (!searchMa.trim()) {
      toast.error("Vui lòng nhập mã hóa đơn để tìm kiếm", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!/^[\p{L}\s\d]+$/u.test(searchMa.trim())) {
      toast.error("Mã hóa đơn chỉ được chứa chữ cái, số và khoảng trắng", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchMa.trim()) {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchMa("");
    toast.info("Đã xóa bộ lọc mã", {
      position: "top-right",
      autoClose: 3000,
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

  if (error && !hoaDonList.length) {
    return (
      <Box m={4}>
        <Box
          sx={{
            bgcolor: "#e53935",
            color: white,
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            mb: 2,
          }}
        >
          {error}
          <Box mt={2}>
            <OrangeButton
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchAllHoaDon}
            >
              Thử lại
            </OrangeButton>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: white, minHeight: "100vh", p: isMobile ? 1 : 4 }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastStyle={{
          backgroundColor: white,
          color: black,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />
      <Box display="flex" alignItems="center" mb={3}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={700}
          color={black}
          align="center"
          sx={{ letterSpacing: 2, flexGrow: 1 }}
        >
          QUẢN LÝ ĐƠN HÀNG / HÓA ĐƠN
        </Typography>
      </Box>

      {/* Bộ lọc */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={7}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Tìm kiếm mã hóa đơn..."
              value={searchMa}
              onChange={(e) => setSearchMa(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                borderRadius: 2,
                bgcolor: "#fafafa",
                maxWidth: 350,
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
                      disabled={!searchMa.trim()}
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
        <Grid item xs={12} md={5}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{
                borderRadius: 2,
                bgcolor: "#fafafa",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              InputLabelProps={{ shrink: true }}
            />
            <Typography fontWeight={700}>~</Typography>
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{
                borderRadius: 2,
                bgcolor: "#fafafa",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              InputLabelProps={{ shrink: true }}
            />
            {(startDate || endDate) && (
              <OrangeButton
                variant="outlined"
                onClick={resetDateFilter}
                sx={{ borderColor: orange, color: orange }}
              >
                <CloseIcon />
              </OrangeButton>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Tabs trạng thái */}
      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {statusTabs.map((tab) => (
          <Button
            key={tab.label}
            variant={activeStatus === tab.status ? "contained" : "outlined"}
            sx={{
              borderRadius: "16px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 0.5,
              bgcolor: activeStatus === tab.status ? orange : white,
              color: activeStatus === tab.status ? white : black,
              borderColor: orange,
              "&:hover": {
                bgcolor: activeStatus === tab.status ? "#ff9900" : "#fffaf3",
                borderColor: orange,
              },
            }}
            onClick={() => setActiveStatus(tab.status)}
          >
            {tab.label}
            <Chip
              label={getStatusCount(tab.status)}
              sx={{
                ml: 1,
                bgcolor: "#6c757d",
                color: white,
                fontSize: "0.8rem",
                borderRadius: "16px",
              }}
            />
          </Button>
        ))}
      </Box>

      {/* Table */}
      <TableContainer
        component={Box}
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          border: "1px solid #ffe0b2",
          mt: 1,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: orange }}>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, width: "5%", border: 0 }}
              >
                #
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Mã
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Người đặt
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Người nhận
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "15%", border: 0 }}
              >
                Địa chỉ
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, width: "5%", border: 0 }}
              >
                SLSP
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Tổng tiền
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "8%", border: 0 }}
              >
                Thuế
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "8%", border: 0 }}
              >
                Ngày đặt
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "8%", border: 0 }}
              >
                Ngày nhận
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Ngày tạo
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Trạng thái
              </TableCell>
              <TableCell
                sx={{ color: white, fontWeight: 700, width: "10%", border: 0 }}
              >
                Mô tả
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: white, fontWeight: 700, width: "8%", border: 0 }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hoaDonList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} align="center">
                  <Typography color="text.secondary" fontSize={18}>
                    {searchMa
                      ? `Không tìm thấy hóa đơn với mã "${searchMa}"`
                      : "Không có hóa đơn nào"}
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
                    sx={{ fontWeight: 600, color: black, border: 0 }}
                  >
                    {idx + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: black,
                      letterSpacing: 1,
                      border: 0,
                    }}
                  >
                    {hd.ma || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.nguoiDatHang || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.nguoiNhanHang || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.diaChiNhanHang || "N/A"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.tongSoLuongSp ?? 0}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.tongTien
                      ? hd.tongTien.toLocaleString("vi-VN") + " đ"
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.tienThue
                      ? hd.tienThue.toLocaleString("vi-VN") + " đ"
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.ngayDat
                      ? new Date(hd.ngayDat).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.ngayNhan
                      ? new Date(hd.ngayNhan).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.ngayTao
                      ? new Date(hd.ngayTao).toLocaleString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
                    {renderTrangThaiBadge(hd.trangThai)}
                  </TableCell>
                  <TableCell
                    sx={{ color: black, fontWeight: 500, border: 0 }}
                  >
                    {hd.moTa || "N/A"}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
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
                      onClick={() => navigate(`/admin/hoa-don/${hd.id}`)}
                      size="small"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderManagement;