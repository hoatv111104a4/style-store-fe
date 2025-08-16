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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  listThuongHieu,
  listChatLieu,
  listMauSac,
  listKichCo,
  getPageSanPhamAdmin,
  chuyenTrangThaiSPCT,
} from "../../services/Website/ProductApis";

const SanPhamAdminPage = () => {
  const { sanPhamId } = useParams();
  const navigate = useNavigate();
  console.log("sanPhamId from URL:", sanPhamId);

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
        console.log("Calling API with sanPhamId:", sanPhamId, "filters:", { ...filters, page });
        const data = await getPageSanPhamAdmin(sanPhamId, { ...filters, page });
        console.log("API response:", data);
        if (data && data.content) {
          setSanPhamList(data.content);
          setTotalPages(data.totalPages || 0);
        } else {
          setSanPhamList([]);
          setTotalPages(0);
          console.warn("API response không chứa content:", data);
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

  // Xử lý chuyển trạng thái sản phẩm
  const handleChangeStatus = async (id, currentStatus) => {
    try {
      await chuyenTrangThaiSPCT(id);
      // Cập nhật trạng thái trong danh sách
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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      <h1>Danh sách sản phẩm Admin</h1>

      {/* Bộ lọc */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <TextField
          label="Tên sản phẩm"
          value={filters.tenSanPham}
          onChange={(e) => handleChange("tenSanPham", e.target.value)}
          size="small"
        />
        <Select
          value={filters.thuongHieuId}
          onChange={(e) => handleChange("thuongHieuId", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tất cả thương hiệu</MenuItem>
          {thuongHieuList.map((th) => (
            <MenuItem key={th.id} value={th.id}>
              {th.ten}
            </MenuItem>
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
            <MenuItem key={ms.id} value={ms.id}>
              {ms.ten}
            </MenuItem>
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
            <MenuItem key={cl.id} value={cl.id}>
              {cl.ten}
            </MenuItem>
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
            <MenuItem key={kc.id} value={kc.id}>
              {kc.ten}
            </MenuItem>
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
        <Typography>Không có sản phẩm nào hoặc ID không hợp lệ.</Typography>
      ) : (
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá bán</TableCell>
              <TableCell>Thương hiệu</TableCell>
              <TableCell>Màu sắc</TableCell>
              <TableCell>Chất liệu</TableCell>
              <TableCell>Kích thước</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Xuất xứ</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Xoá sp</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sanPhamList.map((sp, index) => (
              <TableRow key={sp.id}>
                <TableCell>{index + 1 + page * filters.size}</TableCell>
                <TableCell>
                  <img
                    src={
                      sp.tenHinhAnhSp
                        ? `http://localhost:8080/uploads/${sp.tenHinhAnhSp}`
                        : "https://via.placeholder.com/80"
                    }
                    alt={sp.tenSanPham}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                  />
                </TableCell>
                <TableCell>{sp.tenSanPham}</TableCell>
                <TableCell>{sp.giaBan?.toLocaleString()} ₫</TableCell>
                <TableCell>{sp.tenThuongHieu}</TableCell>
                <TableCell>{sp.tenMauSac}</TableCell>
                <TableCell>{sp.tenChatLieu}</TableCell>
                <TableCell>{sp.tenKichThuoc}</TableCell>
                <TableCell>{sp.soLuong}</TableCell>
                <TableCell>{sp.tenXuatXu}</TableCell>
                <TableCell>{sp.trangThai == 1 ?'Đang bán':'Ngưng bán'}</TableCell>

                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sp.trangThai === 1}
                        onChange={() => handleChangeStatus(sp.id, sp.trangThai)}
                        color="primary"
                      />
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewProduct(sp.id)}>
                    <VisibilityIcon color="primary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Phân trang */}
      <div style={{ marginTop: "20px" }}>
        <Button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          variant="outlined"
          size="small"
        >
          Prev
        </Button>
        <span style={{ margin: "0 10px" }}>
          {page + 1} / {totalPages}
        </span>
        <Button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          variant="outlined"
          size="small"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default SanPhamAdminPage;