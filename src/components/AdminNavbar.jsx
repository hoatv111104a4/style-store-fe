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
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : null;
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
    const response = await logout();
    setUser(null);
    localStorage.removeItem("cart");
    toast.success(response.message || "Đăng xuất thành công!", {
      onClose: () => {
        navigate("/styleStore/login/admin"); 
      },
    });
    handleMenuClose();
  } catch (err) {
    console.error("Lỗi đăng xuất:", err.message);
    toast.error(err.message);
    setUser(null);
    localStorage.removeItem("cart");
    handleMenuClose();
    navigate("/styleStore/login/admin"); 
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
          {/* <i
            className="bi bi-bell fs-4 position-relative me-5"
            style={{ cursor: "pointer" }}
          >
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: "0.7rem", padding: "2px 6px" }}
            >
              0<span className="visually-hidden">unread messages</span>
            </span>
          </i> */}
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
            onClick={handleMenuClose}
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