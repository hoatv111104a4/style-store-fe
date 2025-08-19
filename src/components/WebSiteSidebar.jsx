import "../styles/MainCss.css";
import Slider from "rc-slider";
import { NavLink } from "react-router-dom";
import "rc-slider/assets/index.css";
import React, { useEffect, useState, useMemo } from "react";
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

  // Tách filters thành appliedFilters và pendingFilters
  const [appliedFilters, setAppliedFilters] = useState({
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

  const [pendingFilters, setPendingFilters] = useState({
    tenSanPham: tenSanPhamQuery,
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
  const [allProducts, setAllProducts] = useState([]);
  const pageSize = 12;

  useEffect(() => {
    if (tenSanPhamQuery) {
      setPendingFilters(prev => ({ ...prev, tenSanPham: tenSanPhamQuery }));
      setAppliedFilters(prev => ({ ...prev, tenSanPham: tenSanPhamQuery }));
      setCurrentPage(0);
    }
  }, [tenSanPhamQuery]);

  const fetchSanPham = async () => {
    try {
      setLoading(true);
      let data;
      if (!appliedFilters.sanPhamId) {
        data = await getAllSanPham({
          ...appliedFilters,
          page: 0,
          size: 10000,
          tenSanPham: appliedFilters.tenSanPham
        });
      } else {
        data = await getPageSanPhamAdmin2(
          appliedFilters.sanPhamId,
          { ...appliedFilters, page: 0, size: 10000 }
        );
      }
      setTimeout(() => {
        setAllProducts(data.content || []);
        setLoading(false);
      }, 400);
    } catch {
      setTimeout(() => {
        setError("Không thể tải danh sách sản phẩm");
        setLoading(false);
      }, 400);
    }
  };

  // Trigger fetch khi appliedFilters thay đổi
  useEffect(() => {
    fetchSanPham();
    setCurrentPage(0);
    // eslint-disable-next-line
  }, [JSON.stringify(appliedFilters)]);

  // Gộp các sản phẩm chi tiết cùng sản phẩm gốc
  const groupedProducts = useMemo(() => {
    const groups = {};
    
    allProducts.forEach(product => {
      if (!groups[product.sanPhamId]) {
        groups[product.sanPhamId] = [];
      }
      groups[product.sanPhamId].push(product);
    });

    return Object.values(groups).map(group => {
      // Sắp xếp các biến thể theo ngày tạo mới nhất trước
      const sortedVariants = [...group].sort((a, b) => {
        // Ưu tiên sản phẩm mới nhất (ngày tạo lớn nhất)
        const dateA = new Date(a.ngayTao || 0);
        const dateB = new Date(b.ngayTao || 0);
        return dateB - dateA;
      });

      const representative = sortedVariants[0];
      
      return {
        ...representative,
        variantCount: group.length,
        minPrice: Math.min(...group.map(p => p.giaBan)),
        maxPrice: Math.max(...group.map(p => p.giaBan)),
        hasDiscount: group.some(p => p.giamGia && p.giamGia > 0),
        // Lưu lại ngày tạo mới nhất của nhóm sản phẩm
        latestCreatedDate: sortedVariants[0].ngayTao
      };
    });
  }, [allProducts]);

  // Sắp xếp groupedProducts
  const sortedGroupedProducts = useMemo(() => {
    let sorted = [...groupedProducts];
    
    // Mặc định sắp xếp theo ngày tạo mới nhất trước
    if (!appliedFilters.sortOrder) {
      sorted.sort((a, b) => {
        const dateA = new Date(a.latestCreatedDate || 0);
        const dateB = new Date(b.latestCreatedDate || 0);
        return dateB - dateA;
      });
    } 
    // Sắp xếp theo giá nếu có lựa chọn
    else if (appliedFilters.sortOrder === "asc") {
      sorted.sort((a, b) => a.minPrice - b.minPrice);
    } else if (appliedFilters.sortOrder === "desc") {
      sorted.sort((a, b) => b.minPrice - a.minPrice);
    }
    
    return sorted;
  }, [groupedProducts, appliedFilters.sortOrder]);

  // Tính toán totalPages
  useEffect(() => {
    setTotalPages(Math.ceil(sortedGroupedProducts.length / pageSize));
  }, [sortedGroupedProducts]);

  // Phân trang client-side
  const paginatedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return sortedGroupedProducts.slice(start, end);
  }, [sortedGroupedProducts, currentPage, pageSize]);

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
    setAppliedFilters({
      tenSanPham: "", thuongHieuId: "", mauSacId: "",
      chatLieuId: "", kichThuocId: "", xuatXuId: "",
      minPrice: 0, maxPrice: 3000000, sanPhamId: "", sortOrder: ""
    });
    setPendingFilters({
      tenSanPham: "", thuongHieuId: "", mauSacId: "",
      chatLieuId: "", kichThuocId: "", xuatXuId: "",
      minPrice: 0, maxPrice: 3000000, sanPhamId: "", sortOrder: ""
    });
    setCurrentPage(0);
    setAllProducts([]);
    window.location.reload();
  };

  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
    setCurrentPage(0);
    scrollToProductList();
  };

  if (error) return <div>{error}</div>;

  const handlePageClick = (page) => (setCurrentPage(page), scrollToProductList());
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <div className="row gx-0 container-fluid" style={{ minHeight: "100vh" }}>
      <div className="col-12 col-md-4 col-lg-3 bg-white p-0">
        <div className="bg-white shadow-sm p-3 h-100">
          <h3 className="mb-4 page-title">Bộ lọc sản phẩm</h3>
          <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }}>
            {/* Giá tiền */}
            <div className="mb-3">
              <label className="form-label" style={{ color: "red" }}>Giá tiền</label>
              <Slider
                range min={0} max={3000000} step={50000}
                value={[Number(pendingFilters.minPrice) || 0, Number(pendingFilters.maxPrice) || 3000000]}
                onChange={([min, max]) => setPendingFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                trackStyle={[{ backgroundColor: "#ff6600", height: 8 }]}
                handleStyle={[
                  { borderColor: "#ff6600", backgroundColor: "#fff" },
                  { borderColor: "#ff6600", backgroundColor: "#fff" },
                ]}
                railStyle={{ backgroundColor: "#eee", height: 8 }}
              />
              <div className="d-flex justify-content-between mt-1" style={{ fontSize: 13 }}>
                <span style={{ color: "#ff6600" }}>{Number(pendingFilters.minPrice).toLocaleString()}đ</span>
                <span style={{ color: "#ff6600" }}>{Number(pendingFilters.maxPrice).toLocaleString()}đ</span>
              </div>
            </div>

            {/* Tên sản phẩm */}
            <div className="mb-3">
              <label className="form-label text-dark">Tên sản phẩm</label>
              <Select 
                value={pendingFilters.sanPhamId} 
                onChange={(e) => setPendingFilters(prev => ({ ...prev, sanPhamId: e.target.value }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {sanPhamList.map(sp => <MenuItem key={sp.id} value={sp.id}>{sp.ten}</MenuItem>)}
              </Select>
            </div>

            {/* Thương hiệu */}
            <div className="mb-3">
              <label className="form-label text-dark">Thương hiệu</label>
              <Select 
                value={pendingFilters.thuongHieuId} 
                onChange={(e) => setPendingFilters(prev => ({ ...prev, thuongHieuId: e.target.value }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {thuongHieuList.map(th => <MenuItem key={th.id} value={th.id}>{th.ten}</MenuItem>)}
              </Select>
            </div>

            {/* Màu sắc */}
            <div className="mb-3">
              <label className="form-label text-dark">Màu sắc</label>
              <Select 
                value={pendingFilters.mauSacId} 
                onChange={(e) => setPendingFilters(prev => ({ ...prev, mauSacId: e.target.value }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}
              >
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
              <Select 
                value={pendingFilters.kichThuocId} 
                onChange={(e) => setPendingFilters(prev => ({ ...prev, kichThuocId: e.target.value }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {kichCoList.map(kt => <MenuItem key={kt.id} value={kt.id}>{kt.ten}</MenuItem>)}
              </Select>
            </div>

            {/* Xuất xứ */}
            <div className="mb-3">
              <label className="form-label text-dark">Xuất xứ</label>
              <Select 
                value={pendingFilters.xuatXuId} 
                onChange={(e) => setPendingFilters(prev => ({ ...prev, xuatXuId: e.target.value }))}
                displayEmpty fullWidth sx={{ background: "#fff", height: 36 }}
              >
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
                <Select 
                  value={pendingFilters.sortOrder} 
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                  displayEmpty size="small" sx={selectNoBorderSx}
                >
                  <MenuItem value="">Mới nhất</MenuItem>
                  <MenuItem value="asc">Giá tăng dần</MenuItem>
                  <MenuItem value="desc">Giá giảm dần</MenuItem>
                </Select>
              </li>
            </ul>
          </div>

          <div className="product-list">
            {paginatedProducts.length > 0 ? (
              <div className="row g-3">
                {paginatedProducts.map(product => (
                  <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 product-card-custom" style={{ transition: "box-shadow 0.2s" }}>
                      {product.hasDiscount && (
                        <span style={{
                          position: "absolute", top: 8, right: 8, background: "#ff6600", color: "#fff",
                          padding: "4px 10px", borderRadius: "16px", fontWeight: "bold", fontSize: 13, zIndex: 2
                        }}>
                          {product.giamGia ? `-${Math.round(product.giamGia * 1)}%` : "Khuyến mãi"}
                        </span>
                      )}
                      <img src={product.tenHinhAnhSp ? `http://localhost:8080/uploads/${product.tenHinhAnhSp}` : "/placeholder-image.png"}
                        className="card-img-top product-image" alt={product.tenSanPham} style={{ objectFit: "cover", height: "180px" }} />
                      <div className="card-body do-an-info d-flex flex-column">
                        <h3 className="product-name fs-6 mb-1 fw-bold">{product.tenSanPham}</h3>
                        
                        <p className="product-price mb-3 fw-bold">
                          {product.giaBanGoc && product.giamGia != null && product.giamGia !== 0 && (
                            <span style={{
                              textDecoration: "line-through", color: "#888", fontWeight: "normal",
                              marginRight: 8, fontSize: 14
                            }}>
                              {Number(product.giaBanGoc).toLocaleString("vi-VN")}₫
                            </span>
                          )}
                          {Number(product.giaBan).toLocaleString("vi-VN")}₫
                        </p>
                        <button
                          className="product-order-btn btn mt-auto"
                          style={{ backgroundColor: "#222", color: "#fff" }}
                          onClick={() => {
                            const productVariants = allProducts.filter(p => p.sanPhamId === product.sanPhamId);
                            const sortedVariants = [...productVariants].sort((a, b) => {
                              if ((a.giamGia || 0) !== (b.giamGia || 0)) {
                                return (b.giamGia || 0) - (a.giamGia || 0);
                              }
                              return a.giaBan - b.giaBan;
                            });
                            const defaultVariant = sortedVariants[0] || product;
                            navigate(`/website/san-pham/chi-tiet-san-pham/${product.sanPhamId}`, {
                              state: {
                                selectedColor: defaultVariant.mauSacId,
                                selectedSize: defaultVariant.kichThuocId,
                                selectedMaterial: defaultVariant.chatLieuId
                              }
                            });
                          }}
                        >
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