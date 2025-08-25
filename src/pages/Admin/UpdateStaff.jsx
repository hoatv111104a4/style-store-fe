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
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserDetail, updateUser } from "../../services/Website/UserApi2";
import Swal from "sweetalert2";
const API_PROVINCE = "https://provinces.open-api.vn/api/";

const fallbackProvinces = [
  { code: "01", name: "Hà Nội" },
  { code: "02", name: "Hồ Chí Minh" },
];

const StaffDetailForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
    tinh: "",
    huyen: "",
    xa: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceNames, setProvinceNames] = useState({});
  const [districtNames, setDistrictNames] = useState({});
  const [wardNames, setWardNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProvincesLoaded, setIsProvincesLoaded] = useState(false);
  const [isDistrictsLoaded, setIsDistrictsLoaded] = useState(false);
  const [isWardsLoaded, setIsWardsLoaded] = useState(false);

  // Normalize text for matching
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

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
        setIsProvincesLoaded(true);
      })
      .catch(() => {
        toast.error("Không thể tải tỉnh/thành. Dùng dữ liệu mẫu.");
        const names = {};
        fallbackProvinces.forEach((p) => (names[p.code] = p.name));
        setProvinces(fallbackProvinces);
        setProvinceNames(names);
        setIsProvincesLoaded(true);
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
          setIsDistrictsLoaded(true);
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
          setIsDistrictsLoaded(true);
        });
    } else {
      setDistricts([]);
      setIsDistrictsLoaded(false);
      setForm((f) => ({ ...f, district: "", ward: "", huyen: "", xa: "" }));
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
          setIsWardsLoaded(true);
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
          setIsWardsLoaded(true);
        });
    } else {
      setWards([]);
      setIsWardsLoaded(false);
      setForm((f) => ({ ...f, ward: "", xa: "" }));
    }
  }, [form.district]);

  // Load user details
  // Load user details
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await getUserDetail(id);
      const userData = res?.result || {};
      const formattedNamSinh = userData.namSinh
        ? new Date(userData.namSinh).toISOString().split("T")[0]
        : "";

      // Tách phần địa chỉ cụ thể (phía trước dấu phẩy đầu tiên)
      const fullDiaChi = userData.diaChi || "";
      const addressOnly = fullDiaChi.split(",")[0]?.trim() || "";

      setForm((prev) => ({
        ...prev,
        hoTen: userData.hoTen || "",
        soDienThoai: userData.soDienThoai || "",
        email: userData.email || "",
        address: addressOnly,
        gioiTinh: userData.gioiTinh?.toString() || "1",
        namSinh: formattedNamSinh,
        trangThai: userData.trangThai?.toString() || "1",
        cccd: userData.cccd || "",
        tinh: userData.tinh || "",
        huyen: userData.huyen || "",
        xa: userData.xa || "",
        province: "",
        district: "",
        ward: "",
      }));
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        navigate("/access-denied");
      } else {
        toast.error("Không thể tải dữ liệu nhân viên");
      }
    }
  };

  if (id && isProvincesLoaded) fetchUser();
}, [id, isProvincesLoaded]);

