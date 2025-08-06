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
            <h6 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a202c', marginBottom: '1rem' }}>
                Thông tin khách hàng
            </h6>
            <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                marginBottom: '1rem',
            }}>
                {showSearchInput && !khachHang && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nhập SĐT khách hàng..."
                    value={searchSdt}
                    onChange={(e) => setSearchSdt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocalSearch()}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                    />
                    <button
                    className="btn btn-sm btn-primary"
                    type="button"
                    onClick={handleLocalSearch}
                    disabled={loading}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: 'orange',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2b6cb0')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'orange')}
                    >
                    <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                )}

                {khachHang && (
                <div style={{
                    backgroundColor: '#ebf8ff',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    border: '1px solid #bee3f8',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h6 style={{ fontSize: '1rem', fontWeight: '600', color: '#2b6cb0', margin: 0 }}>
                        {khachHang.hoTen}
                    </h6>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        title="Chọn lại khách hàng"
                        onClick={handleReload}
                        style={{
                        padding: '4px 8px',
                        border: '1px solid #e53e3e',
                        borderRadius: '6px',
                        color: '#e53e3e',
                        backgroundColor: 'transparent',
                        fontSize: '0.75rem',
                        transition: 'background-color 0.2s, color 0.2s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#e53e3e', e.target.style.color = '#ffffff')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#e53e3e')}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </button>
                    </div>
                    <p style={{ marginBottom: '4px', fontSize: '0.875rem', color: '#4a5568' }}>
                    <strong>SĐT:</strong> {khachHang.sdt || khachHang.soDienThoai}
                    </p>
                    <p style={{ marginBottom: '0', fontSize: '0.875rem', color: '#4a5568' }}>
                    <strong>Địa chỉ:</strong> {[
                        khachHang.diaChiNguoiDung,
                        khachHang.xaNguoiDung,
                        khachHang.huyenNguoiDung,
                        khachHang.tinhNguoiDung
                    ].filter(Boolean).join(', ')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateHoaDonWithKhachHang(hoaDonId, khachHang)}
                        style={{
                        padding: '8px 12px',
                        backgroundColor: '#38a169',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#2f855a')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#38a169')}
                    >
                        Xác nhận khách hàng
                    </button>
                    </div>
                </div>
                )}

                {!khachHang && !showSearchInput && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                    className="btn btn-sm btn-outline-primary"
                    type="button"
                    onClick={() => setShowSearchInput(true)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid orange',
                        borderRadius: '6px',
                        color: 'orange',
                        backgroundColor: 'transparent',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = 'orange', e.target.style.color = '#ffffff')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.color = 'orange')}
                    >
                    <FontAwesomeIcon icon={faSearch} style={{ marginRight: '4px' }} /> Tìm kiếm
                    </button>
                </div>
                )}

                {!khachHang && !showSearchInput && (
                <p style={{ fontSize: '0.875rem', color: '#4a5568' }}>
                    Khách hàng: <strong style={{ color: '#1a202c' }}>Khách lẻ</strong>
                </p>
                )}
            </div>

            {showAddModal && (
                <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                >
                <div
                    className="modal-dialog modal-lg modal-dialog-scrollable"
                    style={{ maxWidth: '700px', width: '90%' }}
                >
                    <div
                    className="modal-content"
                    style={{
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        backgroundColor: '#ffffff',
                    }}
                    >
                    <div
                        className="modal-header"
                        style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        }}
                    >
                        <h5 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                        Thêm khách hàng mới
                        </h5>
                        <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowAddModal(false)}
                        style={{
                            fontSize: '1rem',
                            color: '#4a5568',
                            cursor: 'pointer',
                        }}
                        >
                        ×
                        </button>
                    </div>
                    <div className="modal-body" style={{ padding: '24px' }}>
                        <div className="row">
                        <div className="col-md-6 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Họ và tên
                            </label>
                            <input
                            type="text"
                            name="hoTen"
                            className="form-control"
                            value={newCustomer.hoTen}
                            onChange={handleInputChange}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Số điện thoại
                            </label>
                            <input
                            type="text"
                            name="soDienThoai"
                            className="form-control"
                            value={newCustomer.soDienThoai}
                            onChange={handleInputChange}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Email
                            </label>
                            <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={newCustomer.email}
                            onChange={handleInputChange}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Năm sinh
                            </label>
                            <input
                            type="number"
                            name="namSinh"
                            className="form-control"
                            value={newCustomer.namSinh}
                            onChange={handleInputChange}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Giới tính
                            </label>
                            <select
                            name="gioiTinh"
                            className="form-select"
                            value={newCustomer.gioiTinh}
                            onChange={handleInputChange}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            >
                            <option value="1">Nam</option>
                            <option value="0">Nữ</option>
                            </select>
                        </div>
                        <div className="col-md-12 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Địa chỉ (Số nhà, tên đường)
                            </label>
                            <input
                            type="text"
                            name="diaChi"
                            className="form-control"
                            value={newCustomer.diaChi}
                            onChange={handleInputChange}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            />
                        </div>
                        <div className="col-md-4 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Tỉnh/Thành phố
                            </label>
                            <select
                            className="form-select"
                            value={selectedProvince}
                            onChange={e => setSelectedProvince(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            >
                            <option value="">Chọn tỉnh</option>
                            {provinces.map(p => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                            </select>
                        </div>
                        <div className="col-md-4 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Quận/Huyện
                            </label>
                            <select
                            className="form-select"
                            value={selectedDistrict}
                            onChange={e => setSelectedDistrict(e.target.value)}
                            disabled={!selectedProvince}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                opacity: !selectedProvince ? 0.5 : 1,
                            }}
                            onFocus={(e) => !selectedProvince || (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            >
                            <option value="">Chọn quận/huyện</option>
                            {districts.map(d => (
                                <option key={d.code} value={d.code}>{d.name}</option>
                            ))}
                            </select>
                        </div>
                        <div className="col-md-4 mb-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                            Phường/Xã
                            </label>
                            <select
                            className="form-select"
                            value={selectedWard}
                            onChange={e => setSelectedWard(e.target.value)}
                            disabled={!selectedDistrict}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                opacity: !selectedDistrict ? 0.5 : 1,
                            }}
                            onFocus={(e) => !selectedDistrict || (e.target.style.borderColor = 'orange', e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)')}
                            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0', e.target.style.boxShadow = 'none')}
                            >
                            <option value="">Chọn phường/xã</option>
                            {wards.map(w => (
                                <option key={w.code} value={w.code}>{w.name}</option>
                            ))}
                            </select>
                        </div>
                        </div>
                    </div>
                    <div
                        className="modal-footer"
                        style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        }}
                    >
                        <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddModal(false)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#a0aec0',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#718096')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#a0aec0')}
                        >
                        Hủy
                        </button>
                        <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddNewCustomer}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'orange',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            opacity: loading ? 0.5 : 1,
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2b6cb0')}
                        onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'orange')}
                        >
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
