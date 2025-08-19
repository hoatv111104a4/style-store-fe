import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { getHoaDonByNgayBatDauVaKetThuc, getHoaDonByNgayBatDauVaKetThucT, getAllHDC } from '../../services/Admin/CounterSales/HoaDonSAdmService';
import { thongKeTheoThang, thongKeTheoNam, thongKeTheoTuan } from '../../services/Admin/ThongKe/ThongKeService';
import { useNavigate } from "react-router-dom";

dayjs.extend(weekOfYear);
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const dashboardStyle = `
.table {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    border: none;
}
.table thead th {
    background: #f8f9fa;
    font-weight: 600;
    color: #222;
    border-bottom: 2px solid #f0f0f0;
    font-size: 15px;
}
.table tbody tr {
    border-bottom: 1px solid #f0f0f0;
}
.table tbody tr:last-child {
    border-bottom: none;
}
.table td, .table th {
    vertical-align: middle;
    border: none;
    font-size: 15px;
}
.table img {
    border-radius: 8px;
    border: 1px solid #eee;
}
.btn, .form-control {
    border-radius: 8px !important;
    font-weight: 500;
    font-size: 15px;
    transition: background 0.2s, color 0.2s;
}
.btn-primary {
    background: #ff6600 !important;
    border-color: #ff6600 !important;
    color: #fff !important;
}
.btn-primary:hover, .btn-primary:focus {
    background: #e65c00 !important;
    border-color: #e65c00 !important;
}
.btn-outline-primary {
    color: #ff6600 !important;
    border-color: #ff6600 !important;
    background: #fff !important;
}
.btn-outline-primary:hover, .btn-outline-primary:focus {
    background: #ff6600 !important;
    color: #fff !important;
}
.btn-secondary {
    background: #f0f0f0 !important;
    color: #333 !important;
    border: none !important;
}
.btn-secondary:hover, .btn-secondary:focus {
    background: #e0e0e0 !important;
}
.btn-info {
    background: #e6f0ff !important;
    color: #1976d2 !important;
    border: none !important;
}
.btn-info:hover, .btn-info:focus {
    background: #bbdefb !important;
    color: #1976d2 !important;
}
.btn-danger {
    background: #ffebee !important;
    color: #d32f2f !important;
    border: none !important;
}
.btn-danger:hover, .btn-danger:focus {
    background: #ffcdd2 !important;
    color: #d32f2f !important;
}
.form-control {
    border: 1px solid #e0e0e0 !important;
    background: #fafbfc !important;
    color: #222 !important;
    box-shadow: none !important;
}
.card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    background: #fff;
}
.table-bordered > :not(caption) > * > * {
    border-width: 0;
}
`;

