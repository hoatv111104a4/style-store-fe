import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPageSanPham, getListSanPhamGiamGia } from "../../services/Website/ProductApis";
import { getGiamGiaDetail, updateGiamGia } from "../../services/Website/VocherApi";
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

const UpdateVoucher = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  // Fetch chi tiết mã giảm giá khi component mount
  useEffect(() => {
    const fetchGiamGiaDetail = async () => {
      try {
        setLoading(true);
        const response = await getGiamGiaDetail(id);
        const { result } = response;
        setFormData({
          tenDotGiam: result.tenDotGiam || "",
          giamGia: result.giamGia?.toString() || "",
          giamToiDa: result.giamToiDa?.toString() || "",
          dieuKienGiam: result.dieuKienGiam?.toString() || "",
          ngayBatDau: result.ngayBatDau ? new Date(result.ngayBatDau).toISOString().split("T")[0] : "",
          ngayKetThuc: result.ngayKetThuc ? new Date(result.ngayKetThuc).toISOString().split("T")[0] : "",
          moTa: result.moTa || "",
        });
        // Tích tự động các sản phẩm
        setSelectedIds(result.idSanPham || []);
        // Tích tự động các chi tiết sản phẩm
        setSelectedChiTietIds(result.idChiTietSanPham || []);

        // Lấy chi tiết sản phẩm dựa trên idSanPham
        const chiTietPromises = (result.idSanPham || []).map(async (sanPhamId) => {
          const data = await getListSanPhamGiamGia({ sanPhamId });
          return data;
        });
        const chiTietList = (await Promise.all(chiTietPromises)).flat().filter(ct => ct?.id);
        // Loại bỏ trùng lặp
        const uniqueChiTietList = Array.from(new Map(chiTietList.map(item => [item.id, item])).values());
        setChiTietSanPhamList(uniqueChiTietList);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết mã giảm giá:", error);
        toast.error(error.response?.data?.result || "Không thể tải thông tin mã giảm giá.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGiamGiaDetail();
    }
  }, [id]);

  const fetchData = async (pageIndex) => {
    try {
      const data = await getPageSanPham(pageIndex - 1, pageSize);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm.");
    }
  };

  const fetchAllProducts = async () => {
    try {
      const data = await getPageSanPham(0, 9999);
      setAllProducts(data.content || []);
    } catch (err) {
      console.error("Lỗi khi fetch toàn bộ sản phẩm:", err);
      toast.error("Không thể tải toàn bộ sản phẩm.");
    }
  };

  useEffect(() => {
    fetchData(page);
    fetchAllProducts();
  }, [page]);

  const getChiTietSanPhamBySanPhamId = async (sanPhamId) => {
    try {
      const data = await getListSanPhamGiamGia({ sanPhamId });
      return Array.from(new Map(data.map(item => [item.id, item])).values()) || [];
    } catch (err) {
      console.error("Lỗi khi gọi chi tiết sản phẩm:", err);
      toast.error("Không thể tải chi tiết sản phẩm.");
      return [];
    }
  };

  const handleSelect = async (id) => {
    let newSelectedIds;
    if (selectedIds.includes(id)) {
      newSelectedIds = selectedIds.filter((i) => i !== id);
      setChiTietSanPhamList((prev) => prev.filter((ct) => ct.sanPhamId !== id));
      setSelectedChiTietIds((prev) => prev.filter((ctId) => !chiTietSanPhamList.find(ct => ct.id === ctId && ct.sanPhamId === id)));
    } else {
      newSelectedIds = [...selectedIds, id];
      const chiTietList = await getChiTietSanPhamBySanPhamId(id);
      setChiTietSanPhamList((prev) => {
        const existingIds = new Set(prev.map(ct => ct.id));
        const newChiTiet = chiTietList.filter(ct => !existingIds.has(ct.id));
        return [...prev, ...newChiTiet];
      });
    }
    setSelectedIds(newSelectedIds);
    setSelectedAll(newSelectedIds.length === allProducts.length);
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
      setChiTietSanPhamList((prev) => {
        const uniqueChiTiet = Array.from(new Map([...prev, ...allChiTiet].map(item => [item.id, item])).values());
        return uniqueChiTiet;
      });
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
      await updateGiamGia(id, voucherData);
      toast.success("Cập nhật mã giảm giá thành công!");
      setTimeout(() => navigate("/admin/giam-gia"), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.result || "Lỗi khi cập nhật voucher!";
      if (error.response?.data?.errorCode === 1104) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
      } else {
        toast.error(errorMessage);
      }
      console.error("Chi tiết lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-4">
      <ToastContainer position="top-right" />
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={3} mt={3}>
        <Box flex={isMobile ? 1 : 0.4}>
          <Typography variant="h5" sx={{ color: "#ff6600", textAlign: "left" }}>
            Cập nhật Phiếu Giảm Giá
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ padding: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Tên đợt giảm giá"
                name="tenDotGiam"
                value={formData.tenDotGiam}
                onChange={handleChange}
                margin="dense"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Giảm giá (%)"
                name="giamGia"
                type="number"
                value={formData.giamGia}
                onChange={handleChange}
                margin="dense"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Giảm tối đa (VND)"
                name="giamToiDa"
                type="number"
                value={formData.giamToiDa}
                onChange={handleChange}
                margin="dense"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Điều kiện giảm (VND)"
                name="dieuKienGiam"
                type="number"
                value={formData.dieuKienGiam}
                onChange={handleChange}
                margin="dense"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Ngày bắt đầu"
                name="ngayBatDau"
                type="date"
                value={formData.ngayBatDau}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Ngày kết thúc"
                name="ngayKetThuc"
                type="date"
                value={formData.ngayKetThuc}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Mô tả"
                name="moTa"
                value={formData.moTa}
                onChange={handleChange}
                margin="dense"
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, backgroundColor: "#ff6600", "&:hover": { backgroundColor: "#e65c00" } }}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật Voucher"}
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
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sp.id)}
                        onChange={() => handleSelect(sp.id)}
                      />
                    </td>
                    <td>{sp.ma}</td>
                    <td>{sp.ten}</td>
                    <td>{sp.trangThai == "1" ? "Đang kinh doanh" : "Ngưng kinh doanh"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              shape="rounded"
            />
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
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedChiTietIds.includes(ct.id)}
                        onChange={() => handleChiTietSelect(ct.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={
                          ct.tenHinhAnhSp
                            ? `http://localhost:8080/uploads/${ct.tenHinhAnhSp}`
                            : "/placeholder-image.png"
                        }
                        alt={ct.tenSanPham}
                        style={{
                          objectFit: "cover",
                          height: "80px",
                          width: "80px",
                          borderRadius: "8px",
                        }}
                      />
                    </td>
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

export default UpdateVoucher;