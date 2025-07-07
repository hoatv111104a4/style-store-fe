import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { searchUserById } from '../../../services/Admin/CounterSales/NguoiDungSAdmService';
import { updateHDCTWithKH, searchHoaDonById } from '../../../services/Admin/CounterSales/HoaDonSAdmService';

const Client = ({
    hoaDonId,
    khachHangMap,
    showSearchInput,
    setShowSearchInput,
    searchSdt,
    setSearchSdt,
    handleSearchCustomer,
    handleUpdateHoaDonWithKhachHang
}) => {
    const [hinhThucNhanHang, setHinhThucNhanHang] = useState(0);
    const [daXacNhan, setDaXacNhan] = useState(false);
    const [loading, setLoading] = useState(false);
    const [khachHang, setKhachHang] = useState(null);

    // Lấy thông tin hóa đơn và khách hàng khi đã xác nhận
    useEffect(() => {
        const fetchKhachHangFromHoaDon = async () => {
            if (daXacNhan && hoaDonId) {
                try {
                    const hoaDon = await searchHoaDonById(hoaDonId);
                    const idKhachHang = hoaDon?.khachHangId || hoaDon?.khachHang?.id;
                    if (idKhachHang) {
                        const user = await searchUserById(idKhachHang);
                        setKhachHang(user);
                    } else {
                        setKhachHang(null);
                    }
                } catch {
                    setKhachHang(null);
                }
            } else {
                setKhachHang(khachHangMap?.[hoaDonId] || null);
            }
        };
        fetchKhachHangFromHoaDon();
        // eslint-disable-next-line
    }, [hoaDonId, daXacNhan, khachHangMap]);

    // Hàm xác nhận khách hàng
    const handleXacNhan = async () => {
        setLoading(true);
        try {
            await updateHDCTWithKH(hoaDonId, khachHangMap?.[hoaDonId]?.id, hinhThucNhanHang);
            setDaXacNhan(true);
            alert('Cập nhật khách hàng cho hóa đơn thành công!');
        } catch (err) {
            alert('Cập nhật khách hàng thất bại: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Hàm reload lại khách hàng cho hóa đơn này
    const handleReload = () => {
        setDaXacNhan(false);
        setShowSearchInput(false);
        setSearchSdt('');
        setKhachHang(null);
    };

    return (
        <div>
            <h6 className="fw-bold">Thông tin khách hàng</h6>
            <div className="border p-3 mb-3">
                {/* Nút tìm kiếm */}
                {!khachHang && !showSearchInput && (
                    <button
                        className="btn btn-sm btn-outline-primary mb-2"
                        type="button"
                        onClick={() => setShowSearchInput(true)}
                    >
                        <FontAwesomeIcon icon={faSearch} className="me-1" />
                        Tìm kiếm khách hàng
                    </button>
                )}

                {/* Nhập số điện thoại */}
                {!khachHang && showSearchInput && (
                    <div className="mb-2 d-flex gap-2">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Nhập SĐT khách hàng"
                            value={searchSdt}
                            onChange={e => setSearchSdt(e.target.value)}
                            style={{ maxWidth: 180 }}
                        />
                        <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={() => handleSearchCustomer(hoaDonId)}
                        >
                            <FontAwesomeIcon icon={faSearch} className="me-1" />
                            Tìm kiếm
                        </button>
                    </div>
                )}

                {/* Hiển thị khách hàng nếu có */}
                {khachHang && (khachHang.hoTen || khachHang.sdt) && (
                    <div className="alert alert-info py-2 px-3 mb-2 d-flex align-items-center">
                        <div>
                            Khách hàng: <strong>{khachHang.hoTen || khachHang.sdt}</strong>
                            {khachHang.sdt && (
                                <span className="ms-2 badge bg-success">{khachHang.sdt}</span>
                            )}
                        </div>
                        {!daXacNhan && (
                            <button
                                className="btn btn-sm btn-success ms-3"
                                onClick={handleXacNhan}
                                disabled={loading}
                            >
                                {loading ? (
                                    <FontAwesomeIcon icon={faSyncAlt} spin className="me-1" />
                                ) : null}
                                Xác nhận khách hàng
                            </button>
                        )}
                        {daXacNhan && (
                            <button
                                className="btn btn-sm btn-outline-secondary ms-3"
                                title="Cập nhật lại khách hàng"
                                onClick={handleReload}
                            >
                                <FontAwesomeIcon icon={faSyncAlt} />
                            </button>
                        )}
                    </div>
                )}

                {/* Nếu không có khách hàng */}
                {!khachHang && !showSearchInput && (
                    <p>Khách hàng: <strong>Khách lẻ</strong></p>
                )}

                <div>
                    <label>Hình thức nhận hàng:</label><br />
                    <input
                        type="radio"
                        name={`nhanHang-${hoaDonId}`}
                        checked={hinhThucNhanHang === 0}
                        onChange={() => setHinhThucNhanHang(0)}
                        disabled={daXacNhan}
                    /> Tại quầy &nbsp;
                    <input
                        type="radio"
                        name={`nhanHang-${hoaDonId}`}
                        checked={hinhThucNhanHang === 1}
                        onChange={() => setHinhThucNhanHang(1)}
                        disabled={daXacNhan}
                    /> Giao hàng
                </div>
            </div>
        </div>
    );
};

export default Client;
