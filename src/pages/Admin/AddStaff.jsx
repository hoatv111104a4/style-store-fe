import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Box,
  Grid,
  CircularProgress,
  Typography,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createNhanVien } from "../../services/Website/UserApi2";
import Swal from "sweetalert2";

const API_PROVINCE = "https://provinces.open-api.vn/api/";

const fallbackProvinces = [
  { code: "01", name: "Hà Nội" },
  { code: "02", name: "Hồ Chí Minh" },
];

const AddStaff = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hoTen: "",
    soDienThoai: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    gioiTinh: "1",
    namSinh: "",
    trangThai: "1",
    cccd: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceNames, setProvinceNames] = useState({});
  const [districtNames, setDistrictNames] = useState({});
  const [wardNames, setWardNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load provinces
  useEffect(() => {
    fetch(API_PROVINCE + "?depth=1")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const names = {};
        data.forEach((p) => (names[p.code] = p.name));
        setProvinces(data);
        setProvinceNames(names);
      })
      .catch(() => {
        toast.error("Không thể tải tỉnh/thành. Dùng dữ liệu mẫu.");
        const names = {};
        fallbackProvinces.forEach((p) => (names[p.code] = p.name));
        setProvinces(fallbackProvinces);
        setProvinceNames(names);
      });
  }, []);

  // Load districts
  useEffect(() => {
    if (form.province) {
      fetch(`${API_PROVINCE}p/${form.province}?depth=2`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          const names = {};
          data.districts.forEach((d) => (names[d.code] = d.name));
          setDistricts(data.districts);
          setDistrictNames(names);
        })
        .catch(() => {
          toast.error("Không thể tải quận/huyện. Dùng mẫu.");
          const sample = [
            { code: "001", name: "Quận 1" },
            { code: "002", name: "Quận 2" },
          ];
          const names = {};
          sample.forEach((d) => (names[d.code] = d.name));
          setDistricts(sample);
          setDistrictNames(names);
        });
    } else {
      setDistricts([]);
      setForm((f) => ({ ...f, district: "", ward: "" }));
    }
  }, [form.province]);

  // Load wards
  useEffect(() => {
    if (form.district) {
      fetch(`${API_PROVINCE}d/${form.district}?depth=2`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          const names = {};
          data.wards.forEach((w) => (names[w.code] = w.name));
          setWards(data.wards);
          setWardNames(names);
        })
        .catch(() => {
          toast.error("Không thể tải phường/xã. Dùng mẫu.");
          const sample = [
            { code: "0001", name: "Phường 1" },
            { code: "0002", name: "Phường 2" },
          ];
          const names = {};
          sample.forEach((w) => (names[w.code] = w.name));
          setWards(sample);
          setWardNames(names);
        });
    } else {
      setWards([]);
      setForm((f) => ({ ...f, ward: "" }));
    }
  }, [form.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const {
      hoTen,
      soDienThoai,
      email,
      province,
      district,
      ward,
      address,
      namSinh,
      gioiTinh,
      trangThai,
      cccd,
    } = form;

    // Đảm bảo định dạng YYYY-MM-DD
    const formattedDate = namSinh ? new Date(namSinh).toISOString().split("T")[0] : "";

    const payload = {
      hoTen,
      soDienThoai,
      email,
      gioiTinh: parseInt(gioiTinh),
      namSinh: formattedDate,
      trangThai: parseInt(trangThai),
      diaChi: `${address}, ${wardNames[ward] || ""}, ${districtNames[district] || ""}, ${provinceNames[province] || ""}`,
      tinh: provinceNames[province] || "",
      huyen: districtNames[district] || "",
      xa: wardNames[ward] || "",
      ...(cccd ? { cccd } : {}),
    };

    const result = await Swal.fire({
      title: "Xác nhận thêm nhân viên",
      text: "Bạn có chắc chắn muốn thêm nhân viên này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6600",
      cancelButtonColor: "#888",
      confirmButtonText: "Thêm",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        console.log("Payload gửi đi:", payload);
        await createNhanVien(payload);
        toast.success("Thêm nhân viên thành công!");
        setForm({
          hoTen: "",
          soDienThoai: "",
          email: "",
          province: "",
          district: "",
          ward: "",
          address: "",
          gioiTinh: "1",
          namSinh: "",
          trangThai: "1",
          cccd: "",
        });
      } catch (err) {
        // Hiển thị lỗi từ backend, lấy giá trị từ result
        const errorMessage = err.response?.data?.result || "Lỗi khi thêm nhân viên!";
        toast.error(errorMessage);
        console.error("Chi tiết lỗi:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="#ff6600">
        Thêm nhân viên
      </Typography>

      <Box
        sx={{ background: "#fff", p: 4, borderRadius: 2, boxShadow: 3 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Grid container spacing={4}>
          {/* Cột trái: Thông tin cá nhân */}
          <Grid item xs={12} md={6}>
            <TextField
              name="hoTen"
              value={form.hoTen}
              onChange={handleChange}
              fullWidth
              label="Họ và tên"
              sx={{ mb: 2 }}
            />
            <TextField
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              fullWidth
              label="Số điện thoại"
              sx={{ mb: 2 }}
            />
            <TextField
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              label="Email"
              sx={{ mb: 2 }}
            />
            <TextField
              name="cccd"
              value={form.cccd}
              onChange={handleChange}
              fullWidth
              label="CCCD"
              sx={{ mb: 2 }}
            />
            <TextField
              name="namSinh"
              value={form.namSinh}
              onChange={handleChange}
              fullWidth
              type="date"
              label="Ngày sinh"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormLabel component="legend">Giới tính</FormLabel>
            <RadioGroup
              row
              name="gioiTinh"
              value={form.gioiTinh}
              onChange={handleChange}
            >
              <FormControlLabel value="1" control={<Radio />} label="Nam" />
              <FormControlLabel value="0" control={<Radio />} label="Nữ" />
            </RadioGroup>
            <FormLabel component="legend" sx={{ mt: 2 }}>
              Trạng thái
            </FormLabel>
            <RadioGroup
              row
              name="trangThai"
              value={form.trangThai}
              onChange={handleChange}
            >
              <FormControlLabel
                value="1"
                control={<Radio />}
                label="Hoạt động"
              />
              <FormControlLabel
                value="0"
                control={<Radio />}
                label="Không hoạt động"
              />
            </RadioGroup>
          </Grid>

          {/* Cột phải: Địa chỉ */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              name="province"
              value={form.province}
              onChange={handleChange}
              fullWidth
              label="Tỉnh/Thành phố"
              sx={{ mb: 2 }}
            >
              <MenuItem value="">-- Chọn tỉnh --</MenuItem>
              {provinces.map((p) => (
                <MenuItem key={p.code} value={p.code}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              name="district"
              value={form.district}
              onChange={handleChange}
              fullWidth
              label="Quận/Huyện"
              sx={{ mb: 2 }}
              disabled={!form.province}
            >
              <MenuItem value="">-- Chọn quận --</MenuItem>
              {districts.map((d) => (
                <MenuItem key={d.code} value={d.code}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              name="ward"
              value={form.ward}
              onChange={handleChange}
              fullWidth
              label="Phường/Xã"
              sx={{ mb: 2 }}
              disabled={!form.district}
            >
              <MenuItem value="">-- Chọn phường --</MenuItem>
              {wards.map((w) => (
                <MenuItem key={w.code} value={w.code}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              label="Địa chỉ cụ thể"
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Nút Submit */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  px: 5,
                  py: 1.5,
                  backgroundColor: "#ff6600",
                  "&:hover": { backgroundColor: "#e65c00" },
                  fontWeight: 700,
                }}
                startIcon={
                  isLoading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {isLoading ? "Đang xử lý..." : "Thêm nhân viên"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default AddStaff;