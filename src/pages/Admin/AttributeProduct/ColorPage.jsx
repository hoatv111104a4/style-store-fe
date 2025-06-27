import React, { useState, useEffect } from 'react';
import { getAllMauSac, addMauSac, updateMauSac, deleteMauSac } from '../../../services/Admin/MauSacService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faEdit, faTrash,faSync, } from '@fortawesome/free-solid-svg-icons';

// Map common Vietnamese color names to hex codes
const colorMap = {
  'đỏ': '#FF0000',
  'xanh': '#00FF00',
  'xanh dương': '#0000FF',
  'xanh lá': '#008000',
  'vàng': '#FFFF00',
  'trắng': '#FFFFFF',
  'đen': '#000000',
  'hồng': '#FF69B4',
  'tím': '#800080',
  'cam': '#FFA500',
  'nâu': '#8B4513',
  'xám': '#808080',
};

const getColorCode = (color) => {
  if (!color) return '#000000';
  if (color.hexCode && /^#[0-9A-Fa-f]{6}$/i.test(color.hexCode)) {
    return color.hexCode;
  }
  const normalizedColor = color.ten?.toLowerCase() || '';
  return colorMap[normalizedColor] || (CSS.supports('color', color.ten) ? color.ten : '#000000');
};

const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

const Color = () => {
  const [colors, setColors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [formData, setFormData] = useState({
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    ngayXoa: null,
    moTa: '',
    trangThai: 1,
    hexCode: '#000000',
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchData(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const fetchData = async (page, size, search) => {
    try {
      setLoading(true);
      const response = await getAllMauSac(page, size, search);
      console.log('API Response:', response); // Debug dữ liệu API
      setColors(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.ten?.trim()) {
      errors.ten = 'Tên màu sắc không được để trống';
    } else if (!formData.ten.trim().match(/^[\p{L}\s]+$/u)) {
      errors.ten = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    }else if (formData.ten.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
    }
    if (formData.moTa?.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }
    if (!isValidHex(formData.hexCode)) {
      errors.hexCode = 'Mã hex không hợp lệ (VD: #FF0000)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setFormData({
      ma: '',
      ten: '',
      ngayTao: new Date().toISOString(),
      ngaySua: new Date().toISOString(),
      ngayXoa: null,
      moTa: '',
      trangThai: 1,
      hexCode: '#000000',
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedColor(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewOrEdit = (color, viewOnly = false) => {
    const inferredHex = getColorCode(color);
    setFormData({
      ...color,
      ngayTao: color.ngayTao || '',
      ngaySua: color.ngaySua || '',
      ngayXoa: color.ngayXoa || null,
      trangThai: color.trangThai || 1,
      hexCode: color.hexCode || inferredHex,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedColor(color);
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
      const now = new Date().toISOString();
      const colorToSave = {
        ...formData,
        ma: selectedColor ? formData.ma : `MS-${crypto.randomUUID().substring(0, 8)}`,
        trangThai: 1,
        ngayTao: selectedColor ? formData.ngayTao : now,
        ngaySua: now,
        ngayXoa: formData.trangThai === 0 ? now : null,
      };

      if (selectedColor) {
        await updateMauSac(selectedColor.id, colorToSave);
        setColors(colors.map((c) => (c.id === selectedColor.id ? { ...c, ...colorToSave } : c)));
        setAlertMessage(`Cập nhật màu sắc "${colorToSave.ten}" thành công`);
      } else {
        await addMauSac(colorToSave);
        await fetchData(currentPage, pageSize, searchTerm);
        setAlertMessage(`Thêm màu sắc "${colorToSave.ten}" thành công`);
      }
      setAlertType('success');
      setIsModalOpen(false);
    } catch (err) {
      setAlertMessage(`Thao tác thất bại: ${err.response?.data?.message || err.message}`);
      setAlertType('danger');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMauSac(confirmModal.id);
      await fetchData(currentPage, pageSize, searchTerm);
      setAlertMessage('Cập nhật trạng thái thành công');
      setAlertType('success');
    } catch (err) {
      setAlertMessage(`Cập nhật trạng thái thất bại: ${err.message}`);
      setAlertType('danger');
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleTenChange = (e) => {
    const newTen = e.target.value;
    const normalizedTen = newTen.toLowerCase();
    const newHex = colorMap[normalizedTen] || (CSS.supports('color', newTen) ? newTen : formData.hexCode);
    setFormData({
      ...formData,
      ten: newTen,
      hexCode: isValidHex(newHex) ? newHex : formData.hexCode,
    });
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 className="mb-4 text-center text-black fw-bold" style={{ letterSpacing: '2px' }}>
        QUẢN LÝ MÀU SẮC
      </h1>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-3">
        <input
          type="text"
          className="form-control w-auto shadow-sm"
          placeholder="Tìm kiếm màu sắc..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ borderRadius: '12px', borderColor: '#000000', padding: '0.5rem 1rem', maxWidth: '400px' }}
        />
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-primary shadow-sm" onClick={handleAdd} title="Thêm Màu Sắc">
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} /> Thêm màu sắc
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
                MÃ MÀU SẮC
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                TÊN MÀU SẮC
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                NGÀY TẠO
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                NGÀY SỬA
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                NGÀY XÓA
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                MÔ TẢ
              </th>
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '10%' }}>
                TRẠNG THÁI
              </th>
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '15%' }}>
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }}>
            {Array.isArray(colors) && colors.length > 0 ? (
              colors.map((color, index) => (
                <tr key={color.id} className="align-middle">
                  <td className="py-2 px-3 text-center">{index + 1 + currentPage * pageSize}</td>
                  <td className="py-2 px-3 fw-semibold">{color.ma}</td>
                  <td className="py-2 px-3">
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: getColorCode(color),
                        marginRight: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '50%',
                        verticalAlign: 'middle',
                      }}
                    ></span>
                    {color.ten}
                  </td>
                  <td className="py-2 px-3">{color.ngayTao?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{color.ngaySua?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{color.ngayXoa?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{color.moTa || '-'}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`badge ${
                        color.trangThai === 1 ? 'bg-success' : 'bg-secondary'
                      } rounded-pill px-2 py-1`}
                    >
                      {color.trangThai === 1 ? 'Đang Hoạt Động' : 'Ngừng Hoạt Động'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(color, true)}
                        title="Xem"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(color, false)}
                        title="Sửa"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() => setConfirmModal({ open: true, id: color.id })}
                        title="Thay đổi trạng thái"
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
                <td colSpan="9" className="text-center text-muted py-3 fs-5">
                  Không tìm thấy màu sắc phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3 text-secondary">
        <nav>
          <ul className="pagination mb-0">
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(i)}
                  disabled={currentPage === i}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <span>
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} bản ghi)
        </span>
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
                background-color: #a3e635; /* Brighter green */
                color: #1a2e05; /* Darker text for contrast */
                border-color: #84cc16;
              }
              .alert-danger {
                background-color: #f87171; /* Brighter red */
                color: #2a0404; /* Darker text for contrast */
                border-color: #ef4444;
              }
            `}
          </style>
        </div>
      )}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '600px' }}>
            <div className="modal-content shadow-lg rounded-3 border-0" style={{ backgroundColor: '#ffffff' }}>
              <div className="modal-header border-bottom-0 px-4 py-3" style={{ backgroundColor: '#f1f5f9' }}>
                <h4 className="modal-title fw-bold text-dark">
                  {isViewMode ? 'Xem Màu Sắc' : selectedColor ? 'Chỉnh sửa Màu Sắc' : 'Thêm mới Màu Sắc'}
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
                  {selectedColor && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark">Mã Màu Sắc</label>
                      <input
                        type="text"
                        className="form-control shadow-sm"
                        value={formData.ma}
                        readOnly
                        style={{ borderRadius: '8px', padding: '0.75rem', backgroundColor: '#f8f9fa' }}
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Tên Màu Sắc <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control shadow-sm ${formErrors.ten ? 'is-invalid' : ''}`}
                      value={formData.ten}
                      onChange={(e) => !isViewMode && handleTenChange(e)}
                      readOnly={isViewMode}
                      placeholder="VD: Đỏ"
                      required={!isViewMode}
                      style={{ borderRadius: '8px', padding: '0.75rem' }}
                    />
                    {formErrors.ten && <div className="invalid-feedback">{formErrors.ten}</div>}
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Mã Hex <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={formData.hexCode}
                        onChange={(e) => !isViewMode && setFormData({ ...formData, hexCode: e.target.value })}
                        disabled={isViewMode}
                        title="Chọn màu"
                        style={{ width: '40px', padding: '0', border: 'none' }}
                      />
                      <input
                        type="text"
                        className={`form-control shadow-sm ${formErrors.hexCode ? 'is-invalid' : ''}`}
                        value={formData.hexCode}
                        onChange={(e) => !isViewMode && setFormData({ ...formData, hexCode: e.target.value })}
                        readOnly={isViewMode}
                        placeholder="#FFFFFF"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        title="Nhập mã hex hợp lệ (VD: #FF0000)"
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                      />
                      <span
                        style={{
                          display: 'inline-block',
                          width: '40px',
                          height: '40px',
                          backgroundColor: isValidHex(formData.hexCode) ? formData.hexCode : '#000000',
                          border: '1px solid #ccc',
                          borderRadius: '50%',
                          marginLeft: '8px',
                          verticalAlign: 'middle',
                        }}
                      ></span>
                    </div>
                    {formErrors.hexCode && <div className="invalid-feedback">{formErrors.hexCode}</div>}
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Mô Tả</label>
                    <textarea
                      className={`form-control shadow-sm ${formErrors.moTa ? 'is-invalid' : ''}`}
                      rows="4"
                      value={formData.moTa}
                      onChange={(e) => !isViewMode && setFormData({ ...formData, moTa: e.target.value })}
                      readOnly={isViewMode}
                      placeholder="Mô tả thêm về màu sắc"
                      style={{ borderRadius: '8px', padding: '0.75rem' }}
                    />
                    {formErrors.moTa && <div className="invalid-feedback">{formErrors.moTa}</div>}
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
                        {selectedColor ? 'Cập nhật' : 'Thêm mới'}
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
              <div className="modal-body">
                Bạn có chắc muốn thay đổi trạng thái màu sắc này?
              </div>
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

export default Color;