const handleUpdate = async (e) => {
  e.preventDefault();
  if (
    !form.hoTen ||
    !form.soDienThoai ||
    !form.email ||
    !form.province ||
    !form.district ||
    !form.ward ||
    !form.address ||
    !form.namSinh
  ) {
    toast.error("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  setIsLoading(true);
  const formattedDate = new Date(form.namSinh).toISOString().split("T")[0];
  const payload = {
    hoTen: form.hoTen,
    soDienThoai: form.soDienThoai,
    email: form.email,
    gioiTinh: parseInt(form.gioiTinh),
    namSinh: formattedDate,
    trangThai: parseInt(form.trangThai),
    diaChi: `${form.address}, ${wardNames[form.ward] || ""}, ${districtNames[form.district] || ""}, ${provinceNames[form.province] || ""}`,
    tinh: provinceNames[form.province] || "",
    huyen: districtNames[form.district] || "",
    xa: wardNames[form.ward] || "",
    ...(form.cccd ? { cccd: form.cccd } : {}),
  };

  const result = await Swal.fire({
    title: "Xác nhận cập nhật nhân viên",
    text: "Bạn có chắc chắn muốn cập nhật thông tin này không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff6600",
    cancelButtonColor: "#888",
    confirmButtonText: "Cập nhật",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      console.log("Payload gửi đi:", payload);
      await updateUser(id, payload);
      toast.success("Cập nhật thành công!");
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/access-denied");
      } else {
        toast.error("Lỗi khi cập nhật nhân viên!");
        console.error("Chi tiết lỗi:", err);
      }
    } finally {
      setIsLoading(false);
    }
  } else {
    setIsLoading(false);
  }
};


  // Map tinh, huyen, xa to province, district, ward
  useEffect(() => {
    if (isProvincesLoaded && form.tinh && provinces.length > 0) {
      const normalizedTinh = normalizeText(form.tinh);
      const province = provinces.find(
        (p) => normalizeText(p.name) === normalizedTinh
      );
      if (province) {
        setForm((prev) => ({ ...prev, province: province.code }));
        console.log(`Mapped tinh: ${form.tinh} to province code: ${province.code}`);
      } else {
        console.log(`No province found for tinh: ${form.tinh}`);
      }
    }
  }, [form.tinh, provinces, isProvincesLoaded]);

  useEffect(() => {
    if (isDistrictsLoaded && form.huyen && districts.length > 0) {
      const normalizedHuyen = normalizeText(form.huyen);
      const district = districts.find(
        (d) => normalizeText(d.name) === normalizedHuyen
      );
      if (district) {
        setForm((prev) => ({ ...prev, district: district.code }));
        console.log(`Mapped huyen: ${form.huyen} to district code: ${district.code}`);
      } else {
        console.log(`No district found for huyen: ${form.huyen}`);
      }
    }
  }, [form.huyen, districts, isDistrictsLoaded]);

  useEffect(() => {
    if (isWardsLoaded && form.xa && wards.length > 0) {
      const normalizedXa = normalizeText(form.xa);
      const ward = wards.find((w) => normalizeText(w.name) === normalizedXa);
      if (ward) {
        setForm((prev) => ({ ...prev, ward: ward.code }));
        console.log(`Mapped xa: ${form.xa} to ward code: ${ward.code}`);
      } else {
        console.log(`No ward found for xa: ${form.xa}`);
      }
    }
  }, [form.xa, wards, isWardsLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "province" ? { tinh: provinceNames[value] || "", district: "", ward: "", huyen: "", xa: "" } : {}),
      ...(name === "district" ? { huyen: districtNames[value] || "", ward: "", xa: "" } : {}),
      ...(name === "ward" ? { xa: wardNames[value] || "" } : {}),
    }));
  };

 

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="#0066cc">
        Cập nhật nhân viên
      </Typography>

      <Box
        sx={{ background: "#fff", p: 4, borderRadius: 2, boxShadow: 3 }}
        component="form"
        onSubmit={handleUpdate}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TextField
              name="hoTen"
              value={form.hoTen}
              onChange={handleChange}
              fullWidth
              required
              label="Họ và tên"
              sx={{ mb: 2 }}
            />
            <TextField
              name="soDienThoai"
              value={form.soDienThoai}
              onChange={handleChange}
              fullWidth
              required
              label="Số điện thoại"
              sx={{ mb: 2 }}
            />
            <TextField
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              label="Email"
              type="email"
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
              required
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

          <Grid item xs={12} md={6}>
            <TextField
              select
              name="province"
              value={form.province}
              onChange={handleChange}
              fullWidth
              required
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
              required
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
              required
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
              required
              label="Địa chỉ cụ thể"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  px: 5,
                  py: 1.5,
                  backgroundColor: "#0066cc",
                  "&:hover": { backgroundColor: "#0052a3" },
                  fontWeight: 700,
                }}
                startIcon={
                  isLoading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default StaffDetailForm;