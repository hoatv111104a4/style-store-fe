import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSPWithQuantity, deleteSP } from '../../../services/Admin/SanPhamAdminService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faEdit, faRotateRight, faSearch,faSync, } from '@fortawesome/free-solid-svg-icons';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, currentStatus: null });
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
      const response = await searchSPWithQuantity(search, page, size);
      setProducts(response.content.map(item => ({
        ...item.sanPham,
        totalQuantity: item.totalQuantity || 0,
        trangThai: item.sanPham.trangThai
      })) || []);
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

  const handleViewOrEdit = (product, viewOnly = false) => {
    navigate(`/san-pham-chi-tiet/${product.id}`, {
      state: { isViewMode: viewOnly, product },
    });
  };

  const handleAddProduct = () => {
    navigate('/admin/quan-ly-sp/them-san-pham');
  };

  const handleDelete = async () => {
  try {
    await deleteSP(confirmModal.id); // Gọi API thay đổi trạng thái trên backend

    // Gọi lại fetchData để tải lại danh sách đã cập nhật ngàyXoa / ngàySua
    await fetchData(currentPage, pageSize, searchTerm);

    const newStatus = confirmModal.currentStatus === 1 ? 'Hết Hàng' : 'Đang Bán';
    setAlertMessage(`Đã thay đổi trạng thái sản phẩm sang "${newStatus}"`);
    setAlertType('success');
  } catch (err) {
    setAlertMessage(`Cập nhật trạng thái thất bại: ${err.message}`);
    setAlertType('danger');
  } finally {
    setConfirmModal({ open: false, id: null, currentStatus: null });
  }
};


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    setError(null);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(0);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      handleSearch();
    }
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error && !products.length) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 className="mb-4 text-center text-black fw-bold" style={{ letterSpacing: '2px' }}>
        QUẢN LÝ SẢN PHẨM
      </h1>
      <div className="d-flex justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2 align-items-center" style={{ maxWidth: '400px' }}>
          <div className="position-relative flex-grow-1">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Nhập tên sản phẩm..."
              value={searchInput}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              style={{ borderRadius: '12px', borderColor: '#000000', padding: '0.5rem 2rem 0.2rem 1rem', width: '100%' }}
            />
            {searchInput && (
              <button
                type="button"
                className="btn btn-outline-secondary position-absolute"
                style={{ right: searchLoading ? '35px' : '5px', top: '50%', transform: 'translateY(-50%)', padding: '2px 8px' }}
                onClick={handleClearSearch}
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
          </div>
          <button
            type="button"
            className="btn btn-primary shadow-sm"
            onClick={handleSearch}
            title="Tìm kiếm"
            disabled={searchLoading || !searchInput.trim()}
            style={{ padding: '0.5rem 1rem' }}
          >
            <FontAwesomeIcon icon={faSearch} style={{ fontSize: '1rem' }} /> Tìm kiếm
          </button>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-primary shadow-sm" onClick={handleAddProduct} title="Thêm Sản Phẩm">
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} /> Thêm sản phẩm
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
                MÃ SẢN PHẨM
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '20%' }}>
                TÊN SẢN PHẨM
              </th>
              <th scope="col" className="py-2 px-3" style={{ width: '10%' }}>
                TỔNG SỐ LƯỢNG
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
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '10%' }}>
                TRẠNG THÁI
              </th>
              <th scope="col" className="py-2 px-3 text-center" style={{ width: '15%' }}>
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff' }}>
            {products.length > 0 ? (
              products.map((product, index) => (
                <tr key={product.id} className="align-middle">
                  <td className="py-2 px-3 text-center">{index + 1 + currentPage * pageSize}</td>
                  <td className="py-2 px-3 fw-semibold">{product.ma}</td>
                  <td className="py-2 px-3">{product.ten}</td>
                  <td className="py-2 px-3">{product.totalQuantity || 0}</td>
                  <td className="py-2 px-3">{product.ngayTao?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{product.ngaySua?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3">{product.ngayXoa?.slice(0, 10) || '-'}</td>
                  <td className="py-2 px-3 text-center">
  {product.trangThai === 0 ? (
    <span className="badge bg-secondary rounded-pill px-2 py-1">
      {product.totalQuantity > 0 ? 'Tạm Ngưng' : 'Hết Hàng'}
    </span>
  ) : (
    <span className={`badge ${product.totalQuantity === 0 ? 'bg-danger' : 'bg-success'} rounded-pill px-2 py-1`}>
      {product.totalQuantity === 0 ? 'Hết Hàng' : 'Đang Kinh Doanh'}
    </span>
  )}
</td>

                  <td className="py-2 px-3 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(product, true)}
                        title="Xem chi tiết"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm rounded-circle"
                        onClick={() => handleViewOrEdit(product, false)}
                        title="Sửa"
                        style={{ width: '30px', height: '30px', padding: '0' }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle"
                        onClick={() => setConfirmModal({ open: true, id: product.id, currentStatus: product.trangThai })}
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
                  {searchTerm ? `Không tìm thấy sản phẩm phù hợp với "${searchTerm}"` : 'Không có sản phẩm nào'}
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
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} sản phẩm)
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
      {confirmModal.open && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal({ open: false, id: null, currentStatus: null })}
                />
              </div>
              <div className="modal-body">
                Bạn có chắc muốn thay đổi trạng thái sản phẩm sang "{confirmModal.currentStatus === 1 ? 'Hết Hàng' : 'Đang Bán'}"?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmModal({ open: false, id: null, currentStatus: null })}
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

export default Products;