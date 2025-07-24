import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSyncAlt, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getKHBySdt, addNguoiDung, getDCNhan } from '../../../services/Admin/CounterSales/NguoiDungSAdmService';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';

const API_PROVINCE_URL = "https://provinces.open-api.vn/api/";

const Client = ({
    hoaDonId,
    khachHangMap,
    setKhachHangMap,
    handleUpdateHoaDonWithKhachHang,
}) => {
    const [loading, setLoading] = useState(false);
    const [khachHang, setKhachHang] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(true); // Default to show search
    const [searchSdt, setSearchSdt] = useState('');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState(() => () => { });
    const showConfirmDialog = (message, title, onConfirm) => {
        setConfirmMessage(message);
        setConfirmTitle(title);
        setOnConfirmAction(() => onConfirm);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        onConfirmAction();
        setConfirmOpen(false);
    };

    const [alertMessage, setAlertMessage] = useState('');
      const [alertOpen, setAlertOpen] = useState(false);
      const [alertSeverity, setAlertSeverity] = useState('success');
    
      const showAlert = (message) => {
        setAlertMessage(message);
        setAlertOpen(true);
      };
    
      const handleCloseAlert = () => {
        setAlertOpen(false);
        setAlertMessage('');
      };



    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    const initialCustomerState = {
        hoTen: '',
        soDienThoai: '',
        email: '',
        diaChi: '',
        tinh: '',
        huyen: '',
        xa: '',
        namSinh: '',
        gioiTinh: 1,
        idChucVu: 3,
    };
    const [newCustomer, setNewCustomer] = useState(initialCustomerState);

    useEffect(() => {
        fetch(`${API_PROVINCE_URL}?depth=1`).then(res => res.json()).then(setProvinces);
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`${API_PROVINCE_URL}p/${selectedProvince}?depth=2`).then(res => res.json()).then(data => {
                setDistricts(data.districts || []);
                setWards([]);
                setSelectedDistrict('');
                setSelectedWard('');
            });
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetch(`${API_PROVINCE_URL}d/${selectedDistrict}?depth=2`).then(res => res.json()).then(data => {
                setWards(data.wards || []);
                setSelectedWard('');
            });
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    useEffect(() => {
        const currentKhachHang = khachHangMap?.[hoaDonId] || null;
        setKhachHang(currentKhachHang);
        // If a customer is selected, hide the search input
        if (currentKhachHang) {
            setShowSearchInput(false);
        }
    }, [hoaDonId, khachHangMap]);

    const handleLocalSearch = async () => {
        if (!searchSdt) {
            alert('Vui lòng nhập số điện thoại.');
            return;
        }
        setLoading(true);
        try {
            const customerInfo = await getKHBySdt(searchSdt);
            if (customerInfo && customerInfo.id) {
                const addressInfo = await getDCNhan(customerInfo.id);

                // Mapping lại tên các thuộc tính địa chỉ
                const fullCustomerData = {
                    ...customerInfo,
                    diaChiNguoiDung: addressInfo?.diaChiChiTiet || '',
                    xaNguoiDung: addressInfo?.xa || '',
                    huyenNguoiDung: addressInfo?.huyen || '',
                    tinhNguoiDung: addressInfo?.tinh || ''
                };

                // Cập nhật state cho hóa đơn hiện tại
                if (setKhachHangMap) {
                    setKhachHangMap(prev => ({ ...prev, [hoaDonId]: fullCustomerData }));
                }
                setKhachHang(fullCustomerData);

                setShowSearchInput(false);
                setSearchSdt('');
            } else {
                throw new Error("Customer not found");
            }
        } catch (error) {
            const confirmAdd = window.confirm(`Không tìm thấy khách hàng với SĐT "${searchSdt}". Bạn có muốn thêm mới không?`);
            if (confirmAdd) {
                setNewCustomer({ ...initialCustomerState, soDienThoai: searchSdt });
                setShowAddModal(true);
                setShowSearchInput(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReload = () => {
        // Hiển thị lại ô nhập SĐT để tìm khách hàng mới
        setShowSearchInput(true);

        // Xoá giá trị số điện thoại đã nhập trước đó
        setSearchSdt('');

        // Xoá thông tin khách hàng hiện tại khỏi state (nếu có dùng map nhiều hóa đơn)
        if (typeof setKhachHangMap === 'function') {
            setKhachHangMap(prevMap => {
                const updatedMap = { ...prevMap };
                updatedMap[hoaDonId] = null;
                return updatedMap;
            });
        }

        // Xoá cả khách hàng đang hiển thị (nếu cần)
        if (typeof setKhachHang === 'function') {
            setKhachHang(null);
        }
    };


    const handleAddNewCustomer = async () => {
        if (!newCustomer.hoTen || !newCustomer.soDienThoai) {
            alert('Vui lòng nhập họ tên và số điện thoại');
            return;
        }

        setLoading(true);
        try {
            // Check if phone number exists before adding
            await getKHBySdt(newCustomer.soDienThoai);
            alert('Số điện thoại đã tồn tại trong hệ thống.');
            setLoading(false);
        } catch (searchError) {
            // Phone number does not exist, proceed to add
            try {
                const requestData = {
                    hoTen: newCustomer.hoTen,
                    soDienThoai: newCustomer.soDienThoai,
                    email: newCustomer.email || null,
                    diaChiNguoiDung: newCustomer.diaChi || '',
                    tinhNguoiDung: provinces.find(p => p.code == selectedProvince)?.name || '',
                    huyenNguoiDung: districts.find(d => d.code == selectedDistrict)?.name || '',
                    xaNguoiDung: wards.find(w => w.code == selectedWard)?.name || '',
                    namSinh: newCustomer.namSinh ? parseInt(newCustomer.namSinh) : null,
                    gioiTinh: parseInt(newCustomer.gioiTinh),
                    idChucVu: 3,
                    tenNguoiNhan: newCustomer.hoTen,
                    soDienThoaiNhan: newCustomer.soDienThoai,
                    diaChiNhan: newCustomer.diaChi || '',
                    tinhNhan: provinces.find(p => p.code == selectedProvince)?.name || '',
                    huyenNhan: districts.find(d => d.code == selectedDistrict)?.name || '',
                    xaNhan: wards.find(w => w.code == selectedWard)?.name || '',
                    matKhau: "123456",
                    trangThai: 1
                };

                const response = await addNguoiDung(requestData);
                alert('Thêm khách hàng thành công!');
                setShowAddModal(false); // Close modal on success
                setNewCustomer(initialCustomerState); // Reset form

                const newKh = { ...response, sdt: response.soDienThoai };
                setKhachHang(newKh);
                if (setKhachHangMap) {
                    setKhachHangMap(prev => ({ ...prev, [hoaDonId]: newKh }));
                }
            } catch (addError) {
                alert(addError.response?.data?.message || 'Lỗi khi thêm khách hàng');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <h6 className="fw-bold">Thông tin khách hàng</h6>
            <div className="border p-3 mb-3">
                {showSearchInput && !khachHang && (
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Nhập SĐT khách hàng..."
                            value={searchSdt}
                            onChange={(e) => setSearchSdt(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLocalSearch()}
                        />
                        <button className="btn btn-sm btn-primary" type="button" onClick={handleLocalSearch} disabled={loading}>
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                )}

                {khachHang && (
                    <div className="alert alert-info py-2 px-3 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                            <h6 className="fw-bold mb-1">{khachHang.hoTen}</h6>
                            <button className="btn btn-sm btn-outline-danger" title="Chọn lại khách hàng" onClick={handleReload}>
                                <FontAwesomeIcon icon={faSyncAlt} />
                            </button>
                        </div>
                        <p className="mb-1 small">
                            <strong>SĐT:</strong> {khachHang.sdt || khachHang.soDienThoai}
                        </p>
                        <p className="mb-0 small">
                            <strong>Địa chỉ:</strong> {[
                                khachHang.diaChiNguoiDung,
                                khachHang.xaNguoiDung,
                                khachHang.huyenNguoiDung,
                                khachHang.tinhNguoiDung
                            ].filter(Boolean).join(', ')}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleUpdateHoaDonWithKhachHang(hoaDonId, khachHang)}
                            >
                                Xác nhận khách hàng
                            </button>
                        </div>
                    </div>
                )}

                {!khachHang && !showSearchInput && (
                    <div className="d-flex gap-2 mb-2">
                        <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setShowSearchInput(true)}>
                            <FontAwesomeIcon icon={faSearch} className="me-1" /> Tìm kiếm
                        </button>
                    </div>
                )}

                {!khachHang && !showSearchInput && (
                    <p>Khách hàng: <strong>Khách lẻ</strong></p>
                )}
            </div>

            {showAddModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm khách hàng mới</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Họ và tên</label>
                                        <input type="text" name="hoTen" className="form-control" value={newCustomer.hoTen} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Số điện thoại</label>
                                        <input type="text" name="soDienThoai" className="form-control" value={newCustomer.soDienThoai} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Email</label>
                                        <input type="email" name="email" className="form-control" value={newCustomer.email} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Năm sinh</label>
                                        <input type="number" name="namSinh" className="form-control" value={newCustomer.namSinh} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">Giới tính</label>
                                        <select name="gioiTinh" className="form-select" value={newCustomer.gioiTinh} onChange={handleInputChange}>
                                            <option value="1">Nam</option>
                                            <option value="0">Nữ</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <label className="form-label">Địa chỉ (Số nhà, tên đường)</label>
                                        <input type="text" name="diaChi" className="form-control" value={newCustomer.diaChi} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Tỉnh/Thành phố</label>
                                        <select className="form-select" value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
                                            <option value="">Chọn tỉnh</option>
                                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Quận/Huyện</label>
                                        <select className="form-select" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} disabled={!selectedProvince}>
                                            <option value="">Chọn quận/huyện</option>
                                            {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label">Phường/Xã</label>
                                        <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)} disabled={!selectedDistrict}>
                                            <option value="">Chọn phường/xã</option>
                                            {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddNewCustomer} disabled={loading}>
                                    {loading ? 'Đang lưu...' : 'Lưu khách hàng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <CustomAlert
                alertOpen={alertOpen}
                alertMessage={alertMessage}
                alertSeverity={alertSeverity}
                onClose={handleCloseAlert}
            />
            <CustomConfirm
                open={confirmOpen}
                title={confirmTitle}
                message={confirmMessage}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default Client;
