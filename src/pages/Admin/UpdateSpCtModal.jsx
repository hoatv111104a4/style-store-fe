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

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load danh sách lựa chọn
        const [sanPham,thuongHieu, chatLieu, mauSac, kichCo, xuatXu, hinhAnh] = await Promise.all([
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
    
    // Chuẩn bị dữ liệu để gửi lên server
    const requestData = {
      idSanPham: formData.idSanPham,
      idMauSac: formData.idMauSac,
      idThuongHieu: formData.idThuongHieu,
      idKichThuoc: formData.idKichThuoc,
      idXuatXu: formData.idXuatXu,
      idChatLieu: formData.idChatLieu,
      idHinhAnhSp: formData.idHinhAnhSp,
      giaNhap: parseFloat(formData.giaNhap),
      giaBan: parseFloat(formData.giaBan),
      soLuong: parseInt(formData.soLuong),
      trangThai: parseInt(formData.trangThai),
      moTa: formData.moTa,
      giaBanGoc: parseFloat(formData.giaBanGoc || formData.giaBan) // Sử dụng giá ban nếu không có giá gốc
    };

    // Gọi API cập nhật
    await updateSanPhamCtAdmin(formData.id, requestData);
    
    // Hiển thị thông báo thành công
    alert("Cập nhật sản phẩm thành công!");
    setEditMode(false);
    
    // Có thể load lại dữ liệu nếu cần
    const updatedData = await getByIdSanPhamCtAdmin(id);
    setProductDetail(updatedData);
    
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    alert("Có lỗi xảy ra khi cập nhật sản phẩm!");
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
                    <IconButton color="primary" disabled={!editMode}>
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
                    <IconButton color="primary" disabled={!editMode}>
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
                    <IconButton color="primary" disabled={!editMode}>
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
                    <IconButton color="primary" disabled={!editMode}>
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
                    <IconButton color="primary" disabled={!editMode}>
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
                    <IconButton color="primary" disabled={!editMode}>
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
    </Box>
  );
};

export default UpdateSpCtPage;