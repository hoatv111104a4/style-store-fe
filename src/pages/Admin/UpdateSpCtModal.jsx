import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {
  getByIdSanPhamCtAdmin,
  listThuongHieu,
  listChatLieu,
  listMauSac,
  listKichCo,
  listXuatXu,
  listHinhAnh,
  listSanPham,
  updateSanPhamCtAdmin,
} from "../../services/Website/ProductApis";
import {
  createSanPham,
  createXuatXu,
  createThuongHieu,
} from "../../services/Admin/ThuocTinhSanPhamApi";
import { addChatLieu } from "../../services/Admin/ChatLieuService";
import { addMauSac } from "../../services/Admin/MauSacService";
import { addKichThuoc } from "../../services/Admin/KichThuocService";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const UpdateSpCtPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [productDetail, setProductDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [imageList, setImageList] = useState([]);

  // Danh sách lựa chọn
  const [thuongHieuList, setThuongHieuList] = useState([]);
  const [chatLieuList, setChatLieuList] = useState([]);
  const [mauSacList, setMauSacList] = useState([]);
  const [kichCoList, setKichCoList] = useState([]);
  const [xuatXuList, setXuatXuList] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    id: "",
    idSanPham: "",
    idMauSac: "",
    maMauSac: "",
    idThuongHieu: "",
    idKichThuoc: "",
    idXuatXu: "",
    idChatLieu: "",
    idHinhAnhSp: null,
    ma: "",
    giaNhap: "",
    giaBan: "",
    soLuong: "",
    trangThai: "",
    moTa: "",
    giaBanGoc: "",
  });

  // State cho modal thêm nhanh (chung)
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State cho các modal thêm nhanh
  const [openModalSanPham, setOpenModalSanPham] = useState(false);
  const [tenSanPhamMoi, setTenSanPhamMoi] = useState("");

  const [openModalXuatXu, setOpenModalXuatXu] = useState(false);
  const [tenXuatXuMoi, setTenXuatXuMoi] = useState("");

  const [openModalThuongHieu, setOpenModalThuongHieu] = useState(false);
  const [tenThuongHieuMoi, setTenThuongHieuMoi] = useState("");

  const [openModalChatLieu, setOpenModalChatLieu] = useState(false);
  const [tenChatLieuMoi, setTenChatLieuMoi] = useState("");

  const [openModalMauSac, setOpenModalMauSac] = useState(false);
  const [tenMauSacMoi, setTenMauSacMoi] = useState("");
  const [maMauSacMoi, setMaMauSacMoi] = useState("#000000");

  const [openModalKichCo, setOpenModalKichCo] = useState(false);
  const [tenKichCoMoi, setTenKichCoMoi] = useState("");

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load danh sách lựa chọn
        const [sanPham, thuongHieu, chatLieu, mauSac, kichCo, xuatXu, hinhAnh] = await Promise.all([
          listSanPham(),
          listThuongHieu(),
          listChatLieu(),
          listMauSac(),
          listKichCo(),
          listXuatXu(),
          listHinhAnh(),
        ]);
        setSanPhamList(sanPham);
        setThuongHieuList(thuongHieu);
        setChatLieuList(chatLieu);
        setMauSacList(mauSac);
        setKichCoList(kichCo);
        setXuatXuList(xuatXu);
        setImageList(hinhAnh);

        // Load chi tiết sản phẩm
        const data = await getByIdSanPhamCtAdmin(id);
        setProductDetail(data);
        
        // Set form data từ response của backend
        setFormData({
          id: data.id || "",
          idSanPham: data.idSanPham || "",
          idMauSac: data.idMauSac || "",
          maMauSac: data.maMauSac || "",
          idThuongHieu: data.idThuongHieu || "",
          idKichThuoc: data.idKichThuoc || "",
          idXuatXu: data.idXuatXu || "",
          idChatLieu: data.idChatLieu || "",
          idHinhAnhSp: data.idHinhAnhSp || null,
          ma: data.ma || "",
          giaNhap: data.giaNhap || "",
          giaBan: data.giaBan || "",
          soLuong: data.soLuong || "",
          trangThai: data.trangThai || "",
          moTa: data.moTa || "",
          giaBanGoc: data.giaBanGoc || "",
        });

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Hàm lấy tên từ id
  const getNameFromId = (id, list) => {
    const item = list.find(item => item.id === id);
    return item ? item.ten : "Không xác định";
  };

  // Hàm lấy mã màu từ id màu sắc
  const getColorCodeFromId = (id) => {
    const color = mauSacList.find(item => item.id === id);
    return color ? color.ma : "#ffffff";
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
  try {
    setLoading(true);
    console.log('Form data before save:', formData); // Log toàn bộ formData
    const requestData = {
      idSanPham: formData.idSanPham || "",
      idMauSac: formData.idMauSac || "",
      idThuongHieu: formData.idThuongHieu || "",
      idKichThuoc: formData.idKichThuoc || "",
      idXuatXu: formData.idXuatXu || "",
      idChatLieu: formData.idChatLieu || "",
      idHinhAnhSp: formData.idHinhAnhSp || null,
      ma: formData.ma || "",
      giaNhap: parseFloat(formData.giaNhap) || 0,
      giaBan: parseFloat(formData.giaBan) || 0,
      soLuong: parseInt(formData.soLuong) || 0,
      trangThai: parseInt(formData.trangThai) || 1,
      moTa: formData.moTa || "",
      giaBanGoc: parseFloat(formData.giaBanGoc) || parseFloat(formData.giaBan) || 0,
    };
    console.log('Request data:', requestData); // Log requestData gửi đi

    const response = await updateSanPhamCtAdmin(formData.id, requestData); // Lưu response
    console.log('API response:', response); // Log response từ backend

    toast.success("Cập nhật sản phẩm thành công!");
    setEditMode(false);

    const updatedData = await getByIdSanPhamCtAdmin(id);
    setProductDetail(updatedData);
  } catch (error) {
    const errorMessage = error.response?.data?.result || error.response?.data?.message || "Lỗi khi cập nhật sản phẩm!";
    console.error('Error details:', error); // Log full error
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleSelectImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      idHinhAnhSp: imageId
    }));
  };

  // --- Bắt đầu phần xử lý cho các modal thêm nhanh ---

  // Sản phẩm
  const handleOpenModalSanPham = () => setOpenModalSanPham(true);
  const handleCloseModalSanPham = () => {
    setOpenModalSanPham(false);
    setTenSanPhamMoi("");
    setErrorMessage("");
  };
  const handleAddSanPhamMoi = async () => {
    if (!tenSanPhamMoi.trim()) {
      setErrorMessage("Vui lòng nhập tên sản phẩm.");
      return;
    }
    setModalLoading(true);
    setErrorMessage("");
    try {
      await createSanPham({ ten: tenSanPhamMoi });
      handleCloseModalSanPham();
      setSanPhamList(await listSanPham());
      toast.success("Thêm sản phẩm thành công!");
    } catch (error) {
      setErrorMessage(error.message || "Lỗi khi thêm sản phẩm.");
    } finally {
      setModalLoading(false);
    }
  };

  // Xuất xứ
  const handleOpenModalXuatXu = () => setOpenModalXuatXu(true);
  const handleCloseModalXuatXu = () => {
    setOpenModalXuatXu(false);
    setTenXuatXuMoi("");
    setErrorMessage("");
  };
  const handleAddXuatXuMoi = async () => {
    if (!tenXuatXuMoi.trim()) {
      setErrorMessage("Vui lòng nhập tên xuất xứ.");
      return;
    }
    setModalLoading(true);
    setErrorMessage("");
    try {
      await createXuatXu({ ten: tenXuatXuMoi });
      handleCloseModalXuatXu();
      setXuatXuList(await listXuatXu());
      toast.success("Thêm xuất xứ thành công!");
    } catch (error) {
      setErrorMessage(error.message || "Lỗi khi thêm xuất xứ.");
    } finally {
      setModalLoading(false);
    }
  };

  // Thương hiệu
  const handleOpenModalThuongHieu = () => setOpenModalThuongHieu(true);
  const handleCloseModalThuongHieu = () => {
    setOpenModalThuongHieu(false);
    setTenThuongHieuMoi("");
    setErrorMessage("");
  };
  const handleAddThuongHieuMoi = async () => {
    if (!tenThuongHieuMoi.trim()) {
      setErrorMessage("Vui lòng nhập tên thương hiệu.");
      return;
    }
    setModalLoading(true);
    setErrorMessage("");
    try {
      await createThuongHieu({ ten: tenThuongHieuMoi });
      handleCloseModalThuongHieu();
      setThuongHieuList(await listThuongHieu());
      toast.success("Thêm thương hiệu thành công!");
    } catch (error) {
      setErrorMessage(error.message || "Lỗi khi thêm thương hiệu.");
    } finally {
      setModalLoading(false);
    }
  };

  // Chất liệu
  const handleOpenModalChatLieu = () => setOpenModalChatLieu(true);
  const handleCloseModalChatLieu = () => {
    setOpenModalChatLieu(false);
    setTenChatLieuMoi("");
    setErrorMessage("");
  };
  const handleAddChatLieuMoi = async () => {
    if (!tenChatLieuMoi.trim()) {
      setErrorMessage("Vui lòng nhập tên chất liệu.");
      return;
    }
    setModalLoading(true);
    setErrorMessage("");
    try {
      await addChatLieu({
        ma: `CL-${crypto.randomUUID().substring(0, 8)}`,
        ten: tenChatLieuMoi.trim(),
        moTa: "",
        trangThai: 1,
        ngayTao: new Date().toISOString(),
        ngaySua: new Date().toISOString(),
        ngayXoa: null,
      });
      handleCloseModalChatLieu();
      setChatLieuList(await listChatLieu());
      toast.success("Thêm chất liệu thành công!");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Lỗi khi thêm chất liệu.");
    } finally {
      setModalLoading(false);
    }
  };

  // Màu sắc
  const handleOpenModalMauSac = () => setOpenModalMauSac(true);
  const handleCloseModalMauSac = () => {
    setOpenModalMauSac(false);
    setTenMauSacMoi("");
    setMaMauSacMoi("#000000");
    setErrorMessage("");
  };
  const handleAddMauSacMoi = async () => {
    if (!tenMauSacMoi.trim() || !maMauSacMoi.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setModalLoading(true);
    setErrorMessage("");
    try {
      await addMauSac({
        ma: maMauSacMoi,
        ten: tenMauSacMoi.trim(),
        moTa: "",
        trangThai: 1,
        ngayTao: new Date().toISOString(),
        ngaySua: new Date().toISOString(),
        ngayXoa: null,
      });
      handleCloseModalMauSac();
      setMauSacList(await listMauSac());
      toast.success("Thêm màu sắc thành công!");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Lỗi khi thêm màu sắc.");
    } finally {
      setModalLoading(false);
    }
  };

  // Kích cỡ
  const handleOpenModalKichCo = () => setOpenModalKichCo(true);
  const handleCloseModalKichCo = () => {
    setOpenModalKichCo(false);
    setTenKichCoMoi("");
    setErrorMessage("");
  };
  const handleAddKichCoMoi = async () => {
    if (!tenKichCoMoi.trim()) {
      setErrorMessage("Vui lòng nhập tên kích cỡ.");
      return;
    }
    setModalLoading(true);
    setErrorMessage("");
    try {
      await addKichThuoc({
        ma: `KC-${crypto.randomUUID().substring(0, 8)}`,
        ten: tenKichCoMoi.trim(),
        moTa: "",
        trangThai: 1,
        ngayTao: new Date().toISOString(),
        ngaySua: new Date().toISOString(),
        ngayXoa: null,
      });
      handleCloseModalKichCo();
      setKichCoList(await listKichCo());
      toast.success("Thêm kích cỡ thành công!");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Lỗi khi thêm kích cỡ.");
    } finally {
      setModalLoading(false);
    }
  };

  // --- Kết thúc phần xử lý cho các modal thêm nhanh ---

  if (loading && !productDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!productDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Không tìm thấy sản phẩm</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {editMode ? "Chỉnh sửa sản phẩm" : "Chi tiết sản phẩm"}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<EditIcon />}
          onClick={handleEditToggle}
          variant={editMode ? "outlined" : "contained"}
          color={editMode ? "secondary" : "primary"}
        >
          {editMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
        </Button>
      </Box>

      {/* Main content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Thông tin cơ bản */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Thông tin cơ bản
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Trạng thái
                </Typography>
                <FormControl fullWidth size="medium">
                  <Select
                    name="trangThai"
                    value={formData.trangThai}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  >
                    <MenuItem value={1}>Đang kinh doanh</MenuItem>
                    <MenuItem value={0}>Ngừng kinh doanh</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          {/* Hình ảnh */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Hình ảnh
            </Typography>

            <Box display="flex" alignItems="center" mb={3}>
              {formData.idHinhAnhSp ? (
                <img
                  src={`http://localhost:8080/uploads/${
                    imageList.find((img) => img.id === formData.idHinhAnhSp)
                      ?.hinhAnh
                  }`}
                  alt="Product"
                  style={{
                    width: 160,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginRight: 16,
                  }}
                />
              ) : (
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 160,
                    height: 160,
                    bgcolor: "#e0e0e0",
                    mr: 2,
                    fontSize: "1.5rem",
                  }}
                >
                  No Image
                </Avatar>
              )}

              {editMode && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Chọn hình ảnh
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {imageList.slice(0, 4).map((image) => (
                      <Box
                        key={image.id}
                        sx={{
                          border:
                            formData.idHinhAnhSp === image.id
                              ? "2px solid #1976d2"
                              : "1px solid #ddd",
                          borderRadius: 1,
                          p: 0.5,
                          cursor: "pointer",
                          "&:hover": {
                            borderColor: "primary.main",
                          },
                        }}
                        onClick={() => handleSelectImage(image.id)}
                      >
                        <img
                          src={`http://localhost:8080/uploads/${image.hinhAnh}`}
                          alt={image.hinhAnh}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                    <Tooltip title="Xem thêm hình ảnh">
                      <IconButton color="primary">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Thông tin chi tiết */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Thông tin chi tiết
            </Typography>

            <Grid container spacing={3}>
              {/* Dòng 1 - Sản phẩm & Thương hiệu */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
                    <InputLabel>Sản phẩm</InputLabel>
                    <Select
                      name="idSanPham"
                      value={formData.idSanPham}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      label="Sản phẩm"
                    >
                      {sanPhamList.map((sp) => (
                        <MenuItem key={sp.id} value={sp.id}>
                          {sp.ten}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Thêm nhanh sản phẩm">
                    <IconButton color="primary" disabled={!editMode} onClick={handleOpenModalSanPham}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth size="medium" sx={{ mr: 1 }}>
                    <InputLabel>Thương hiệu</InputLabel>
                    <Select
                      name="idThuongHieu"
                      value={formData.idThuongHieu}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      label="Thương hiệu"
                    >
                      {thuongHieuList.map((th) => (
                        <MenuItem key={th.id} value={th.id}>
                          {th.ten}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Thêm nhanh thương hiệu">
                    <IconButton color="primary" disabled={!editMode} onClick={handleOpenModalThuongHieu}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Dòng 1 - Xuất xứ */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth size="medium" sx={{ mr: 1 }}>
                    <InputLabel>Xuất xứ</InputLabel>
                    <Select
                      name="idXuatXu"
                      value={formData.idXuatXu}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      label="Xuất xứ"
                    >
                      {xuatXuList.map((xx) => (
                        <MenuItem key={xx.id} value={xx.id}>
                          {xx.ten}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Thêm nhanh xuất xứ">
                    <IconButton color="primary" disabled={!editMode} onClick={handleOpenModalXuatXu}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Dòng 2 - Chất liệu & Màu sắc */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth size="medium" sx={{ mr: 1 }}>
                    <InputLabel>Chất liệu</InputLabel>
                    <Select
                      name="idChatLieu"
                      value={formData.idChatLieu}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      label="Chất liệu"
                    >
                      {chatLieuList.map((cl) => (
                        <MenuItem key={cl.id} value={cl.id}>
                          {cl.ten}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Thêm nhanh chất liệu">
                    <IconButton color="primary" disabled={!editMode} onClick={handleOpenModalChatLieu}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth size="medium" sx={{ mr: 1 }}>
                    <InputLabel>Màu sắc</InputLabel>
                    <Select
                      name="idMauSac"
                      value={formData.idMauSac}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      label="Màu sắc"
                    >
                      {mauSacList.map((ms) => (
                        <MenuItem key={ms.id} value={ms.id}>
                          <Box display="flex" alignItems="center">
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: ms.ma,
                                border: "1px solid #ddd",
                                borderRadius: "50%",
                                mr: 1,
                              }}
                            />
                            {ms.ten}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Thêm nhanh màu sắc">
                    <IconButton color="primary" disabled={!editMode} onClick={handleOpenModalMauSac}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Dòng 3 - Kích thước */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth size="medium" sx={{ mr: 1 }}>
                    <InputLabel>Kích thước</InputLabel>
                    <Select
                      name="idKichThuoc"
                      value={formData.idKichThuoc}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      label="Kích thước"
                    >
                      {kichCoList.map((kc) => (
                        <MenuItem key={kc.id} value={kc.id}>
                          {kc.ten}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title="Thêm nhanh kích thước">
                    <IconButton color="primary" disabled={!editMode} onClick={handleOpenModalKichCo}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Dòng 4 - Giá cả & Số lượng */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="giaNhap"
                  label="Giá nhập"
                  type="number"
                  value={formData.giaNhap}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="giaBan"
                  label="Giá bán"
                  type="number"
                  value={formData.giaBan}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="soLuong"
                  label="Số lượng tồn"
                  type="number"
                  value={formData.soLuong}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>

              
              
            </Grid>
            {/* Mô tả */}
            <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  name="moTa"
                  label="Mô tả"
                  value={formData.moTa}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  sx={{ mt: 2 }}
                />
              </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={handleBack} sx={{ minWidth: 120 }}>
          Quay lại
        </Button>

        {editMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            disabled={loading}
            sx={{ minWidth: 120 }}
            >
            {loading ? (
                <CircularProgress size={24} color="inherit" />
            ) : (
                "Lưu thay đổi"
            )}
            </Button>
        )}
      </Box>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* --- PHẦN MODALS --- */}

      {/* Modal thêm nhanh sản phẩm */}
      <Dialog
        open={openModalSanPham}
        onClose={handleCloseModalSanPham}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm sản phẩm nhanh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên sản phẩm"
            fullWidth
            variant="outlined"
            value={tenSanPhamMoi}
            onChange={(e) => setTenSanPhamMoi(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModalSanPham}
            color="secondary"
            disabled={modalLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddSanPhamMoi}
            color="primary"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm nhanh Xuất xứ */}
      <Dialog
        open={openModalXuatXu}
        onClose={handleCloseModalXuatXu}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm xuất xứ nhanh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên xuất xứ"
            fullWidth
            variant="outlined"
            value={tenXuatXuMoi}
            onChange={(e) => setTenXuatXuMoi(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModalXuatXu}
            color="secondary"
            disabled={modalLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddXuatXuMoi}
            color="primary"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm nhanh Thương hiệu */}
      <Dialog
        open={openModalThuongHieu}
        onClose={handleCloseModalThuongHieu}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm thương hiệu nhanh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên thương hiệu"
            fullWidth
            variant="outlined"
            value={tenThuongHieuMoi}
            onChange={(e) => setTenThuongHieuMoi(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModalThuongHieu}
            color="secondary"
            disabled={modalLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddThuongHieuMoi}
            color="primary"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm nhanh Chất liệu */}
      <Dialog
        open={openModalChatLieu}
        onClose={handleCloseModalChatLieu}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm chất liệu nhanh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên chất liệu"
            fullWidth
            variant="outlined"
            value={tenChatLieuMoi}
            onChange={(e) => setTenChatLieuMoi(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModalChatLieu}
            color="secondary"
            disabled={modalLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddChatLieuMoi}
            color="primary"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm nhanh Màu sắc */}
      <Dialog
        open={openModalMauSac}
        onClose={handleCloseModalMauSac}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm màu sắc nhanh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên màu sắc"
            fullWidth
            variant="outlined"
            value={tenMauSacMoi}
            onChange={(e) => setTenMauSacMoi(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
          <TextField
            margin="dense"
            label="Mã màu"
            type="color"
            fullWidth
            variant="outlined"
            value={maMauSacMoi}
            onChange={(e) => setMaMauSacMoi(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModalMauSac}
            color="secondary"
            disabled={modalLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddMauSacMoi}
            color="primary"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm nhanh Kích cỡ */}
      <Dialog
        open={openModalKichCo}
        onClose={handleCloseModalKichCo}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm kích cỡ nhanh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên kích cỡ"
            fullWidth
            variant="outlined"
            value={tenKichCoMoi}
            onChange={(e) => setTenKichCoMoi(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModalKichCo}
            color="secondary"
            disabled={modalLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddKichCoMoi}
            color="primary"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpdateSpCtPage;