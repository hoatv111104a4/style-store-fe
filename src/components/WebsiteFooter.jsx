
const WebsiteFooter = () => (
    <footer className="bg-white border-top shadow-sm mt-5">
        <div className="container py-4">
            <div className="row text-dark">
                <div className="col-md-4 mb-3 mb-md-0">
                    <h5>Về chúng tôi</h5>
                    <p>Style Store là nơi cung cấp các sản phẩm thời trang chất lượng, uy tín.</p>
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                    <h5>Liên hệ</h5>
                    <ul className="list-unstyled">
                        <li>Email: info@stylestore.com</li>
                        <li>Hotline: 0123 456 789</li>
                        <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
                    </ul>
                </div>
                <div className="col-md-4">
                    <h5>Kết nối</h5>
                    <ul className="list-unstyled">
                        <li><a href="#" className="text-dark text-decoration-none">Facebook</a></li>
                        <li><a href="#" className="text-dark text-decoration-none">Instagram</a></li>
                        <li><a href="#" className="text-dark text-decoration-none">Zalo</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
);

export default WebsiteFooter;