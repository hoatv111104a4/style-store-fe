import React, { useState } from "react";
import { getHoaDonByMa } from "../../services/Admin/CounterSales/HoaDonSAdmService";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchData = async (maDonHang) => {
        try {
            setLoading(true);
            const res = await getHoaDonByMa(maDonHang);

            if (res) {
                setOrders([res]); // bọc vào mảng để map()
            } else {
                toast.error("Không tìm thấy đơn hàng");
                setOrders([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
            toast.error("Có lỗi xảy ra khi tìm đơn hàng");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) {
            toast.warning("Vui lòng nhập mã đơn hàng");
            return;
        }
        await fetchData(search.trim());
    };

    const handleClearAll = () => {
        setSearch("");
        setOrders([]);
    };

    return (
        <section className="mt-4">
            <h3
                className="mb-3 text-center"
                style={{ color: "#ff6600" }}
            >
                Tra cứu đơn hàng
            </h3>

            {/* Form tìm kiếm */}
            <div className="d-flex justify-content-center mb-4 align-items-center">
                <form className="d-flex" onSubmit={handleSearch}>
                    <TextField
                        variant="outlined"
                        placeholder="Nhập mã đơn hàng"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            minWidth: 250,
                            background: "#fff",
                            borderRadius: 2,
                            marginRight: 2
                        }}
                    />
                </form>

                <IconButton
                    onClick={handleSearch}
                    sx={{
                        backgroundColor: "#ff6600",
                        color: "#fff",
                        borderRadius: 2,
                        marginRight: 1
                    }}
                >
                    <SearchIcon />
                </IconButton>
                <IconButton
                    onClick={handleClearAll}
                    sx={{
                        backgroundColor: "#888",
                        color: "#fff",
                        borderRadius: 2
                    }}
                >
                    <ClearIcon />
                </IconButton>
            </div>

            {/* Kết quả */}
            {loading ? (
                <div className="d-flex justify-content-center mt-4">
                    <div className="spinner-border" role="status" />
                </div>
            ) : (
                <div
                    className="table-responsive"
                    style={{ borderRadius: 8, boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}
                >
                    <table className="table table-hover text-center">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã đơn</th>
                                <th>Tên khách</th>
                                <th>Sản phẩm</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền hàng</th>
                                <th>Tiền ship</th>
                                <th>Trạng thái</th>
                                <th>Thanh toán</th>
                                <th>Tổng tiền</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <tr key={order.id}>
                                        <td>{index + 1}</td>
                                        <td>{order.ma}</td>
                                        <td>{order.nguoiDatHang}</td>
                                        <td>{order.tongSoLuongSp} sản phẩm</td>
                                        <td>{new Date(order.ngayDat).toLocaleDateString("vi-VN")}</td>
                                        <td style={{ color: "#d63384", fontWeight: 600 }}>
                                            {(order.tongTien ?? 0).toLocaleString()}₫
                                        </td>
                                        <td style={{ color: "#d63384", fontWeight: 600 }}>
                                            {(order.tienThue ?? 0).toLocaleString()}₫
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: 12,
                                                    fontSize: "0.85rem",
                                                    fontWeight: 500,
                                                    backgroundColor:
                                                        order.trangThai == "0" ? "#f8d7da" :
                                                        order.trangThai == "1" ? "#fff3cd" :
                                                        order.trangThai == "2" ? "#cfe2ff" :
                                                        order.trangThai == "3" ? "#d1e7dd" :
                                                        order.trangThai == "4" ? "#e2e3e5" :
                                                        order.trangThai == "5" ? "#d3d3d3" :
                                                        order.trangThai == "6" ? "#caa9a9ff" :
                                                        "#f8d7da",
                                                    color:
                                                        order.trangThai == "0" ? "#842029" :
                                                        order.trangThai == "1" ? "#664d03" :
                                                        order.trangThai == "2" ? "#084298" :
                                                        order.trangThai == "3" ? "#0f5132" :
                                                        order.trangThai == "4" ? "#383d41" :
                                                        order.trangThai == "5" ? "#343a40" :
                                                        order.trangThai == "6" ? "#40343eff" :
                                                        "#842029",
                                                }}
                                            >
                                                {order.trangThai == "0" ? "Chờ xác nhận" :
                                                 order.trangThai == "1" ? "Đang chờ lấy hàng" :
                                                 order.trangThai == "2" ? "Đang giao hàng" :
                                                 order.trangThai == "3" ? "Đã hoàn thành" :
                                                 order.trangThai == "4" ? "Đã hủy" :
                                                 order.trangThai == "5" ? "Đã hoàn trả" :
                                                 order.trangThai == "6" ? "Hoá đơn chờ tại quầy" :
                                                 "Không xác định"}
                                            </span>
                                        </td>
                                        <td>
                                            {order.trangThaiThanhToan == "1" ? "Đã thanh toán" : "Chưa thanh toán"}
                                        </td>
                                        <td style={{ color: "#d10404ff", fontWeight: 600 }}>
                                            {((order.tongTien ?? 0) + (order.tienThue ?? 0)).toLocaleString()}₫
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                                onClick={() =>
                                                    navigate(`/website/lich-su-dat-hang/chi-tiet-don-hang/${order.id}`, {
                                                        state: { trangThaiDonHang: order.trangThai },
                                                    })
                                                }
                                            >
                                                <i className="bi bi-eye-fill me-1"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="text-muted py-4">
                                        {search ? "Không tìm thấy đơn hàng" : "Vui lòng nhập mã đơn hàng để tra cứu"}
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

export default OrderHistory;