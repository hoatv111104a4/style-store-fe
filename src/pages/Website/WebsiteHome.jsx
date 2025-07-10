import React, { useEffect, useState } from "react";
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

  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const data = await getAllSanPham({ page: 0, size: 100 });
        const saleList = (data.content || []).filter(
          (sp) => sp.giamGia != null && sp.giamGia !== 0
        );
        setSaleProducts(saleList);
      } catch (error) {
        setSaleProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSaleProducts();
  }, []);

  return (
    <article className="website-home" >
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
          <div className="row g-3">
            {saleProducts.length > 0 ? (
              saleProducts.map((spct) => (
                <div key={spct.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
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
                      -{Math.round(spct.giamGia * 1)}%
                    </span>
                    <img
                      src={spct.tenHinhAnhSp ? `http://localhost:8080/uploads/${spct.tenHinhAnhSp}` : "/placeholder-image.png"}
                      className="card-img-top product-image"
                      alt={spct.tenSanPham}
                      style={{ objectFit: "cover", height: "250px" }}
                    />
                    <div className="card-body do-an-info d-flex flex-column">
                      <h3 className="product-name fs-6 mb-1 fw-bold">{spct.tenSanPham}</h3>
                      <div className="mb-2 d-flex align-items-center gap-1">
                        <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
                          <i className="bi bi-award" style={{ color: "#ff6600" }}></i> {spct.tenThuongHieu}
                        </span>
                      </div>
                      <p className="product-price mb-3 fw-bold">
                        {spct.giaBanGoc && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#888",
                              fontWeight: "normal",
                              marginRight: 8,
                              fontSize: 14,
                            }}
                          >
                            {Number(spct.giaBanGoc).toLocaleString("vi-VN")}₫
                          </span>
                        )}
                        {Number(spct.giaBan).toLocaleString("vi-VN")}₫
                      </p>
                      <button
                        className="product-order-btn btn mt-auto"
                        style={{ backgroundColor: "#222", color: "#fff" }}
                        onClick={() => navigate(`/website/san-pham/chi-tiet-san-pham/${spct.id}`)}
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
        )}
      </section>
    </article>
  );
};

export default WebsiteHome;