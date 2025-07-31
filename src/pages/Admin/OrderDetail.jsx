import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHoaDonById,
  updateStatusHoaDon,
} from "../../services/Admin/HoaDonService";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  LocalShippingOutlined as LocalShippingOutlinedIcon,
  DoneAllOutlined as DoneAllOutlinedIcon,
  CancelOutlined as CancelOutlinedIcon,
  History as HistoryIcon,
  InfoOutlined as InfoOutlinedIcon,
  AccessTime as AccessTimeIcon,
  MonetizationOnOutlined as MonetizationOnOutlinedIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const orange = "#ff8800";
const black = "#222";
const white = "#fff";

const OrangeButton = styled(Button)(({ theme }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return {
    backgroundColor: orange,
    color: white,
    "&:hover": {
      backgroundColor: "#ff9900",
    },
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 2px 8px rgba(255,136,0,0.08)",
    padding: "8px 16px",
    minWidth: isMobile ? 140 : 160,
  };
});

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHoaDonById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết hóa đơn.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const renderTrangThaiBadge = (trangThai) => {
    let label = "";
    let color = "";
    let icon = null;
    switch (trangThai) {
      case 0:
        label = "Chờ xác nhận";
        color = "#ffc107";
        icon = (
          <AccessTimeIcon sx={{ color: white, fontSize: isMobile ? 16 : 18 }} />
        );
        break;
      case 1:
        label = "Chờ vận chuyển";
        color = "#17a2b8";
        icon = (
          <AccessTimeIcon sx={{ color: white, fontSize: isMobile ? 16 : 18 }} />
        );
        break;
      case 2:
        label = "Đang vận chuyển";
        color = "#007bff";
        icon = (
          <LocalShippingOutlinedIcon
            sx={{ color: white, fontSize: isMobile ? 16 : 18 }}
          />
        );
        break;
      case 3:
        label = "Đã hoàn thành";
        color = "#28a745";
        icon = (
          <DoneAllOutlinedIcon
            sx={{ color: white, fontSize: isMobile ? 16 : 18 }}
          />
        );
        break;
      case 4:
        label = "Đã hủy";
        color = "#dc3545";
        icon = (
          <CancelOutlinedIcon
            sx={{ color: white, fontSize: isMobile ? 16 : 18 }}
          />
        );
        break;
      case 5:
        label = "Hoàn tiền / Trả hàng";
        color = "#343a40";
        icon = (
          <MonetizationOnOutlinedIcon
            sx={{ color: white, fontSize: isMobile ? 16 : 18 }}
          />
        );
        break;
      case 6:
        label = "Chờ tại quầy";
        color = "#6610f2";
        icon = (
          <AccessTimeIcon sx={{ color: white, fontSize: isMobile ? 16 : 18 }} />
        );
        break;
      default:
        label = "Không xác định";
        color = "#6c757d";
        icon = (
          <InfoOutlinedIcon
            sx={{ color: white, fontSize: isMobile ? 16 : 18 }}
          />
        );
    }
    return (
      <Chip
        icon={icon}
        label={label}
        sx={{
          bgcolor: color,
          color: white,
          fontWeight: 600,
          px: isMobile ? 1.5 : 2,
          fontSize: isMobile ? 12 : 14,
          borderRadius: "16px",
          height: isMobile ? 28 : 30,
        }}
      />
    );
  };

  const renderPaymentType = (type) => {
    switch (type) {
      case 0:
        return "Thanh toán khi nhận hàng (COD)";
      case 1:
        return "Chuyển khoản ngân hàng";
      default:
        return "Không xác định";
    }
  };

  const handleChangeStatus = useCallback(
    async (newStatus) => {
      try {
        setLoading(true);
        // const updatedOrder = await updateStatusHoaDon(order.id, {
        //   ...order,
        //   trangThai: newStatus,
        // });
        const updatedOrder = await updateStatusHoaDon(order.id, newStatus);
        setOrder(updatedOrder);
        setAlertMessage(
          `Cập nhật trạng thái thành công: ${
            renderTrangThaiBadge(newStatus).props.label
          }`
        );
        setAlertType("success");
      } catch (err) {
        setAlertMessage("Cập nhật trạng thái thất bại.");
        setAlertType("error");
      } finally {
        setLoading(false);
      }
    },
    [order]
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress color="warning" size={isMobile ? 50 : 60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={isMobile ? 1 : 4}>
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2, fontSize: isMobile ? 13 : 16 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="text.secondary" fontSize={isMobile ? 15 : 18}>
          Không tìm thấy thông tin đơn hàng.
        </Typography>
      </Box>
    );
  }

  const mockStatusHistory = [
    { status: 0, timestamp: order.ngayTao },
    ...(order.trangThai >= 1
      ? [
          {
            status: 1,
            timestamp: new Date(
              new Date(order.ngayTao).getTime() + 1 * 60 * 60 * 1000
            ).toISOString(),
          },
        ]
      : []),
    ...(order.trangThai >= 2
      ? [
          {
            status: 2,
            timestamp: new Date(
              new Date(order.ngayTao).getTime() + 2 * 60 * 60 * 1000
            ).toISOString(),
          },
        ]
      : []),
    ...(order.trangThai >= 3
      ? [{ status: 3, timestamp: order.ngayNhan || new Date().toISOString() }]
      : []),
    ...(order.trangThai === 4
      ? [{ status: 4, timestamp: new Date().toISOString() }]
      : []),
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <Box
      sx={{
        bgcolor: white,
        minHeight: "100vh",
        p: isMobile ? 1 : 3,
        maxWidth: isMobile ? "100%" : 1400,
        mx: "auto",
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight={700}
        color={black}
        align="center"
        sx={{
          letterSpacing: 1.5,
          mb: isMobile ? 2 : 3,
          fontSize: isMobile ? 20 : 24,
        }}
      >
        CHI TIẾT ĐƠN HÀNG #{order.ma}
      </Typography>

      <Box mb={isMobile ? 2 : 3}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: orange,
            bgcolor: "#fff7f0",
            borderRadius: "50%",
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48,
            "&:hover": { bgcolor: "#ffe0b2", color: "#ff6f00" },
          }}
        >
          <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: isMobile ? 1 : 2,
          gridTemplateColumns: isMobile ? "1fr" : "7fr 3fr",
        }}
      >
        {/* Left Column: Status and Product List */}
        <Box sx={{ gridColumn: isMobile ? "span 1" : "1 / 2" }}>
          {/* Status Section */}
          <Paper
            sx={{
              p: isMobile ? 1.5 : 2.5,
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(255,136,0,0.08)",
              border: "1px solid #ffe0b2",
              mb: isMobile ? 1 : 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: isMobile ? 1 : 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={600}
                color={black}
                fontSize={isMobile ? 16 : 18}
              >
                Trạng Thái: {renderTrangThaiBadge(order.trangThai)}
              </Typography>
            </Box>

            <Divider sx={{ my: isMobile ? 1 : 2, borderColor: "#ffe0b2" }} />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              color={black}
              mb={isMobile ? 1 : 2}
              fontSize={isMobile ? 14 : 16}
            >
              Thay Đổi Trạng Thái
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                mb: isMobile ? 1 : 2,
              }}
            >
              {order.trangThai === 0 && (
                <OrangeButton
                  variant="contained"
                  onClick={() => handleChangeStatus(1)}
                  startIcon={<CheckCircleOutlineIcon />}
                >
                  Xác Nhận
                </OrangeButton>
              )}
              {order.trangThai === 1 && (
                <OrangeButton
                  variant="contained"
                  onClick={() => handleChangeStatus(2)}
                  startIcon={<LocalShippingOutlinedIcon />}
                >
                  Vận Chuyển
                </OrangeButton>
              )}
              {order.trangThai === 2 && (
                <OrangeButton
                  variant="contained"
                  onClick={() => handleChangeStatus(3)}
                  startIcon={<DoneAllOutlinedIcon />}
                >
                  Hoàn Thành
                </OrangeButton>
              )}
              {(order.trangThai === 0 || order.trangThai === 1) && (
                <OrangeButton
                  variant="contained"
                  onClick={() => handleChangeStatus(4)}
                  startIcon={<CancelOutlinedIcon />}
                  sx={{ bgcolor: "#dc3545", "&:hover": { bgcolor: "#c82333" } }}
                >
                  Hủy Đơn
                </OrangeButton>
              )}
            </Box>

            <Typography
              variant="subtitle1"
              fontWeight={600}
              color={black}
              mb={isMobile ? 1 : 2}
              fontSize={isMobile ? 14 : 16}
            >
              Lịch Sử Trạng Thái
            </Typography>
            <List dense>
              {mockStatusHistory.map((history, index) => (
                <ListItem key={index} sx={{ py: isMobile ? 0.5 : 1 }}>
                  <ListItemIcon>
                    <HistoryIcon
                      sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={renderTrangThaiBadge(history.status)}
                    secondary={
                      history.timestamp
                        ? format(
                            new Date(history.timestamp),
                            "dd/MM/yyyy HH:mm:ss",
                            { locale: vi }
                          )
                        : "Chưa cập nhật"
                    }
                    secondaryTypographyProps={{
                      color: "text.secondary",
                      fontSize: isMobile ? 11 : 13,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper
            sx={{
              p: isMobile ? 1.5 : 2.5,
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(255,136,0,0.08)",
              border: "1px solid #ffe0b2",
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={600}
              color={black}
              mb={isMobile ? 1 : 2}
              fontSize={isMobile ? 16 : 20}
            >
              Danh Sách Sản Phẩm ({order.chiTietHoaDon?.length || 0})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: orange }}>
                    <TableCell
                      sx={{
                        color: white,
                        fontWeight: 700,
                        border: 0,
                        width: "30%",
                        fontSize: isMobile ? 12 : 14,
                      }}
                    >
                      Tên Sản Phẩm
                    </TableCell>
                    <TableCell
                      sx={{
                        color: white,
                        fontWeight: 700,
                        border: 0,
                        width: "25%",
                        fontSize: isMobile ? 12 : 14,
                      }}
                    >
                      Giá Tiền
                    </TableCell>
                    <TableCell
                      sx={{
                        color: white,
                        fontWeight: 700,
                        border: 0,
                        width: "20%",
                        fontSize: isMobile ? 12 : 14,
                      }}
                    >
                      Số Lượng
                    </TableCell>
                    <TableCell
                      sx={{
                        color: white,
                        fontWeight: 700,
                        border: 0,
                        width: "25%",
                        fontSize: isMobile ? 12 : 14,
                      }}
                    >
                      Thành Tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.chiTietHoaDon && order.chiTietHoaDon.length > 0 ? (
                    order.chiTietHoaDon.map((item, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          transition: "background 0.2s",
                          "&:hover": { backgroundColor: "#fffaf3" },
                          borderBottom: "1px solid #ffe0b2",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            color: black,
                            border: 0,
                            fontSize: isMobile ? 12 : 14,
                          }}
                        >
                          {item.tenSanPham || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            color: black,
                            border: 0,
                            fontSize: isMobile ? 12 : 14,
                          }}
                        >
                          {item.giaTien != null && item.giaTien > 0
                            ? item.giaTien.toLocaleString() + " VNĐ"
                            : "Chưa có giá"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: black,
                            border: 0,
                            fontSize: isMobile ? 12 : 14,
                          }}
                        >
                          {item.soLuong || 0}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: black,
                            border: 0,
                            fontSize: isMobile ? 12 : 14,
                          }}
                        >
                          {item.thanhTien != null && item.thanhTien > 0
                            ? item.thanhTien.toLocaleString() + " VNĐ"
                            : "Chưa có giá"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ border: 0, py: isMobile ? 1 : 2 }}
                      >
                        <Typography
                          color="text.secondary"
                          fontSize={isMobile ? 14 : 16}
                        >
                          Không có sản phẩm trong đơn hàng.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Right Column: Customer and Payment Information */}
        <Box sx={{ gridColumn: isMobile ? "span 1" : "2 / 3" }}>
          <Paper
            sx={{
              p: isMobile ? 1.5 : 2.5,
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(255,136,0,0.08)",
              border: "1px solid #ffe0b2",
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={600}
              color={black}
              mb={isMobile ? 1 : 2}
              fontSize={isMobile ? 16 : 20}
            >
              Thông Tin Khách Hàng
            </Typography>
            <List dense>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <PersonIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Người Đặt Hàng"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={order.nguoiDatHang || "N/A"}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <PersonIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Người Nhận Hàng"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={order.nguoiNhanHang || "N/A"}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <EmailIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={order.email || "N/A"}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <PhoneIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Số Điện Thoại"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={order.sdt || "N/A"}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <HomeIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Địa Chỉ"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={order.diaChi || "N/A"}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
            </List>

            <Divider
              sx={{ my: isMobile ? 1.5 : 2.5, borderColor: "#ffe0b2" }}
            />

            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={600}
              color={black}
              mb={isMobile ? 1 : 2}
              fontSize={isMobile ? 16 : 20}
            >
              Thông Tin Thanh Toán
            </Typography>
            <List dense>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <InfoOutlinedIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Hình Thức Thanh Toán"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={renderPaymentType(order.hinhThucThanhToan)}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <MonetizationOnOutlinedIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Tổng Tiền Sản Phẩm"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={`${(
                    order.tongTienSanPham || 0
                  ).toLocaleString()} VNĐ`}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <MonetizationOnOutlinedIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Phí Vận Chuyển"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={`${(
                    order.phiVanChuyen || 0
                  ).toLocaleString()} VNĐ`}
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <MonetizationOnOutlinedIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Tổng Thành Toán"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={
                    <Typography
                      fontWeight={700}
                      color={orange}
                      fontSize={isMobile ? 13 : 15}
                    >
                      {(order.tongTien || 0).toLocaleString()} VNĐ
                    </Typography>
                  }
                />
              </ListItem>
            </List>

            <Divider
              sx={{ my: isMobile ? 1.5 : 2.5, borderColor: "#ffe0b2" }}
            />

            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={600}
              color={black}
              mb={isMobile ? 1 : 2}
              fontSize={isMobile ? 16 : 20}
            >
              Thông Tin Đặt Hàng
            </Typography>
            <List dense>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <AccessTimeIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Ngày Đặt"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={
                    order.ngayTao
                      ? format(new Date(order.ngayTao), "dd/MM/yyyy HH:mm:ss", {
                          locale: vi,
                        })
                      : "N/A"
                  }
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                <ListItemIcon>
                  <AccessTimeIcon
                    sx={{ color: orange, fontSize: isMobile ? 18 : 22 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Ngày Nhận Dự Kiến"
                  primaryTypographyProps={{ fontSize: isMobile ? 13 : 15 }}
                  secondary={
                    order.ngayNhan
                      ? format(new Date(order.ngayNhan), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "N/A"
                  }
                  secondaryTypographyProps={{
                    color: "text.secondary",
                    fontSize: isMobile ? 11 : 13,
                  }}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={!!alertMessage}
        autoHideDuration={4000}
        onClose={() => setAlertMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlertMessage("")}
          severity={alertType}
          sx={{
            bgcolor: alertType === "success" ? orange : "#e53935",
            color: white,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            fontSize: isMobile ? 12 : 14,
            p: isMobile ? 1 : 1.5,
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetail;
