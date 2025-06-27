import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addChatLieu, updateChatLieu, deleteChatLieu, searchChatLieuByName } from '../../../services/Admin/ChatLieuService';


import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';

const MaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchInput, setSearchInput] = useState(''); // Giá trị hiển thị trên input
  const [searchTerm, setSearchTerm] = useState(''); // Giá trị gửi API
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    ma: '',
    ten: '',
    ngayTao: '',
    ngaySua: '',
    ngayXoa: null,
    moTa: '',
    trangThai: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const navigate = useNavigate();

  const fetchData = useCallback(async (page, size, search = '') => {
    try {
      setLoading(true);
      if (search) setSearchLoading(true);
      setError(null);
      let response;
      if (search && search.trim().length >= 5 && /^[\p{L}\s]+$/u.test(search.trim())) {
        response = await searchChatLieuByName(search.trim(), page, size);
      } else {
        response = await getAllChatLieu(page, size);
      }
      setMaterials(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu từ server');
    } finally {
      setLoading(false);
      if (search) setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize, searchTerm, fetchData]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const validateForm = useCallback(async () => {
    const errors = {};

    // Basic validation for ten
    if (!formData.ten?.trim()) {
      errors.ten = 'Tên chất liệu không được để trống';
    } else if (!formData.ten.trim().match(/^[\p{L}\s]+$/u)) {
      errors.ten = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    } else if (formData.ten.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
    } 

    // Check for duplicate name
    if (!errors.ten) {
      try {
        const response = await searchChatLieuByName(formData.ten.trim(), 0, 10);
        const existingMaterials = response.content || [];
        const isDuplicate = existingMaterials.some(
          (material) =>
            material.ten.toLowerCase() === formData.ten.trim().toLowerCase() &&
            (!selectedMaterial || material.id !== selectedMaterial.id)
        );
        if (isDuplicate) {
          errors.ten = 'Tên chất liệu đã tồn tại';
        }
      } catch (err) {
        errors.ten = 'Không thể kiểm tra tên chất liệu';
      }
    }

    // Validation for moTa
    if (formData.moTa?.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedMaterial]);

  const handleAdd = useCallback(() => {
    setFormData({
      ma: '',
      ten: '',
      ngayTao: new Date().toISOString(),
      ngaySua: new Date().toISOString(),
      ngayXoa: null,
      moTa: '',
      trangThai: 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedMaterial(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  }, []);

  const handleViewOrEdit = useCallback((material, viewOnly = false) => {
    setFormData({
      ...material,
      ngayTao: material.ngayTao || '',
      ngaySua: material.ngaySua || '',
      ngayXoa: material.ngayXoa || null,
      trangThai: material.trangThai || 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedMaterial(material);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      const isValid = await validateForm();
      if (!isValid) {
        setAlertMessage('Vui lòng kiểm tra lại thông tin nhập');
        setAlertType('danger');
        return;
      }

      try {
        const now = new Date().toISOString();
        const materialToSave = {
          ...formData,
          ma: selectedMaterial ? formData.ma : `CL-${crypto.randomUUID().substring(0, 8)}`,
          trangThai: 1,
          ngayTao: selectedMaterial ? formData.ngayTao : now,
          ngaySua: now,
          ngayXoa: formData.trangThai === 0 ? now : null,
        };

        if (selectedMaterial) {
          await updateChatLieu(selectedMaterial.id, materialToSave);
          setMaterials((prev) =>
            prev.map((m) => (m.id === selectedMaterial.id ? { ...m, ...materialToSave } : m))
          );
          setAlertMessage(`Cập nhật chất liệu "${materialToSave.ten}" thành công`);
        } else {
          await addChatLieu(materialToSave);
          await fetchData(currentPage, pageSize, searchTerm);
          setAlertMessage(`Thêm chất liệu "${materialToSave.ten}" thành công`);
        }
        setAlertType('success');
        setIsModalOpen(false);
      } catch (err) {
        setAlertMessage(`Thao tác thất bại: ${err.response?.data?.message || err.message}`);
        setAlertType('danger');
      }
    },
    [formData, selectedMaterial, currentPage, pageSize, searchTerm, validateForm, fetchData]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteChatLieu(confirmModal.id);
      await fetchData(currentPage, pageSize, searchTerm);
      setAlertMessage('Cập nhật trạng thái thành công');
      setAlertType('success');
    } catch (err) {
      setAlertMessage(`Cập nhật trạng thái thất bại: ${err.message}`);
      setAlertType('danger');
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  }, [confirmModal.id, currentPage, pageSize, searchTerm, fetchData]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSearchInput = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value && value.trim().length > 0) {
      if (!/^[\p{L}\s]+$/u.test(value.trim())) {
        setError('Tên tìm kiếm chỉ được chứa chữ cái và khoảng trắng');
      }  else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, []);

  const handleSearch = useCallback(() => {
    setSearchTerm(searchInput);
    setCurrentPage(0);
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(0);
    setError(null);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error && !materials.length) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 className="mb-4 text-center text-black fw-bold" style={{ letterSpacing: '2px' }}>
        QUẢN LÝ CHẤT LIỆU
      </h1>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2 align-items-center" style={{ maxWidth: '400px' }}>
          <div className="position-relative flex-grow-1">
            <input
              type="text"
              className={`form-control shadow-sm ${error ? 'is-invalid' : ''}`}
              placeholder="Nhập tên chất liệu..."
              value={searchInput}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              style={{ borderRadius: '12px', borderColor: '#000000', padding: '0.5rem 2rem 0.5rem 1rem', width: '100%' }}
            />
            {searchInput && (
              <button
                type="button"
                className="btn btn-outline-secondary position-absolute"
                style={{ right: searchLoading ? '35px' : '5px', top: '50%', transform: 'translateY(-50%)', padding: '2px 8px' }}
                onClick={clearSearch}
                title="Xóa tìm kiếm"
              >
                X
              </button>
            )}
            {searchLoading && (
              <div
                className="position-absolute"
                style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <div className="spinner-border spinner-border-sm text-muted" role="status" />
              </div>
            )}
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
          <button
            type="button"
            className="btn btn-primary shadow-sm"
            onClick={handleSearch}
            title="Tìm kiếm"
            disabled={searchLoading || !!error || !searchInput.trim()}
            style={{ padding: '0.5rem 1rem' }}
          >
            <FontAwesomeIcon icon={faSearch} style={{ fontSize: '1rem' }} /> Tìm kiếm
          </button>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-primary shadow-sm"
            onClick={handleAdd}
            title="Thêm Chất Liệu"
            style={{ padding: '0.5rem 1rem' }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} /> Thêm chất liệu
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
                MÃ CHẤT LIỆU
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '15%' }}>
                TÊN CHẤT LIỆU
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
            {materials.length > 0 ? (
              materials.map((material, index) => (
                <tr key={material.id} className="align-middle">
                  <td className="py-2 px-3 text-center">{index + 1 + currentPage * pageSize}</td>
                  <td className="py-2 px-3 fw-semibold">{material.ma}</td>
                  <td className="py-2 px-3">{material.ten}</td>
                  <td className="py-2 px-3">{material.ngayTao?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{material.ngaySua?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{material.ngayXoa?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{material.moTa || '-'}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`badge ${
                        material.trangThai === 1 ? 'bg-success' : 'bg-secondary'
                      } rounded-pill px-2 py-1`}
                    >
                      {material.trangThai === 1 ? 'Đang Hoạt Động' : 'Ngừng Hoạt Động'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(material, true)}
                        title="Xem"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(material, false)}
                        title="Sửa"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() => setConfirmModal({ open: true, id: material.id })}
                        title="Thay đổi trạng thái"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted py-3 fs-5">
                  {searchTerm ? `Không tìm thấy chất liệu phù hợp với "${searchTerm}"` : 'Không có chất liệu nào'}
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
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} chất liệu)
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
          <style jsx>{`
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
          `}</style>
        </div>
      )}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '600px' }}>
            <div className="modal-content shadow-lg rounded-3 border-0" style={{ backgroundColor: '#ffffff' }}>
              <div className="modal-header border-bottom-0 px-4 py-3" style={{ backgroundColor: '#f1f5f9' }}>
                <h4 className="modal-title fw-bold text-dark">
                  {isViewMode ? 'Xem Chất Liệu' : selectedMaterial ? 'Chỉnh sửa Chất Liệu' : 'Thêm mới Chất Liệu'}
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
                  {selectedMaterial && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark">Mã Chất Liệu</label>
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
                      Tên Chất Liệu <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control shadow-sm ${formErrors.ten ? 'is-invalid' : ''}`}
                      value={formData.ten}
                      onChange={(e) => !isViewMode && setFormData({ ...formData, ten: e.target.value })}
                      readOnly={isViewMode}
                      placeholder="VD: Cotton"
                      required={!isViewMode}
                      style={{ borderRadius: '8px', padding: '0.75rem' }}
                    />
                    {formErrors.ten && <div className="invalid-feedback">{formErrors.ten}</div>}
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Mô Tả</label>
                    <textarea
                      className={`form-control shadow-sm ${formErrors.moTa ? 'is-invalid' : ''}`}
                      rows="4"
                      value={formData.moTa}
                      onChange={(e) => !isViewMode && setFormData({ ...formData, moTa: e.target.value })}
                      readOnly={isViewMode}
                      placeholder="Mô tả thêm về chất liệu"
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
                        {selectedMaterial ? 'Cập nhật' : 'Thêm mới'}
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
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
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
                Bạn có chắc muốn thay đổi trạng thái chất liệu này?
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

export default MaterialPage;