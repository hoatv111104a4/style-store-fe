import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSyncAlt, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getKHBySdt, addNguoiDung, addDiaChiNhan, getDiaChiNhanByNguoiDungId,getKHByEmail} from '../../../services/Admin/CounterSales/NguoiDungSAdmService';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';

const API_PROVINCE_URL = "https://provinces.open-api.vn/api/";

const Client = ({
    hoaDonId,
    khachHangMap,
    setKhachHangMap,
    daXacNhan,
    handleXacNhanKhachHang,
    setXacNhanKhachHangMap
}) => {
    const [loading, setLoading] = useState(false);
    const [khachHang, setKhachHang] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(true); // Default to show search
    const [searchSdt, setSearchSdt] = useState('');
    const [hinhThucNhanHang, setHinhThucNhanHang] = useState(0);
    const [diaChiNhanId, setDiaChiNhanId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmLabel, setConfirmLabel] = useState('Xác nhận');
    const [confirmColor, setConfirmColor] = useState('error');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState(() => () => { });
    
    const [showDiaChiModal, setShowDiaChiModal] = useState(false);
    const [newDiaChi, setNewDiaChi] = useState({
        tenNguoiNhan: '',
        soDienThoai: '',
        diaChi: '',
        xa: '',
        huyen: '',
        tinh: ''
    });

    const showConfirmDialog = ({ title, message, onConfirm, label = 'Xác nhận', color = 'error' }) => {
        setConfirmTitle(title);
        setConfirmMessage(message);
        setConfirmLabel(label);
        setConfirmColor(color);
        setOnConfirmAction(() => () => {
            onConfirm();
            setConfirmOpen(false);
        });
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
        if (!searchSdt?.trim()) {
            showAlert('Vui lòng nhập số điện thoại.');
            setAlertSeverity('warning');
            setAlertOpen(true);
            return;
        }

        setLoading(true);

        try {
            const customerInfo = await getKHBySdt(searchSdt);
            console.log("🔍 Thông tin khách hàng:", customerInfo);

            if (!customerInfo || !customerInfo.id) {
                throw new Error('Không tìm thấy khách hàng.');
            }

            const addressList = await getDiaChiNhanByNguoiDungId(customerInfo.id);

            const fullCustomerData = {
                ...customerInfo,
                diaChiNguoiDung: customerInfo.diaChi || '',
                xaNguoiDung: customerInfo.xa || '',
                huyenNguoiDung: customerInfo.huyen || '',
                tinhNguoiDung: customerInfo.tinh || '',
                danhSachDiaChi: Array.isArray(addressList) && addressList.length > 0
                    ? addressList
                    : ['Không có địa chỉ nhận'], // hoặc [] nếu muốn
            };

            setKhachHang(fullCustomerData);
            if (setKhachHangMap) {
                setKhachHangMap(prev => ({ ...prev, [hoaDonId]: fullCustomerData }));
            }

            setShowSearchInput(false);
            setSearchSdt('');

        } catch (error) {
            console.warn('Lỗi khi tìm khách hàng:', error);
            showConfirmDialog({
                title: 'Thêm mới khách hàng',
                message: `Không tìm thấy khách hàng với SĐT "${searchSdt}". Bạn có muốn thêm mới không?`,
                label: 'Thêm mới',
                color: 'primary',
                onConfirm: () => {
                    setNewCustomer({ ...initialCustomerState, soDienThoai: searchSdt });
                    setShowAddModal(true);
                    setShowSearchInput(false);
                }
            });

        } finally {
            setLoading(false);
        }
    };



    const handleReload = () => {
        
        setShowSearchInput(true);
        setSearchSdt('');

        if (typeof setKhachHangMap === 'function') {
            setKhachHangMap(prevMap => {
                const updatedMap = { ...prevMap };
                updatedMap[hoaDonId] = null;
                return updatedMap;
            });
        }

        if (typeof setKhachHang === 'function') {
            setKhachHang(null);
        }

        if (typeof setXacNhanKhachHangMap === 'function') {
            setXacNhanKhachHangMap(prev => {
                const updated = { ...prev };
                updated[hoaDonId] = false;
                return updated;
            });
        }
        
        console.log(daXacNhan)
        
    };


    const handleChangeNewDiaChi = (e) => {
        const { name, value } = e.target;
        setNewDiaChi(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDiaChi = async () => {
        if (!khachHang?.id) { 
            showAlert('Không tìm thấy khách hàng');
            setAlertSeverity('error');
            setAlertOpen(true);
            return; 
         } 

        const diaChi = newDiaChi.diaChi || '';
        const soNha = diaChi || '';
        const tinh = provinces.find(p => p.code == selectedProvince)?.name || '';
        const huyen = districts.find(d => d.code == selectedDistrict)?.name || '';
        const xa = wards.find(w => w.code == selectedWard)?.name || '';

        const payload = {
            tenNguoiNhan: newDiaChi.tenNguoiNhan,
            soDienThoai: newDiaChi.soDienThoai,
            diaChi: diaChi,
            soNha: soNha,
            tinh: tinh,
            huyen: huyen,
            xa: xa,
            trangThai: 1,
            nguoiDungSAdm: { id: khachHang.id },
            ngayTao: new Date().toISOString()
        };

        try {
            const result = await addDiaChiNhan(payload);
            showAlert('Thêm địa chỉ thành công!');
            setAlertSeverity('success');
            setAlertOpen(true);
            setKhachHang(prev => ({
                ...prev,
                danhSachDiaChi: [...(prev.danhSachDiaChi || []), result]
            }));
            setNewDiaChi({
                tenNguoiNhan: '',
                soDienThoai: '',
                diaChi: ''
            });
            setSelectedProvince('');
            setSelectedDistrict('');
            setSelectedWard('');
            setShowDiaChiModal(false);
        } catch (error) {
            showAlert('Lỗi khi thêm địa chỉ!');
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };


    const handleAddNewCustomer = async () => {
        if (
            !newCustomer.hoTen || !newCustomer.email || !newCustomer.diaChi || !newCustomer.namSinh ||
            !newCustomer.soDienThoai || !newCustomer.gioiTinh ||
            selectedProvince === "" || selectedDistrict === "" || selectedWard === ""
        ) {
            showAlert('Vui lòng nhập đầy đủ thông tin');
            setAlertSeverity('warning');
            setAlertOpen(true);
            return;
        }

        setLoading(true);
        try {
            // Check if phone number exists before adding
            await getKHBySdt(newCustomer.soDienThoai);
            showAlert('Số điện thoại đã tồn tại trong hệ thống.');
            setAlertSeverity('warning');
            setAlertOpen(true);
            setLoading(false);
        } catch (searchError) {
            // Phone number does not exist, proceed to add
            const diaChi = newCustomer.diaChi?.trim() || '';
            const tinh = provinces.find(p => p.code == selectedProvince)?.name || '';
            const huyen = districts.find(d => d.code == selectedDistrict)?.name || '';
            const xa = wards.find(w => w.code == selectedWard)?.name || '';
            const diaChiDayDu = `${diaChi}, Xã ${xa}, Huyện ${huyen}, Tỉnh ${tinh}`;
            try {
                const requestData = {
                    hoTen: newCustomer.hoTen,
                    soDienThoai: newCustomer.soDienThoai,
                    email: newCustomer.email || null,
                    diaChiNguoiDung: newCustomer.diaChi || '',
                    tinhNguoiDung: provinces.find(p => p.code == selectedProvince)?.name || '',
                    huyenNguoiDung: districts.find(d => d.code == selectedDistrict)?.name || '',
                    xaNguoiDung: wards.find(w => w.code == selectedWard)?.name || '',
                    namSinh: newCustomer.namSinh,
                    gioiTinh: parseInt(newCustomer.gioiTinh),
                    idChucVu: 3,
                    tenNguoiNhan: newCustomer.hoTen,
                    soDienThoaiNhan: newCustomer.soDienThoai,
                    diaChiNhan: diaChiDayDu,
                    soNhaNhan: diaChiDayDu,
                    tinhNhan: tinh,
                    huyenNhan: huyen,
                    xaNhan: xa,
                    trangThai: 1
                };

                const response = await addNguoiDung(requestData);
                showAlert('Thêm khách hàng thành công!');
                setAlertSeverity('success');
                setAlertOpen(true);
                setShowAddModal(false); // Close modal on success
                setNewCustomer(initialCustomerState); // Reset form

                const customerInfo = await getKHBySdt(response.soDienThoai);

                const fullCustomerData = {
                    ...customerInfo,
                    diaChiNguoiDung: diaChiDayDu,
                    tinhNguoiDung: tinh,
                    huyenNguoiDung: huyen,
                    xaNguoiDung: xa,
                    danhSachDiaChi: [
                        {
                            tenNguoiNhan: newCustomer.hoTen,
                            soDienThoai: newCustomer.soDienThoai,
                            diaChi: diaChi,
                            xa: xa,
                            huyen: huyen,
                            tinh: tinh,
                            diaChiDayDu: diaChiDayDu
                        }
                    ]
                };

                setKhachHang(fullCustomerData);
                if (setKhachHangMap) {
                    setKhachHangMap(prev => ({ ...prev, [hoaDonId]: fullCustomerData }));
                }
            } catch (addError) {
                try {
                    const existedEmailUser = await getKHByEmail(newCustomer.email);
                    if (existedEmailUser) {
                        showAlert('Email đã tồn tại trong hệ thống. Vui lòng dùng email khác.');
                    } else {
                        showAlert(addError.response?.data?.message || 'Lỗi khi thêm khách hàng');
                    }
                } catch (emailCheckError) {
                    // Nếu không gọi được getKHByEmail thì fallback
                    showAlert(addError.response?.data?.message || 'Lỗi khi thêm khách hàng');
                }                    
                setAlertSeverity('error');
                setAlertOpen(true);
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
                            maxLength={10}
                            onChange={(e) => {
                                const input = e.target.value;
                                // Chỉ cho phép nhập số và tối đa 10 ký tự
                                if (/^\d{0,10}$/.test(input)) {
                                    setSearchSdt(input);
                                }
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    if (searchSdt.length === 10) {
                                        handleLocalSearch();
                                    } else {
                                        showAlert("Số điện thoại phải gồm đúng 10 chữ số");
                                        setAlertSeverity("warning");
                                        setAlertOpen(true);
                                    }
                                }
                            }}

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
                            <strong>Địa chỉ:</strong> {[khachHang.diaChiNguoiDung]
                                .filter(Boolean)
                                .join(', ')}
                        </p>

                        {/* Hình thức nhận hàng */}
                        <div className="mt-2">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="hinhThucNhanHang"
                                    id="nhanTaiQuay"
                                    value="0"
                                    checked={hinhThucNhanHang === 0}
                                    onChange={() => setHinhThucNhanHang(0)}
                                    disabled={daXacNhan}
                                />
                                <label className="form-check-label" htmlFor="nhanTaiQuay">
                                    Nhận hàng tại quầy
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="hinhThucNhanHang"
                                    id="giaoHang"
                                    value="1"
                                    checked={hinhThucNhanHang === 1}
                                    onChange={() => setHinhThucNhanHang(1)}
                                    disabled={daXacNhan}
                                />
                                <label className="form-check-label" htmlFor="giaoHang">
                                    Giao hàng
                                </label>
                            </div>
                        </div>
                        {khachHang?.danhSachDiaChi?.length > 0 && hinhThucNhanHang === 1 && (
                            <div className="mt-2">
                                <h6 className="fw-bold">Danh sách địa chỉ nhận:</h6>
                                <button
                                    className="btn btn-primary btn-sm mb-2"
                                    onClick={() => setShowDiaChiModal(true)}
                                    disabled={daXacNhan}
                                >
                                    + Thêm địa chỉ nhận
                                </button>

                                {showDiaChiModal && (
                                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                        <div className="modal-dialog modal-lg">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title">Thêm địa chỉ nhận</h5>
                                                    <button type="button" className="btn-close" onClick={() => setShowDiaChiModal(false)}></button>
                                                </div>
                                                <div className="modal-body">
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <input
                                                                className="form-control"
                                                                name="tenNguoiNhan"
                                                                placeholder="Tên người nhận"
                                                                value={newDiaChi.tenNguoiNhan}
                                                                onChange={handleChangeNewDiaChi}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input
                                                                className="form-control"
                                                                name="soDienThoai"
                                                                placeholder="Số điện thoại"
                                                                value={newDiaChi.soDienThoai}
                                                                onChange={handleChangeNewDiaChi}
                                                            />
                                                        </div>
                                                        <div className="col-md-12">
                                                            <input
                                                                className="form-control"
                                                                name="diaChi"
                                                                placeholder="Địa chỉ cụ thể (số nhà, đường, thôn...)"
                                                                value={newDiaChi.diaChi}
                                                                onChange={handleChangeNewDiaChi}
                                                            />
                                                        </div>

                                                        <div className="col-md-4">
                                                            <select
                                                                className="form-select"
                                                                value={selectedProvince}
                                                                onChange={e => setSelectedProvince(e.target.value)}
                                                            >
                                                                <option value="">Chọn tỉnh</option>
                                                                {provinces.map(p => (
                                                                    <option key={p.code} value={p.code}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-md-4">
                                                            <select
                                                                className="form-select"
                                                                value={selectedDistrict}
                                                                onChange={e => setSelectedDistrict(e.target.value)}
                                                                disabled={!selectedProvince}
                                                            >
                                                                <option value="">Chọn huyện</option>
                                                                {districts.map(d => (
                                                                    <option key={d.code} value={d.code}>{d.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-md-4">
                                                            <select
                                                                className="form-select"
                                                                value={selectedWard}
                                                                onChange={e => setSelectedWard(e.target.value)}
                                                                disabled={!selectedDistrict}
                                                            >
                                                                <option value="">Chọn xã</option>
                                                                {wards.map(w => (
                                                                    <option key={w.code} value={w.code}>{w.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="modal-footer">
                                                    <button className="btn btn-secondary" onClick={() => setShowDiaChiModal(false)}>Hủy</button>
                                                    <button className="btn btn-success" onClick={handleAddDiaChi}>Thêm</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <ul className="list-group list-group-flush">
                                    {khachHang.danhSachDiaChi.map((dc, index) => {
                                        const isEmpty =
                                            !dc.tenNguoiNhan && !dc.soDienThoai && !dc.soNha && !dc.xa && !dc.huyen && !dc.tinh;

                                        const diaChiDayDu = [dc.soNha, dc.xa, dc.huyen, dc.tinh].filter(Boolean).join(', ');

                                        return (
                                            <li className="list-group-item px-2 py-1 d-flex align-items-start" key={dc.id || index}>
                                                {!isEmpty ? (
                                                    <>
                                                        <input
                                                            type="radio"
                                                            className="form-check-input mt-1 me-2"
                                                            name="diaChiNhan"
                                                            checked={diaChiNhanId === (dc.id || index)}
                                                            onChange={() => setDiaChiNhanId(dc.id || index)}
                                                            disabled={daXacNhan}
                                                        />
                                                        <div>
                                                            <div><strong>Người nhận:</strong> {dc.tenNguoiNhan || '—'}</div>
                                                            <div><strong>SĐT:</strong> {dc.soDienThoai || '—'}</div>
                                                            <div><strong>Địa chỉ:</strong> {diaChiDayDu || '—'}</div>
                                                        </div>
                                                    </>

                                                ) : (
                                                    <div className="text-muted fst-italic">Không có địa chỉ nhận</div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}


                        {!daXacNhan && (
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleXacNhanKhachHang(hoaDonId, khachHang, hinhThucNhanHang, diaChiNhanId)}
                                    disabled={hinhThucNhanHang === 1 && diaChiNhanId === null}
                                >
                                    Xác nhận khách hàng
                                </button>
                            </div>
                        )}
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
                                        <label className="form-label">Ngày sinh</label>
                                        <input type="date" name="namSinh" className="form-control" value={newCustomer.namSinh} onChange={handleInputChange} />
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
                                        <input type="text" name="diaChi" className="form-control" value={newCustomer.diaChi} onChange={handleInputChange} required />
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
                confirmLabel={confirmLabel}
                confirmColor={confirmColor}
                confirmVariant="contained"
            />
        </div>
    );
};

export default Client;
