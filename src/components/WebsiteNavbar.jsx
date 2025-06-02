import { NavLink } from "react-router-dom";
import "../styles/WebsiteNavbarCss.css";
import "../styles/MainCss.css";
const WebsiteNavbar = () => {
    return(
        <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top py-3">
            <div className="container">
                <NavLink className="navbar-brand" to="/">Style store</NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ps-5">
                        <li className="nav-item mx-2">
                            <NavLink className="website-nav-link text-dark" aria-current="page" to="/">Trang chủ</NavLink>
                        </li>
                        <li className="nav-item mx-2">
                            <NavLink className="website-nav-link text-dark" to="/san-pham">Sản phẩm</NavLink>
                        </li>     
                        <li className="nav-item mx-2">
                            <NavLink className="website-nav-link text-dark" to="/gioi-thieu">Giới thiệu</NavLink>
                        </li>                        
                        <li className="nav-item mx-2">
                            <NavLink className="website-nav-link text-dark" to="/lien-he">Liên hệ</NavLink>
                        </li>                         
                                               
                    </ul>
                    <form className="d-flex" role="search">
                        <div className="input-group">
                            <input type="text" className="form-control border-orange" placeholder="Nhập tên balo" aria-label="Tìm kiếm" aria-describedby="button-search"/>
                            <button className="btn btn-orange" type="button"  id="button-search" style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item mx-2">
                            <a className="nav-link cart-icon-wrapper" href="#">
                                <span className="cart-icon-border">
                                    <i className="bi bi-cart"></i>
                                </span>
                            </a>
                        </li>
                        <li className="nav-item dropdown mt-2">
                            <a className="nav-link dropdown-toggle text-dark" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Tài khoản</a>
                            <ul className="dropdown-menu">
                                <li>
                                    <NavLink className="dropdown-item  px-3" to="/dang-nhap">Đăng nhập</NavLink>
                                </li>
                                <li>
                                    <NavLink className="dropdown-item px-3" to="/dang-ki">Đăng kí</NavLink>
                                </li>
                                <li><hr className="dropdown-divider"/></li>
                                <li>
                                    <NavLink className="dropdown-item  px-3" to="/admin/thong-ke">Cửa hàng của tôi</NavLink>
                                </li>
                            </ul>
                        </li> 
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default WebsiteNavbar;