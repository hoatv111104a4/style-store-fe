
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSanPhamCtBySanPhamId,
  addSanPhamCt,
  updateSanPhamCt,
  deleteSanPhamCt,
  searchSanPhamCtByTen,
} from '../../../services/Admin/SanPhamCTService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faSearch,
  faFileExcel,
  faQrcode,
  faArrowLeft,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const SanPhamCtPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sanPhamCts, setSanPhamCts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedSanPhamCt, setSelectedSanPhamCt] = useState(null);
  const [formData, setFormData] = useState({
    sanPhamId: parseInt(id) || 0,
    mauSacId: null,
    thuongHieuId: null,
    kichThuocId: null,
    xuatXuId: null,
    chatLieuId: null,
    hinhAnhMauSacId: null,
    ma: '',
    giaNhap: '',
    giaBan: '',
    soLuong: '',
    moTa: '',
    trangThai: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [dropdownData, setDropdownData] = useState({
    mauSac: [],
    thuongHieu: [],
    kichThuoc: [],
    xuatXu: [],
    chatLieu: [],
    hinhAnhMauSac: [],
  });

  const fetchDropdownData = useCallback(async () => {
    try {
      console.log('Fetching dropdown data...');
      const token = localStorage.getItem('jwtToken');
      const [mauSacRes, thuongHieuRes, kichThuocRes, xuatXuRes, chatLieuRes, hinhAnhRes] = await Promise.all([
        axios.get(`${BASE_URL}/mau-sac/all`, {
          params: { page: 0, size: 100 },
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/thuong-hieu/all`, {
          params: { page: 0, size: 100 },
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/kich-thuoc/all`, {
          params: { page: 0, size: 100 },
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/xuat-xu/all`, {
          params: { page: 0, size: 100 },
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/chat-lieu/all`, {
          params: { page: 0, size: 100 },
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/hinh-anh-mau-sac/all`, {
          params: { page: 0, size: 100 },
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }),
      ]);
      setDropdownData({
        mauSac: mauSacRes.data.content || [],
        thuongHieu: thuongHieuRes.data.content || [],
        kichThuoc: kichThuocRes.data.content || [],
        xuatXu: xuatXuRes.data.content || [],
        chatLieu: chatLieuRes.data.content || [],
        hinhAnhMauSac: hinhAnhRes.data.content || [],
      });
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      
    }
  }, [navigate]);

  const fetchData = useCallback(
    async (page, size) => {
      try {
        setLoading(true);
        setError(null);
        if (!id || isNaN(parseInt(id))) {
          throw new Error('ID sản phẩm không hợp lệ');
        }
        let response;
        if (searchTerm.trim()) {
          response = await searchSanPhamCtByTen(searchTerm, page, size);
        } else {
          response = await getSanPhamCtBySanPhamId(id, page, size);
        }
        setSanPhamCts(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.message === 'Phiên đăng nhập đã hết hạn') {
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
        } else {
          setError(err.message || 'Không thể tải dữ liệu từ server');
        }
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [id, searchTerm, navigate]
  );

  useEffect(() => {
    fetchDropdownData();
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize, fetchData, fetchDropdownData]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const validateForm = () => {
    const errors = {};
    if (!formData.sanPhamId || formData.sanPhamId <= 0) {
      errors.sanPhamId = 'ID sản phẩm không hợp lệ';
    }
    if (!formData.mauSacId) {
      errors.mauSacId = 'Màu sắc không được để trống';
    }
    if (!formData.thuongHieuId) {
      errors.thuongHieuId = 'Thương hiệu không được để trống';
    }
    if (!formData.kichThuocId) {
      errors.kichThuocId = 'Kích thước không được để trống';
    }
    if (!formData.xuatXuId) {
      errors.xuatXuId = 'Xuất xứ không được để trống';
    }
    if (!formData.chatLieuId) {
      errors.chatLieuId = 'Chất liệu không được để trống';
    }
    if (formData.hinhAnhMauSacId && formData.hinhAnhMauSacId <= 0) {
      errors.hinhAnhMauSacId = 'ID hình ảnh màu sắc không hợp lệ';
    }
    if (!formData.giaBan || isNaN(Number(formData.giaBan)) || Number(formData.giaBan) <= 0) {
      errors.giaBan = 'Giá bán phải là số và lớn hơn 0';
    }
    if (formData.soLuong === null || isNaN(Number(formData.soLuong)) || Number(formData.soLuong) < 0) {
      errors.soLuong = 'Số lượng phải là số và không được nhỏ hơn 0';
    }
    if (formData.giaNhap && (isNaN(Number(formData.giaNhap)) || Number(formData.giaNhap) < 0)) {
      errors.giaNhap = 'Giá nhập phải là số và không âm';
    }
    if (selectedSanPhamCt && (!formData.ma || formData.ma.trim().length === 0)) {
      errors.ma = 'Mã sản phẩm chi tiết không được để trống';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setFormData({
      sanPhamId: parseInt(id) || 0,
      mauSacId: null,
      thuongHieuId: null,
      kichThuocId: null,
      xuatXuId: null,
      chatLieuId: null,
      hinhAnhMauSacId: null,
      ma: '',
      giaNhap: '',
      giaBan: '',
      soLuong: '',
      moTa: '',
      trangThai: 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedSanPhamCt(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewOrEdit = (sanPhamCt, viewOnly = false) => {
    setFormData({
      id: sanPhamCt.id,
      sanPhamId: parseInt(id) || 0,
      mauSacId: sanPhamCt.mauSacId || null,
      thuongHieuId: sanPhamCt.thuongHieuId || null,
      kichThuocId: sanPhamCt.kichThuocId || null,
      xuatXuId: sanPhamCt.xuatXuId || null,
      chatLieuId: sanPhamCt.chatLieuId || null,
      hinhAnhMauSacId: sanPhamCt.hinhAnhMauSacId || null,
      ma: sanPhamCt.ma || '',
      giaNhap: sanPhamCt.giaNhap || '',
      giaBan: sanPhamCt.giaBan || '',
      soLuong: sanPhamCt.soLuong || '',
      moTa: sanPhamCt.moTa || '',
      trangThai: sanPhamCt.trangThai || 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedSanPhamCt(sanPhamCt);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAlertMessage('Vui lòng kiểm tra lại thông tin nhập');
      setAlertType('danger');
      return;
    }

    try {
      const sanPhamCtToSave = {
        ...formData,
        giaNhap: formData.giaNhap ? Number(formData.giaNhap) : null,
        giaBan: Number(formData.giaBan),
        soLuong: Number(formData.soLuong),
        ngayTao: selectedSanPhamCt ? formData.ngayTao : new Date().toISOString(),
        ngaySua: new Date().toISOString(),
        ngayXoa: formData.trangThai === 0 ? new Date().toISOString() : null,
      };

      if (selectedSanPhamCt) {
        await updateSanPhamCt(selectedSanPhamCt.id, sanPhamCtToSave);
        setAlertMessage(`Cập nhật sản phẩm chi tiết "${sanPhamCtToSave.ma}" thành công`);
      } else {
        await addSanPhamCt(sanPhamCtToSave);
        setAlertMessage(`Thêm sản phẩm chi tiết thành công`);
      }
      setAlertType('success');
      setIsModalOpen(false);
      await fetchData(currentPage, pageSize);
    } catch (err) {
      console.error('Error saving data:', err);
      if (err.message === 'Phiên đăng nhập đã hết hạn') {
        setAlertMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        setAlertMessage(`Thao tác thất bại: ${err.message}`);
      }
      setAlertType('danger');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSanPhamCt(confirmModal.id);
      setAlertMessage('Xóa sản phẩm chi tiết thành công');
      setAlertType('success');
      await fetchData(currentPage, pageSize);
    } catch (err) {
      console.error('Error deleting data:', err);
      if (err.message === 'Phiên đăng nhập đã hết hạn') {
        setAlertMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        setAlertMessage(`Xóa thất bại: ${err.message}`);
      }
      setAlertType('danger');
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setSearchLoading(true);
    setCurrentPage(0);
    fetchData(0, pageSize);
  };

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value && !/^[\p{L}\s\d]+$/u.test(e.target.value.trim())) {
      setError('Tên tìm kiếm chỉ được chứa chữ cái, số và khoảng trắng');
    } else {
      setError(null);
    }
  };

  const getPaginationItems = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow);
    return Array.from({ length: endPage - startPage }, (_, i) => startPage + i);
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error) {
    return (
      <div className="alert alert-danger m-4">
        {error}
        <br />
        <button
          className="btn btn-outline-primary mt-2"
          onClick={() => {
            setError(null);
            fetchDropdownData();
            fetchData(currentPage, pageSize);
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate('/admin/quan-ly-sp/san-pham')}
          title="Quay lại"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>
        <h1 className="text-center text-black fw-bold flex-grow-1" style={{ letterSpacing: '2px' }}>
          SẢN PHẨM CHI TIẾT
        </h1>
      </div>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="position-relative w-auto">
            <input
              type="text"
              className={`form-control shadow-sm ${error ? 'is-invalid' : ''}`}
              placeholder="Tìm kiếm sản phẩm chi tiết..."
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ borderRadius: '12px', borderColor: '#000000', padding: '0.5rem 1rem', maxWidth: '250px' }}
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
          <button
            className="btn btn-primary shadow-sm"
            onClick={handleSearch}
            title="Tìm kiếm"
            disabled={searchLoading}
            style={{ borderRadius: '12px', padding: '0.5rem 1rem' }}
          >
            {searchLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <FontAwesomeIcon icon={faSearch} style={{ fontSize: '1rem' }} /> Tìm
              </>
            )}
          </button>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success shadow-sm" style={{ borderRadius: '12px' }} disabled>
            <FontAwesomeIcon icon={faFileExcel} /> Xuất Excel
          </button>
          <button className="btn btn-info shadow-sm" style={{ borderRadius: '12px' }} disabled>
            <FontAwesomeIcon icon={faQrcode} /> Xuất QR Code
          </button>
          <button
            className="btn btn-primary shadow-sm"
            onClick={handleAdd}
            title="Thêm Sản Phẩm Chi Tiết"
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} /> Thêm sản phẩm chi tiết
          </button>
        </div>
      </div>
      <div className="table-responsive shadow-lg rounded-3 overflow-hidden border border-light">
        <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
          <thead className="table-dark text-uppercase" style={{ backgroundColor: '#343a40' }}>
            <tr>
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '5%' }}>
                #
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                Tên *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Mã *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Màu Sắc *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Kích Thước *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Thương Hiệu *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Xuất Xứ *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Chất Liệu *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Giá *
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                Số Lượng *
              </th>
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '10%' }}>
                Trạng Thái *
              </th>
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '10%' }}>
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }}>
            {sanPhamCts.length > 0 ? (
              sanPhamCts.map((spct, index) => (
                <tr key={spct.id} className="align-middle">
                  <td className="py-2 px-3 text-center">{index + 1 + currentPage * pageSize}</td>
                  <td className="py-2 px-3 fw-semibold">{spct.tenSanPham || 'N/A'}</td>
                  <td className="py-2 px-3">{spct.ma || 'N/A'}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`badge ${
                        spct.tenMauSac === 'Green'
                          ? 'bg-success'
                          : spct.tenMauSac === 'Red'
                          ? 'bg-danger'
                          : 'bg-secondary'
                      } rounded-pill px-2 py-1`}
                    >
                      {spct.tenMauSac || 'N/A'}
                    </span>
                  </td>
                  <td className="py-2 px-3">{spct.tenKichThuoc || 'N/A'}</td>
                  <td className="py-2 px-3">{spct.tenThuongHieu || 'N/A'}</td>
                  <td className="py-2 px-3">{spct.tenXuatXu || 'N/A'}</td>
                  <td className="py-2 px-3">{spct.tenChatLieu || 'N/A'}</td>
                  <td className="py-2 px-3">
                    {spct.giaBan ? spct.giaBan.toLocaleString('vi-VN') + ' đ' : 'N/A'}
                  </td>
                  <td className="py-2 px-3">{spct.soLuong || 'N/A'}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`badge ${
                        spct.trangThai === 1 ? 'bg-success' : 'bg-warning'
                      } rounded-pill px-2 py-1`}
                    >
                      {spct.trangThai === 1 ? 'Đang bán' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(spct, true)}
                        title="Xem"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(spct, false)}
                        title="Sửa"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() => setConfirmModal({ open: true, id: spct.id })}
                        title="Xóa"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faSync} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="text-center text-muted py-3 fs-5">
                  Không tìm thấy sản phẩm chi tiết phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3 text-secondary">
        <nav>
          <ul className="pagination mb-0">
            {getPaginationItems().map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page)}
                  style={{ borderRadius: '50%' }}
                >
                  {page + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <select
          className="form-select shadow-sm"
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setCurrentPage(0);
          }}
          style={{ borderRadius: '12px', padding: '0.5rem 1rem', maxWidth: '100px' }}
        >
          <option value="5">5 / page</option>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
        </select>
      </div>
      {alertMessage && (
        <div
          className={`alert alert-${alertType} alert-dismissible fade show`}
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1050,
            minWidth: '300px',
            maxWidth: '400px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-in-out',
          }}
        >
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlertMessage('')}
            aria-label="Close"
          />
          <style>
            {`
              @keyframes slideIn {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              .alert-success {
                background-color: #a3e635;
                color: #1a2e05;
                border-color: #84cc16;
              }
              .alert-danger {
                background-color: #f87171;
                color: #2a0404;
                border-color: #ef4444;
              }
            `}
          </style>
        </div>
      )}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '800px' }}>
            <div
              className="modal-content shadow-lg rounded-3 border-0"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div
                className="modal-header border-bottom-0 px-4 py-3"
                style={{ backgroundColor: '#f1f5f9' }}
              >
                <h4 className="modal-title fw-bold text-dark">
                  {isViewMode
                    ? 'Xem Sản Phẩm Chi Tiết'
                    : selectedSanPhamCt
                    ? 'Chỉnh sửa Sản Phẩm Chi Tiết'
                    : 'Thêm mới Sản Phẩm Chi Tiết'}
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSave}>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Giá Nhập
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${formErrors.giaNhap ? 'is-invalid' : ''}`}
                        value={formData.giaNhap}
                        onChange={(e) =>
                          !isViewMode && setFormData({ ...formData, giaNhap: e.target.value })
                        }
                        readOnly={isViewMode}
                        placeholder="VD: 400000"
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      />
                      {formErrors.giaNhap && <div className="invalid-feedback">{formErrors.giaNhap}</div>}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Giá Bán <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${formErrors.giaBan ? 'is-invalid' : ''}`}
                        value={formData.giaBan}
                        onChange={(e) =>
                          !isViewMode && setFormData({ ...formData, giaBan: e.target.value })
                        }
                        readOnly={isViewMode}
                        placeholder="VD: 500000"
                        required={!isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      />
                      {formErrors.giaBan && <div className="invalid-feedback">{formErrors.giaBan}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Số Lượng <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${formErrors.soLuong ? 'is-invalid' : ''}`}
                        value={formData.soLuong}
                        onChange={(e) =>
                          !isViewMode && setFormData({ ...formData, soLuong: e.target.value })
                        }
                        readOnly={isViewMode}
                        placeholder="VD: 100"
                        required={!isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      />
                      {formErrors.soLuong && <div className="invalid-feedback">{formErrors.soLuong}</div>}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Màu Sắc <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select shadow-sm ${formErrors.mauSacId ? 'is-invalid' : ''}`}
                        value={formData.mauSacId || ''}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({
                            ...formData,
                            mauSacId: parseInt(e.target.value) || null,
                            hinhAnhMauSacId: null, // Reset image when color changes
                          })
                        }
                        disabled={isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value="">Chọn màu sắc...</option>
                        {dropdownData.mauSac.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.ten}
                          </option>
                        ))}
                      </select>
                      {formErrors.mauSacId && <div className="invalid-feedback">{formErrors.mauSacId}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Thương Hiệu <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select shadow-sm ${formErrors.thuongHieuId ? 'is-invalid' : ''}`}
                        value={formData.thuongHieuId || ''}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({ ...formData, thuongHieuId: parseInt(e.target.value) || null })
                        }
                        disabled={isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value="">Chọn thương hiệu...</option>
                        {dropdownData.thuongHieu.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.ten}
                          </option>
                        ))}
                      </select>
                      {formErrors.thuongHieuId && <div className="invalid-feedback">{formErrors.thuongHieuId}</div>}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Kích Thước <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select shadow-sm ${formErrors.kichThuocId ? 'is-invalid' : ''}`}
                        value={formData.kichThuocId || ''}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({ ...formData, kichThuocId: parseInt(e.target.value) || null })
                        }
                        disabled={isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value="">Chọn kích thước...</option>
                        {dropdownData.kichThuoc.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.ten}
                          </option>
                        ))}
                      </select>
                      {formErrors.kichThuocId && <div className="invalid-feedback">{formErrors.kichThuocId}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Xuất Xứ <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select shadow-sm ${formErrors.xuatXuId ? 'is-invalid' : ''}`}
                        value={formData.xuatXuId || ''}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({ ...formData, xuatXuId: parseInt(e.target.value) || null })
                        }
                        disabled={isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value="">Chọn xuất xứ...</option>
                        {dropdownData.xuatXu.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.ten}
                          </option>
                        ))}
                      </select>
                      {formErrors.xuatXuId && <div className="invalid-feedback">{formErrors.xuatXuId}</div>}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Chất Liệu <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select shadow-sm ${formErrors.chatLieuId ? 'is-invalid' : ''}`}
                        value={formData.chatLieuId || ''}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({ ...formData, chatLieuId: parseInt(e.target.value) || null })
                        }
                        disabled={isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value="">Chọn chất liệu...</option>
                        {dropdownData.chatLieu.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.ten}
                          </option>
                        ))}
                      </select>
                      {formErrors.chatLieuId && <div className="invalid-feedback">{formErrors.chatLieuId}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Hình Ảnh Màu Sắc (Tùy chọn)
                      </label>
                      <select
                        className={`form-select shadow-sm ${formErrors.hinhAnhMauSacId ? 'is-invalid' : ''}`}
                        value={formData.hinhAnhMauSacId || ''}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({ ...formData, hinhAnhMauSacId: parseInt(e.target.value) || null })
                        }
                        disabled={isViewMode || !formData.mauSacId}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value="">Không chọn (tự động theo màu sắc)</option>
                        {dropdownData.hinhAnhMauSac
                          .filter((option) => option.mauSacId === formData.mauSacId)
                          .map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.ten || `Hình ${option.id}`}
                            </option>
                          ))}
                      </select>
                      {formErrors.hinhAnhMauSacId && (
                        <div className="invalid-feedback">{formErrors.hinhAnhMauSacId}</div>
                      )}
                      <small className="form-text text-muted">
                        Nếu không chọn, hệ thống sẽ tự động lấy hình ảnh mới nhất theo màu sắc.
                      </small>
                      {/* Image Preview */}
                      {formData.hinhAnhMauSacId && (
                        <div className="mt-2">
                          <img
                            src={
                              dropdownData.hinhAnhMauSac.find(
                                (option) => option.id === formData.hinhAnhMauSacId
                              )?.hinhAnh || '/default-image.jpg'
                            }
                            alt="Hình ảnh màu sắc"
                            style={{
                              maxWidth: '100px',
                              maxHeight: '100px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                            onError={(e) => (e.target.src = '/default-image.jpg')}
                          />
                        </div>
                      )}
                      {/* Image Selection Grid */}
                      {!isViewMode && formData.mauSacId && (
                        <div className="mt-3">
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                              gap: '10px',
                            }}
                          >
                            {dropdownData.hinhAnhMauSac
                              .filter((option) => option.mauSacId === formData.mauSacId)
                              .map((option) => (
                                <div
                                  key={option.id}
                                  style={{
                                    cursor: 'pointer',
                                    border:
                                      formData.hinhAnhMauSacId === option.id
                                        ? '2px solid #007bff'
                                        : '2px solid transparent',
                                    borderRadius: '8px',
                                    padding: '2px',
                                  }}
                                  onClick={() =>
                                    !isViewMode &&
                                    setFormData({ ...formData, hinhAnhMauSacId: option.id })
                                  }
                                >
                                  <img
                                    src={option.hinhAnh || '/default-image.jpg'}
                                    alt={option.ten || `Hình ${option.id}`}
                                    style={{
                                      width: '100%',
                                      height: '80px',
                                      objectFit: 'cover',
                                      borderRadius: '6px',
                                    }}
                                    onError={(e) => (e.target.src = '/default-image.jpg')}
                                  />
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      textAlign: 'center',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {option.ten || `Hình ${option.id}`}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-semibold text-dark">
                        Trạng Thái <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select shadow-sm"
                        value={formData.trangThai}
                        onChange={(e) =>
                          !isViewMode &&
                          setFormData({ ...formData, trangThai: parseInt(e.target.value) })
                        }
                        disabled={isViewMode}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      >
                        <option value={1}>Đang bán</option>
                        <option value={0}>Hết hàng</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Mô Tả
                    </label>
                    <textarea
                      className="form-control shadow-sm"
                      value={formData.moTa}
                      onChange={(e) =>
                        !isViewMode && setFormData({ ...formData, moTa: e.target.value })
                      }
                      readOnly={isViewMode}
                      placeholder="Nhập mô tả sản phẩm..."
                      rows="4"
                      style={{ borderRadius: '8px', padding: '0.75rem' }}
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsModalOpen(false)}
                      style={{ borderRadius: '8px', padding: '8px 20px' }}
                    >
                      {isViewMode ? 'Đóng' : 'Hủy'}
                    </button>
                    {!isViewMode && (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: '8px', padding: '8px 20px' }}
                      >
                        {selectedSanPhamCt ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmModal.open && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal({ open: false, id: null })}
                />
              </div>
              <div className="modal-body">Bạn có chắc muốn xóa sản phẩm chi tiết này?</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmModal({ open: false, id: null })}
                >
                  Hủy
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SanPhamCtPage;
