import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSyncAlt, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getKHBySdt, addNguoiDung, addDiaChiNhan, getDiaChiNhanByNguoiDungId, searchUserById } from '../../../services/Admin/CounterSales/NguoiDungSAdmService';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { set } from 'lodash';
const API_PROVINCE_URL = "https://provinces.open-api.vn/api/";

const Client = forwardRef(({
    hoaDonId,
    khachHangMap,
    setKhachHangMap,
    daXacNhan,
    handleXacNhanKhachHang,
    setXacNhanKhachHangMap,
    hinhThucNhanHang,
    setHinhThucNhanHang,
    setSoDienThoai
}, ref) => {
    const [loading, setLoading] = useState(false);
    const [khachHang, setKhachHang] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(true); // Default to show search
    const [searchSdt, setSearchSdt] = useState('');
    const [diaChiNhanId, setDiaChiNhanId] = useState(null);
    const [daXacNhanState, setDaXacNhanState] = useState(false);
    const [showDiaChiModal, setShowDiaChiModal] = useState(false);
    const [newDiaChi, setNewDiaChi] = useState({
        tenNguoiNhan: '',
        soDienThoai: '',
        soNha: '',
        diaChi: '',
        xa: '',
        huyen: '',
        tinh: ''
    });

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
    useEffect(() => {
        // Load hình thức nhận hàng theo hoaDonId
        const savedHinhThucNhanHang = localStorage.getItem(`hinhThucNhanHang-${hoaDonId}`);
        if (savedHinhThucNhanHang) {
            setHinhThucNhanHang(parseInt(savedHinhThucNhanHang, 10));
        }
    }, [hoaDonId]);

    useEffect(() => {
        // Load địa chỉ nhận theo hoaDonId
        const savedDiaChiNhanId = localStorage.getItem(`diaChiNhanId-${hoaDonId}`);
        if (savedDiaChiNhanId) {
            setDiaChiNhanId(savedDiaChiNhanId);
        }
    }, [hoaDonId]);

    useEffect(() => {
        const savedPhone = localStorage.getItem(`soDienThoai-${hoaDonId}`);
        if (savedPhone) {
            setSoDienThoai(savedPhone);
        }
    }, [hoaDonId]);

    useEffect(() => {
        const currentMap = JSON.parse(localStorage.getItem('soDienThoaiMap') || '{}');
        if (currentMap[hoaDonId]) {
            setSoDienThoai(currentMap[hoaDonId]);
        }
    }, [hoaDonId]);


    useEffect(() => {
        // Khôi phục thông tin khách hàng
        const savedCustomer = localStorage.getItem(`selectedCustomer-${hoaDonId}`);
        if (savedCustomer) {
            const parsedCustomer = JSON.parse(savedCustomer);
            setKhachHang(parsedCustomer);

        }

        const savedKhachHangMap = localStorage.getItem('khachHangMap');
        if (savedKhachHangMap && setKhachHangMap) {
            setKhachHangMap(JSON.parse(savedKhachHangMap));
        }

        // Khôi phục số điện thoại đang nhập dở (nếu có)
        const pendingSdt = localStorage.getItem(`pendingSdt-${hoaDonId}`);
        if (pendingSdt) {
            setSearchSdt(pendingSdt);
        }
    }, [hoaDonId, setKhachHangMap]);


    useEffect(() => {
        // Load khách hàng theo hoaDonId
        const storedCustomer = localStorage.getItem(`selectedCustomer-${hoaDonId}`);
        if (storedCustomer) {
            setKhachHang(JSON.parse(storedCustomer));
            setShowSearchInput(false);
        }
    }, [hoaDonId]);

    useEffect(() => {
        // Load trạng thái xác nhận theo hoaDonId
        const storedDaXacNhan = localStorage.getItem(`daXacNhan-${hoaDonId}`);
        if (storedDaXacNhan === 'true') {
            setDaXacNhanState(true);
        }
    }, [hoaDonId]);

    useEffect(() => {
        if (daXacNhanState) {
            // Cập nhật map khi người dùng xác nhận thành công
            setXacNhanKhachHangMap(prevState => ({
                ...prevState,
                [hoaDonId]: true
            }));

            // Lưu trạng thái xác nhận vào localStorage theo hoaDonId
            localStorage.setItem(`daXacNhan-${hoaDonId}`, 'true');

            // Lưu thông tin khách hàng vào localStorage theo hoaDonId
            if (khachHang) {
                localStorage.setItem(`selectedCustomer-${hoaDonId}`, JSON.stringify(khachHang));
            }

            // Lưu hình thức nhận hàng theo hoaDonId
            localStorage.setItem(`hinhThucNhanHang-${hoaDonId}`, hinhThucNhanHang);

            // Lưu địa chỉ nhận theo hoaDonId
            if (diaChiNhanId) {
                localStorage.setItem(`diaChiNhanId-${hoaDonId}`, diaChiNhanId);
            }
        }
    }, [daXacNhanState, hoaDonId, setXacNhanKhachHangMap, khachHang, hinhThucNhanHang, diaChiNhanId]);

    const handleLocalSearch = async () => {
        if (!searchSdt?.trim()) {
            toast.warning('Vui lòng nhập số điện thoại.');
            return;
        }

        setLoading(true);

        try {
            const customerInfo = await getKHBySdt(searchSdt);

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
                    : ['Không có địa chỉ nhận'],
            };

            // Lưu thông tin khách hàng vào localStorage
            // localStorage.setItem('selectedCustomer', JSON.stringify(fullCustomerData));
            localStorage.setItem(`selectedCustomer-${hoaDonId}`, JSON.stringify(fullCustomerData));
            // localStorage.setItem(`lastSearchSdt-${hoaDonId}`, searchSdt);
            localStorage.setItem('soDienThoaiMap', JSON.stringify({
                ...JSON.parse(localStorage.getItem('soDienThoaiMap') || '{}'),
                [hoaDonId]: searchSdt
            }));
            setKhachHang(fullCustomerData);
            if (setKhachHangMap) {
                setKhachHangMap(prev => ({ ...prev, [hoaDonId]: fullCustomerData }));

                localStorage.setItem(`khachHangMap`, JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`khachHangMap`) || {}),
                    [hoaDonId]: fullCustomerData
                }));
            }

            setShowSearchInput(false);
            setSearchSdt('');

        } catch (error) {
            const result = await Swal.fire({
                title: "Thêm mới khách hàng",
                text: `Không tìm thấy khách hàng với SĐT ${searchSdt}. Bạn có muốn thêm mới không?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#0051ffff",
                cancelButtonColor: "#888",
                confirmButtonText: "Thêm mới",
                cancelButtonText: "Hủy",
            });
            if (result.isConfirmed) {
                setNewCustomer({ ...initialCustomerState, soDienThoai: searchSdt });
                setShowAddModal(true);
                setShowSearchInput(false);
            }
        } finally {
            setLoading(false);
        }
    };
    const handleReload = () => {
        setShowSearchInput(true);
        setSearchSdt('');
        setDaXacNhanState(false);

        // Xóa dữ liệu theo hoaDonId
        localStorage.removeItem(`selectedCustomer-${hoaDonId}`);
        localStorage.removeItem(`daXacNhan-${hoaDonId}`);
        localStorage.removeItem(`diaChiNhanId-${hoaDonId}`);
        localStorage.removeItem(`hinhThucNhanHang-${hoaDonId}`);

        if (typeof setKhachHangMap === 'function') {
            setKhachHangMap(prevMap => ({
                ...prevMap,
                [hoaDonId]: null
            }));
        }

        setKhachHang(null);

        if (typeof setXacNhanKhachHangMap === 'function') {
            setXacNhanKhachHangMap(prev => ({
                ...prev,
                [hoaDonId]: false
            }));
        }
    };

    useImperativeHandle(ref, () => ({
        reloadClient: handleReload
    }));

    const handleDiaChiChange = (dc, index) => {
        setDiaChiNhanId(dc.id || index);

        if (setSoDienThoai) {
            const currentMap = JSON.parse(localStorage.getItem('soDienThoaiMap') || '{}');
            const phone = dc?.soDienThoai?.trim() || currentMap[hoaDonId] || searchSdt || "";
            setSoDienThoai(phone);

            localStorage.setItem('soDienThoaiMap', JSON.stringify({
                ...currentMap,
                [hoaDonId]: phone
            }));
        }


        localStorage.setItem(`diaChiNhanId-${hoaDonId}`, dc.id || index);
    };


    const handleXacNhan = () => {
        handleXacNhanKhachHang(hoaDonId, khachHang, hinhThucNhanHang, diaChiNhanId);
        localStorage.setItem(`daXacNhan-${hoaDonId}`, 'true');
        localStorage.setItem(`hinhThucNhanHang-${hoaDonId}`, hinhThucNhanHang);
        setDaXacNhanState(true);
    };
    const handleChangeNewDiaChi = (e) => {
        const { name, value } = e.target;
        setNewDiaChi(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDiaChi = async () => {
        if (!khachHang?.id) {
            toast.error('Không tìm thấy khách hàng');
            return;
        }

        const diaChi = newDiaChi.diaChi || '';
        const soNha = newDiaChi.soNha || '';
        const tinh = provinces.find(p => p.code == selectedProvince)?.name || '';
        const huyen = districts.find(d => d.code == selectedDistrict)?.name || '';
        const xa = wards.find(w => w.code == selectedWard)?.name || '';
        const payload = {
            tenNguoiNhan: newDiaChi.tenNguoiNhan,
            soDienThoai: newDiaChi.soDienThoai,
            diaChi: diaChi,
            soNha: diaChi,
            tinh: tinh,
            huyen: huyen,
            xa: xa,
            trangThai: 1,
            nguoiDungSAdm: { id: khachHang.id },
            ngayTao: new Date().toISOString()
        };

        try {
            const result = await addDiaChiNhan(payload);
            toast.success('Thêm địa chỉ thành công!');
            setKhachHang(prev => ({
                ...prev,
                danhSachDiaChi: [...(prev.danhSachDiaChi || []), result]
            }));
            setNewDiaChi({
                tenNguoiNhan: '',
                soDienThoai: '',
                soNha: '',
                diaChi: ''
            });
            setSelectedProvince('');
            setSelectedDistrict('');
            setSelectedWard('');
            setShowDiaChiModal(false);
        } catch (error) {
            toast.error('Lỗi khi thêm địa chỉ!');
        }
    };


    const handleAddNewCustomer = async () => {
        if (
            !newCustomer.hoTen || !newCustomer.email || !newCustomer.diaChi || !newCustomer.namSinh ||
            !newCustomer.soDienThoai || !newCustomer.gioiTinh ||
            selectedProvince === "" || selectedDistrict === "" || selectedWard === ""
        ) {
            toast.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            // Kiểm tra nếu số điện thoại đã tồn tại
            await getKHBySdt(newCustomer.soDienThoai);
            toast.warning('Số điện thoại đã tồn tại trong hệ thống.');
            setLoading(false);
        } catch (searchError) {
            // Nếu số điện thoại không tồn tại, tiếp tục thêm khách hàng mới
            const diaChi = newCustomer.diaChi?.trim() || '';
            const tinh = provinces.find(p => p.code == selectedProvince)?.name || '';
            const huyen = districts.find(d => d.code == selectedDistrict)?.name || '';
            const xa = wards.find(w => w.code == selectedWard)?.name || '';
            const diaChiDayDu = `${diaChi}, ${xa}, ${huyen}, ${tinh}`;

            try {
                const requestData = {
                    hoTen: newCustomer.hoTen,
                    soDienThoai: newCustomer.soDienThoai,
                    email: newCustomer.email || null,
                    diaChiNguoiDung: diaChiDayDu || '',
                    tinhNguoiDung: provinces.find(p => p.code == selectedProvince)?.name || '',
                    huyenNguoiDung: districts.find(d => d.code == selectedDistrict)?.name || '',
                    xaNguoiDung: wards.find(w => w.code == selectedWard)?.name || '',
                    namSinh: newCustomer.namSinh,
                    gioiTinh: parseInt(newCustomer.gioiTinh),
                    idChucVu: 3,
                    tenNguoiNhan: newCustomer.hoTen,
                    soDienThoaiNhan: newCustomer.soDienThoai,
                    diaChiNhan: diaChiDayDu,
                    soNhaNhan: diaChi,
                    tinhNhan: tinh,
                    huyenNhan: huyen,
                    xaNhan: xa,
                    trangThai: 1
                };

                const response = await addNguoiDung(requestData);
                toast.success('Thêm khách hàng thành công!');
                setShowAddModal(false); // Đóng modal khi thêm thành công
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
                            soNha: diaChi,
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
                const errorMessage = addError.response?.data?.result || "Lỗi khi thêm khách hàng!";
                toast.error(errorMessage);
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
                                        if (setSoDienThoai) setSoDienThoai(searchSdt || "");
                                        console.log("Số điện thoại tìm kiếm: ", searchSdt);
                                    } else {
                                        toast.warning("Số điện thoại phải gồm đúng 10 chữ số");
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
                                    value="3"
                                    checked={hinhThucNhanHang === 3}
                                    onChange={() => {
                                        setHinhThucNhanHang(3);
                                        localStorage.setItem('hinhThucNhanHang', 3);
                                    }}
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
                                    onChange={() => {
                                        setHinhThucNhanHang(1);
                                        localStorage.setItem('hinhThucNhanHang', 1);
                                    }}
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
                                                                value={`${newDiaChi.soNha ? newDiaChi.soNha + ', ' : ''}${newDiaChi.diaChi || ''}`}
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
                                        const isEmpty = !dc.tenNguoiNhan && !dc.soDienThoai && !dc.soNha && !dc.xa && !dc.huyen && !dc.tinh;
                                        const diaChiDayDu = [dc.soNha, dc.xa, dc.huyen, dc.tinh].filter(Boolean).join(', ');

                                        return (
                                            <li className="list-group-item px-2 py-1 d-flex align-items-start" key={dc.id || index}>
                                                {!isEmpty ? (
                                                    <>
                                                        <input
                                                            type="radio"
                                                            className="form-check-input mt-1 me-2"
                                                            name="diaChiNhan"
                                                            checked={String(diaChiNhanId) === String(dc.id || index)} // Kiểm tra xem có chọn đúng địa chỉ không
                                                            onChange={() => handleDiaChiChange(dc, index)}  // Xử lý khi thay đổi
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


                        {!daXacNhanState && (
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={handleXacNhan}
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
{/* 
                {!khachHang && !showSearchInput && (
                    <p>Khách hàng: <strong>Khách lẻ</strong></p>
                )} */}
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
            <ToastContainer />
        </div>
    );
});

export default Client;