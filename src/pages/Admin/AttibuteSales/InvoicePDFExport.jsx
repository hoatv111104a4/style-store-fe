import React, { forwardRef, useState, useEffect } from 'react';
import { searchHoaDonById } from '../../../services/Admin/CounterSales/HoaDonSAdmService'; // Giả sử bạn có một service để lấy hoá đơn

const HoaDonPDFExport = React.forwardRef(({ hoaDon, sanPhams, tongTien, tienThue, soDienThoai }, ref) => {

    if (!hoaDon) return null;

    return (
        <div
            ref={ref}
            style={{
                padding: 20,
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#fff',
                color: '#000',
                width: '210mm', // cố định khổ giấy A4 ngang khoảng 210mm
                boxSizing: 'border-box',
            }}
        >
            <h3 style={{ textAlign: 'center', marginBottom: 20 }}>HOÁ ĐƠN BÁN HÀNG</h3>

            <p><strong>Người tạo:</strong> {hoaDon.tenNguoiTao || 'Không xác định'}</p>
            <p><strong>Mã hoá đơn:</strong> {hoaDon.ma}</p>
            <p><strong>Ngày tạo:</strong> {new Date(hoaDon.ngayTao).toLocaleString()}</p>
            <p><strong>Khách hàng:</strong> {hoaDon.nguoiNhanHang || 'Không xác định'}</p>
            <p><strong>Địa chỉ:</strong> {hoaDon.diaChiNhanHang || 'Không xác định'}</p>
            <p><strong>Số điện thoại:</strong> {soDienThoai || 'Không xác định'}</p>

            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: 20,
                    color: '#000',
                    fontSize: 14,
                }}
                border="1"
            >
                <thead style={{ backgroundColor: '#f0f0f0' }}>
                    <tr>
                        <th style={{ padding: 8 }}>#</th>
                        <th style={{ padding: 8 }}>Mã SP</th>
                        <th style={{ padding: 8 }}>Tên SP</th>
                        <th style={{ padding: 8 }}>Số lượng</th>
                        <th style={{ padding: 8 }}>Đơn giá</th>
                        <th style={{ padding: 8 }}>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {sanPhams.map((sp, idx) => (
                        <tr key={sp.id}>
                            <td style={{ textAlign: 'center', padding: 8 }}>{idx + 1}</td>
                            <td style={{ padding: 8 }}>{sp.maSanPhamCtAdm}</td>
                            <td style={{ padding: 8 }}>{sp.tenSanPham}</td>
                            <td style={{ textAlign: 'center', padding: 8 }}>{sp.soLuong}</td>
                            <td style={{ textAlign: 'right', padding: 8 }}>{(sp.giaTien || 0).toLocaleString()}₫</td>
                            <td style={{ textAlign: 'right', padding: 8 }}>{(sp.thanhTien || 0).toLocaleString()}₫</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: 20, fontSize: 16 }}>
                <strong>Tổng tiền hàng: {tongTien.toLocaleString()}₫</strong>
            </div>
            <div style={{ textAlign: 'right', marginTop: 8, fontSize: 16 }}>
                <strong>Tiền ship:</strong> {tienThue.toLocaleString() + '₫'}
            </div>
            <div style={{ textAlign: 'right', marginTop: 8, fontSize: 18 }}>
                <strong>Tổng thanh toán: {(tongTien + tienThue).toLocaleString()}₫</strong>
            </div>

            <div style={{ textAlign: 'center', marginTop: 40, fontSize: 14 }}>
                <p>Cảm ơn bạn đã mua hàng!</p>
                <p>Hẹn gặp lại!</p>
            </div>
        </div>
    );
});

export default HoaDonPDFExport;
