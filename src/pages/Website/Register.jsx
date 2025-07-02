import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đăng ký ở đây
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "#fafafa" }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 420,
          width: "100%",
          border: "2px solid #fff",
          boxShadow: "0 0 16px #ddd",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          mb={3}
          sx={{ color: "#ff6600", fontWeight: 700 }}
        >
          Đăng ký tài khoản
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Họ và tên"
            name="fullName"
            fullWidth
            required
            margin="normal"
            value={form.fullName}
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
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
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
            fullWidth
            required
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
            type={showPassword ? "text" : "password"}
            fullWidth
            required
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
            required
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
            required
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
              <FormControlLabel value="male" control={<Radio sx={{
                color: "#ff6600", '&.Mui-checked': { color: "#222" }
              }} />} label="Nam" />
              <FormControlLabel value="female" control={<Radio sx={{
                color: "#ff6600", '&.Mui-checked': { color: "#222" }
              }} />} label="Nữ" />
              <FormControlLabel value="other" control={<Radio sx={{
                color: "#ff6600", '&.Mui-checked': { color: "#222" }
              }} />} label="Khác" />
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
                    '&.Mui-checked': { color: "#222" }
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
            Đăng ký
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;