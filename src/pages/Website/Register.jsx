import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { Visibility, VisibilityOff, Close } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { registerUser } from "../../services/Website/UserApi2";

const Register = ({ open, onClose }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "2", // Mặc định là Không xác định
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    onClose(); // Đóng modal ngay khi nhấn Đăng ký

    const {
      fullName,
      email,
      phone,
      password,
      dob,
      gender,
    } = form;

    // Định dạng ngày sinh theo YYYY-MM-DD
    const formattedDate = dob ? new Date(dob).toISOString().split("T")[0] : "";

    const userCreationRequest = {
      hoTen: fullName,
      soDienThoai: phone,
      email,
      matKhau: password,
      gioiTinh: parseInt(gender), // Chuyển đổi thành số nguyên
      namSinh: formattedDate,
      ma: null,
      cccd: null,
      diaChi: null,
      tenDangNhap: null,
      trangThai: null,
      tinh: null,
      huyen: null,
      xa: null,
    };

    const result = await Swal.fire({
      title: "Xác nhận đăng ký",
      text: "Bạn có chắc chắn muốn đăng ký tài khoản này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6600",
      cancelButtonColor: "#888",
      confirmButtonText: "Đăng ký",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        console.log("Payload gửi đi:", userCreationRequest);
        await registerUser(userCreationRequest);
        toast.success("Đăng ký tài khoản thành công!");
        setForm({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          dob: "",
          gender: "2",
          agree: false,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.result || "Lỗi khi đăng ký tài khoản!";
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
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="register-modal-title"
      aria-describedby="register-modal-description"
      disableScrollLock
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: "420px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" id="register-modal-title" sx={{ color: "#ff6600", fontWeight: 700 }}>
            Đăng ký tài khoản
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#888" }}>
            <Close />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Họ và tên"
            name="fullName"
            fullWidth
            margin="normal"
            value={form.fullName}
            onChange={handleChange}
            size="small"
            sx={{
              "& label": { color: "#222" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ff6600" },
                "&:hover fieldset": { borderColor: "#222" },
                "&.Mui-focused fieldset": { borderColor: "#222" },
              },
            }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            size="small"
            margin="normal"
            value={form.email}
            onChange={handleChange}
            sx={{
              "& label": { color: "#222" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ff6600" },
                "&:hover fieldset": { borderColor: "#222" },
                "&.Mui-focused fieldset": { borderColor: "#222" },
              },
            }}
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            type="tel"
            size="small"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={handleChange}
            sx={{
              "& label": { color: "#222" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ff6600" },
                "&:hover fieldset": { borderColor: "#222" },
                "&.Mui-focused fieldset": { borderColor: "#222" },
              },
            }}
          />
          <TextField
            label="Mật khẩu"
            name="password"
            size="small"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            sx={{
              "& label": { color: "#222" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ff6600" },
                "&:hover fieldset": { borderColor: "#222" },
                "&.Mui-focused fieldset": { borderColor: "#222" },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            fullWidth
            size="small"
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            sx={{
              "& label": { color: "#222" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ff6600" },
                "&:hover fieldset": { borderColor: "#222" },
                "&.Mui-focused fieldset": { borderColor: "#222" },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirm((show) => !show)}
                    edge="end"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Ngày sinh"
            name="dob"
            type="date"
            fullWidth
            size="small"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.dob}
            onChange={handleChange}
            sx={{
              "& label": { color: "#222" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ff6600" },
                "&:hover fieldset": { borderColor: "#222" },
                "&.Mui-focused fieldset": { borderColor: "#222" },
              },
            }}
          />
          <FormControl component="fieldset" margin="normal" sx={{ width: "100%" }}>
            <FormLabel component="legend" sx={{ color: "#222" }}>
              Giới tính
            </FormLabel>
            <RadioGroup
              row
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <FormControlLabel
                value="1"
                control={<Radio sx={{ color: "#ff6600", "&.Mui-checked": { color: "#222" } }} />}
                label="Nam"
              />
              <FormControlLabel
                value="0"
                control={<Radio sx={{ color: "#ff6600", "&.Mui-checked": { color: "#222" } }} />}
                label="Nữ"
              />
              <FormControlLabel
                value="2"
                control={<Radio sx={{ color: "#ff6600", "&.Mui-checked": { color: "#222" } }} />}
                label="Không xác định"
              />
            </RadioGroup>
          </FormControl>
          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.agree}
                  onChange={handleChange}
                  name="agree"
                  sx={{
                    color: "#ff6600",
                    "&.Mui-checked": { color: "#222" },
                  }}
                />
              }
              label="Tôi đồng ý với điều khoản"
            />
          </FormGroup>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              background: "#222",
              color: "#fff",
              fontWeight: 700,
              "&:hover": { background: "#ff6600", color: "#fff" },
              py: 1.2,
              fontSize: 18,
              borderRadius: 2,
            }}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </Box>
        <ToastContainer />
      </Box>
    </Modal>
  );
};

export default Register;