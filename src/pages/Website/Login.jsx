import React, { useState } from "react";
import { Box, TextField, Button, Typography, Link, Paper, IconButton, InputAdornment, Modal } from "@mui/material";
import { Visibility, VisibilityOff, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { login } from "../../services/Website/UserApi";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const Login = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await login(email, password);
    if (data.code === 0 && data.result?.authenticated) {
      const token = data.result.token;
      const userInfo = jwtDecode(token);
      Cookies.set("token", token, { expires: 7 });
      Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });
      
      
      onClose();
      
      toast.success("Đăng nhập thành công!", {
        onClose: () => {
          setTimeout(() => {
            window.location.reload();
          }, 500); // Small delay to ensure toast is fully closed
        },
      });
    } else {
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    }
  } catch (err) {
    toast.error(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
  }
};

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
      disableScrollLock
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: "400px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" id="login-modal-title" sx={{ color: "#ff6600", fontWeight: 700 }}>
            Đăng nhập
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#888" }}>
            <Close />
          </IconButton>
        </Box>
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
    </Modal>
  );
};

export default Login;