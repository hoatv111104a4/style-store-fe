import React, { forwardRef } from 'react';

const HoaDonPDFExport = forwardRef(({ hoaDon, sanPhams, tongTien }, ref) => {
    if (!hoaDon) return null;

    return (
        <div ref={ref} style={{ padding: 20, fontFamily: 'Arial' }}>
            <h3 style={{ textAlign: 'center' }}>HOÁ ĐƠN BÁN HÀNG</h3>

            <p><strong>Mã hoá đơn:</strong> {hoaDon.ma}</p>
            <p><strong>Ngày tạo:</strong> {new Date(hoaDon.ngayTao).toLocaleString()}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                <thead>
                    <tr>
                        <th style={{ padding: 5 }}>#</th>
                        <th style={{ padding: 5 }}>Mã SP</th>
                        <th style={{ padding: 5 }}>Tên SP</th>
                        <th style={{ padding: 5 }}>Số lượng</th>
                        <th style={{ padding: 5 }}>Đơn giá</th>
                        <th style={{ padding: 5 }}>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {sanPhams.map((sp, idx) => (
                        <tr key={sp.id}>
                            <td style={{ textAlign: 'center', padding: 5 }}>{idx + 1}</td>
                            <td style={{ padding: 5 }}>{sp.maSanPhamCtAdm}</td>
                            <td style={{ padding: 5 }}>{sp.tenSanPham}</td>
                            <td style={{ textAlign: 'center', padding: 5 }}>{sp.soLuong}</td>
                            <td style={{ textAlign: 'right', padding: 5 }}>{(sp.giaTien || 0).toLocaleString()}₫</td>
                            <td style={{ textAlign: 'right', padding: 5 }}>{(sp.thanhTien || 0).toLocaleString()}₫</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <strong>Tổng tiền: {tongTien.toLocaleString()}₫</strong>
            </div>
        </div>
    );
});

export default HoaDonPDFExport;