const DashboardDoanhSo = ({ hoaDons = [] }) => {
    const [doanhSoHomNay, setDoanhSoHomNay] = useState(0);
    const [doanhSoTuanNay, setDoanhSoTuanNay] = useState(0);
    const [doanhSoThangNay, setDoanhSoThangNay] = useState(0);
    const [tongDonTheoTrangThai, setTongDonTheoTrangThai] = useState({});
    const [thongKeData, setThongKeData] = useState([]);
    const [thongKeType, setThongKeType] = useState('month');
    const [chartType, setChartType] = useState('doanhSo'); // Mặc định hiển thị doanh số
    const navigate = useNavigate();

    useEffect(() => {
        const today = dayjs();
        const startOfWeek = today.startOf('week');
        const startOfMonth = today.startOf('month');
        const endOfMonth = today.endOf('month');

        const stats = (hoaDons || []).reduce(
            (acc, hd) => {
                if (!hd.ngayNhan || hd.trangThai !== 3) return acc;
                const ngayNhan = dayjs(hd.ngayNhan);
                const tien = Number(hd.tongTien) || 0;

                if (ngayNhan.isSame(today, 'day')) acc.doanhSoNgay += tien;
                if (ngayNhan.isSame(today, 'week')) acc.doanhSoTuan += tien;
                if (ngayNhan.isAfter(startOfMonth.subtract(1, 'day')) && ngayNhan.isBefore(endOfMonth.add(1, 'day'))) {
                    acc.doanhSoThang += tien;
                }
                return acc;
            },
            { doanhSoNgay: 0, doanhSoTuan: 0, doanhSoThang: 0 }
        );

        setDoanhSoHomNay(stats.doanhSoNgay);
        setDoanhSoTuanNay(stats.doanhSoTuan);
        setDoanhSoThangNay(stats.doanhSoThang);

        // Thay fetchTrangThaiData bằng xử lý trực tiếp trên hoaDons:
        const countMap = {};
        (hoaDons || []).forEach(hd => {
            const key = getTrangThaiLabel(hd.trangThai);
            countMap[key] = (countMap[key] || 0) + 1;
        });
        setTongDonTheoTrangThai(countMap);
    }, [hoaDons]);

    useEffect(() => {
        const fetchThongKeData = async () => {
            try {
                const today = dayjs();
                const currentMonth = today.month() + 1;
                const currentYear = today.year();
                const currentWeek = today.week();

                let data = [];
                if (thongKeType === 'month') {
                    console.log(`Calling thongKeTheoThang with thang=${currentMonth}, nam=${currentYear}`);
                    const res = await thongKeTheoThang(currentMonth, currentYear);
                    data = res.data || res;
                    console.log('Response from thongKeTheoThang:', data);
                } else if (thongKeType === 'year') {
                    console.log(`Calling thongKeTheoNam with nam=${currentYear}`);
                    const res = await thongKeTheoNam(currentYear);
                    data = res.data || res;
                    console.log('Response from thongKeTheoNam:', data);
                } else if (thongKeType === 'week') {
                    console.log(`Calling thongKeTheoTuan with tuan=${currentWeek}, nam=${currentYear}`);
                    const res = await thongKeTheoTuan(currentWeek, currentYear);
                    data = res.data || res;
                    console.log('Response from thongKeTheoTuan:', data);
                }
                setThongKeData(data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error.response?.status, error.message);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    navigate("/access-denied");
                } else {
                    console.error("Lỗi khi tải dữ liệu:", error);
                    setThongKeData([]);
                }
            }
        };

        fetchThongKeData();
    }, [thongKeType]);

    const getTrangThaiLabel = (code) => {
        switch (code) {
            case 0: return 'Chờ xác nhận';
            case 1: return 'Chờ vận chuyển';
            case 2: return 'Đang vận chuyển';
            case 3: return 'Đã hoàn thành';
            case 4: return 'Đã huỷ';
            case 5: return 'Hoàn tiền / Trả hàng';
            case 6: return 'Hoá đơn chờ tại quầy';
            default: return 'Không xác định';
        }
    };

    const groupDoanhThuByDate = () => {
        const grouped = {};
        (hoaDons || []).forEach(hd => {
            if (hd.ngayNhan && hd.trangThai === 3) {
                const date = dayjs(hd.ngayNhan).format('DD/MM');
                grouped[date] = (grouped[date] || 0) + (Number(hd.tongTien) || 0);
            }
        });
        return grouped;
    };

    const groupSoLuongByDate = () => {
        const grouped = {};
        const today = dayjs().format("DD/MM");

        (hoaDons || []).forEach(hd => {
            if (hd.ngayNhan && hd.trangThai === 3) {
                const date = dayjs(hd.ngayNhan).format("DD/MM");
                grouped[date] = (grouped[date] || 0) + 1;
            }
        });

        return grouped;
    };


    const doanhThuTheoNgay = groupDoanhThuByDate();
    const soLuongTheoNgay = groupSoLuongByDate();

    // Biểu đồ tích lũy dựa trên loại (doanh số hoặc số lượng)
    const barData = {
        labels: Object.keys(chartType === 'doanhSo' ? doanhThuTheoNgay : soLuongTheoNgay).sort(),
        datasets: [{
            label: chartType === 'doanhSo' ? 'Doanh số (VND)' : 'Số lượng (đơn hàng)',
            data: Object.keys(chartType === 'doanhSo' ? doanhThuTheoNgay : soLuongTheoNgay)
                .sort()
                .map(date => chartType === 'doanhSo'
                    ? (doanhThuTheoNgay[date] || 0)
                    : (soLuongTheoNgay[date] || 0)
                ),
            backgroundColor: chartType === 'doanhSo' ? '#3b82f6' : '#ffca28',
            barPercentage: 0.5,
            categoryPercentage: 0.6
        }]
    };


    const TRANG_THAI = [
        { label: 'Chờ xác nhận', color: '#ff7043' },         // Cam đậm
        { label: 'Chờ vận chuyển', color: '#ffd54f' },       // Vàng tươi
        { label: 'Đang vận chuyển', color: '#42a5f5' },      // Xanh dương sáng
        { label: 'Đã hoàn thành', color: '#66bb6a' },        // Xanh lá cây
        { label: 'Đã huỷ', color: '#bdbdbd' },               // Xám nhạt
        { label: 'Hoàn tiền / Trả hàng', color: '#ab47bc' }, // Tím nhạt
        { label: 'Hoá đơn chờ tại quầy', color: '#29b6f6' }, // Xanh cyan
        { label: 'Không xác định', color: '#ef9a9a' },       // Hồng nhạt
    ];

    const doughnutData = {
        labels: TRANG_THAI.map(t => t.label),
        datasets: [{
            data: TRANG_THAI.map(t => (tongDonTheoTrangThai[t.label] > 0 ? tongDonTheoTrangThai[t.label] : 0.0001)),
            backgroundColor: TRANG_THAI.map(t => t.color),
            borderColor: '#fff',
            borderWidth: 1
        }]
    };

    return (
        <div>
            <h2>Tổng quan bán hàng</h2>

            <div className="row mb-4">
                <div className="col">
                    <div className="card p-3">
                        <h5>Doanh số hôm nay</h5>
                        <p>{doanhSoHomNay.toLocaleString()} VND</p>
                    </div>
                </div>
                <div className="col">
                    <div className="card p-3">
                        <h5>Doanh số tuần này</h5>
                        <p>{doanhSoTuanNay.toLocaleString()} VND</p>
                    </div>
                </div>
                <div className="col">
                    <div className="card p-3">
                        <h5>Doanh số tháng này</h5>
                        <p>{doanhSoThangNay.toLocaleString()} VND</p>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <h5>Thống kê</h5>
                    <div className="mb-3">
                        <button
                            className={`btn ${chartType === 'doanhSo' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                            onClick={() => setChartType('doanhSo')}
                        >
                            Doanh số
                        </button>
                        <button
                            className={`btn ${chartType === 'soLuong' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setChartType('soLuong')}
                        >
                            Số lượng
                        </button>
                    </div>
                    <Bar data={barData} />
                </div>
                <div className="col-md-4 d-flex flex-column align-items-center">
                    <h5>Danh mục</h5>
                    <div style={{ width: 420, height: 420 }}>
                        <Doughnut
                            data={doughnutData}
                            options={{
                                cutout: '75%', // Giảm độ rộng vòng tròn, giá trị càng lớn vòng càng mỏng
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top',
                                        labels: {
                                            boxWidth: 20,
                                            font: { size: 14 }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                    <p className="text-center mt-2">{(hoaDons || []).length} đơn hàng</p>
                </div>
            </div>

            <div className="mt-4">
                <h5>Thống kê sản phẩm bán chạy</h5>
                <div className="mb-3">
                    <button
                        className={`btn ${thongKeType === 'week' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                        onClick={() => setThongKeType('week')}
                    >
                        Theo tuần
                    </button>
                    <button
                        className={`btn ${thongKeType === 'month' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                        onClick={() => setThongKeType('month')}
                    >
                        Theo tháng
                    </button>
                    <button
                        className={`btn ${thongKeType === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setThongKeType('year')}
                    >
                        Theo năm
                    </button>
                </div>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Mã sản phẩm chi tiết</th>
                            <th>Tổng số lượng bán</th>
                            <th>Tổng tiền bán</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(thongKeData) && thongKeData.length > 0 ? (
                            thongKeData.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <img
                                            src={item.urlHinhAnhMauSac ? `http://localhost:8080/uploads/${item.urlHinhAnhMauSac}` : "/placeholder-image.png"}
                                            alt={item.tenSanPhamTK}
                                            style={{ objectFit: "cover", height: "80px", width: "80px", borderRadius: "8px" }}
                                        />
                                    </td>
                                    <td>{item.tenSanPhamTK || "?"}</td>
                                    <td>{item.maSanPhamCtTK || "?"}</td>
                                    <td>{item.tongSoLuongBanTK?.toLocaleString() || 0}</td>
                                    <td>{item.tongTienBanTK?.toLocaleString() || 0} VND</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [hoaDons, setHoaDons] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHoaDons = async () => {
        if (!startDate || !endDate) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Đổi hàm gọi API ở đây:
            const result = await getHoaDonByNgayBatDauVaKetThucT(
                `${startDate}T00:00:00`,
                `${endDate}T23:59:59`
            );
            setHoaDons(result || []);
        } catch (err) {
            console.error("Lỗi khi lấy hóa đơn:", err);
            setError("Không thể tải dữ liệu hóa đơn.");
            setHoaDons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
        setStartDate(startOfMonth);
        setEndDate(endOfMonth);
    }, []);

    useEffect(() => {
        fetchHoaDons();
    }, [startDate, endDate]);

    // Thêm đoạn này vào đầu component AdminDashboard (trước return):
    // (Chỉ cần xuất hiện 1 lần trong file)
    if (typeof document !== "undefined" && !document.getElementById("dashboard-style")) {
        const style = document.createElement("style");
        style.id = "dashboard-style";
        style.innerHTML = dashboardStyle;
        document.head.appendChild(style);
    }

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex gap-3 align-items-end mb-4">
                <div>
                    <label>Từ ngày:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label>Đến ngày:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <DashboardDoanhSo hoaDons={hoaDons} />
        </div>
    );
};

export default AdminDashboard;