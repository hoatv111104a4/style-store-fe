import React, { useState } from "react";
import { Box, TextField, Button, Typography, Link, Paper, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { login } from "../../services/Website/UserApi";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data.code === 0 && data.result?.authenticated) {
        // Lấy token và decode thông tin user
        const token = data.result.token;
        const userInfo = jwtDecode(token); // userInfo chứa id, hoTen, email, ...
        Cookies.set("token", token, { expires: 7 });
      Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });
      toast.success("Đăng nhập thành công!");
        // TODO: cập nhật icon tài khoản theo userInfo.email hoặc userInfo.hoTen
        // Chuyển hướng hoặc reload nếu cần
        window.location.reload();
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
      }
    } catch (err) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: "#fafafa" }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, maxWidth: 400, width: "100%", border: "2px solid #fff", boxShadow: "0 0 16px #ddd" }}>
        <Typography variant="h4" align="center" mb={3} sx={{ color: "#ff6600", fontWeight: 700 }}>
          Đăng nhập
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Gmail"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Link href="#" underline="hover" sx={{ color: "#ff6600", fontSize: 15 }}>
              Quên mật khẩu?
            </Link>
          </Box>
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
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
