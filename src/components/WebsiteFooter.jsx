import "../styles/Website/WebsiteFooterCss.css";

const WebsiteFooter = () => (
    <footer className="footer-custom text-white border-top shadow-sm mt-5" style={{ backgroundColor: "black" }}>
        <div className="container py-4">
            <div className="row text-center text-md-start">
                <div className="col-md-4 mb-4 mb-md-0">
                    <h5 className="footer-title">Về chúng tôi</h5>
                    <p className="mb-2">Style Store là nơi cung cấp các sản phẩm về balo  chất lượng, uy tín.</p>
                </div>
                <div className="col-md-4 mb-4 mb-md-0">
                    <h5 className="footer-title">Liên hệ</h5>
                    <ul className="list-unstyled mb-0">
                        <li><i className="bi bi-envelope-fill me-2"></i>Email: <a href="mailto:hoa573898@gmail.com" className="footer-link">hoa573898@gmail.com</a></li>
                        <li><i className="bi bi-telephone-fill me-2"></i>Hotline: <a href="tel:0967606518" className="footer-link">0967 606 518</a></li>
                        <li><i className="bi bi-geo-alt-fill me-2"></i>Địa chỉ: Cao đẳng FPT, Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</li>
                    </ul>
                </div>
                <div className="col-md-4">
                    <h5 className="footer-title">Kết nối</h5>
                    <ul className="list-unstyled d-flex justify-content-center justify-content-md-start gap-3 mb-0">
                        <li>
                            <a href="#" className="footer-link d-flex align-items-center">
                                <i className="bi bi-facebook me-1"></i> Facebook
                            </a>
                        </li>
                        <li>
                            <a href="#" className="footer-link d-flex align-items-center">
                                <i className="bi bi-instagram me-1"></i> Instagram
                            </a>
                        </li>
                        <li>
                            <a href="#" className="footer-link d-flex align-items-center">
                                <i className="bi bi-chat-dots-fill me-1"></i> Zalo
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="text-center mt-4" style={{ fontSize: 14, color: "#bbb" }}>
                &copy; {new Date().getFullYear()} Style Store. All rights reserved.
            </div>
        </div>
    </footer>
);

export default WebsiteFooter;