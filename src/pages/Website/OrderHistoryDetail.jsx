import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getChiTietDonHang } from "../../services/Website/OrderApi";
import { searchHoaDonById } from "../../services/Admin/CounterSales/HoaDonSAdmService";
import OrderTimeline from "../../components/OrderTimeline";

const OrderHistoryDetail = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [details, setDetails] = useState([]);
    const [tenSanPham, setTenSanPham] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trangThaiDonHang, setTrangThaiDonHang] = useState(location.state?.trangThaiDonHang || null);

    // Function to fetch order details
    const fetchData = async (searchName = "") => {
        if (!orderId) {
            setError("Không tìm thấy ID đơn hàng");
            setDetails([]);
            setTrangThaiDonHang(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await getChiTietDonHang(orderId, searchName);

            setDetails(res.result || []);
           
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", err);
            setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại.");
            setDetails([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataHD = async (orderId) => {
        if (!orderId) return;

        try {
            const re = await searchHoaDonById(orderId);
            console.log("API trả về trạng thái đơn hàng:", re);
            const apiTrangThai = re.trangThai;
            console.log("API trả về trạng thái đơn hàng (trangThai):", apiTrangThai);
            if (apiTrangThai !== undefined && apiTrangThai !== null) {
                const newStatus = Number(apiTrangThai);
                if (newStatus !== trangThaiDonHang) {
                    setTrangThaiDonHang(newStatus);
                }
            }
        } catch (err) {
            console.error("Lỗi khi tải thông tin hóa đơn:", err);
        }
    };

    // Effect to fetch data initially and when the orderId changes
    useEffect(() => {
        fetchData();
    }, [orderId]);

    useEffect(() => {
        fetchDataHD(orderId);
    }, [orderId]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData(tenSanPham);
    };

    const handleClear = () => {
        setTenSanPham("");
        fetchData("");
    };

    const handleBack = () => {
        navigate("/website/lich-su-dat-hang");
    };

    if (error) return <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>{error}</div>;

    return (
        <section className="mt-4">
            <h3 className="mb-3 text-center" style={{ color: "#ff6600" }}>
                Chi tiết đơn hàng 
            </h3>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ color: "#ff6600", borderColor: "#ff6600" }}
                >
                    Quay lại
                </Button>

                {/* <Button
                    variant="contained"
                    onClick={() => fetchData(tenSanPham)}
                    disabled={loading}
                    sx={{ backgroundColor: "#28a745", "&:hover": { backgroundColor: "#218838" } }}
                >
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </Button> */}
            </div>

            {trangThaiDonHang !== null && <OrderTimeline trangThaiDonHang={trangThaiDonHang} />}

            <form className="d-flex gap-2 mb-4" onSubmit={handleSearch}>
                <TextField
                    variant="outlined"
                    placeholder="Tìm tên sản phẩm"
                    size="small"
                    value={tenSanPham}
                    onChange={(e) => setTenSanPham(e.target.value)}
                    sx={{ minWidth: 250, background: "#fff", borderRadius: 2 }}
                />
                <IconButton type="submit" sx={{ backgroundColor: "#ff6600", color: "#fff", borderRadius: 2 }}>
                    <SearchIcon />
                </IconButton>
                <IconButton onClick={handleClear} sx={{ backgroundColor: "#888", color: "#fff", borderRadius: 2 }}>
                    <ClearIcon />
                </IconButton>
            </form>

            {loading ? (
                <div className="d-flex justify-content-center mt-4">
                    <div className="spinner-border" role="status" />
                </div>
            ) : (
                <div className="table-responsive" style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}>
                    <table className="table table-hover text-center">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Ảnh sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Màu sắc</th>
                                <th>Kích thước</th>
                                <th>Chất liệu</th>
                                <th>Thương hiệu</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.length > 0 ? (
                                details.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img
                                                src={item.hinhAnh ? `http://localhost:8080/uploads/${item.hinhAnh}` : "/placeholder-image.png"}
                                                className="card-img-top product-image"
                                                alt={item.tenSanPham}
                                                style={{ objectFit: "cover", height: "80px", width: "80px", borderRadius: "8px" }}
                                            />
                                        </td>
                                        <td>{item.tenSanPham}</td>
                                        <td>{item.tenMauSac}</td>
                                        <td>{item.tenKichThuoc}</td>
                                        <td>{item.tenChatLieu}</td>
                                        <td>{item.tenThuongHieu}</td>
                                        <td>{item.soLuong}</td>
                                        <td>{item.giaTien?.toLocaleString()}₫</td>
                                        <td>{(item.soLuong * item.giaTien)?.toLocaleString()}₫</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-muted py-4">
                                        Không có sản phẩm nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default OrderHistoryDetail;