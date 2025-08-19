import React, { useEffect, useState, useMemo } from "react";
import Slider from "react-slick";
import banner1 from "../../assets/banner1.png";
import banner2 from "../../assets/banner2.jpg";
import banner3 from "../../assets/banner3.jpg";
import "../../styles/Website/HomeCss.css";
import { getAllSanPham } from "../../services/Website/ProductApis";
import { useNavigate } from "react-router-dom";

const WebsiteHome = () => {
  const navigate = useNavigate();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
  };

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllSanPham({ page: 0, size: 100 });
        setAllProducts(data.content || []);
      } catch (error) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Gộp các sản phẩm chi tiết cùng sản phẩm gốc
  const groupedProducts = useMemo(() => {
    const groups = {};
    
    allProducts.forEach(product => {
      if (!groups[product.sanPhamId]) {
        groups[product.sanPhamId] = [];
      }
      groups[product.sanPhamId].push(product);
    });

    // Chọn sản phẩm đại diện cho mỗi nhóm
    return Object.values(groups).map(group => {
      // Sắp xếp theo giảm giá lớn nhất trước, sau đó giá thấp nhất
      const sorted = [...group].sort((a, b) => {
        // Ưu tiên sản phẩm có giảm giá lớn hơn
        if ((a.giamGia || 0) !== (b.giamGia || 0)) {
          return (b.giamGia || 0) - (a.giamGia || 0);
        }
        // Nếu cùng giảm giá hoặc không giảm giá, chọn giá thấp hơn
        return a.giaBan - b.giaBan;
      });

      // Lấy sản phẩm đầu tiên sau khi sắp xếp
      const representative = sorted[0];
      
      // Thêm thông tin về số lượng biến thể
      return {
        ...representative,
        variantCount: group.length,
        minPrice: Math.min(...group.map(p => p.giaBan)),
        maxPrice: Math.max(...group.map(p => p.giaBan)),
        hasDiscount: group.some(p => p.giamGia && p.giamGia > 0)
      };
    });
  }, [allProducts]);

  // Lọc chỉ các sản phẩm có giảm giá
  const saleProducts = useMemo(() => {
    return groupedProducts.filter(product => product.hasDiscount);
  }, [groupedProducts]);

  // Tính toán totalPages
  const totalPages = Math.ceil(saleProducts.length / pageSize);

  // Phân trang client-side
  const paginatedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return saleProducts.slice(start, end);
  }, [saleProducts, currentPage, pageSize]);

  const handlePreviousPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);
  const handleFirstPage = () => setCurrentPage(0);
  const handleLastPage = () => setCurrentPage(totalPages - 1);
  const handlePageClick = (page) => setCurrentPage(page);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <article className="website-home">
      <Slider {...settings}>
        <div>
          <img src={banner1} alt="Banner 1" style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
        </div>
        <div>
          <img src={banner2} alt="Banner 2" style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
        </div>
        <div>
          <img src={banner3} alt="Banner 3" style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
        </div>
      </Slider>

      <div className="home-feature-list">
        <div className="home-feature-box">
          <i className="bi bi-star-fill" style={{ color: "#ff6600", fontSize: 28 }}></i>
          <span>Chất lượng cao</span>
        </div>
        <div className="home-feature-box">
          <i className="bi bi-shield-check" style={{ color: "#ff6600", fontSize: 28 }}></i>
          <span>Giao dịch uy tín</span>
        </div>
        <div className="home-feature-box">
          <i className="bi bi-truck" style={{ color: "#ff6600", fontSize: 28 }}></i>
          <span>Giao hàng nhanh</span>
        </div>
        <div className="home-feature-box">
          <i className="bi bi-headset" style={{ color: "#ff6600", fontSize: 28 }}></i>
          <span>Hỗ trợ tận tâm</span>
        </div>
      </div>

      {/* Danh sách sản phẩm giảm giá */}
      <section className="mt-4">
        <h3 className="mb-3" style={{ color: "#ff6600", textAlign: "center" }}>Sản phẩm giảm giá</h3>
        {loading ? (
          <div className="d-flex flex-column justify-content-center align-items-center mt-4" style={{ minHeight: "60px" }}>
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "1.5rem",
                height: "1.5rem",
                color: "#444",
                borderWidth: "2px"
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="fs-6 mt-2" style={{ color: "#444" }}>Đang tải...</div>
          </div>
        ) : (
          <>
            <div className="row g-3">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="card h-100 product-card-custom position-relative" style={{ transition: "box-shadow 0.2s" }}>
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "#ff6600",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "16px",
                          fontWeight: "bold",
                          fontSize: 13,
                          zIndex: 2,
                        }}
                      >
                        -{Math.round(product.giamGia * 1)}%
                      </span>
                      <img
                        src={product.tenHinhAnhSp ? `http://localhost:8080/uploads/${product.tenHinhAnhSp}` : "/placeholder-image.png"}
                        className="card-img-top product-image"
                        alt={product.tenSanPham}
                        style={{ objectFit: "cover", height: "250px" }}
                      />
                      <div className="card-body do-an-info d-flex flex-column">
                        <h3 className="product-name fs-6 mb-1 fw-bold">{product.tenSanPham}</h3>
                        <div className="mb-2 d-flex align-items-center gap-1">
                          <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
                            <i className="bi bi-award" style={{ color: "#ff6600" }}></i> {product.tenThuongHieu}
                          </span>
                        </div>
                        <p className="product-price mb-3 fw-bold">
                          {product.giaBanGoc && (
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                fontWeight: "normal",
                                marginRight: 8,
                                fontSize: 14,
                              }}
                            >
                              {Number(product.giaBanGoc).toLocaleString("vi-VN")}₫
                            </span>
                          )}
                          {Number(product.giaBan).toLocaleString("vi-VN")}₫
                        </p>
                        <button
                          className="product-order-btn btn mt-auto"
                          style={{ backgroundColor: "#222", color: "#fff" }}
                          onClick={() => {
                            // Tìm tất cả các biến thể của sản phẩm này
                            const productVariants = allProducts.filter(p => p.sanPhamId === product.sanPhamId);
                            
                            // Sắp xếp theo giảm giá lớn nhất trước, sau đó giá thấp nhất (giống logic group sản phẩm)
                            const sortedVariants = [...productVariants].sort((a, b) => {
                              if ((a.giamGia || 0) !== (b.giamGia || 0)) {
                                return (b.giamGia || 0) - (a.giamGia || 0);
                              }
                              return a.giaBan - b.giaBan;
                            });
                            
                            // Chọn biến thể đầu tiên sau khi sắp xếp
                            const defaultVariant = sortedVariants[0] || product;
                            
                            // Chuyển đến trang chi tiết với ID sản phẩm gốc và truyền thông tin biến thể đã chọn
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
                ))
              ) : (
                <div className="text-center w-100" style={{ color: "#888" }}>Không có sản phẩm giảm giá</div>
              )}
            </div>

            {!loading && saleProducts.length > 0 && (
              <div className="pagination d-flex justify-content-center align-items-center gap-1 mt-4 flex-wrap">
                <button onClick={handleFirstPage} disabled={currentPage === 0} className="btn btn-light border">
                  <i className="bi bi-chevron-double-left"></i>
                </button>
                <button onClick={handlePreviousPage} disabled={currentPage <= 0} className="btn btn-light border">
                  <i className="bi bi-chevron-left"></i>
                </button>
                {pageNumbers.map(pn => (
                  <button 
                    key={pn} 
                    onClick={() => handlePageClick(pn)}
                    className={`btn btn-light border mx-1 ${currentPage === pn ? "active bg-primary text-white" : ""}`}
                    style={{ minWidth: 36 }}
                  >
                    {pn + 1}
                  </button>
                ))}
                <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} className="btn btn-light border">
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button onClick={handleLastPage} disabled={currentPage === totalPages - 1} className="btn btn-light border">
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </article>
  );
};

export default WebsiteHome;