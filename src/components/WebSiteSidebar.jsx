import "../styles/MainCss.css";
import Slider from "rc-slider";
import { NavLink } from "react-router-dom";
import "rc-slider/assets/index.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllSanPham,
  getPageSanPhamAdmin2,
  listThuongHieu,
  listChatLieu,
  listMauSac,
  listKichCo,
  listSanPham,
  listXuatXu
} from "../services/Website/ProductApis";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import ReplayIcon from '@mui/icons-material/Replay';
import selectNoBorderSx from "./selectNoBorderSx";
import "../styles/Website/ProductCss.css";

const WebSiteSidebar = () => {
  const [thuongHieuList, setThuongHieuList] = useState([]);
  const [chatLieuList, setChatLieuList] = useState([]);
  const [mauSacList, setMauSacList] = useState([]);
  const [kichCoList, setKichCoList] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [xuatXuList, setXuatXuList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tenSanPhamQuery = queryParams.get("tenSanPham") || "";

  // Fetch dữ liệu các bộ lọc
  useEffect(() => {
    listSanPham().then(setSanPhamList).catch(() => setSanPhamList([]));
    listThuongHieu().then(setThuongHieuList).catch(() => setThuongHieuList([]));
    listChatLieu().then(setChatLieuList).catch(() => setChatLieuList([]));
    listMauSac().then(setMauSacList).catch(() => setMauSacList([]));
    listKichCo().then(setKichCoList).catch(() => setKichCoList([]));
    listXuatXu().then(setXuatXuList).catch(() => setXuatXuList([]));
  }, []);

  const [filters, setFilters] = useState({
    page: 0,
    size: 12,
    tenSanPham: "",
    thuongHieuId: "",
    mauSacId: "",
    chatLieuId: "",
    kichThuocId: "",
    xuatXuId: "",
    minPrice: 0,
    maxPrice: 3000000,
    sanPhamId: "",
    sortOrder: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (tenSanPhamQuery) {
      setFilters(prev => ({ ...prev, tenSanPham: tenSanPhamQuery, page: 0 }));
      setCurrentPage(0);
    }
  }, [tenSanPhamQuery]);

  const fetchSanPham = async (page, tenSanPham) => {
    try {
      setLoading(true);
      let data;
      if (!filters.sanPhamId) {
        // Nếu chưa chọn sản phẩm gốc, lấy tất cả sản phẩm
        data = await getAllSanPham({
          ...filters,
          page,
          tenSanPham: tenSanPham || filters.tenSanPham
        });
      } else {
        // Nếu đã chọn sản phẩm gốc, lọc theo sản phẩm gốc
        data = await getPageSanPhamAdmin2(
          filters.sanPhamId,
          { ...filters, page, tenSanPham: tenSanPham || filters.tenSanPham }
        );
      }
      setTimeout(() => {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      }, 400);
    } catch {
      setTimeout(() => {
        setError("Không thể tải danh sách sản phẩm");
        setLoading(false);
      }, 400);
    }
  };

  useEffect(() => {
    fetchSanPham(currentPage, tenSanPhamQuery);
    // eslint-disable-next-line
  }, [currentPage, tenSanPhamQuery, filters.sortOrder]);

  const scrollToProductList = () => {
    const el = document.getElementById("product-list-title");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePreviousPage = () => currentPage > 0 && (setCurrentPage(currentPage - 1), scrollToProductList());
  const handleNextPage = () => currentPage < totalPages - 1 && (setCurrentPage(currentPage + 1), scrollToProductList());
  const handleFirstPage = () => (setCurrentPage(0), scrollToProductList());
  const handleLastPage = () => (setCurrentPage(totalPages - 1), scrollToProductList());

  const handleReset = () => {
    navigate("/san-pham", { replace: true });
    setFilters({
      page: 0, size: 12, tenSanPham: "", thuongHieuId: "", mauSacId: "",
      chatLieuId: "", kichThuocId: "", xuatXuId: "",
      minPrice: 0, maxPrice: 3000000, sanPhamId: "", sortOrder: ""
    });
    setCurrentPage(0);
    setProducts([]);
    window.location.reload();
  };

  if (error) return <div>{error}</div>;

  const handlePageClick = (page) => (setCurrentPage(page), scrollToProductList());
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <div className="row gx-0 container-fluid" style={{ minHeight: "100vh" }}>
      <div className="col-12 col-md-4 col-lg-3 bg-white p-0">
        <div className="bg-white shadow-sm p-3 h-100">
          <h3 className="mb-4 page-title">Bộ lọc sản phẩm</h3>
          <form onSubmit={(e) => { e.preventDefault(); fetchSanPham(0); setCurrentPage(0); }}>
            {/* Giá tiền */}
            <div className="mb-3">
              <label className="form-label" style={{ color: "red" }}>Giá tiền</label>
              <Slider
                range min={0} max={3000000} step={50000}
                value={[Number(filters.minPrice) || 0, Number(filters.maxPrice) || 3000000]}
                onChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 0 }))}
                trackStyle={[{ backgroundColor: "#ff6600", height: 8 }]}
                handleStyle={[
                  { borderColor: "#ff6600", backgroundColor: "#fff" },
                  { borderColor: "#ff6600", backgroundColor: "#fff" },
                ]}
                railStyle={{ backgroundColor: "#eee", height: 8 }}
              />
              <div className="d-flex justify-content-between mt-1" style={{ fontSize: 13 }}>
                <span style={{ color: "#ff6600" }}>{Number(filters.minPrice).toLocaleString()}đ</span>
                <span style={{ color: "#ff6600" }}>{Number(filters.maxPrice).toLocaleString()}đ</span>
              </div>
            </div>

            {/* Tên sản phẩm */}
            <div className="mb-3">
              <label className="form-label text-dark">Tên sản phẩm</label>
              <Select value={filters.sanPhamId} onChange={(e) => setFilters(prev => ({ ...prev, sanPhamId: e.target.value, page: 0 }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}>
                <MenuItem value="">Tất cả</MenuItem>
                {sanPhamList.map(sp => <MenuItem key={sp.id} value={sp.id}>{sp.ten}</MenuItem>)}
              </Select>
            </div>

            {/* Thương hiệu */}
            <div className="mb-3">
              <label className="form-label text-dark">Thương hiệu</label>
              <Select value={filters.thuongHieuId} onChange={(e) => setFilters(prev => ({ ...prev, thuongHieuId: e.target.value, page: 0 }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}>
                <MenuItem value="">Tất cả</MenuItem>
                {thuongHieuList.map(th => <MenuItem key={th.id} value={th.id}>{th.ten}</MenuItem>)}
              </Select>
            </div>

            {/* Màu sắc */}
            <div className="mb-3">
              <label className="form-label text-dark">Màu sắc</label>
              <Select value={filters.mauSacId} onChange={(e) => setFilters(prev => ({ ...prev, mauSacId: e.target.value, page: 0 }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}>
                <MenuItem value="">Tất cả</MenuItem>
                {mauSacList.map(ms => (
                  <MenuItem key={ms.id} value={ms.id}>
                    {ms.ma}
                    <span style={{
                      display: "inline-block", width: 18, height: 18, borderRadius: "50%",
                      backgroundColor: ms.ma, border: "1px solid #ccc", verticalAlign: "middle", marginRight: 8
                    }} />
                  </MenuItem>
                ))}
              </Select>
            </div>

            {/* Kích cỡ */}
            <div className="mb-3">
              <label className="form-label text-dark">Kích cỡ</label>
              <Select value={filters.kichThuocId} onChange={(e) => setFilters(prev => ({ ...prev, kichThuocId: e.target.value, page: 0 }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}>
                <MenuItem value="">Tất cả</MenuItem>
                {kichCoList.map(kt => <MenuItem key={kt.id} value={kt.id}>{kt.ten}</MenuItem>)}
              </Select>
            </div>

            {/* Xuất xứ */}
            <div className="mb-3">
              <label className="form-label text-dark">Xuất xứ</label>
              <Select value={filters.xuatXuId} onChange={(e) => setFilters(prev => ({ ...prev, xuatXuId: e.target.value, page: 0 }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}>
                <MenuItem value="">Tất cả</MenuItem>
                {xuatXuList.map(xx => <MenuItem key={xx.id} value={xx.id}>{xx.ten}</MenuItem>)}
              </Select>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="contained" color="warning" startIcon={<SearchIcon />} className="w-50" sx={{ minWidth: 0, flex: 1 }}>Tìm kiếm</Button>
              <Button type="button" variant="outlined" color="warning" startIcon={<ReplayIcon />} onClick={handleReset} className="w-50" sx={{ minWidth: 0, flex: 1 }}>Reset</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="col-12 col-md-8 col-lg-9 px-3 py-3">
        <div className="product-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 id="product-list-title" className="page-title mb-0">Danh sách sản phẩm</h3>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 mb-0">
              <li className="nav-item mx-2 d-flex align-items-center">
                <span className="me-2 fw-semibold" style={{ whiteSpace: "nowrap" }}>Sắp xếp:</span>
                <Select value={filters.sortOrder} onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value, page: 0 }))}
                  displayEmpty size="small" sx={selectNoBorderSx}>
                  <MenuItem value="">Mặc định</MenuItem>
                  <MenuItem value="asc">Tăng dần</MenuItem>
                  <MenuItem value="desc">Giảm dần</MenuItem>
                </Select>
              </li>
            </ul>
          </div>

          <div className="product-list">
            {products.length > 0 ? (
              <div className="row g-3">
                {products.map(spct => (
                  <div key={spct.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 product-card-custom" style={{ transition: "box-shadow 0.2s" }}>
                      {spct.giamGia != null && spct.giamGia !== 0 && (
                        <span style={{
                          position: "absolute", top: 8, right: 8, background: "#ff6600", color: "#fff",
                          padding: "4px 10px", borderRadius: "16px", fontWeight: "bold", fontSize: 13, zIndex: 2
                        }}>
                          -{Math.round(spct.giamGia * 1)}%
                        </span>
                      )}
                      <img src={spct.tenHinhAnhSp ? `http://localhost:8080/uploads/${spct.tenHinhAnhSp}` : "/placeholder-image.png"}
                        className="card-img-top product-image" alt={spct.tenSanPham} style={{ objectFit: "cover", height: "180px" }} />
                      <div className="card-body do-an-info d-flex flex-column">
                        <h3 className="product-name fs-6 mb-1 fw-bold">{spct.tenSanPham}</h3>
                        <div className="mb-2 d-flex align-items-center gap-1">
                          <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
                            <i className="bi bi-award" style={{ color: "#ff6600" }}></i> {spct.tenThuongHieu}
                          </span>
                        </div>
                        <p className="product-price mb-3 fw-bold">
                          {spct.giaBanGoc && spct.giamGia != null && spct.giamGia !== 0 && (
                            <span style={{
                              textDecoration: "line-through", color: "#888", fontWeight: "normal",
                              marginRight: 8, fontSize: 14
                            }}>
                              {Number(spct.giaBanGoc).toLocaleString("vi-VN")}₫
                            </span>
                          )}
                          {Number(spct.giaBan).toLocaleString("vi-VN")}₫
                        </p>
                        <button className="product-order-btn btn mt-auto" style={{ backgroundColor: "#222", color: "#fff" }}
                          onClick={() => navigate(`/website/san-pham/chi-tiet-san-pham/${spct.sanPhamId}`)}>
                          <i className="bi bi-cart-fill" style={{ color: "#fff" }}></i> Đặt hàng
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (!loading && <p>Không có sản phẩm nào</p>)}
          </div>

          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center mt-4" style={{ minHeight: "60px" }}>
              <div className="spinner-border" role="status" style={{ width: "1.5rem", height: "1.5rem", color: "#444", borderWidth: "2px" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="fs-6 mt-2" style={{ color: "#444" }}>Đang tải...</div>
            </div>
          )}

          {!loading && (
            <div className="pagination d-flex justify-content-center align-items-center gap-1 mt-4 flex-wrap">
              <button onClick={handleFirstPage} disabled={currentPage === 0} className="btn btn-light border"><i className="bi bi-chevron-double-left"></i></button>
              <button onClick={handlePreviousPage} disabled={currentPage <= 0} className="btn btn-light border"><i className="bi bi-chevron-left"></i></button>
              {pageNumbers.map(pn => (
                <button key={pn} onClick={() => handlePageClick(pn)}
                  className={`btn btn-light border mx-1 ${currentPage === pn ? "active bg-primary text-white" : ""}`}
                  style={{ minWidth: 36 }}>{pn + 1}</button>
              ))}
              <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="btn btn-light border"><i className="bi bi-chevron-right"></i></button>
              <button onClick={handleLastPage} disabled={currentPage === totalPages - 1} className="btn btn-light border"><i className="bi bi-chevron-double-right"></i></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSiteSidebar;