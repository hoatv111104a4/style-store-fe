import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Select,
  MenuItem,
  Box,
  Typography,
  DialogContentText,
} from "@mui/material";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { getAllSanPham, listThuongHieu, listChatLieu, listMauSac, listKichCo } from "../../services/Website/ProductApis";
import { addSanPhamHoaDon } from "../../services/Admin/HoaDonAdminServiceNew";

const ProductModalPage = ({ open, onClose, hoaDonId, onProductAdded }) => {
  const [thuongHieuList, setThuongHieuList] = useState([]);
  const [chatLieuList, setChatLieuList] = useState([]);
  const [mauSacList, setMauSacList] = useState([]);
  const [kichCoList, setKichCoList] = useState([]);
  const [filters, setFilters] = useState({
    page: 0,
    size: 12,
    tenSanPham: "",
    thuongHieuId: "",
    mauSacId: "",
    chatLieuId: "",
    kichThuocId: "",
    minPrice: 0,
    maxPrice: 3000000,
    sortOrder: "",
  });
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // State cho sub-dialog nhập số lượng
  const [openQuantityDialog, setOpenQuantityDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [soLuong, setSoLuong] = useState(1);

  useEffect(() => {
    if (!open) return;

    const fetchAllFilters = async () => {
      try {
        const [thuongHieu, chatLieu, mauSac, kichCo] = await Promise.all([
          listThuongHieu(),
          listChatLieu(),
          listMauSac(),
          listKichCo(),
        ]);
        setThuongHieuList(thuongHieu);
        setChatLieuList(chatLieu);
        setMauSacList(mauSac);
        setKichCoList(kichCo);
      } catch {
        setThuongHieuList([]);
        setChatLieuList([]);
        setMauSacList([]);
        setKichCoList([]);
      }
    };

    fetchAllFilters();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllSanPham({ ...filters, page: currentPage });
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch {
        setProducts([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage, open]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setFilters((prev) => ({ ...prev, page: currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setFilters((prev) => ({ ...prev, page: currentPage + 1 }));
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(0);
    setFilters((prev) => ({ ...prev, page: 0 }));
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages - 1);
    setFilters((prev) => ({ ...prev, page: totalPages - 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 0,
      size: 12,
      tenSanPham: "",
      thuongHieuId: "",
      mauSacId: "",
      chatLieuId: "",
      kichThuocId: "",
      minPrice: 0,
      maxPrice: 3000000,
      sortOrder: "",
    });
    setCurrentPage(0);
  };

  const handleSelectProduct = (product) => {
    if (!hoaDonId) {
      alert("Không tìm thấy ID hóa đơn!");
      return;
    }
    setSelectedProduct(product);
    setSoLuong(1);
    setOpenQuantityDialog(true);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || soLuong <= 0 || !hoaDonId) {
      alert("Vui lòng kiểm tra số lượng hoặc ID hóa đơn!");
      return;
    }

    const request = {
      hoaDonId: parseInt(hoaDonId),
      sanPhamCtId: selectedProduct.id,
      tenSanPham: selectedProduct.tenSanPham,
      giaTien: selectedProduct.giaBan,
      soLuong: soLuong,
      thanhTien: selectedProduct.giaBan * soLuong,
    };

    try {
        console.log("Thêm sản phẩm:", request); // Debug dữ liệu
      console.log("Gửi request:", request); // Debug dữ liệu gửi lên
      await addSanPhamHoaDon(request);
      alert("Thêm sản phẩm thành công!");
      setOpenQuantityDialog(false);
      onClose();
      if (onProductAdded) onProductAdded();
    } catch (error) {
      console.error("Lỗi API:", error);
      alert("Lỗi khi thêm sản phẩm: " + (error.response?.data?.message || error.message));
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle>Bộ lọc & Danh sách sản phẩm</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center" }}
        >
          <TextField
            label="Tên sản phẩm"
            value={filters.tenSanPham}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, tenSanPham: e.target.value, page: 0 }))
            }
            size="small"
          />
          <Select
            value={filters.thuongHieuId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, thuongHieuId: e.target.value, page: 0 }))
            }
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
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
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, mauSacId: e.target.value, page: 0 }))
            }
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">Tất cả màu sắc</MenuItem>
            {mauSacList.map((ms) => (
              <MenuItem key={ms.id} value={ms.id}>
                {ms.ma}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={filters.chatLieuId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, chatLieuId: e.target.value, page: 0 }))
            }
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
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
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, kichThuocId: e.target.value, page: 0 }))
            }
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">Tất cả kích cỡ</MenuItem>
            {kichCoList.map((kc) => (
              <MenuItem key={kc.id} value={kc.id}>
                {kc.ten}
              </MenuItem>
            ))}
          </Select>

          <Button variant="outlined" color="warning" onClick={handleResetFilters} size="small">
            Reset
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Typography>Không có sản phẩm nào.</Typography>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Thương hiệu</TableCell>
                <TableCell>Màu sắc</TableCell>
                <TableCell>Chất liệu</TableCell>
                <TableCell>Kích cỡ</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell>{index + 1 + currentPage * filters.size}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <img
                        src={
                          p.tenHinhAnhSp
                            ? `http://localhost:8080/uploads/${p.tenHinhAnhSp}`
                            : "/placeholder-image.png"
                        }
                        alt={p.tenSanPham}
                        style={{ objectFit: "cover", height: 80, width: 80, borderRadius: 8 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{p.tenSanPham}</TableCell>
                  <TableCell>{p.giaBan.toLocaleString()} đ</TableCell>
                  <TableCell>{p.tenThuongHieu}</TableCell>
                  <TableCell>{p.tenMauSac}</TableCell>
                  <TableCell>{p.tenChatLieu}</TableCell>
                  <TableCell>{p.tenKichThuoc}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSelectProduct(p)}
                    >
                      Chọn
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mt: 3,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleFirstPage}
              disabled={currentPage === 0}
              title="Trang đầu"
              variant="outlined"
              size="small"
            >
              <i className="bi bi-chevron-double-left"></i>
            </Button>
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              title="Trang trước"
              variant="outlined"
              size="small"
            >
              <i className="bi bi-chevron-left"></i>
            </Button>
            {pageNumbers.map((pn) => (
              <Button
                key={pn}
                onClick={() => handlePageChange(pn)}
                disabled={currentPage === pn}
                variant={currentPage === pn ? "contained" : "outlined"}
                size="small"
                sx={{ minWidth: 36 }}
              >
                {pn + 1}
              </Button>
            ))}
            <Button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              title="Trang sau"
              variant="outlined"
              size="small"
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
            <Button
              onClick={handleLastPage}
              disabled={currentPage === totalPages - 1}
              title="Trang cuối"
              variant="outlined"
              size="small"
            >
              <i className="bi bi-chevron-double-right"></i>
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>

      <Dialog open={openQuantityDialog} onClose={() => setOpenQuantityDialog(false)}>
        <DialogTitle>Nhập số lượng cho {selectedProduct?.tenSanPham}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vui lòng nhập số lượng sản phẩm bạn muốn thêm vào hóa đơn.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Số lượng"
            type="number"
            fullWidth
            variant="standard"
            value={soLuong}
            onChange={(e) => setSoLuong(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuantityDialog(false)}>Hủy</Button>
          <Button onClick={handleAddProduct} variant="contained">
            Xác nhận thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ProductModalPage;