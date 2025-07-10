import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPageSanPham, getListSanPhamGiamGia } from "../../services/Website/ProductApis";
import { applyVoucher } from "../../services/Website/VocherApi";
import "../../styles/TableCss.css";
import {
  TextField,
  Button,
  Box,
  Typography,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddVoucher = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({
    tenDotGiam: "",
    giamGia: "",
    giamToiDa: "",
    dieuKienGiam: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    moTa: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [chiTietSanPhamList, setChiTietSanPhamList] = useState([]);
  const [selectedChiTietIds, setSelectedChiTietIds] = useState([]);
  const [selectedAllChiTiet, setSelectedAllChiTiet] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const fetchData = async (pageIndex) => {
    try {
      const data = await getPageSanPham(pageIndex - 1, pageSize);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const data = await getPageSanPham(0, 9999);
      setAllProducts(data.content || []);
    } catch (err) {
      console.error("Lỗi khi fetch toàn bộ sản phẩm:", err);
    }
  };

  useEffect(() => {
    fetchData(page);
    fetchAllProducts();
  }, [page]);

  const getChiTietSanPhamBySanPhamId = async (sanPhamId) => {
    try {
      const data = await getListSanPhamGiamGia({ sanPhamId });
      return data;
    } catch (err) {
      console.error("Lỗi khi gọi chi tiết sản phẩm:", err);
      return [];
    }
  };

  const handleSelect = async (id) => {
    let newSelectedIds;
    if (selectedIds.includes(id)) {
      newSelectedIds = selectedIds.filter((i) => i !== id);
      setChiTietSanPhamList((prev) => prev.filter((ct) => ct.sanPhamId !== id));
      setSelectedChiTietIds((prev) => prev.filter((ct) => ct.sanPhamId !== id));
    } else {
      newSelectedIds = [...selectedIds, id];
      const chiTietList = await getChiTietSanPhamBySanPhamId(id);
      setChiTietSanPhamList((prev) => [...prev, ...chiTietList]);
    }
    setSelectedIds(newSelectedIds);
    setSelectedAll(false);
  };

  const handleSelectAll = async () => {
    const newSelectAll = !selectedAll;
    setSelectedAll(newSelectAll);

    if (newSelectAll) {
      const allIds = allProducts.map((p) => p.id);
      setSelectedIds(allIds);
      const allChiTiet = [];
      for (let id of allIds) {
        const chiTiet = await getChiTietSanPhamBySanPhamId(id);
        allChiTiet.push(...chiTiet);
      }
      setChiTietSanPhamList(allChiTiet);
    } else {
      setSelectedIds([]);
      setChiTietSanPhamList([]);
      setSelectedChiTietIds([]);
    }
  };

  const handleChiTietSelect = (id) => {
    if (selectedChiTietIds.includes(id)) {
      setSelectedChiTietIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedChiTietIds((prev) => [...prev, id]);
    }
    setSelectedAllChiTiet(false);
  };

  const handleChiTietSelectAll = () => {
    const allIds = chiTietSanPhamList.map((ct) => ct.id);
    setSelectedChiTietIds(selectedAllChiTiet ? [] : allIds);
    setSelectedAllChiTiet(!selectedAllChiTiet);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const voucherData = {
      ...formData,
      giamGia: parseFloat(formData.giamGia) || 0,
      giamToiDa: parseInt(formData.giamToiDa) || 0,
      dieuKienGiam: parseInt(formData.dieuKienGiam) || 0,
      ngayBatDau: formData.ngayBatDau || null,
      ngayKetThuc: formData.ngayKetThuc || null,
      sanPhamCtIds: selectedChiTietIds,
    };

    try {
      await applyVoucher(voucherData);
      toast.success("Áp dụng giảm giá thành công!");
      setTimeout(() => navigate("/admin/giam-gia"), 2000);
    } catch (error) {
      console.error("Lỗi khi tạo voucher:", error);
      setError("Có lỗi xảy ra khi tạo voucher.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-4">
      <ToastContainer position="top-right" />
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={3} mt={3}>
        <Box flex={isMobile ? 1 : 0.4}>
          <Typography variant="h5" sx={{ color: "#ff6600", textAlign: "left" }}>
            Tạo Phiếu Giảm Giá
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ padding: 1 }}>
              <TextField fullWidth size="small" label="Tên đợt giảm giá" name="tenDotGiam" required value={formData.tenDotGiam} onChange={handleChange} margin="dense" sx={{mb:2}}/>
              <TextField fullWidth size="small" label="Giảm giá (%)" name="giamGia" type="number" required value={formData.giamGia} onChange={handleChange} margin="dense" inputProps={{ min: 0, max: 100 }} sx={{mb:2}}/>
              <TextField fullWidth size="small" label="Giảm tối đa (VND)" name="giamToiDa" type="number" required value={formData.giamToiDa} onChange={handleChange} margin="dense" sx={{mb:2}} />
              <TextField fullWidth size="small" label="Điều kiện giảm (VND)" name="dieuKienGiam" type="number" required value={formData.dieuKienGiam} onChange={handleChange} margin="dense" sx={{mb:2}} />
              <TextField fullWidth size="small" label="Ngày bắt đầu" name="ngayBatDau" type="date" required value={formData.ngayBatDau} onChange={handleChange} margin="dense" InputLabelProps={{ shrink: true }} sx={{mb:2}} />
              <TextField fullWidth size="small" label="Ngày kết thúc" name="ngayKetThuc" type="date" required value={formData.ngayKetThuc} onChange={handleChange} margin="dense" InputLabelProps={{ shrink: true }} sx={{mb:2}} />
              <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2, backgroundColor: "#ff6600", "&:hover": { backgroundColor: "#e65c00" } }}>
                {loading ? "Đang tạo..." : "Tạo Voucher"}
              </Button>
            </Box>
          </form>
        </Box>

        <Box flex={isMobile ? 1 : 0.6} sx={{ maxHeight: "800px", overflowY: "auto" }}>
          <div className="table-responsive table-container mt-5">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedAll} onChange={handleSelectAll} /></th>
                  <th>Mã sp</th>
                  <th>Tên sản phẩm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {products.map((sp) => (
                  <tr key={sp.id}>
                    <td><input type="checkbox" checked={selectedIds.includes(sp.id)} onChange={() => handleSelect(sp.id)} /></td>
                    <td>{sp.ma}</td>
                    <td>{sp.ten}</td>
                    <td >{sp.trangThai == "1" ? "Đang kinh doanh" : "Ngưng kinh doanh"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} color="primary" shape="rounded" />
          </Box>
        </Box>
      </Box>

      {chiTietSanPhamList.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" color="primary">
            Danh sách chi tiết sản phẩm đã chọn:
          </Typography>
          <div className="table-responsive table-container mt-3">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedAllChiTiet} onChange={handleChiTietSelectAll} /></th>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Mã CTSP</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá bán</th>
                  <th>Giảm giá</th>
                  <th>Màu sắc</th>
                  <th>Kích thước</th>
                  <th>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {chiTietSanPhamList.map((ct, index) => (
                  <tr key={ct.id}>
                    <td><input type="checkbox" checked={selectedChiTietIds.includes(ct.id)} onChange={() => handleChiTietSelect(ct.id)} /></td>
                    <td>{index + 1}</td>
                    <td><img src={ct.tenHinhAnhSp ? `http://localhost:8080/uploads/${ct.tenHinhAnhSp}` : "/placeholder-image.png"} alt={ct.tenSanPham} style={{ objectFit: "cover", height: "80px", width: "80px", borderRadius: "8px" }} /></td>
                    <td>{ct.ma}</td>
                    <td>{ct.tenSanPham}</td>
                    <td>{ct.giaBan?.toLocaleString()}₫</td>
                    <td>{ct.giamGia != null ? `${Math.round(ct.giamGia)}%` : "0%"}</td>
                    <td>{ct.tenMauSac}</td>
                    <td>{ct.tenKichThuoc}</td>
                    <td>{ct.soLuong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      )}
    </section>
  );
};

export default AddVoucher;