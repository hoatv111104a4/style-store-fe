import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Modal,
  TextField,
} from "@mui/material";
import {
  getHoaDonById,
  deleteSanPhamHoaDon,
  getHoaDonUDDetail,
  updateHoaDonUDDetail,
  chuyenTrangThaiDonHang,
  getLichSuDonHang,
} from "../../services/Admin/HoaDonAdminServiceNew";
import { toast, ToastContainer } from "react-toastify";
import ProductModalPage from "./ModalSanPhamCt";
import "react-toastify/dist/ReactToastify.css";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { huyDonHang } from "../../services/Admin/HoaDonAdminServiceNew";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../Roboto-Regular-normal.js"; // Import font file

const HoaDonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [hoaDon, setHoaDon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    nguoiNhanHang: "",
    diaChiNhanHang: "",
    soDtNguoiNhan: "",
    tienThue: 0,
    tenNguoiGiaoHang: "",
    sdtNguoiGiaoHang: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [soTienConThieu, setSoTienConThieu] = useState(0);
  const [paying, setPaying] = useState(false);
  const [lichSu, setLichSu] = useState([]);
  const [loadingLichSu, setLoadingLichSu] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0 đ";
    const number = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(number) ? "0 đ" : number.toLocaleString("vi-VN") + " đ";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      0: { label: "Chờ xác nhận", color: "warning" },
      1: { label: "Đã xác nhận", color: "info" },
      2: { label: "Đang giao", color: "secondary" },
      3: { label: "Đã giao", color: "success" },
      4: { label: "Đã hủy", color: "error" },
    };
    return statusMap[status] || { label: "Không xác định", color: "default" };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getHoaDonById(id);
      setHoaDon(response);
      console.log("Chi tiết hóa đơn:", response);
      setError(null);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi load chi tiết hóa đơn:", error);
        setError("Không thể tải dữ liệu hóa đơn");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHuyDonHang = async () => {
  if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
  try {
    await huyDonHang(id);
    await fetchData();
    await fetchLichSu();
    toast.success("Hủy đơn hàng thành công");
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      navigate("/access-denied");
    } else {
      console.error("Lỗi khi hủy đơn hàng:", error);
      toast.error("Hủy đơn hàng thất bại, vui lòng thử lại.");
    }
  }
};

  const fetchLichSu = async () => {
    try {
      setLoadingLichSu(true);
      const data = await getLichSuDonHang(id);
      setLichSu(data || []);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
        setLichSu([]);
      }
    } finally {
      setLoadingLichSu(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLichSu();
    // eslint-disable-next-line
  }, [id]);

  const handleProductAdded = () => {
    fetchData();
    fetchLichSu();
  };

  const handleDeleteProduct = async (idHoaDonCt) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hoá đơn?")) return;
    try {
      setDeletingId(idHoaDonCt);
      await deleteSanPhamHoaDon(idHoaDonCt);
      await fetchData();
      await fetchLichSu();
      toast.success("Xóa sản phẩm thành công");
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi xóa sản phẩm khỏi hoá đơn:", error);
        toast.error("Xóa sản phẩm thất bại, vui lòng thử lại.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenUpdateModal = async () => {
    try {
      setUpdateLoading(true);
      const detail = await getHoaDonUDDetail(id);
      setUpdateFormData({
        nguoiNhanHang: detail.nguoiNhanHang || "",
        diaChiNhanHang: detail.diaChiNhanHang || "",
        soDtNguoiNhan: detail.soDtNguoiNhan || "",
        tienThue: detail.tienThue || 0,
        tenNguoiGiaoHang: detail.tenNguoiGiaoHang || "",
        sdtNguoiGiaoHang: detail.sdtNguoiGiaoHang || "",
      });
      setOpenUpdateModal(true);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi lấy thông tin vận chuyển:", error);
        toast.error("Không thể tải thông tin vận chuyển");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: name === "tienThue" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleUpdateSubmit = async () => {
    try {
      setUpdateLoading(true);
      const request = {
        nguoiNhanHang: updateFormData.nguoiNhanHang,
        diaChiNhanHang: updateFormData.diaChiNhanHang,
        soDtNguoiNhan: updateFormData.soDtNguoiNhan,
        tienThue: updateFormData.tienThue,
        tenNguoiGiaoHang: updateFormData.tenNguoiGiaoHang,
        sdtNguoiGiaoHang: updateFormData.sdtNguoiGiaoHang,
      };
      await updateHoaDonUDDetail(id, request);
      await fetchData();
      await fetchLichSu();
      toast.success("Cập nhật thành công");
      handleCloseUpdateModal();
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi cập nhật thông tin vận chuyển:", error);
        toast.error("Cập nhật thất bại, vui lòng thử lại.");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const isEditableStatus = () => {
    return hoaDon?.trangThai !== undefined && hoaDon.trangThai <= 2;
  };

  const isEditableStatus2 = () => {
  return hoaDon?.trangThai === 0;
};


  const getNextStatus = () => {
    if (!hoaDon) return 0;
    const currentStatus = hoaDon.trangThai;
    if (currentStatus < 3) return currentStatus + 1;
    return currentStatus;
  };

  const getStatusButtonLabel = () => {
    if (!hoaDon) return "Chuyển trạng thái";
    const nextStatus = getNextStatus();
    const statusLabels = {
      1: "Xác nhận đơn hàng",
      2: "Chuyển sang Đang giao",
      3: "Hoàn thành đơn hàng",
      4: "Đơn hàng đã hoàn thành",
    };
    return statusLabels[nextStatus] || "Chuyển trạng thái";
  };

  const handleChuyenTrangThai = async () => {
    const nextStatus = getNextStatus();
    if (
      hoaDon.trangThai === 2 &&
      hoaDon.tienKhachTra < hoaDon.tongTien + hoaDon.tienThue
    ) {
      setSoTienConThieu((hoaDon.tongTien + hoaDon.tienThue) - hoaDon.tienKhachTra);
      setOpenPayModal(true);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "${getStatusLabel(nextStatus).label}"?`)) return;

    try {
      setUpdatingStatus(true);
      await chuyenTrangThaiDonHang(id);
      await fetchData();
      await fetchLichSu();
      toast.success(`Chuyển trạng thái thành công sang "${getStatusLabel(nextStatus).label}"`);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi chuyển trạng thái đơn hàng:", error);
        toast.error("Chuyển trạng thái thất bại");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmPayAndChangeStatus = async () => {
    setPaying(true);
    try {
      await updateHoaDonUDDetail(id, {
        ...hoaDon,
        tienKhachTra: hoaDon.tongTien + hoaDon.tienThue,
      });
      await chuyenTrangThaiDonHang(id);
      await fetchData();
      await fetchLichSu();
      toast.success("Đã thu đủ tiền và chuyển trạng thái thành công");
      setOpenPayModal(false);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        console.error("Lỗi khi xác nhận thanh toán và chuyển trạng thái:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setPaying(false);
    }
  };

  const handleExportPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  // Define a consistent left margin and content width
  const leftMargin = 20;
  const contentWidth = 170;

  // 🔹 Sử dụng font Roboto Regular
  doc.setFont("Roboto-Regular", "normal");

  // 🔹 Tiêu đề
  doc.setFontSize(18);
  doc.text("HÓA ĐƠN BÁN HÀNG", 105, 20, { align: "center" });
  doc.setDrawColor(200);
  doc.line(leftMargin, 25, leftMargin + contentWidth, 25);

  // 🔹 Thông tin cửa hàng
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("CỬA HÀNG THỜI TRANG Style store", 105, 32, { align: "center" });
  doc.text("Địa chỉ: Cao đăng FPT , Phố Trịnh Văn Bô, Quận Nam Từ Liêm ,Hà Nội", 105, 37, { align: "center" });
  doc.text("Điện thoại: 0123.456.789 - Email: hoa573898@gmail.com", 105, 42, { align: "center" });

  // 🔹 Thông tin hóa đơn
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Mã hóa đơn: ${hoaDon.ma}`, leftMargin, 55);
  doc.text(
    `Ngày đặt: ${
      hoaDon.ngayDat ? new Date(hoaDon.ngayDat).toLocaleDateString("vi-VN") : ""
    }`,
    leftMargin,
    62
  );
  doc.text(`Trạng thái: ${getStatusLabel(hoaDon.trangThai).label}`, leftMargin + contentWidth, 55, { align: "right" });
  doc.text(`PT thanh toán: ${hoaDon.ptThanhToan}`, leftMargin + contentWidth, 62, { align: "right" });

  // 🔹 Thông tin khách hàng
  doc.setFont(undefined, "bold");
  doc.text("THÔNG TIN KHÁCH HÀNG", leftMargin, 75);
  doc.setFont("Roboto-Regular", "normal");

  doc.setDrawColor(200);
  doc.setFillColor(245);
  doc.rect(leftMargin, 78, contentWidth, 20, "F");

  // Splitting the address string to wrap it if it's too long
  const addressLines = doc.splitTextToSize(`Địa chỉ: ${hoaDon.diaChiNhanHang}`, 80);

  doc.text(`Người nhận: ${hoaDon.nguoiNhanHang}`, leftMargin + 5, 85);
  doc.text(`SĐT: ${hoaDon.soDtNguoiNhan}`, leftMargin + 5, 92);
  doc.text(addressLines, 105, 85);

  // 🔹 Bảng sản phẩm
  const body = hoaDon.sanPhams?.map((sp, idx) => [
    idx + 1,
    sp.tenSanPham,
    `Màu: ${sp.mauSacSanPham}\nCL: ${sp.chatLieuSanPham}\nTH: ${sp.thuongHieuSanPham}\nKT: ${
      sp.kichThuocSanPham || "N/A"
    }`,
    sp.soLuong,
    formatCurrency(sp.giaBanSanPham),
    formatCurrency(sp.soLuong * parseFloat(sp.giaBanSanPham))
  ]);
  const pageWidth = doc.internal.pageSize.getWidth();
const margin = 15; // lề trái/phải

  // Adjusting column widths to make the table wider
 autoTable(doc, {
  startY: 105,
  head: [["STT", "San pham", "Thông tin", "SL", "Gia tien", "Thanh tien"]],
  body,
  styles: {
    font: "Roboto-Regular",
    fontSize: 9,
    cellPadding: 2,
    valign: "middle"
  },
  headStyles: {
    fillColor: [60, 60, 60],
    textColor: 255,
    halign: "center"
  },
  // Căn lại tỉ lệ chiều rộng các cột dựa trên contentWidth
  columnStyles: {
    0: { halign: "center", cellWidth: 12 },                      // STT
    1: { cellWidth: 45 },                                        // Sản phẩm
    2: { cellWidth: 55 },                                        // Thông tin
    3: { halign: "center", cellWidth: 12 },                      // SL
    4: { halign: "right", cellWidth: 28 },                       // Đơn giá
    5: { halign: "right", cellWidth: 28 }                        // Thành tiền
  },
  margin: { left: margin, right: margin }
});

  // 🔹 Thông tin thanh toán
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, "bold");
  doc.text("THÔNG TIN THANH TOÁN", leftMargin, finalY);
  finalY += 5;

  doc.setDrawColor(200);
  doc.setFillColor(245);
  doc.rect(leftMargin, finalY, contentWidth, 45, "F");

  doc.setFont("Roboto-Regular", "normal");
  doc.text("Tiền hàng:", leftMargin + 5, finalY + 10);
  doc.text("Tiền ship:", leftMargin + 5, finalY + 17);
  doc.text("Tổng cộng:", leftMargin + 5, finalY + 24);
  doc.text("Tiền khách trả:", leftMargin + 5, finalY + 31);
  const conLai = hoaDon.tongTien + hoaDon.tienThue - hoaDon.tienKhachTra;
  doc.text("Còn lại:", leftMargin + 5, finalY + 38);

  const rightAlignX = leftMargin + contentWidth - 5;
  doc.text(formatCurrency(hoaDon.tongTien), rightAlignX, finalY + 10, { align: "right" });
  doc.text(formatCurrency(hoaDon.tienThue), rightAlignX, finalY + 17, { align: "right" });
  doc.text(formatCurrency(hoaDon.tongTien + hoaDon.tienThue), rightAlignX, finalY + 24, {
    align: "right"
  });
  doc.text(formatCurrency(hoaDon.tienKhachTra), rightAlignX, finalY + 31, {
    align: "right"
  });
  doc.text(formatCurrency(conLai), rightAlignX, finalY + 38, { align: "right" });

  // 🔹 Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Cảm ơn quý khách đã mua hàng!", 105, finalY + 60, { align: "center" });
  doc.text(
    "Hóa đơn được tạo vào: " + new Date().toLocaleString("vi-VN"),
    105,
    finalY + 65,
    { align: "center" }
  );

  // 🔹 Xuất PDF
  window.open(doc.output("bloburl"), "_blank");
};
  const getTimelineTitle = (tieuDe) => {
    switch (tieuDe) {
      case "1":
        return "Đã xác nhận";
      case "2":
        return "Đang giao";
      case "3":
        return "Đã giao";
      case "4":
        return "Đã huỷ";
      default:
        return tieuDe || "";
    }
  };

  const getTimelineNoiDung = (noiDung) => {
    switch (noiDung) {
      case "1":
        return "Đã xác nhận";
      case "2":
        return "Đang giao";
      case "3":
        return "Đã giao";
      case "4":
        return "Đã huỷ";
      default:
        return noiDung || "";
    }
  };

  const renderOrderHistoryTimeline = () => {
    if (loadingLichSu) {
      return (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'auto',
          py: 3,
          position: 'relative',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.2)',
            borderRadius: '3px',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            position: 'relative',
            zIndex: 1,
            gap: 2,
            px: 2,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 200,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                mb: 1,
                border: '2px solid white',
                boxShadow: 1,
                zIndex: 2,
              }}
            />
            <Paper
              elevation={3}
              sx={{
                p: 2,
                width: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Typography fontWeight="bold" color="warning.main">
                Chờ xác nhận
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                Đơn hàng đang chờ xác nhận
              </Typography>
            </Paper>
          </Box>
          {lichSu.slice().reverse().map((item, idx, arr) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 200,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: idx === arr.length - 1 ? 'primary.main' : 'grey.500',
                  mb: 1,
                  border: '2px solid white',
                  boxShadow: 1,
                  zIndex: 2,
                }}
              />
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  width: '100%',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography fontWeight="bold" color={idx === arr.length - 1 ? 'primary.main' : 'text.primary'}>
                  {getTimelineTitle(item.tieuDe) || `Trạng thái ${item.trangThai}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                  {getTimelineNoiDung(item.noiDung) || `Trạng thái ${item.trangThai}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleString() : ''}
                  {item.nguoiThucHien ? ` - ${item.nguoiThucHien}` : ''}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!hoaDon) {
    return (
      <Box p={3}>
        <Typography>Không tìm thấy thông tin hóa đơn</Typography>
      </Box>
    );
  }

  const statusInfo = getStatusLabel(hoaDon.trangThai);

  return (
    <Box p={3}>
      <ToastContainer />
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Lịch sử đơn hàng</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleChuyenTrangThai}
            disabled={updatingStatus || hoaDon.trangThai >= 3}
          >
            {updatingStatus ? "Đang chuyển..." : getStatusButtonLabel()}
          </Button>
        </Box>
        {renderOrderHistoryTimeline()}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5">
              Thông tin đơn hàng #{hoaDon.ma}
            </Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} variant="outlined" />
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenUpdateModal}
              disabled={!isEditableStatus()}
            >
              Cập nhật đơn hàng
            </Button>
            {hoaDon.trangThai === 0 || hoaDon.trangThai === 1 ? (
              <Button
                variant="contained"
                color="error"
                onClick={handleHuyDonHang}
              >
                Hủy đơn hàng
              </Button>
            ) : null}
            <Button
              variant="contained"
              color="success"
              onClick={handleExportPDF}
              disabled={hoaDon.trangThai === 0}
            >
              Xuất PDF
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex={1} minWidth={300}>
            <Typography variant="subtitle1" gutterBottom>
              <b>Thông tin thanh toán</b>
            </Typography>
            <Typography>
              <b>Phương thức:</b> {hoaDon.ptThanhToan}
            </Typography>
            <Typography>
              <b>Trạng thái thanh toán:</b> {hoaDon.trangThaiThanhToan === 1 ? "Đã thanh toán" : "Chưa thanh toán"}
            </Typography>
            <Typography>
              <b>Ngày đặt:</b> {hoaDon.ngayDat ? new Date(hoaDon.ngayDat).toLocaleString() : null}
            </Typography>
          </Box>
          <Box flex={1} minWidth={300}>
            <Typography variant="subtitle1" gutterBottom>
              <b>Thông tin khách hàng</b>
            </Typography>
            <Typography>
              <b>Người nhận:</b> {hoaDon.nguoiNhanHang}
            </Typography>
            <Typography>
              <b>SĐT:</b> {hoaDon.soDtNguoiNhan}
            </Typography>
            <Typography>
              <b>Địa chỉ:</b> {hoaDon.diaChiNhanHang}
            </Typography>
            <Typography>
              <b>Người giao hàng:</b> {hoaDon.tenNguoiGiaoHang}
            </Typography>
            <Typography>
              <b>SĐT người giao:</b> {hoaDon.sdtNguoiGiaoHang}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách sản phẩm
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>Thông tin</TableCell>
              <TableCell align="right">Đơn giá</TableCell>
              <TableCell align="right">Số lượng</TableCell>
              <TableCell align="right">Thành tiền</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hoaDon.sanPhams?.map((sp, index) => (
              <TableRow key={sp.idHoaDonCt}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <img
                      src={sp.hinhAnhSanPham ? `http://localhost:8080/uploads/${sp.hinhAnhSanPham}` : "/placeholder-image.png"}
                      alt={sp.tenSanPham}
                      style={{ objectFit: "cover", height: 80, width: 80, borderRadius: 8 }}
                    />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      {sp.tenSanPham}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    <b>Thương hiệu:</b> {sp.thuongHieuSanPham}
                  </Typography>
                  <Typography variant="body2">
                    <b>Màu:</b> {sp.mauSacSanPham}
                  </Typography>
                  <Typography variant="body2">
                    <b>Chất liệu:</b> {sp.chatLieuSanPham}
                  </Typography>
                </TableCell>
                <TableCell align="right">{formatCurrency(sp.giaBanSanPham)}</TableCell>
                <TableCell align="right">{sp.soLuong}</TableCell>
                <TableCell align="right">{formatCurrency(sp.soLuong * parseFloat(sp.giaBanSanPham))}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={deletingId === sp.idHoaDonCt || !isEditableStatus2()}
                    onClick={() => handleDeleteProduct(sp.idHoaDonCt)}
                  >
                    {deletingId === sp.idHoaDonCt ? "Đang xóa..." : "Xóa"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenProductModal(true)}
            disabled={!isEditableStatus2()}
          >
            Thêm sản phẩm
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="flex-end">
          <Box width={300}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tiền hàng:</Typography>
              <Typography>{formatCurrency(hoaDon.tongTien)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tiền ship:</Typography>
              <Typography>{formatCurrency(hoaDon.tienThue)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(hoaDon.tongTien + hoaDon.tienThue)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tiền khách trả:</Typography>
              <Typography>{formatCurrency(hoaDon.tienKhachTra)}</Typography>
            </Box>
            {hoaDon.tienKhachTra < hoaDon.tongTien + hoaDon.tienThue && (
              <Box mt={1}>
                <Typography color="error" fontWeight="bold">
                  Khách cần trả thêm {formatCurrency((hoaDon.tongTien + hoaDon.tienThue) - hoaDon.tienKhachTra)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <ProductModalPage
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        hoaDonId={id}
        onProductAdded={handleProductAdded}
      />

      <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Cập nhật thông tin vận chuyển
          </Typography>
          {updateLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Người nhận hàng"
                name="nguoiNhanHang"
                value={updateFormData.nguoiNhanHang}
                onChange={handleUpdateFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="SĐT người nhận"
                name="soDtNguoiNhan"
                value={updateFormData.soDtNguoiNhan}
                onChange={handleUpdateFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Tiền thuế"
                name="tienThue"
                type="number"
                value={updateFormData.tienThue}
                onChange={handleUpdateFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Tên người giao hàng"
                name="tenNguoiGiaoHang"
                value={updateFormData.tenNguoiGiaoHang}
                onChange={handleUpdateFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="SĐT người giao hàng"
                name="sdtNguoiGiaoHang"
                value={updateFormData.sdtNguoiGiaoHang}
                onChange={handleUpdateFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Địa chỉ nhận hàng"
                name="diaChiNhanHang"
                value={updateFormData.diaChiNhanHang}
                onChange={handleUpdateFormChange}
                margin="normal"
              />
              <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={handleCloseUpdateModal}>
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateSubmit}
                  disabled={updateLoading}
                >
                  {updateLoading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal open={openPayModal} onClose={() => setOpenPayModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Khách còn thiếu {formatCurrency(soTienConThieu)}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Vui lòng xác nhận đã thu đủ số tiền còn thiếu trước khi hoàn thành đơn hàng.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => setOpenPayModal(false)}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmPayAndChangeStatus}
              disabled={paying}
            >
              {paying ? "Đang xác nhận..." : "Đã thu đủ tiền, hoàn thành đơn"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HoaDonDetailPage;