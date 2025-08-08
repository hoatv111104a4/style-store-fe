import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { logout } from "../services/Website/UserApi";
import { Typography } from "@mui/material";

const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userInfoCookie = Cookies.get("adminInfo");
    return userInfoCookie ? JSON.parse(userInfoCookie) : null;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout(true); // Gọi logout với isAdmin = true
      // Xóa token và user khỏi cookies
      Cookies.remove("adminToken");
      Cookies.remove("adminInfo");
      setUser(null);
      localStorage.removeItem("cart");
      toast.success("Đăng xuất thành công!", {
        autoClose: 2000,
        onClose: () => {
          navigate("/styleStore/login/admin");
        },
      });
    } catch (err) {
      console.error("Lỗi đăng xuất:", err.message || err);
      Cookies.remove("adminToken");
      Cookies.remove("adminInfo");
      setUser(null);
      localStorage.removeItem("cart");
      toast.error("Đăng xuất thất bại. Vui lòng thử lại!");
      navigate("/styleStore/login/admin");
    } finally {
      handleMenuClose();
    }
  };

  return (
    <nav className="navbar navbar-expand-md bg-white border-bottom sticky-top" style={{ height: "60px", zIndex: 1020 }}>
      <div className="container-md d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleSidebar}
            aria-controls="sidebar"
            aria-expanded="false"
            aria-label="Toggle sidebar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <div className="d-flex align-items-center">
          <IconButton
            onClick={handleMenuClick}
            size="large"
            sx={{
              color: "#222",
              border: "1px solid #ff6600",
              ml: 1,
              "&:hover": { background: "#fff7f0" },
              padding: 0.3,
            }}
          >
            <Avatar sx={{ bgcolor: "#ff6600", width: 32, height: 32 }}>
              {user?.hoTen
                ? user.hoTen
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                : <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          {user?.hoTen && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1, fontWeight: 300 }}
            >
              Chào: {user.hoTen}
            </Typography>
          )}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            disableScrollLock
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {user ? (
              <>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LoginIcon fontSize="small" sx={{ color: "#ff6600" }} />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
                <MenuItem component={NavLink} to="/website/thong-tin-ca-nhan-cua-toi">
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" sx={{ color: "#ff6600" }} />
                  </ListItemIcon>
                  Thông tin cá nhân
                </MenuItem>
              </>
            ) : (
              <MenuItem disabled>
                Vui lòng đăng nhập
              </MenuItem>
            )}
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;