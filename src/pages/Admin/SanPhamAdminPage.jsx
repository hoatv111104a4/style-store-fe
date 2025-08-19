import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add"; // <-- THÊM IMPORT NÀY

import {
  listThuongHieu,
  listChatLieu,
  listMauSac,
  listKichCo,
  getPageSanPhamAdmin,
  chuyenTrangThaiSPCT,
  chuyenTrangThaiSP,
} from "../../services/Website/ProductApis";

const SanPhamAdminPage = () => {
  const { sanPhamId } = useParams();
  const navigate = useNavigate();

  if (!sanPhamId) {
    return <Typography color="error">Lỗi: Không tìm thấy ID sản phẩm.</Typography>;
  }

  const [sanPhamList, setSanPhamList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    tenSanPham: "",
    thuongHieuId: "",
    mauSacId: "",
    chatLieuId: "",
    kichThuocId: "",
    minPrice: "",
    maxPrice: "",
    sortOrder: "",
    size: 12,
  });
  const [thuongHieuList, setThuongHieuList] = useState([]);
  const [mauSacList, setMauSacList] = useState([]);
  const [kichCoList, setKichCoList] = useState([]);
  const [chatLieuList, setChatLieuList] = useState([]);
  const [tenSanPhamGoc, setTenSanPhamGoc] = useState(""); // State để lưu tên sản phẩm gốc

  // Lấy danh sách filter options
  useEffect(() => {
    Promise.all([listThuongHieu(), listMauSac(), listKichCo(), listChatLieu()])
      .then(([thuongHieu, mauSac, kichCo, chatLieu]) => {
        setThuongHieuList(thuongHieu);
        setMauSacList(mauSac);
        setKichCoList(kichCo);
        setChatLieuList(chatLieu);
      })
      .catch((error) => console.error("Lỗi khi lấy danh sách filter:", error));
  }, []);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPageSanPhamAdmin(sanPhamId, { ...filters, page });
        if (data && data.content) {
          setSanPhamList(data.content);
          setTotalPages(data.totalPages || 0);
          // Lấy tên sản phẩm gốc từ item đầu tiên (nếu có)
          if (data.content.length > 0) {
            setTenSanPhamGoc(data.content[0].tenSanPham);
          }
        } else {
          setSanPhamList([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error.message);
        setSanPhamList([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filters, sanPhamId]);

  // Xử lý xem chi tiết sản phẩm
  const handleViewProduct = (id) => {
    navigate(`/admin/san-pham-chi-tiet/chi-tiet/${id}`);
  };
  
  // =======================================================
  // === BẮT ĐẦU PHẦN CODE MỚI ===
  
  // Xử lý khi nhấn nút thêm phiên bản
  const handleAddVariant = () => {
    navigate('/admin/quan-ly-sp/them-san-pham');
  };

  // === KẾT THÚC PHẦN CODE MỚI ===
  // =======================================================


  // Xử lý chuyển trạng thái sản phẩm
  const handleChangeStatus = async (id, currentStatus) => {
    try {
      await chuyenTrangThaiSPCT(id);
      setSanPhamList(prevList =>
        prevList.map(item =>
          item.id === id ? { ...item, trangThai: currentStatus === 1 ? 0 : 1 } : item
        )
      );
    } catch (error) {
      console.error("Lỗi khi chuyển trạng thái:", error);
    }
  };

  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      tenSanPham: "",
      thuongHieuId: "",
      mauSacId: "",
      chatLieuId: "",
      kichThuocId: "",
      minPrice: "",
      maxPrice: "",
      sortOrder: "",
      size: 12,
    });
    setPage(0);
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* // ======================================================= */}
      {/* // === BẮT ĐẦU PHẦN JSX MỚI === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
           Quản lý phiên bản: {tenSanPhamGoc}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVariant}
        >
          Thêm sản phẩm chi tiết
        </Button>
      </Box>
      {/* // === KẾT THÚC PHẦN JSX MỚI === */}
      {/* // ======================================================= */}


      {/* Bộ lọc */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
        <Select
          value={filters.thuongHieuId}
          onChange={(e) => handleChange("thuongHieuId", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tất cả thương hiệu</MenuItem>
          {thuongHieuList.map((th) => (
            <MenuItem key={th.id} value={th.id}>{th.ten}</MenuItem>
          ))}
        </Select>

        <Select
          value={filters.mauSacId}
          onChange={(e) => handleChange("mauSacId", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tất cả màu sắc</MenuItem>
          {mauSacList.map((ms) => (
            <MenuItem key={ms.id} value={ms.id}>{ms.ten}</MenuItem>
          ))}
        </Select>

        <Select
          value={filters.chatLieuId}
          onChange={(e) => handleChange("chatLieuId", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tất cả chất liệu</MenuItem>
          {chatLieuList.map((cl) => (
            <MenuItem key={cl.id} value={cl.id}>{cl.ten}</MenuItem>
          ))}
        </Select>

        <Select
          value={filters.kichThuocId}
          onChange={(e) => handleChange("kichThuocId", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tất cả kích thước</MenuItem>
          {kichCoList.map((kc) => (
            <MenuItem key={kc.id} value={kc.id}>{kc.ten}</MenuItem>
          ))}
        </Select>

        <Select
          value={filters.sortOrder}
          onChange={(e) => handleChange("sortOrder", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">-- Sắp xếp --</MenuItem>
          <MenuItem value="asc">Giá tăng dần</MenuItem>
          <MenuItem value="desc">Giá giảm dần</MenuItem>
        </Select>

        <Button
          variant="outlined"
          color="warning"
          onClick={handleResetFilters}
          size="small"
        >
          Reset
        </Button>
      </Box>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : sanPhamList.length === 0 ? (
        <Typography>Không có phiên bản sản phẩm nào.</Typography>
      ) : (
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Giá bán</TableCell>
              <TableCell>Màu sắc</TableCell>
              <TableCell>Kích thước</TableCell>
              <TableCell>Số lượng tồn</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sanPhamList.map((sp, index) => (
              <TableRow key={sp.id}>
                <TableCell>{index + 1 + page * filters.size}</TableCell>
                <TableCell>
                  <img
                    src={sp.tenHinhAnhSp ? `http://localhost:8080/uploads/${sp.tenHinhAnhSp}` : "https://via.placeholder.com/80"}
                    alt={sp.tenSanPham || "Sản phẩm không tên"}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                </TableCell>
                <TableCell>{sp.giaBan ? sp.giaBan.toLocaleString() + " ₫" : "0 ₫"}</TableCell>
                <TableCell>{sp.tenMauSac ?? "-"}</TableCell>
                <TableCell>{sp.tenKichThuoc ?? "-"}</TableCell>
                <TableCell>{sp.soLuong ?? "-"}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sp.trangThai === 1}
                        onChange={() => handleChangeStatus(sp.id, sp.trangThai)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={sp.trangThai === 1 ? "Đang bán" : "Ngưng bán"}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewProduct(sp.id)}>
                    <VisibilityIcon color="info" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            variant="outlined"
            size="small"
          >
            Trang trước
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            {page + 1} / {totalPages}
          </Typography>
          <Button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
            variant="outlined"
            size="small"
          >
            Trang sau
          </Button>
        </Box>
      )}
    </div>
  );
};

export default SanPhamAdminPage;