import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import { createDiaChiNhan, getAllDiaChiNhan,getDiaChiNhanById } from "../../services/Website/AddressApi";

const API_PROVINCE = "https://provinces.open-api.vn/api/";

const fallbackProvinces = [
  { code: "01", name: "Hà Nội" },
  { code: "02", name: "Hồ Chí Minh" },
];

const AddAddressModal = ({ open, onClose, onSelectAddress }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    tinh: "",
    huyen: "",
    xa: "",
    soNha: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceNames, setProvinceNames] = useState({});
  const [districtNames, setDistrictNames] = useState({});
  const [wardNames, setWardNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
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

    // Load existing addresses
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await getAllDiaChiNhan();
      setAddresses(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      toast.error("Không thể tải danh sách địa chỉ.");
    }
  };

  useEffect(() => {
    if (form.tinh) {
      fetch(`${API_PROVINCE}p/${form.tinh}?depth=2`)
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
      setForm((f) => ({ ...f, huyen: "", xa: "" }));
    }
  }, [form.tinh]);

  useEffect(() => {
    if (form.huyen) {
      fetch(`${API_PROVINCE}d/${form.huyen}?depth=2`)
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
      setForm((f) => ({ ...f, xa: "" }));
    }
  }, [form.huyen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.phone ||
      !form.tinh ||
      !form.huyen ||
      !form.xa ||
      !form.soNha
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);

    const addressData = {
      tenNguoiNhan: form.name,
      soDienThoai: form.phone,
      tinh: provinceNames[form.tinh] || "",
      huyen: districtNames[form.huyen] || "",
      xa: wardNames[form.xa] || "",
      soNha: form.soNha,
    };

    try {
      await createDiaChiNhan(addressData);
      toast.success("Thêm địa chỉ nhận thành công!");
      setForm({
        name: "",
        phone: "",
        tinh: "",
        huyen: "",
        xa: "",
        soNha: "",
      });
      loadAddresses(); // Refresh address list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm địa chỉ nhận!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = async () => {
  if (!selectedAddressId) {
    toast.error("Vui lòng chọn một địa chỉ!");
    return;
  }
  try {
    const address = await getDiaChiNhanById(selectedAddressId);
    onSelectAddress(address); // Pass selected address to CheckOutPage
    onClose(); // Close the modal
  } catch (error) {
    toast.error("Không thể chọn địa chỉ!");
    console.error(error);
  }
};

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: { xs: "90%", sm: 600 }, // Tăng chiều rộng lên 600px
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Thêm địa chỉ nhận
        </Typography>
        <form onSubmit={handleSave}>
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
            name="tinh"
            value={form.tinh}
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
            name="huyen"
            value={form.huyen}
            onChange={handleChange}
            fullWidth
            SelectProps={{ native: true }}
            required
            sx={{ mb: 2 }}
            disabled={!form.tinh}
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
            name="xa"
            value={form.xa}
            onChange={handleChange}
            fullWidth
            SelectProps={{ native: true }}
            required
            sx={{ mb: 2 }}
            disabled={!form.huyen}
          >
            <option value=""></option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </TextField>
          <TextField
            label="Số nhà/Địa chỉ cụ thể"
            name="soNha"
            value={form.soNha}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </Box>
        </form>

        {/* Danh sách địa chỉ hiện có */}
        <Box sx={{ mt: 4 }}>
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 700 }}>
            Chọn địa chỉ đã lưu
          </FormLabel>
          <RadioGroup
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
          >
            {addresses.map((address) => (
              <FormControlLabel
                key={address.id}
                value={address.id}
                control={<Radio />}
                label={`${address.tenNguoiNhan} - ${address.soDienThoai} - ${address.soNha}, ${address.xa}, ${address.huyen}, ${address.tinh}`}
              />
            ))}
          </RadioGroup>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSelectAddress}
            disabled={!selectedAddressId || isLoading}
          >
            Chọn địa chỉ
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddAddressModal;