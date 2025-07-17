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
import { getHoaDonByNgayBatDauVaKetThuc, getHoaDonByNgayBatDauVaKetThucT } from '../../services/Admin/CounterSales/HoaDonSAdmService';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardDoanhSo = ({ hoaDons }) => {
    const [doanhSoHomNay, setDoanhSoHomNay] = useState(0);
    const [doanhSoTuanNay, setDoanhSoTuanNay] = useState(0);
    const [doanhSoThangNay, setDoanhSoThangNay] = useState(0);
    const [tongDonTheoTrangThai, setTongDonTheoTrangThai] = useState({});

    useEffect(() => {
        const today = dayjs();
        const startOfWeek = today.startOf('week');
        const startOfMonth = today.startOf('month');
        const endOfMonth = today.endOf('month');

        let doanhSoNgay = 0, doanhSoTuan = 0, doanhSoThang = 0;

        hoaDons.forEach((hd) => {
            const ngayNhan = dayjs(hd.ngayNhan);
            const tien = hd.tongTien || 0;

            if (ngayNhan.isSame(today, 'day')) doanhSoNgay += tien;
            if (ngayNhan.isSame(today, 'week')) doanhSoTuan += tien;
            if (ngayNhan.isAfter(startOfMonth.subtract(1, 'day')) && ngayNhan.isBefore(endOfMonth.add(1, 'day'))) {
                doanhSoThang += tien;
            }
        });

        setDoanhSoHomNay(doanhSoNgay);
        setDoanhSoTuanNay(doanhSoTuan);
        setDoanhSoThangNay(doanhSoThang);

        // 📌 Dùng API riêng cho biểu đồ doughnut
        const fetchTrangThaiData = async () => {
            try {
                const start = startOfMonth.format('YYYY-MM-DD');
                const end = endOfMonth.format('YYYY-MM-DD');
                const result = await getHoaDonByNgayBatDauVaKetThucT(`${start}T00:00:00`, `${end}T23:59:59`);
                const countMap = {};

                result.forEach(hd => {
                    const key = getTrangThaiLabel(hd.trangThai);
                    countMap[key] = (countMap[key] || 0) + 1;
                });

                setTongDonTheoTrangThai(countMap);
            } catch (err) {
                console.error('Lỗi khi thống kê theo trạng thái:', err);
            }
        };

        fetchTrangThaiData();
    }, [hoaDons]);
    



    const getTrangThaiLabel = (code) => {
        switch (code) {
            case 0: return 'Chờ xác nhận';
            case 1: return 'Đã thanh toán';
            case 2: return 'Đang vận chuyển';
            case 3: return 'Chờ vận chuyển';
            case 4: return 'Đã huỷ';
            case 5: return 'Hoàn tiền / Trả hàng';
            case 6: return 'Hoá đơn chờ tại quầy';
            default: return 'Không xác định';
        }
    };

    const barData = {
        labels: hoaDons.map(hd => dayjs(hd.ngayNhan).format('DD/MM')),
        datasets: [{
            label: 'Doanh số',
            data: hoaDons.map(hd => hd.tongTien || 0),
            backgroundColor: '#3b82f6'
        }]
    };

    const doughnutData = {
        labels: Object.keys(tongDonTheoTrangThai),
        datasets: [{
            data: Object.values(tongDonTheoTrangThai),
            backgroundColor: [
                '#ffca28',
                '#43a047',
                '#1976d2',
                '#a3e635',
                '#e53935',
                '#607D8B', 
                '#795548'  
            ],
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
                    <h5>Thống kê doanh số</h5>
                    <Bar data={barData} />
                </div>
                <div className="col-md-4">
                    <h5>Danh mục</h5>
                    <Doughnut data={doughnutData} />
                    <p className="text-center mt-2">{hoaDons.length} đơn hàng</p>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [hoaDons, setHoaDons] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchHoaDons = async () => {
        if (!startDate || !endDate) {
            return;
        }

        try {
            const result = await getHoaDonByNgayBatDauVaKetThuc(
                `${startDate}T00:00:00`,
                `${endDate}T23:59:59`
            );
            setHoaDons(result);
        } catch (err) {
            console.error("Lỗi khi lấy hóa đơn:", err);
        }
    };

    useEffect(() => {
        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

        getHoaDonByNgayBatDauVaKetThuc(`${startOfMonth}T00:00:00`, `${endOfMonth}T23:59:59`)
            .then(setHoaDons)
            .catch(err => console.error("Lỗi khi lấy hóa đơn:", err));
    }, []);


    useEffect(() => {
        fetchHoaDons();
    }, [startDate, endDate]);

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
