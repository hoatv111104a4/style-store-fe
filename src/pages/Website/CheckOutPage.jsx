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
import CircularProgress from "@mui/material/CircularProgress";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { createOder, submitVNPayOrder } from "../../services/Website/OrderApi";
import AddAddressModal from "./AddAddressModal";
const API_PROVINCE = "https://provinces.open-api.vn/api/";

// Địa chỉ gửi hàng mặc định (Cao đẳng FPT)
const DEFAULT_SHIPPING_LOCATION = {
  province: "Hà Nội",
  district: "Bắc Từ Liêm",
  ward: "Phường Phương Canh",
  address: "Đường Trịnh Văn Bô",
  coordinates: { lat: 21.038045, lng: 105.746841 }
};

const fallbackProvinces = [
  { code: "01", name: "Hà Nội" },
  { code: "02", name: "Hồ Chí Minh" },
];

// Hàm tính khoảng cách Euclid (chim bay) giữa 2 điểm
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính Trái đất tính bằng km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Khoảng cách tính bằng km
};

// Hàm tính phí vận chuyển dựa trên khoảng cách
const calculateShippingFee = (distance) => {
  if (distance <= 5) return 15000; // Dưới 5km: 15,000đ
  if (distance <= 10) return 25000; // Dưới 10km: 25,000đ
  if (distance <= 20) return 35000; // Dưới 20km: 35,000đ
  if (distance <= 50) return 50000; // Dưới 50km: 50,000đ
  return 80000; // Trên 50km: 80,000đ
};

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
  const [provinceNames, setProvinceNames] = useState({});
  const [districtNames, setDistrictNames] = useState({});
  const [wardNames, setWardNames] = useState({});
  const [shippingFee, setShippingFee] = useState(0);
  const [expectedDate, setExpectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [distance, setDistance] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm tính toán phí vận chuyển khi địa chỉ thay đổi
  const updateShippingFee = async () => {
    if (!form.province || !form.district || !form.ward) {
      setShippingFee(0);
      setDistance(0);
      return;
    }

    try {
      // Giả lập tọa độ dựa trên địa chỉ (trong thực tế nên dùng API Geocoding)
      const destinationLat = DEFAULT_SHIPPING_LOCATION.coordinates.lat + (Math.random() * 0.1 - 0.05);
      const destinationLng = DEFAULT_SHIPPING_LOCATION.coordinates.lng + (Math.random() * 0.1 - 0.05);
      
      const dist = calculateDistance(
        DEFAULT_SHIPPING_LOCATION.coordinates.lat,
        DEFAULT_SHIPPING_LOCATION.coordinates.lng,
        destinationLat,
        destinationLng
      );
      
      setDistance(dist);
      setShippingFee(calculateShippingFee(dist));
    } catch (error) {
      console.error("Lỗi tính toán phí vận chuyển:", error);
      setShippingFee(35000); // Mặc định 35,000đ nếu có lỗi
    }
  };

  useEffect(() => {
    const items = location.state?.selectedItems?.length > 0
      ? location.state.selectedItems
      : JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(items);

    const date = new Date();
    date.setDate(date.getDate() + 3);
    setExpectedDate(date.toLocaleDateString("vi-VN"));

    fetch(API_PROVINCE + "?depth=1")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu từ API");
        return res.json();
      })
      .then((data) => {
        const names = {};
        data.forEach((p) => (names[p.code] = p.name));
        setProvinces(data);
        setProvinceNames(names);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API tỉnh thành:", error);
        toast.error("Không thể tải dữ liệu từ API. Sử dụng dữ liệu địa phương.");
        const names = {};
        fallbackProvinces.forEach((p) => (names[p.code] = p.name));
        setProvinces(fallbackProvinces);
        setProvinceNames(names);
      });
  }, [location.state?.selectedItems]);

  useEffect(() => {
    return () => {
      setCartItems([]);
    };
  }, []);

  useEffect(() => {
    if (form.province) {
      fetch(`${API_PROVINCE}p/${form.province}?depth=2`)
        .then((res) => {
          if (!res.ok) throw new Error("Không thể tải dữ liệu quận huyện");
          return res.json();
        })
        .then((data) => {
          const names = {};
          data.districts.forEach((d) => (names[d.code] = d.name));
          setDistricts(data.districts || []);
          setDistrictNames(names);
        })
        .catch((error) => {
          console.error("Lỗi khi gọi API quận huyện:", error);
          toast.error("Không thể tải dữ liệu quận huyện. Sử dụng dữ liệu mẫu.");
          const sampleDistricts = [
            { code: "001", name: "Quận 1" },
            { code: "002", name: "Quận 2" },
          ];
          const names = {};
          sampleDistricts.forEach((d) => (names[d.code] = d.name));
          setDistricts(sampleDistricts);
          setDistrictNames(names);
        });
    } else {
      setDistricts([]);
      setWards([]);
      setForm((f) => ({ ...f, district: "", ward: "" }));
    }
  }, [form.province]);

  useEffect(() => {
    if (form.district) {
      fetch(`${API_PROVINCE}d/${form.district}?depth=2`)
        .then((res) => {
          if (!res.ok) throw new Error("Không thể tải dữ liệu phường xã");
          return res.json();
        })
        .then((data) => {
          const names = {};
          data.wards.forEach((w) => (names[w.code] = w.name));
          setWards(data.wards || []);
          setWardNames(names);
        })
        .catch((error) => {
          console.error("Lỗi khi gọi API phường xã:", error);
          toast.error("Không thể tải dữ liệu phường xã. Sử dụng dữ liệu mẫu.");
          const sampleWards = [
            { code: "0001", name: "Phường 1" },
            { code: "0002", name: "Phường 2" },
          ];
          const names = {};
          sampleWards.forEach((w) => (names[w.code] = w.name));
          setWards(sampleWards);
          setWardNames(names);
        });
    } else {
      setWards([]);
      setForm((f) => ({ ...f, ward: "" }));
    }
  }, [form.district]);

  // Cập nhật phí vận chuyển khi địa chỉ thay đổi
  useEffect(() => {
    updateShippingFee();
  }, [form.province, form.district, form.ward]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (id, value) => {
    let quantity = Number(value);
    if (quantity < 1) quantity = 1;
    const newCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(newCart);
    const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedFullCart = fullCart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedFullCart));
  };

  const handleRemoveItem = (id) => {
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
    const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedFullCart = fullCart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(updatedFullCart));
  };

  const handleSelectAddress = async (address) => {
    const provinceCode = provinces.find((p) => p.name === address.tinh)?.code || "";
    let districtCode = "";
    let wardCode = "";

    if (provinceCode) {
      try {
        const res = await fetch(`${API_PROVINCE}p/${provinceCode}?depth=2`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu quận huyện");
        const data = await res.json();
        const names = {};
        data.districts.forEach((d) => (names[d.code] = d.name));
        setDistricts(data.districts || []);
        setDistrictNames(names);

        districtCode = data.districts.find((d) => d.name === address.huyen)?.code || "";

        if (districtCode) {
          const wardRes = await fetch(`${API_PROVINCE}d/${districtCode}?depth=2`);
          if (!wardRes.ok) throw new Error("Không thể tải dữ liệu phường xã");
          const wardData = await wardRes.json();
          const wardNames = {};
          wardData.wards.forEach((w) => (wardNames[w.code] = w.name));
          setWards(wardData.wards || []);
          setWardNames(wardNames);

          wardCode = wardData.wards.find((w) => w.name === address.xa)?.code || "";
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu địa phương:", error);
        toast.error("Không thể tải dữ liệu địa phương!");
      }
    }

    setForm({
      ...form,
      name: address.tenNguoiNhan,
      phone: address.soDtNguoiNhan,
      province: provinceCode,
      district: districtCode,
      ward: wardCode,
      address: address.soNha,
    });
    setOpenModal(false);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
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

    setIsLoading(true);

    const donHangData = {
      nguoiDatHang: form.phone,
      nguoiNhanHang: form.name,
      diaChiNhanHang: `${form.address}, ${wardNames[form.ward] || ''}, ${districtNames[form.district] || ''}, ${provinceNames[form.province] || ''}`,
      tongSoLuongSp: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      tongTien: total + shippingFee,
      tienThue: shippingFee,
      moTa: form.note,
      chiTietDonHang: cartItems.map((item) => ({
        sanPhamctId: item.id,
        tenSanPham: item.tenSanPham || '',
        giaTien: item.giaBan,
        soLuong: item.quantity,
        thanhTien: item.quantity * item.giaBan,
      })),
      soDtNguoiNhan: form.phone,
    };

    try {
      if (form.payment === "online") {
        const vnpayUrl = await submitVNPayOrder(donHangData);
        window.location.href = vnpayUrl;
        return;
      } else {
        await createOder(donHangData);
        toast.success("Đặt hàng thành công!");
        const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const updatedFullCart = fullCart.filter(
          (item) => !cartItems.some((selected) => selected.id === item.id)
        );
        localStorage.setItem("cart", JSON.stringify(updatedFullCart));
        setCartItems([]);
        setForm({
          name: "",
          phone: "",
          province: "",
          district: "",
          ward: "",
          address: "",
          note: "",
          payment: "cod",
        });

      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo đơn hàng hoặc thanh toán!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.giaBan,
    0
  );

  return (
    <div className="container py-4">
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
      <h3 className="mb-4 fw-bold" style={{ color: "#ff6600" }}>
        Đặt hàng
      </h3>
      <Box
        className="d-flex flex-column flex-md-row gap-4"
        sx={{ background: "#fff", borderRadius: 2, boxShadow: 2, p: { xs: 2, md: 4 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <h5 className="fw-bold">Thông tin người nhận</h5>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenModal(true)}
              sx={{ fontWeight: 700 }}
            >
              Chọn địa chỉ nhận
            </Button>
          </Box>
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
              x
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
              disabled={cartItems.length === 0 || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
          </form>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
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
                              item.hinhAnhSp
                                ? `http://localhost:8080/uploads/${item.hinhAnhSp}`
                                : "/placeholder-image.png"
                            }
                            alt={item.tenSanPham}
                            width={36}
                            height={36}
                            style={{ objectFit: "cover", borderRadius: 6, marginRight: 8 }}
                          />
                          <span>{item.tenSanPham}</span>
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
                <span>Khoảng cách:</span>
                <span>{distance.toFixed(1)} km</span>
              </Box>
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
      <AddAddressModal open={openModal} onClose={() => setOpenModal(false)} onSelectAddress={handleSelectAddress} />
      <ToastContainer />
    </div>
  );
};

export default CheckOutPage;