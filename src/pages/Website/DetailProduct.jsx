import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getByIdSanPhamCt } from "../../services/Website/ProductApis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Website/DetailProductCss.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'


const DetailProduct = () => {
  const { id } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getByIdSanPhamCt(id);
      setProductDetail(data);
      setQuantity(1); // reset về 1 khi đổi sản phẩm
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
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existIndex = cart.findIndex(item => item.id === productDetail.id);
  if (existIndex !== -1) {
    cart[existIndex].quantity += quantity;
  } else {
    cart.push({
      ...productDetail,
      quantity,
    });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  toast.success("Đã thêm vào giỏ hàng!"); 
 };

  return (
    <div className="container py-4">
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
                  productDetail.hinhAnhSp?.hinhAnh
                    ? `http://localhost:8080/uploads/${productDetail.hinhAnhSp.hinhAnh}`
                    : "/placeholder-image.png"
                }
                alt={productDetail.sanPham?.ten}
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
              {productDetail.sanPham?.ten}
            </h2>
            <div className="mb-2 d-flex align-items-center">
              <b className="me-2">Màu sắc:</b>
              <span
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: productDetail.mauSac?.ma,
                  border: "1px solid #ccc",
                  marginRight: 8,
                }}
              />
            </div>
            <div className="mb-2">
              <b>Thương hiệu:</b> {productDetail.thuongHieu?.ten}
            </div>
            <div className="mb-2">
              <b>Kích thước:</b> {productDetail.kichThuoc?.ten}
            </div>
            <div className="mb-2">
              <b>Xuất xứ:</b> {productDetail.xuatXu?.ten}
            </div>
            <div className="mb-2">
              <b>Chất liệu:</b> {productDetail.chatLieu?.ten}
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