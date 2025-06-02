import "../styles/MainCss.css"; 
const WebSiteSidebar = () => {
    return (
        <div className="row">            
            <div className="col-12 col-md-4 col-lg-3 mb-3 mb-md-0">
                <div className="bg-white border shadow-sm p-4" style={{ minHeight: "100vh", width: "240px" }}>
                    <h3>Chọn mức giá</h3>
                    <ul className="nav flex-column mb-4">
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="price1" />
                                <label className="form-check-label text-dark" htmlFor="price1">
                                    Dưới 500.000đ
                                </label>
                            </div>
                        </li>
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="price2" />
                                <label className="form-check-label text-dark" htmlFor="price2">
                                    500.000đ - 1.000.000đ
                                </label>
                            </div>
                        </li>
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="price3" />
                                <label className="form-check-label text-dark" htmlFor="price3">
                                    Trên 1.000.000đ
                                </label>
                            </div>
                        </li>
                    </ul>

                    <h3>Thương hiệu</h3>
                    <ul className="nav flex-column mb-4">
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="brand1" />
                                <label className="form-check-label text-dark" htmlFor="brand1">
                                    Nike
                                </label>
                            </div>
                        </li>
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="brand2" />
                                <label className="form-check-label text-dark" htmlFor="brand2">
                                    Adidas
                                </label>
                            </div>
                        </li>
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="brand3" />
                                <label className="form-check-label text-dark" htmlFor="brand3">
                                    Puma
                                </label>
                            </div>
                        </li>
                    </ul>

                    <h3>Chất liệu</h3>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="material1" />
                                <label className="form-check-label text-dark" htmlFor="material1">
                                    Da
                                </label>
                            </div>
                        </li>
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="material2" />
                                <label className="form-check-label text-dark" htmlFor="material2">
                                    Vải
                                </label>
                            </div>
                        </li>
                        <li className="nav-item mb-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="material3" />
                                <label className="form-check-label text-dark" htmlFor="material3">
                                    Nhựa
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="col-12 col-md-8 col-lg-9">
                <h2>Đây là phần nội dung bên phải sidebar</h2>
                <p>Bạn có thể đặt bất kỳ nội dung nào ở đây, ví dụ như danh sách sản phẩm hoặc thông tin khác.</p>
            </div>
        </div>
    )
}

export default WebSiteSidebar;