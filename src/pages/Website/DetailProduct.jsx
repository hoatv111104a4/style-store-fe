import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate ,useLocation} from "react-router-dom";
import { getPageSanPhamAdmin } from "../../services/Website/ProductApis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Website/DetailProductCss.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const DetailProduct = () => {
  const { id } = useParams(); // id sản phẩm gốc
  const [productList, setProductList] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy danh sách sản phẩm chi tiết theo id sản phẩm
  useEffect(() => {
  const fetchDetail = async () => {
    try {
      const data = await getPageSanPhamAdmin(id, { page: 0, size: 100 });
      const list = data.content || [];
      setProductList(list);
      
      // Kiểm tra nếu có state từ navigation
      if (location.state) {
        const { selectedColor, selectedSize, selectedMaterial } = location.state;
        setSelectedColor(selectedColor || "");
        setSelectedSize(selectedSize || "");
        setSelectedMaterial(selectedMaterial || "");
        
        // Tìm sản phẩm phù hợp với các thuộc tính đã chọn
        const matchedProduct = list.find(
          item =>
            (selectedColor ? item.mauSacId === selectedColor : true) &&
            (selectedSize ? item.kichThuocId === selectedSize : true) &&
            (selectedMaterial ? item.chatLieuId === selectedMaterial : true)
        );
        
        if (matchedProduct) {
          setProductDetail(matchedProduct);
        } else if (list.length > 0) {
          // Nếu không tìm thấy, chọn sản phẩm đầu tiên
          setProductDetail(list[0]);
        }
      } else if (list.length > 0) {
        // Nếu không có state từ navigation, chọn sản phẩm đầu tiên
        setProductDetail(list[0]);
      }
      
      setQuantity(1);
    } catch (error) {
      toast.error("Không thể tải chi tiết sản phẩm!");
    }
  };
  fetchDetail();
}, [id, location.state]); // Thêm location.state vào dependencies
  // Lấy tất cả màu, size và chất liệu (không lọc)
  const allColors = Array.from(new Set(productList.map(item => item.mauSacId)))
    .map(msId => {
      const item = productList.find(i => i.mauSacId === msId);
      return { id: msId, name: item.tenMauSac || item.ten, code: item.maMauSac };
    });

  const allSizes = Array.from(new Set(productList.map(item => item.kichThuocId)))
    .map(ktId => {
      const item = productList.find(i => i.kichThuocId === ktId);
      return { id: ktId, name: item.tenKichThuoc };
    });

  const allMaterials = Array.from(new Set(productList.map(item => item.chatLieuId)))
    .map(clId => {
      const item = productList.find(i => i.chatLieuId === clId);
      return { id: clId, name: item.tenChatLieu };
    });

  // Khi chọn màu/kích thước/chất liệu, tìm sản phẩm chi tiết phù hợp
  useEffect(() => {
    if (productList.length === 0) return;

    // Tìm sản phẩm phù hợp với các thuộc tính đã chọn
    let foundProduct = productList.find(
      item =>
        (selectedColor ? item.mauSacId === selectedColor : true) &&
        (selectedSize ? item.kichThuocId === selectedSize : true) &&
        (selectedMaterial ? item.chatLieuId === selectedMaterial : true)
    );

    // Nếu không tìm thấy sản phẩm phù hợp
    if (!foundProduct) {
      // Tạo một sản phẩm "ảo" với số lượng = 0 để hiển thị
      const firstColor = allColors.find(c => c.id === selectedColor) || {};
      const firstSize = allSizes.find(s => s.id === selectedSize) || {};
      const firstMaterial = allMaterials.find(m => m.id === selectedMaterial) || {};
      const firstProduct = productList[0] || {};
      
      foundProduct = {
        ...firstProduct,
        id: null, // Đánh dấu là không tồn tại
        soLuong: 0,
        tenMauSac: firstColor.name || '',
        tenKichThuoc: firstSize.name || '',
        tenChatLieu: firstMaterial.name || '',
        mauSacId: selectedColor,
        kichThuocId: selectedSize,
        chatLieuId: selectedMaterial
      };

      // Hiển thị thông báo nếu đã chọn ít nhất 1 thuộc tính
      
    }

    setProductDetail(foundProduct);
    setQuantity(1);
  }, [selectedColor, selectedSize, selectedMaterial, productList]);

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);
    if (value > (productDetail?.soLuong || 0)) value = productDetail?.soLuong || 0;
    if (value < 1) value = 1;
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!productDetail || !productDetail.id || productDetail.soLuong <= 0) {
      toast.error("Sản phẩm không khả dụng!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existIndex = cart.findIndex(item => item.id === productDetail.id);
    const productToAdd = {
      id: productDetail.id,
      tenSanPham: productDetail.tenSanPham,
      hinhAnhSp: productDetail.tenHinhAnhSp,
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
    if (!productDetail || !productDetail.id || productDetail.soLuong <= 0) {
      toast.error("Sản phẩm không khả dụng!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existIndex = cart.findIndex(item => item.id === productDetail.id);
    const productToAdd = {
      id: productDetail.id,
      tenSanPham: productDetail.tenSanPham,
      hinhAnhSp: productDetail.tenHinhAnhSp,
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

  // Kiểm tra sản phẩm có khả dụng không
  const isProductAvailable = productDetail?.id && productDetail?.soLuong > 0;

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
                  productDetail.tenHinhAnhSp
                    ? `http://localhost:8080/uploads/${productDetail.tenHinhAnhSp}`
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
              <div style={{ display: "flex", gap: 8 }}>
                {allColors.map(ms => (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => setSelectedColor(ms.id)}
                    style={{
                      border: selectedColor === ms.id ? "2px solid #ff6600" : "1px solid #ccc",
                      outline: "none",
                      background: "#fff",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: selectedColor === ms.id ? "0 0 0 2px #ffe0b2" : "none",
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: ms.code,
                        border: "1px solid #ccc",
                        verticalAlign: "middle"
                      }}
                      title={ms.name}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <b className="me-2">Kích thước:</b>
              <div style={{ display: "flex", gap: 8 }}>
                {allSizes.map(kt => (
                  <button
                    key={kt.id}
                    type="button"
                    onClick={() => setSelectedSize(kt.id)}
                    style={{
                      border: selectedSize === kt.id ? "2px solid #ff6600" : "1px solid #ccc",
                      outline: "none",
                      background: "#fff",
                      borderRadius: 6,
                      minWidth: 36,
                      height: 32,
                      fontWeight: 600,
                      color: selectedSize === kt.id ? "#ff6600" : "#222",
                      boxShadow: selectedSize === kt.id ? "0 0 0 2px #ffe0b2" : "none",
                      cursor: "pointer"
                    }}
                  >
                    {kt.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <b className="me-2">Chất liệu:</b>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {allMaterials.map(cl => (
                  <button
                    key={cl.id}
                    type="button"
                    onClick={() => setSelectedMaterial(cl.id)}
                    style={{
                      border: selectedMaterial === cl.id ? "2px solid #ff6600" : "1px solid #ccc",
                      outline: "none",
                      background: "#fff",
                      borderRadius: 6,
                      padding: "0 12px",
                      height: 32,
                      fontWeight: 600,
                      color: selectedMaterial === cl.id ? "#ff6600" : "#222",
                      boxShadow: selectedMaterial === cl.id ? "0 0 0 2px #ffe0b2" : "none",
                      cursor: "pointer"
                    }}
                  >
                    {cl.name}
                  </button>
                ))}
              </div>
            </div>
            {/* <div className="mb-2">
              <b>Thương hiệu:</b> {productDetail.tenThuongHieu}
            </div>
            <div className="mb-2">
              <b>Xuất xứ:</b> {productDetail.tenXuatXu}
            </div> */}
            
            <div className="mb-2">
              <b>Giá bán:</b>{" "}
              <span style={{ color: "#e53935", fontWeight: 600 }}>
                {Number(productDetail.giaBan).toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="mb-2">
              <b>Mô tả:</b> {productDetail.moTa || "Chưa có mô tả"}
            </div>
            <div className="mb-2">
              <b>Số lượng còn:</b>{" "}
              <span style={{ color: isProductAvailable ? "inherit" : "#e53935", fontWeight: 600 }}>
                {productDetail.soLuong || 0}
              </span>
              {!isProductAvailable && (
                <span style={{ color: "#e53935", marginLeft: 8 }}>(Sản phẩm không khả dụng)</span>
              )}
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
                  max: productDetail?.soLuong || 0,
                  style: { fontWeight: 600, textAlign: "center" }
                }}
                disabled={!isProductAvailable}
                sx={{ 
                  width: 120, 
                  background: "#fff", 
                  borderRadius: 2,
                  '& .MuiInputBase-root.Mui-disabled': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOrderNow}
                disabled={!isProductAvailable}
                sx={{ 
                  minWidth: 140, 
                  borderRadius: 2, 
                  fontWeight: 700,
                  opacity: isProductAvailable ? 1 : 0.7
                }}
              >
                Đặt hàng ngay
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleAddToCart}
                disabled={!isProductAvailable}
                sx={{ 
                  minWidth: 140, 
                  borderRadius: 2, 
                  fontWeight: 700,
                  opacity: isProductAvailable ? 1 : 0.7
                }}
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