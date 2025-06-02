import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/AdminAsideCss.css";

const productSubLinks = [
  { to: "/admin/quan-ly-sp/san-pham", icon: "bi-box-seam", label: "Sản phẩm" },
  { to: "/admin/quan-ly-sp/mau-sac", icon: "bi-palette", label: "Màu sắc" },
  { to: "/admin/quan-ly-sp/thuong-hieu", icon: "bi-award", label: "Thương hiệu" },
  { to: "/admin/quan-ly-sp/kich-thuoc", icon: "bi-arrows-angle-expand", label: "Kích thước" },
  { to: "/admin/quan-ly-sp/xuat-xu", icon: "bi-globe", label: "Xuất xứ" },
  { to: "/admin/quan-ly-sp/chat-lieu", icon: "bi-layers", label: "Chất liệu" },
];

const accountSubLinks = [
  { to: "/admin/tai-khoan/khach-hang", icon: "bi-person", label: "Khách hàng", className: "customer-attribute" },
  { to: "/admin/tai-khoan/nhan-vien", icon: "bi-person-badge", label: "Nhân viên", className: "staff-attribute" },
];

const AdminAside = () => {
  const [openProduct, setOpenProduct] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const location = useLocation();

  // Xác định có đang ở route thuộc quản lý sản phẩm không
  const isProductRoute = productSubLinks.some(link => location.pathname.startsWith(link.to));
  // Xác định có đang ở route thuộc tài khoản không
  const isAccountRoute = accountSubLinks.some(link => location.pathname.startsWith(link.to));

  // Tự động mở submenu khi ở route sản phẩm hoặc tài khoản
  useEffect(() => {
    setOpenProduct(isProductRoute);
  }, [isProductRoute]);
  useEffect(() => {
    setOpenAccount(isAccountRoute);
  }, [isAccountRoute]);

  return (
    <div className="bg-white border border-light shadow-sm p-4" style={{ position: "sticky", top: "0", minHeight: "100vh", zIndex: 1000 }}>
      <h3 className="mb-4 text-dark mb-5">Style store</h3>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <NavLink
            className={`admin-nav-link${!isProductRoute && !isAccountRoute && location.pathname === "/admin/thong-ke" ? " active" : ""}`}
            onClick={() => { setOpenProduct(false); setOpenAccount(false); }}
            to="/admin/thong-ke">
            <i className="bi bi-bar-chart-fill me-2"></i>Thống kê            
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            className={`admin-nav-link${!isProductRoute && !isAccountRoute && location.pathname === "/admin/ban-hang-tai-quay" ? " active" : ""}`}
            onClick={() => { setOpenProduct(false); setOpenAccount(false); }}
            to="/admin/ban-hang-tai-quay" >
            <i className="bi bi-shop me-2"></i> Bán hàng tại quầy            
          </NavLink>
        </li>        
        <li className="nav-item mb-2">
          <div
            className={`admin-nav-link d-flex justify-content-between align-items-center${isProductRoute ? " active" : ""}`}
            onClick={() => { setOpenProduct(!openProduct); setOpenAccount(false); }}
            style={{ cursor: "pointer" }} >
            <span>
              <i className="bi bi-box-seam me-2"></i>
              Quản lý sp
            </span>
            <i className={`bi ms-2 ${openProduct ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>
          {openProduct && (
            <ul className="submenu list-unstyled ms-4 mt-2 product-submenu-scroll">
              {productSubLinks.map(link => (
                <li key={link.to} className="nav-item mb-2">
                  <NavLink
                    className={`admin-sub-nav-link${location.pathname.startsWith(link.to) ? " active" : ""}`}
                    to={link.to} >
                    <i className={`bi ${link.icon} me-2`}></i>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className="nav-item mb-2">
          <NavLink
            className={`admin-nav-link${!isProductRoute && !isAccountRoute && location.pathname === "/admin/quan-ly-don-hang" ? " active" : ""}`}
            onClick={() => { setOpenProduct(false); setOpenAccount(false); }}
            to="/admin/quan-ly-don-hang">
            <i className="bi bi-clipboard-data me-2"></i> Quản lý đơn hàng            
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            className={`admin-nav-link${!isProductRoute && !isAccountRoute && location.pathname === "/admin/giam-gia" ? " active" : ""}`}
            onClick={() => { setOpenProduct(false); setOpenAccount(false); }}
            to="/admin/giam-gia">
            <i className="bi bi-percent me-2"></i> Giảm giá            
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <div
            className={`admin-nav-link d-flex justify-content-between align-items-center${isAccountRoute ? " active" : ""}`}
            onClick={() => { setOpenAccount(!openAccount); setOpenProduct(false); }}
            style={{ cursor: "pointer" }}>
            <span>
              <i className="bi bi-person-circle me-2"></i>Tài khoản              
            </span>
            <i className={`bi ms-2 ${openAccount ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </div>
          {openAccount && (
            <ul className="submenu list-unstyled ms-4 mt-2">
              {accountSubLinks.map(link => (
                <li key={link.to} className="nav-item mb-2">
                  <NavLink
                    className={`admin-sub-nav-link ${link.className}${location.pathname.startsWith(link.to) ? " active" : ""}`}
                    to={link.to}
                  >
                    <i className={`bi ${link.icon} me-2`}></i>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className="nav-item mb-2">
          <NavLink
            className={`admin-nav-link${!isProductRoute && !isAccountRoute && location.pathname === "/admin/quan-ly-tra-hang" ? " active" : ""}`}
            onClick={() => { setOpenProduct(false); setOpenAccount(false); }}
            to="/admin/quan-ly-tra-hang" >
            <i className="bi bi-arrow-counterclockwise me-2"></i> Quản lý trả hàng            
          </NavLink>
        </li>
        <li className="my-3">
          <hr />
        </li>
        <li className="nav-item mb-2">
          <NavLink
            className={`admin-nav-link${!isProductRoute && !isAccountRoute && location.pathname === "/" ? " active" : ""}`}
            onClick={() => { setOpenProduct(false); setOpenAccount(false); }}
            to="/">
            <i className="bi bi-house-door me-2"></i>Quay lại trang web            
          </NavLink>
        </li>
        <li className="nav-item mb-2 mt-auto">
          <NavLink className="admin-nav-link" to="/dang-xuat">
            <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất            
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminAside;