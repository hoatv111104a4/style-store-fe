import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { login } from "../services/Website/UserApi";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  IconButton, 
  InputAdornment 
} from "@mui/material";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data.code === 0 && data.result?.authenticated) {
        const token = data.result.token;
        const userInfo = jwtDecode(token);
        const userRole = userInfo.scope ? userInfo.scope.split(" ") : [userInfo.role || ""];

        // Kiểm tra vai trò ROLE_ADMIN hoặc ROLE_STAFF
        if (userRole.includes("ROLE_ADMIN") || userRole.includes("ROLE_STAFF")) {
          Cookies.set("token", token, { expires: 7 });
          Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });
          toast.success("Đăng nhập admin thành công!", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin/thong-ke"); // Chuyển đến trang thống kê
              }, 500);
            },
          });
        } else {
          toast.error("Bạn không có quyền truy cập trang admin!");
        }
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
      }
    } catch (err) {
      toast.error(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: "400px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: "#ff6600", fontWeight: 700, mb: 2, textAlign: "center" }}>
          Đăng nhập Admin
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
      </Box>
    </Box>
  );
};

export default AdminLogin;