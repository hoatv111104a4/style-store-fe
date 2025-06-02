import { NavLink } from "react-router-dom";
import "../styles/AdminAsideCss.css";

const AdminAside = () => {
  return (
    <div className="bg-white border border-light shadow-sm p-4" style={{ position: "sticky", top: "0", minHeight: "100vh", zIndex: 1000, }}>
      <h3 className="mb-4 text-dark mb-5">Style store</h3>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/thong-ke">
            <i className="bi bi-bar-chart-fill me-2"></i>
            Thống kê
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/ban-hang-tai-quay">
            <i className="bi bi-shop me-2"></i>
            Bán hàng tại quầy
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/san-pham">
            <i className="bi bi-box-seam me-2"></i>
            Sản phẩm
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/quan-ly-don-hang">
            <i className="bi bi-clipboard-data me-2"></i>
            Quản lý đơn hàng
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/giam-gia">
            <i className="bi bi-percent me-2"></i>
            Giảm giá
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/tai-khoan">
            <i className="bi bi-person-circle me-2"></i>
            Tài khoản
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/admin/quan-ly-tra-hang">
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            Quản lý trả hàng
          </NavLink>
        </li>
        <li className="my-3">
          <hr />
        </li>
        <li className="nav-item mb-2">
          <NavLink className="admin-nav-link" to="/">
            <i className="bi bi-house-door me-2"></i>
            Quay lại trang web
          </NavLink>
        </li>
        <li className="nav-item mb-2 mt-auto">
          <NavLink className="admin-nav-link" to="/dang-xuat">
            <i className="bi bi-box-arrow-right me-2"></i>
            Đăng xuất
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminAside;