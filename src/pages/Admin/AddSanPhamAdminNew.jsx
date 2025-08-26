import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import {
  listXuatXu,
  listSanPham,
  listThuongHieu,
  listChatLieu,
  listMauSac,
  listKichCo,
  listHinhAnh,
  addSanPhamChiTiet,
  uploadHinhAnh,
} from "../../services/Website/ProductApis";
import {
  createSanPham,
  createXuatXu,
  createThuongHieu,
  createChatLieu,
} from "../../services/Admin/ThuocTinhSanPhamApi";
import { addChatLieu } from "../../services/Admin/ChatLieuService";
import { addMauSac } from "../../services/Admin/MauSacService";
import { addKichThuoc } from "../../services/Admin/KichThuocService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddSanPhamChiTietAdmin = () => {
  const navigate = useNavigate();
  // State cho danh sách lựa chọn
  const [xuatXuList, setXuatXuList] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [thuongHieuList, setThuongHieuList] = useState([]);
  const [chatLieuList, setChatLieuList] = useState([]);
  const [mauSacList, setMauSacList] = useState([]);
  const [kichCoList, setKichCoList] = useState([]);
  const [hinhAnhList, setHinhAnhList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageDescription, setImageDescription] = useState("");

  // State cho form
  const [selectedXuatXu, setSelectedXuatXu] = useState("");
  const [selectedSanPham, setSelectedSanPham] = useState("");
  const [selectedThuongHieu, setSelectedThuongHieu] = useState("");
  const [selectedChatLieu, setSelectedChatLieu] = useState("");
  const [moTa, setMoTa] = useState("");
  const [giaBan, setgiaBan] = useState("");
  const [soLuong, setSoLuong] = useState("");
  const [giaNhap, setGiaNhap] = useState("");

  // State cho màu sắc và kích cỡ
  const [selectedMauSac, setSelectedMauSac] = useState([]);
  const [selectedKichCo, setSelectedKichCo] = useState([]);
  const [tempMauSac, setTempMauSac] = useState([]);
  const [tempKichCo, setTempKichCo] = useState([]);

  // State cho modal
  const [openMauSac, setOpenMauSac] = useState(false);
  const [openKichCo, setOpenKichCo] = useState(false);
  const [openHinhAnh, setOpenHinhAnh] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  // State cho danh sách sản phẩm chi tiết
  const [sanPhamChiTietList, setSanPhamChiTietList] = useState([]);

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

  // State cho modal thêm nhanh màu sắc
  const [openModalMauSac, setOpenModalMauSac] = useState(false);
  const [tenMauSacMoi, setTenMauSacMoi] = useState("");
  const [maMauSacMoi, setMaMauSacMoi] = useState("#000000");

  // State cho modal thêm nhanh kích cỡ
  const [openModalKichCo, setOpenModalKichCo] = useState(false);
  const [tenKichCoMoi, setTenKichCoMoi] = useState("");

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setXuatXuList(await listXuatXu());
        setSanPhamList(await listSanPham());
        setThuongHieuList(await listThuongHieu());
        setChatLieuList(await listChatLieu());
        setMauSacList(await listMauSac());
        setKichCoList(await listKichCo());
        setHinhAnhList(await listHinhAnh());
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  // Xử lý chọn màu sắc
  const handleToggleMauSac = (id) => {
    setTempMauSac((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Xử lý chọn kích cỡ
  const handleToggleKichCo = (id) => {
    setTempKichCo((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  // Thêm sản phẩm chi tiết vào bảng tạm
  const handleAddSanPhamChiTiet = () => {
    if (
      !selectedSanPham ||
      !selectedXuatXu ||
      !selectedThuongHieu ||
      !selectedChatLieu ||
      !giaBan ||
      !soLuong ||
      !giaNhap ||
      selectedMauSac.length === 0 ||
      selectedKichCo.length === 0
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const giaNhapNum = parseFloat(giaNhap);
    const giaBanNum = parseFloat(giaBan);
    const soLuongNum = parseInt(soLuong);

    if (giaNhapNum < 0 || giaBanNum < 0 || soLuongNum < 0) {
      toast.error("Giá trị không được nhỏ hơn 0");
      return;
    }

    if (giaNhapNum > giaBanNum) {
      toast.error("Giá nhập không được lớn hơn giá bán");
      return;
    }

    const combinations = [];
    selectedMauSac.forEach((msId) => {
      selectedKichCo.forEach((kcId) => {
        combinations.push({
          sanPhamId: selectedSanPham,
          xuatXuId: selectedXuatXu,
          thuongHieuId: selectedThuongHieu,
          chatLieuId: selectedChatLieu,
          mauSacId: msId,
          kichCoId: kcId,
          moTa,
          giaBan: giaBan,
          soLuongTon: soLuong,
          giaNhap: giaNhap,
          hinhAnhId: null,
          hinhAnhUrl: null,
        });
      });
    });

    const sanPham = sanPhamList.find((sp) => sp.id === selectedSanPham)?.ten || "";
    const xuatXu = xuatXuList.find((xx) => xx.id === selectedXuatXu)?.ten || "";
    const thuongHieu =
      thuongHieuList.find((th) => th.id === selectedThuongHieu)?.ten || "";
    const chatLieu =
      chatLieuList.find((cl) => cl.id === selectedChatLieu)?.ten || "";

    const newSanPhamChiTietList = combinations.map((combo) => {
      const mauSac = mauSacList.find((ms) => ms.id === combo.mauSacId);
      const kichCo = kichCoList.find((kc) => kc.id === combo.kichCoId);

      return {
        ...combo,
        sanPhamTen: sanPham,
        xuatXuTen: xuatXu,
        thuongHieuTen: thuongHieu,
        chatLieuTen: chatLieu,
        mauSacTen: mauSac?.ten || "",
        mauSacMa: mauSac?.ma || "",
        kichCoTen: kichCo?.ten || "",
      };
    });

    setSanPhamChiTietList([...sanPhamChiTietList, ...newSanPhamChiTietList]);

    setSelectedSanPham("");
    setSelectedXuatXu("");
    setSelectedThuongHieu("");
    setSelectedChatLieu("");
    setSelectedMauSac([]);
    setSelectedKichCo([]);
    setMoTa("");
    setgiaBan("");
    setSoLuong("");
    setGiaNhap("");
  };

  // Xóa sản phẩm chi tiết khỏi bảng tạm
  const handleDeleteSanPhamChiTiet = (index) => {
    const newList = [...sanPhamChiTietList];
    newList.splice(index, 1);
    setSanPhamChiTietList(newList);
  };

  // Cập nhật field trong bảng tạm
  const handleUpdateField = (index, field, value) => {
    const newList = [...sanPhamChiTietList];
    newList[index][field] = value;
    setSanPhamChiTietList(newList);
  };

  // Mở dialog chọn hình ảnh
  const handleOpenImageDialog = (index) => {
    setCurrentImageIndex(index);
    setOpenHinhAnh(true);
  };

  // Chọn hình ảnh cho sản phẩm chi tiết
  const handleSelectImage = (hinhAnh) => {
    const newList = [...sanPhamChiTietList];
    newList[currentImageIndex] = {
      ...newList[currentImageIndex],
      hinhAnhId: hinhAnh.id,
      hinhAnhUrl: `http://localhost:8080/uploads/${hinhAnh.hinhAnh}`,
    };
    setSanPhamChiTietList(newList);
    setOpenHinhAnh(false);
  };

  // Lưu tất cả sản phẩm trong bảng tạm vào DB
  const handleSaveAll = async () => {
    for (const spct of sanPhamChiTietList) {
      const giaNhapNum = parseFloat(spct.giaNhap);
      const giaBanNum = parseFloat(spct.giaBan);
      const soLuongNum = parseInt(spct.soLuongTon);

      if (isNaN(giaNhapNum) || isNaN(giaBanNum) || isNaN(soLuongNum)) {
        toast.error("Vui lòng nhập giá trị hợp lệ cho tất cả các trường");
        return;
      }

      if (giaNhapNum < 0 || giaBanNum < 0 || soLuongNum < 0) {
        toast.error("Giá trị không được nhỏ hơn 0");
        return;
      }

      if (giaNhapNum > giaBanNum) {
        toast.error("Giá nhập không được lớn hơn giá bán");
        return;
      }
    }

    try {
      for (const spct of sanPhamChiTietList) {
        const requestData = {
          sanPhamId: spct.sanPhamId,
          mauSacId: spct.mauSacId,
          thuongHieuId: spct.thuongHieuId,
          kichThuocId: spct.kichCoId,
          xuatXuId: spct.xuatXuId,
          chatLieuId: spct.chatLieuId,
          hinhAnhSpId: spct.hinhAnhId || null,
          giaNhap: parseFloat(spct.giaNhap),
          giaBan: parseFloat(spct.giaBan),
          soLuong: parseInt(spct.soLuongTon),
          moTa: spct.moTa,
        };
        await addSanPhamChiTiet(requestData);
      }
      toast.success("Lưu tất cả sản phẩm thành công!");
      navigate("/admin/quan-ly-sp/san-pham");
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm chi tiết:", error);
      toast.error("Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại!");
    }
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
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Lỗi khi thêm kích cỡ.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    setUploading(true);
    try {
      // Sửa ở đây: truyền file và moTa riêng biệt
      const response = await uploadHinhAnh(selectedFile, imageDescription);
      
      // Cập nhật danh sách hình ảnh
      setHinhAnhList(await listHinhAnh());
      
      // Reset form
      setSelectedFile(null);
      setImageDescription("");
      
      toast.success("Upload hình ảnh thành công!");
    } catch (error) {
      console.error("Lỗi khi upload hình ảnh:", error);
      toast.error("Có lỗi xảy ra khi upload hình ảnh");
    } finally {
      setUploading(false);
    }
  };

  // --- Kết thúc phần xử lý cho các modal thêm nhanh ---

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Thêm sản phẩm chi tiết
      </Typography>

      {/* Form nhập liệu chính */}
      <Box sx={{ mb: 4, p: 3, border: "1px solid #ddd", borderRadius: "8px" }}>
        {/* Dòng 1 */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Sản phẩm</InputLabel>
              <Select
                value={selectedSanPham}
                onChange={(e) => setSelectedSanPham(e.target.value)}
              >
                <MenuItem value="">Chọn sản phẩm</MenuItem>
                {sanPhamList.map((sp) => (
                  <MenuItem key={sp.id} value={sp.id}>
                    {sp.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Thêm nhanh sản phẩm">
              <IconButton color="primary" onClick={handleOpenModalSanPham}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Xuất xứ</InputLabel>
              <Select
                value={selectedXuatXu}
                onChange={(e) => setSelectedXuatXu(e.target.value)}
              >
                <MenuItem value="">Chọn xuất xứ</MenuItem>
                {xuatXuList.map((xx) => (
                  <MenuItem key={xx.id} value={xx.id}>
                    {xx.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Thêm nhanh xuất xứ">
              <IconButton color="primary" onClick={handleOpenModalXuatXu}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Dòng 2 */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Thương hiệu</InputLabel>
              <Select
                value={selectedThuongHieu}
                onChange={(e) => setSelectedThuongHieu(e.target.value)}
              >
                <MenuItem value="">Chọn thương hiệu</MenuItem>
                {thuongHieuList.map((th) => (
                  <MenuItem key={th.id} value={th.id}>
                    {th.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Thêm nhanh thương hiệu">
              <IconButton color="primary" onClick={handleOpenModalThuongHieu}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Chất liệu</InputLabel>
              <Select
                value={selectedChatLieu}
                onChange={(e) => setSelectedChatLieu(e.target.value)}
              >
                <MenuItem value="">Chọn chất liệu</MenuItem>
                {chatLieuList.map((cl) => (
                  <MenuItem key={cl.id} value={cl.id}>
                    {cl.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Thêm nhanh chất liệu">
              <IconButton color="primary" onClick={handleOpenModalChatLieu}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Mô tả, giá, số lượng */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
          {/* <TextField
            label="Mô tả"
            multiline
            minRows={3}
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
          /> */}
          <Box sx={{ display: "flex", gap: 4 }}>
            <TextField
              label="Giá nhập"
              type="number"
              value={giaNhap}
              onChange={(e) => setGiaNhap(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Giá bán"
              type="number"
              value={giaBan}
              onChange={(e) => setgiaBan(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Số lượng"
              type="number"
              value={soLuong}
              onChange={(e) => setSoLuong(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
          </Box>
        </Box>

        {/* Màu sắc & kích cỡ */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Màu sắc:</Typography>
            <Tooltip title="Chọn màu sắc">
              <IconButton
                color="primary"
                onClick={() => {
                  setTempMauSac(selectedMauSac);
                  setOpenMauSac(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            {selectedMauSac.length > 0 &&
              mauSacList
                .filter((ms) => selectedMauSac.includes(ms.id))
                .map((ms) => (
                  <Chip
                    key={ms.id}
                    label={ms.ten}
                    sx={{
                      backgroundColor: ms.ma,
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  />
                ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Kích thước:</Typography>
            <Tooltip title="Chọn kích thước">
              <IconButton
                color="primary"
                onClick={() => {
                  setTempKichCo(selectedKichCo);
                  setOpenKichCo(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            {selectedKichCo.length > 0 &&
              kichCoList
                .filter((kc) => selectedKichCo.includes(kc.id))
                .map((kc) => <Chip key={kc.id} label={kc.ten} />)}
          </Box>
        </Box>

        {/* Nút thêm sản phẩm chi tiết */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleAddSanPhamChiTiet}
            disabled={
              !selectedSanPham ||
              !selectedXuatXu ||
              !selectedThuongHieu ||
              !selectedChatLieu ||
              !giaBan ||
              !soLuong ||
              !giaNhap ||
              selectedMauSac.length === 0 ||
              selectedKichCo.length === 0
            }
          >
            Thêm sản phẩm chi tiết
          </Button>
        </Box>
      </Box>

      {/* Bảng danh sách sản phẩm chi tiết tạm thời */}
      {sanPhamChiTietList.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Danh sách sản phẩm chi tiết
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Màu sắc</TableCell>
                  <TableCell>Kích thước</TableCell>
                  <TableCell>Hình ảnh</TableCell>
                  <TableCell>Giá nhập</TableCell>
                  <TableCell>Giá bán</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sanPhamChiTietList.map((spct, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{spct.sanPhamTen}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: spct.mauSacMa,
                            border: "1px solid #ddd",
                            borderRadius: "50%",
                          }}
                        />
                        {spct.mauSacTen}
                      </Box>
                    </TableCell>
                    <TableCell>{spct.kichCoTen}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {spct.hinhAnhUrl ? (
                          <img
                            src={spct.hinhAnhUrl}
                            alt={spct.sanPhamTen}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ bgcolor: "#e0e0e0" }}>
                            <ImageIcon color="action" />
                          </Avatar>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleOpenImageDialog(index)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={spct.giaNhap}
                        onChange={(e) =>
                          handleUpdateField(index, "giaNhap", e.target.value)
                        }
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={spct.giaBan}
                        onChange={(e) =>
                          handleUpdateField(index, "giaBan", e.target.value)
                        }
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={spct.soLuongTon}
                        onChange={(e) =>
                          handleUpdateField(index, "soLuongTon", e.target.value)
                        }
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteSanPhamChiTiet(index)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button variant="contained" color="success" onClick={handleSaveAll}>
              Lưu tất cả sản phẩm
            </Button>
          </Box>
        </Box>
      )}

      {/* --- PHẦN MODALS --- */}

      {/* Modal chọn hình ảnh */}
      <Dialog
        open={openHinhAnh}
        onClose={() => setOpenHinhAnh(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography>Chọn hình ảnh cho sản phẩm</Typography>
            <Tooltip title="Tải lên hình ảnh mới">
              <IconButton 
                color="primary" 
                onClick={() => document.getElementById('upload-image-input').click()}
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} /> : <AddIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Phần upload hình ảnh */}
          {selectedFile && (
            <Box sx={{ mb: 2, p: 2, border: "1px dashed #ddd", borderRadius: "4px" }}>
              <Typography variant="subtitle2" gutterBottom>
                Hình ảnh đã chọn: {selectedFile.name}
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Mô tả hình ảnh (tùy chọn)"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleUploadImage}
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={16} /> : null}
              >
                {uploading ? "Đang tải lên..." : "Tải lên"}
              </Button>
            </Box>
          )}

          {/* Input file ẩn */}
          <input
            id="upload-image-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />

          {/* Danh sách hình ảnh */}
          <Grid container spacing={2}>
            {hinhAnhList.map((hinhAnh) => (
              <Grid item xs={4} sm={3} md={2} key={hinhAnh.id}>
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    p: 1,
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                  onClick={() => handleSelectImage(hinhAnh)}
                >
                  <img
                    src={`http://localhost:8080/uploads/${hinhAnh.hinhAnh}`}
                    alt={hinhAnh.hinhAnh}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                  <Typography variant="caption" noWrap>
                    {hinhAnh.hinhAnh}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHinhAnh(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

      {/* Modal chọn màu sắc */}
      <Dialog
        open={openMauSac}
        onClose={() => setOpenMauSac(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography>Chọn màu sắc</Typography>
            <Tooltip title="Thêm nhanh màu sắc">
              <IconButton color="primary" onClick={handleOpenModalMauSac}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {mauSacList.map((ms) => (
              <ListItem
                key={ms.id}
                button
                onClick={() => handleToggleMauSac(ms.id)}
              >
                <ListItemIcon>
                  <Checkbox checked={tempMauSac.includes(ms.id)} />
                </ListItemIcon>
                <ListItemText primary={ms.ten} />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: ms.ma,
                    border: "1px solid #ddd",
                    borderRadius: "50%",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMauSac(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedMauSac(tempMauSac);
              setOpenMauSac(false);
            }}
          >
            Xong
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chọn kích cỡ */}
      <Dialog
        open={openKichCo}
        onClose={() => setOpenKichCo(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography>Chọn kích thước</Typography>
            <Tooltip title="Thêm nhanh kích thước">
              <IconButton color="primary" onClick={handleOpenModalKichCo}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {kichCoList.map((kc) => (
              <ListItem
                key={kc.id}
                button
                onClick={() => handleToggleKichCo(kc.id)}
              >
                <ListItemIcon>
                  <Checkbox checked={tempKichCo.includes(kc.id)} />
                </ListItemIcon>
                <ListItemText primary={kc.ten} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenKichCo(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedKichCo(tempKichCo);
              setOpenKichCo(false);
            }}
          >
            Xong
          </Button>
        </DialogActions>
      </Dialog>

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

      <ToastContainer />
    </Box>
  );
};

export default AddSanPhamChiTietAdmin;