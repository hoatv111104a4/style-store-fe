import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const API_PROVINCE = "https://provinces.open-api.vn/api/";

const CheckOutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
    payment: "cod",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingFee] = useState(30000); // phí vận chuyển cố định
  const [expectedDate, setExpectedDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"));
    // Ngày nhận dự kiến: +3 ngày
    const date = new Date();
    date.setDate(date.getDate() + 3);
    setExpectedDate(date.toLocaleDateString("vi-VN"));
    // Lấy tỉnh
    fetch(API_PROVINCE + "?depth=1")
      .then((res) => res.json())
      .then(setProvinces);
  }, []);

  // Lấy quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (form.province) {
      fetch(`${API_PROVINCE}p/${form.province}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
      setWards([]);
      setForm((f) => ({ ...f, district: "", ward: "" }));
    }
  }, [form.province]);

  // Lấy xã/phường khi chọn quận/huyện
  useEffect(() => {
    if (form.district) {
      fetch(`${API_PROVINCE}d/${form.district}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []));
    } else {
      setWards([]);
      setForm((f) => ({ ...f, ward: "" }));
    }
  }, [form.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sửa số lượng sản phẩm trong hóa đơn
  const handleQuantityChange = (id, value) => {
    let quantity = Number(value);
    if (quantity < 1) quantity = 1;
    const newCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // Xoá sản phẩm khỏi hóa đơn
  const handleRemoveItem = (id) => {
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleOrder = (e) => {
    e.preventDefault();
    // Validate
    if (
      !form.name ||
      !form.phone ||
      !form.province ||
      !form.district ||
      !form.ward ||
      !form.address
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    // Xử lý đặt hàng ở đây (gửi API...)
    toast.success("Đặt hàng thành công!");
    // Xoá giỏ hàng
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.giaBan,
    0
  );

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" style={{ marginBottom: 24 }}>
        <ol className="breadcrumb bg-white px-0 py-2" style={{ background: "none" }}>
          <li className="breadcrumb-item">
            <span
              style={{ color: "#222", textDecoration: "none", fontWeight: 500, cursor: "pointer" }}
              onClick={() => navigate(-1)}
            >
              Giỏ hàng
            </span>
          </li>
          <li className="breadcrumb-item active" aria-current="page" style={{ color: "#ff6600", fontWeight: 600 }}>
            Đặt hàng
          </li>
        </ol>
      </nav>
      {/* End Breadcrumb */}
      <h3 className="mb-4 fw-bold" style={{ color: "#ff6600" }}>
        Đặt hàng
      </h3>
      <Box
        className="d-flex flex-column flex-md-row gap-4"
        sx={{ background: "#fff", borderRadius: 2, boxShadow: 2, p: { xs: 2, md: 4 } }}
      >
        {/* Thông tin người đặt */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <h5 className="mb-3 fw-bold">Thông tin người nhận</h5>
          <form onSubmit={handleOrder}>
            <TextField
              label="Họ và tên"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Tỉnh/Thành phố"
              name="province"
              value={form.province}
              onChange={handleChange}
              fullWidth
              SelectProps={{ native: true }}
              required
              sx={{ mb: 2 }}
            >
              <option value=""></option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </TextField>
            <TextField
              select
              label="Quận/Huyện"
              name="district"
              value={form.district}
              onChange={handleChange}
              fullWidth
              SelectProps={{ native: true }}
              required
              sx={{ mb: 2 }}
              disabled={!form.province}
            >
              <option value=""></option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </TextField>
            <TextField
              select
              label="Xã/Phường/Thị trấn"
              name="ward"
              value={form.ward}
              onChange={handleChange}
              fullWidth
              SelectProps={{ native: true }}
              required
              sx={{ mb: 2 }}
              disabled={!form.district}
            >
              <option value=""></option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </TextField>
            <TextField
              label="Địa chỉ cụ thể"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Ghi chú"
              name="note"
              value={form.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Phương thức thanh toán
            </FormLabel>
            <RadioGroup
              row
              name="payment"
              value={form.payment}
              onChange={handleChange}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="cod"
                control={<Radio color="primary" />}
                label="Thanh toán khi nhận hàng"
              />
              <FormControlLabel
                value="online"
                control={<Radio color="primary" />}
                label="Thanh toán online"
              />
            </RadioGroup>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontWeight: 700, py: 1.2, mt: 2 }}
              disabled={cartItems.length === 0}
            >
              Đặt hàng
            </Button>
          </form>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
        {/* Hóa đơn */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <h5 className="mb-3 fw-bold">Hóa đơn</h5>
          {cartItems.length === 0 ? (
            <p>Không có sản phẩm trong giỏ hàng.</p>
          ) : (
            <Box>
              <table className="cart-table" style={{ width: "100%", fontSize: 15, marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Sản phẩm</th>
                    <th style={{ textAlign: "center" }}>SL</th>
                    <th style={{ textAlign: "right" }}>Giá</th>
                    <th style={{ textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              item.hinhAnhSp?.hinhAnh
                                ? `http://localhost:8080/uploads/${item.hinhAnhSp.hinhAnh}`
                                : "/placeholder-image.png"
                            }
                            alt={item.sanPham?.ten}
                            width={36}
                            height={36}
                            style={{ objectFit: "cover", borderRadius: 6, marginRight: 8 }}
                          />
                          <span>{item.sanPham?.ten}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          inputProps={{
                            min: 1,
                            style: { width: 50, textAlign: "center" },
                          }}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {(item.quantity * item.giaBan).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString("vi-VN")}₫</span>
              </Box>
              <Box className="d-flex justify-content-between mb-2">
                <span>Ngày nhận dự kiến:</span>
                <span>{expectedDate}</span>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box className="d-flex justify-content-between" sx={{ fontWeight: 700, color: "#e53935", fontSize: 18 }}>
                <span>Tổng tiền:</span>
                <span>{(total + shippingFee).toLocaleString("vi-VN")}₫</span>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <ToastContainer />
    </div>
  );
};

export default CheckOutPage;