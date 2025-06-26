import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import "../styles/WebsiteNavbarCss.css";
import "../styles/MainCss.css";
import logo from "../assets/logo.jpg"; // Adjust the path as necessary
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
const WebsiteNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [openCart, setOpenCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const handleOpenCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
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

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top  ">
        <div className="container py-2">
          <NavLink className="navbar-brand logo-text" to="/">
            <span className="logo-main">
              <span className="logo-style">Style</span>
              <span className="logo-bag">
                <i className="bi bi-backpack2-fill"></i>
              </span>
              <span className="logo-highlight">Store</span>
            </span>
            <span className="logo-sub">Balo chất lượng &amp; uy tín</span>
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
                <NavLink
                  className="website-nav-link text-dark"
                  aria-current="page"
                  to="/"
                >
                  Trang chủ
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink className="website-nav-link text-dark" to="/san-pham">
                  Sản phẩm
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink
                  className="website-nav-link text-dark"
                  to="/gioi-thieu"
                >
                  Giới thiệu
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
                <a
                  className="nav-link cart-icon-wrapper"
                  href="#"
                  onClick={handleOpenCart}
                >
                  <span className="cart-icon-border">
                    <i className="bi bi-cart"></i>
                  </span>
                </a>
              </li>
              <li className="nav-item dropdown mt-2">
                <a
                  className="nav-link dropdown-toggle text-dark"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Tài khoản
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink className="dropdown-item  px-3" to="/dang-nhap">
                      Đăng nhập
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item px-3" to="/dang-ki">
                      Đăng kí
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <NavLink
                      className="dropdown-item  px-3"
                      to="/admin/thong-ke"
                    >
                      Cửa hàng của tôi
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Modal open={openCart} onClose={handleCloseCart}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95vw", // Chiếm 90% chiều rộng màn hình
            maxWidth: 800, // Tối đa 500px
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflowX: "auto", // Nếu bảng rộng hơn thì có thể cuộn ngang
          }}
        >
          <h4>Giỏ hàng của bạn</h4>
          {cartItems.length === 0 ? (
            <p>Chưa có sản phẩm nào trong giỏ.</p>
          ) : (
            <table
              className="table table-bordered align-middle"
              style={{ fontSize: 15 }}
            >
              <thead>
                <tr>
                  <th style={{ width: 40 }}>STT</th>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <img
                        src={
                          item.hinhAnhSp?.hinhAnh
                            ? `http://localhost:8080/uploads/${item.hinhAnhSp.hinhAnh}`
                            : "/placeholder-image.png"
                        }
                        alt={item.sanPham?.ten}
                        width={40}
                        height={40}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />
                    </td>
                    <td>{item.sanPham?.ten}</td>
                    <td>
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
                    <td>{Number(item.giaBan).toLocaleString("vi-VN")}₫</td>
                    <td>
                        {(item.quantity * item.giaBan).toLocaleString("vi-VN")}₫
                    </td>
                    <td>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          const newCart = cartItems.filter(
                            (sp) => sp.id !== item.id
                          );
                          setCartItems(newCart);
                          localStorage.setItem("cart", JSON.stringify(newCart));
                        }}
                      >
                        Xoá
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Box className="d-flex justify-content-end mt-3">
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseCart}
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default WebsiteNavbar;
