import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import StoreIcon from "@mui/icons-material/Store";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { logout } from "../services/Website/UserApi";
import "../styles/WebsiteNavbarCss.css";
import "../styles/MainCss.css";
import logo from "../assets/logo.jpg";
import Login from "../pages/Website/Login";
import Register from "../pages/Website/Register";

const WebsiteNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : null;
  });
  const [openCart, setOpenCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Get user role from token
  const getUserRole = () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const scopes = decoded.scope ? decoded.scope.split(" ") : [];
        return scopes.length > 0 ? scopes : [decoded.role || ""];
      } catch (err) {
        console.error("Lỗi giải mã token:", err);
        return [];
      }
    }
    return [];
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenCart = () => {
    // Kiểm tra nếu không phải đang ở trang thanh toán thì mới load từ localStorage
    if (!window.location.pathname.includes("/dat-hang")) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      // Chuẩn hóa dữ liệu từ localStorage
      const normalizedCart = cart.map(item => ({
        ...item,
        tenSanPham: item.tenSanPham || item.sanPham?.ten || "Không xác định",
        hinhAnhSp: item.hinhAnhSp || item.hinhAnhSp?.hinhAnh || "/placeholder-image.png",
        giaBan: item.giaBan || item.giaTien || 0,
        quantity: item.quantity || 1,
      }));
      setCartItems(normalizedCart);
    }
    setOpenCart(true);
  };

  const handleCloseCart = () => setOpenCart(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/san-pham?tenSanPham=${encodeURIComponent(search)}`);
    } else {
      navigate("/san-pham");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await logout();
      setUser(null);
      setCartItems([]);
      setSelectedCartItems([]);
      localStorage.removeItem("cart");
      toast.success(response.message || "Đăng xuất thành công!", {
        onClose: () => {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        },
      });
      handleMenuClose();
      navigate("/");
    } catch (err) {
      console.error("Lỗi đăng xuất:", err.message);
      toast.error(err.message);
      setUser(null);
      setCartItems([]);
      setSelectedCartItems([]);
      localStorage.removeItem("cart");
      handleMenuClose();
      navigate("/");
    }
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedCartItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleOrderClick = () => {
    if (selectedCartItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
      return;
    }

    const selectedItems = cartItems.filter((item) =>
      selectedCartItems.includes(item.id)
    );

    handleCloseCart();
    navigate("/website/dat-hang", {
      state: { selectedItems },
    });
  };

  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get("token");
      if (token) {
        const decoded = jwtDecode(token);
        const expiresIn = decoded.exp * 1000 - Date.now();
        if (expiresIn < 300000) {
          apiClient
            .post("/auth/refresh", { token })
            .then((response) => {
              const newToken = response.data.result.token;
              Cookies.set("token", newToken, { expires: 7 });
              Cookies.set("user", JSON.stringify(jwtDecode(newToken)), { expires: 7 });
              setUser(jwtDecode(newToken));
            })
            .catch(() => {
              Cookies.remove("token");
              Cookies.remove("user");
              setUser(null);
              setSelectedCartItems([]);
              navigate("/dang-nhap");
            });
        }
      }
    };

    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  const userRole = getUserRole();
  const isAdminOrStaff = user && (Array.isArray(userRole) ? userRole.includes("ROLE_ADMIN") || userRole.includes("ROLE_STAFF") : false);

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top" style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <div className="container py-2">
          <NavLink className="navbar-brand logo-text" to="/">
            <span className="logo-main">
              <span className="logo-style">Style</span>
              <span className="logo-bag">
                <i className="bi bi-backpack2-fill"></i>
              </span>
              <span className="logo-highlight">Store</span>
            </span>
            <span className="logo-sub">Balo chất lượng & uy tín</span>
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ps-5">
              <li className="nav-item mx-2">
                <NavLink className="website-nav-link text-dark" aria-current="page" to="/">
                  Trang chủ
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink className="website-nav-link text-dark" to="/san-pham">
                  Sản phẩm
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink className="website-nav-link text-dark" to="/lien-he">
                  Liên hệ
                </NavLink>
              </li>
            </ul>
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <TextField
                variant="outlined"
                placeholder="Nhập tên balo"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 300, background: "#fff" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item mx-2">
                <a className="nav-link cart-icon-wrapper" href="#" onClick={handleOpenCart}>
                  <span className="cart-icon-border">
                    <i className="bi bi-cart"></i>
                  </span>
                </a>
              </li>
              <li className="nav-item mx-2">
                <IconButton
                  onClick={handleMenuClick}
                  size="large"
                  sx={{
                    color: "#222",
                    border: "1px solid #ff6600",
                    ml: 1,
                    "&:hover": { background: "#fff7f0" },
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
                  {!user ? (
                    <>
                      <MenuItem onClick={() => setOpenLogin(true)}>
                        <ListItemIcon>
                          <LoginIcon fontSize="small" sx={{ color: "#ff6600" }} />
                        </ListItemIcon>
                        Đăng nhập
                      </MenuItem>
                      <MenuItem onClick={() => setOpenRegister(true)}>
                        <ListItemIcon>
                          <PersonAddIcon fontSize="small" sx={{ color: "#ff6600" }} />
                        </ListItemIcon>
                        Đăng kí
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LoginIcon fontSize="small" sx={{ color: "#ff6600" }} />
                        </ListItemIcon>
                        Đăng xuất
                      </MenuItem>
                      {isAdminOrStaff && (
                        <MenuItem component={NavLink} to="/admin/thong-ke">
                          <ListItemIcon>
                            <StoreIcon fontSize="small" sx={{ color: "#ff6600" }} />
                          </ListItemIcon>
                          Cửa hàng của tôi
                        </MenuItem>
                      )}
                      <MenuItem component={NavLink} to="/website/dat-hang/lich-su-dat-hang">
                        <ListItemIcon>
                          <StoreIcon fontSize="small" sx={{ color: "#ff6600" }} />
                        </ListItemIcon>
                        Thông tin đơn hàng
                      </MenuItem>
                      <MenuItem component={NavLink} to="/thong-tin-ca-nhan">
                        <ListItemIcon>
                          <AccountCircleIcon fontSize="small" sx={{ color: "#ff6600" }} />
                        </ListItemIcon>
                        Thông tin cá nhân
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Modal open={openCart} onClose={handleCloseCart} disableScrollLock>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "98vw", sm: "90vw", md: 700, lg: 800 },
            maxWidth: "98vw",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 1, sm: 2, md: 4 },
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseCart}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "#888",
              zIndex: 10,
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          <h4 style={{ marginBottom: 20, fontWeight: 700, textAlign: "center" }}>
            Giỏ hàng của bạn
          </h4>
          {cartItems.length === 0 ? (
            <p>Chưa có sản phẩm nào trong giỏ.</p>
          ) : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table
                className="cart-table"
                style={{
                  fontSize: 15,
                  width: "100%",
                  minWidth: 600,
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  marginBottom: 0,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: 40, background: "#111", color: "#fff", border: "none", padding: 10 }}></th>
                    <th style={{ width: 40, background: "#111", color: "#fff", border: "none", padding: 10 }}>STT</th>
                    <th style={{ background: "#111", color: "#fff", border: "none", padding: 10 }}>Ảnh</th>
                    <th style={{ background: "#111", color: "#fff", border: "none", padding: 10 }}>Tên sản phẩm</th>
                    <th style={{ background: "#111", color: "#fff", border: "none", padding: 10 }}>Số lượng</th>
                    <th style={{ background: "#111", color: "#fff", border: "none", padding: 10 }}>Giá</th>
                    <th style={{ background: "#111", color: "#fff", border: "none", padding: 10 }}>Thành tiền</th>
                    <th style={{ background: "#111", color: "#fff", border: "none", padding: 10 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, idx) => (
                    <tr key={item.id} style={{ border: "none" }}>
                      <td style={{ border: "none", padding: 10, textAlign: "center" }}>
                        <Checkbox
                          checked={selectedCartItems.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                      </td>
                      <td style={{ border: "none", padding: 10, textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ border: "none", padding: 10, textAlign: "center" }}>
                        <img
                          src={`http://localhost:8080/uploads/${item.hinhAnhSp}`}
                          alt={item.tenSanPham}
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: 6 }}
                          onError={(e) => { e.target.src = "/placeholder-image.png"; }}
                        />
                      </td>
                      <td style={{ border: "none", padding: 10 }}>{item.tenSanPham}</td>
                      <td style={{ border: "none", padding: 10, textAlign: "center" }}>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          inputProps={{
                            min: 1,
                            style: { width: 60, textAlign: "center" },
                          }}
                          onChange={(e) => {
                            let value = Number(e.target.value);
                            if (value < 1) value = 1;
                            const newCart = cartItems.map((sp) =>
                              sp.id === item.id ? { ...sp, quantity: value } : sp
                            );
                            setCartItems(newCart);
                            localStorage.setItem("cart", JSON.stringify(newCart));
                          }}
                        />
                      </td>
                      <td style={{ border: "none", padding: 10, textAlign: "right" }}>
                        {Number(item.giaBan).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ color: "#e53935", fontWeight: 600, border: "none", padding: 10, textAlign: "right" }}>
                        {(item.quantity * item.giaBan).toLocaleString("vi-VN")}₫
                      </td>
                      <td style={{ border: "none", padding: 10, textAlign: "center" }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            const newCart = cartItems.filter((sp) => sp.id !== item.id);
                            setCartItems(newCart);
                            setSelectedCartItems((prev) => prev.filter((id) => id !== item.id));
                            localStorage.setItem("cart", JSON.stringify(newCart));
                          }}
                        >
                          Xoá
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={6} style={{ textAlign: "right", fontWeight: 600, border: "none", padding: 10, background: "#fafafa" }}>
                      Tổng tiền:
                    </td>
                    <td style={{ color: "#e53935", fontWeight: 700, fontSize: 17, border: "none", padding: 10, background: "#fafafa", textAlign: "right" }}>
                      {cartItems
                        .filter((item) => selectedCartItems.includes(item.id))
                        .reduce((sum, item) => sum + item.quantity * item.giaBan, 0)
                        .toLocaleString("vi-VN")}
                      ₫
                    </td>
                    <td style={{ border: "none", background: "#fafafa" }}></td>
                  </tr>
                </tbody>
              </table>
              <Box className="d-flex justify-content-end mt-3" sx={{ gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOrderClick}
                  sx={{ minWidth: 140, fontWeight: 700 }}
                >
                  Đặt hàng
                </Button>
              </Box>
            </div>
          )}
        </Box>
      </Modal>
      <Login open={openLogin} onClose={() => setOpenLogin(false)} />
      <Register open={openRegister} onClose={() => setOpenRegister(false)} />
    </div>
  );
};

export default WebsiteNavbar;