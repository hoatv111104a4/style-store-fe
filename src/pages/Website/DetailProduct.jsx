import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getByIdSanPhamCt } from "../../services/Website/ProductApis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Website/DetailProductCss.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const DetailProduct = () => {
  const { id } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getByIdSanPhamCt(id);
        setProductDetail(data);
        console.log("Chi tiết sản phẩm:", data);
        setQuantity(1); // reset về 1 khi đổi sản phẩm
      } catch (error) {
        toast.error("Không thể tải chi tiết sản phẩm!");
      }
    };
    fetchDetail();
  }, [id]);

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);
    if (value > (productDetail?.soLuong || 1)) value = productDetail.soLuong;
    if (value < 1) value = 1;
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!productDetail) {
      toast.error("Không có thông tin sản phẩm!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existIndex = cart.findIndex(item => item.id === productDetail.id);
    const productToAdd = {
      id: productDetail.id,
      tenSanPham: productDetail.tenSanPham,
      hinhAnhSp: productDetail.hinhAnhSp,
      giaBan: productDetail.giaBan,
      soLuong: productDetail.soLuong,
      tenMauSac: productDetail.tenMauSac,
      maMauSac: productDetail.maMauSac,
      tenThuongHieu: productDetail.tenThuongHieu,
      tenKichThuoc: productDetail.tenKichThuoc,
      tenXuatXu: productDetail.tenXuatXu,
      tenChatLieu: productDetail.tenChatLieu,
      moTa: productDetail.moTa,
      giaBanGoc: productDetail.giaBanGoc,
      quantity,
    };
    if (existIndex !== -1) {
      cart[existIndex].quantity += quantity;
    } else {
      cart.push(productToAdd);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleOrderNow = () => {
    if (!productDetail) {
      toast.error("Không có thông tin sản phẩm!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existIndex = cart.findIndex(item => item.id === productDetail.id);
    const productToAdd = {
      id: productDetail.id,
      tenSanPham: productDetail.tenSanPham,
      hinhAnhSp: productDetail.hinhAnhSp,
      giaBan: productDetail.giaBan,
      soLuong: productDetail.soLuong,
      tenMauSac: productDetail.tenMauSac,
      maMauSac: productDetail.maMauSac,
      tenThuongHieu: productDetail.tenThuongHieu,
      tenKichThuoc: productDetail.tenKichThuoc,
      tenXuatXu: productDetail.tenXuatXu,
      tenChatLieu: productDetail.tenChatLieu,
      moTa: productDetail.moTa,
      giaBanGoc: productDetail.giaBanGoc,
      quantity,
    };
    if (existIndex !== -1) {
      cart[existIndex].quantity += quantity;
    } else {
      cart.push(productToAdd);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("orderNow", JSON.stringify([productToAdd]));
    navigate("/website/dat-hang", { state: { selectedItems: [productToAdd] } });
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" style={{ marginBottom: 20 }}>
        <ol className="breadcrumb bg-white px-0 py-2" style={{ background: "none" }}>
          <li className="breadcrumb-item">
            <Link to="/" style={{ color: "#222", textDecoration: "none", fontWeight: 500 }}>
              Trang chủ
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/san-pham" style={{ color: "#222", textDecoration: "none", fontWeight: 500 }}>
              Sản phẩm
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page" style={{ color: "#ff6600", fontWeight: 600 }}>
            {productDetail?.tenSanPham ? `Chi tiết: ${productDetail.tenSanPham}` : "Thông tin sản phẩm"}
          </li>
        </ol>
      </nav>
      {/* End Breadcrumb */}

      {productDetail ? (
        <div
          className="detail-product-box d-flex flex-column flex-md-row gap-4 align-items-stretch"
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: 24,
          }}
        >
          <div
            className="detail-product-img-col d-flex align-items-center justify-content-center"
            style={{ flex: "0 0 50%", maxWidth: "50%", minHeight: 320 }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 350,
                aspectRatio: "1/1",
                background: "#fafafa",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={
                  productDetail.hinhAnhSp
                    ? `http://localhost:8080/uploads/${productDetail.hinhAnhSp}`
                    : "/placeholder-image.png"
                }
                alt={productDetail.tenSanPham}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "#fff",
                  display: "block",
                }}
              />
            </div>
          </div>
          {/* Thông tin bên phải */}
          <div
            className="flex-grow-1 d-flex flex-column justify-content-center"
            style={{ flex: "0 0 50%", maxWidth: "50%" }}
          >
            <h2 className="fw-bold mb-3" style={{ color: "#ff6600" }}>
              {productDetail.tenSanPham}
            </h2>
            <div className="mb-2 d-flex align-items-center">
              <b className="me-2">Màu sắc:</b>
              <span
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: productDetail.maMauSac,
                  border: "1px solid #ccc",
                  marginRight: 8,
                }}
              />
              <span>{productDetail.tenMauSac}</span>
            </div>
            <div className="mb-2">
              <b>Thương hiệu:</b> {productDetail.tenThuongHieu}
            </div>
            <div className="mb-2">
              <b>Kích thước:</b> {productDetail.tenKichThuoc}
            </div>
            <div className="mb-2">
              <b>Xuất xứ:</b> {productDetail.tenXuatXu}
            </div>
            <div className="mb-2">
              <b>Chất liệu:</b> {productDetail.tenChatLieu}
            </div>
            <div className="mb-2">
              <b>Giá bán:</b>{" "}
              <span style={{ color: "#e53935", fontWeight: 600 }}>
                {Number(productDetail.giaBan).toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="mb-2">
              <b>Mô tả:</b> {productDetail.moTa}
            </div>
            <div className="mb-2">
              <b>Số lượng còn:</b> {productDetail.soLuong}
            </div>
            <div className="d-flex align-items-center gap-3 mt-3">
              <TextField
                type="number"
                label="Số lượng"
                variant="outlined"
                size="small"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{
                  min: 1,
                  max: productDetail?.soLuong || 99,
                  style: { fontWeight: 600, textAlign: "center" }
                }}
                sx={{ width: 120, background: "#fff", borderRadius: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOrderNow}
                sx={{ minWidth: 140, borderRadius: 2, fontWeight: 700 }}
              >
                Đặt hàng ngay
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleAddToCart}
                sx={{ minWidth: 140, borderRadius: 2, fontWeight: 700 }}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p>Đang tải chi tiết sản phẩm...</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default DetailProduct;