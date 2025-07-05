import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSP, searchSPWithQuantity } from '../../../services/Admin/SanPhamAdminService';
import { addSanPhamCt, getHinhAnhByMauSacId } from '../../../services/Admin/SanPhamCTService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Định nghĩa BASE_URL và STATIC_URL riêng
const BASE_URL = 'http://localhost:8080/api'; // Dành cho API endpoint
const STATIC_URL = 'http://localhost:8080'; // Dành cho tài nguyên tĩnh (hình ảnh)

const DropdownField = ({ label, name, value, options, onChange, error, disabled, required }) => (
  <div className="mb-3">
    <label className="form-label fw-semibold text-dark">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <select
      className={`form-select shadow-sm ${error ? 'is-invalid' : ''}`}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      aria-label={`Chọn ${label.toLowerCase()}`}
      style={{ borderRadius: '8px', padding: '0.75rem' }}
    >
      <option value="">Chọn {label.toLowerCase()}...</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.ten || `Hình ${option.id}`}
        </option>
      ))}
    </select>
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

const AddProductWithDetailsPage = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    ten: '',
    trangThai: 1,
  });
  const [productErrors, setProductErrors] = useState({});
  const [productDetails, setProductDetails] = useState([
    {
      mauSacId: null,
      thuongHieuId: null,
      kichThuocId: null,
      xuatXuId: null,
      chatLieuId: null,
      hinhAnhMauSacId: null,
      giaNhap: null,
      giaBan: null,
      soLuong: null,
      moTa: '',
      trangThai: 1,
    },
  ]);
  const [detailErrors, setDetailErrors] = useState([{}]);
  const [dropdownData, setDropdownData] = useState({
    mauSac: [],
    thuongHieu: [],
    kichThuoc: [],
    xuatXu: [],
    chatLieu: [],
    hinhAnh: [],
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('warning');
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false });

  const fetchDropdownData = useCallback(async (signal) => {
    console.log('Fetching dropdown data...');
    try {
      setDropdownLoading(true);
      const [mauSacRes, thuongHieuRes, kichThuocRes, xuatXuRes, chatLieuRes] = await Promise.all([
        axios.get(`${BASE_URL}/mau-sac/active`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/thuong-hieu/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/kich-thuoc/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/xuat-xu/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/chat-lieu/all`, { params: { page: 0, size: 100 }, signal }),
      ]);
      setDropdownData({
        mauSac: mauSacRes.data.content || [],
        thuongHieu: thuongHieuRes.data.content || [],
        kichThuoc: kichThuocRes.data.content || [],
        xuatXu: xuatXuRes.data.content || [],
        chatLieu: chatLieuRes.data.content || [],
        hinhAnh: [],
      });
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log('Request bị hủy do AbortController hoặc Axios cancel');
        return;
      }
      console.error('Dropdown fetch error:', err);
      setAlertMessage(`Không thể tải dữ liệu dropdown: ${err.message}`);
      setAlertType('danger');
    } finally {
      setDropdownLoading(false);
      console.log('dropdownLoading set to false');
    }
  }, []);

  const fetchHinhAnhByMauSacId = useCallback(async (mauSacId, detailIndex) => {
    if (!mauSacId) {
      setDropdownData((prev) => {
        const newHinhAnh = [...prev.hinhAnh];
        newHinhAnh[detailIndex] = [];
        return { ...prev, hinhAnh: newHinhAnh };
      });
      return;
    }
    try {
      const response = await getHinhAnhByMauSacId(mauSacId);
      const hinhAnhList = response.map((hinhAnh) => ({
        ...hinhAnh,
        hinhAnh: hinhAnh.hinhAnh.startsWith('http') ? hinhAnh.hinhAnh : `${STATIC_URL}${hinhAnh.hinhAnh}`,
      }));
      setDropdownData((prev) => {
        const newHinhAnh = [...prev.hinhAnh];
        newHinhAnh[detailIndex] = hinhAnhList;
        return { ...prev, hinhAnh: newHinhAnh };
      });
      setProductDetails((prev) => {
        const newDetails = [...prev];
        if (!hinhAnhList.some((hinhAnh) => hinhAnh.id === newDetails[detailIndex].hinhAnhMauSacId)) {
          newDetails[detailIndex] = { ...newDetails[detailIndex], hinhAnhMauSacId: null };
        }
        return newDetails;
      });
    } catch (err) {
      console.error('Fetch hinh anh error:', err);
      setAlertMessage(`Không thể tải hình ảnh cho màu sắc: ${err.message}`);
      setAlertType('danger');
      setDropdownData((prev) => {
        const newHinhAnh = [...prev.hinhAnh];
        newHinhAnh[detailIndex] = [];
        return { ...prev, hinhAnh: newHinhAnh };
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDropdownData(controller.signal);
    return () => controller.abort();
  }, [fetchDropdownData]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const validateProduct = async () => {
    const errors = {};
    if (!productData.ten?.trim()) {
      errors.ten = 'Tên sản phẩm không được để trống';
    } else if (!/^[\p{L}\s]+$/u.test(productData.ten.trim())) {
      errors.ten = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    } else if (productData.ten.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
    } else {
      try {
        const response = await searchSPWithQuantity(productData.ten.trim(), 0, 10);
        const existingProducts = response.content || [];
        if (
          existingProducts.some(
            (p) =>
              p.sanPham.ten.toLowerCase() === productData.ten.trim().toLowerCase() &&
              p.sanPham.id !== productData.id
          )
        ) {
          errors.ten = 'Tên sản phẩm đã tồn tại';
        }
      } catch (err) {
        console.error('Product validation error:', err);
        errors.ten = 'Không thể kiểm tra tên sản phẩm';
      }
    }
    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDetail = (detail, index) => {
    const errors = {};
    if (!detail.mauSacId) errors.mauSacId = 'Màu sắc không được để trống';
    if (!detail.thuongHieuId) errors.thuongHieuId = 'Thương hiệu không được để trống';
    if (!detail.kichThuocId) errors.kichThuocId = 'Kích thước không được để trống';
    if (!detail.xuatXuId) errors.xuatXuId = 'Xuất xứ không được để trống';
    if (!detail.chatLieuId) errors.chatLieuId = 'Chất liệu không được để trống';
    if (!detail.giaBan || detail.giaBan <= 0) errors.giaBan = 'Giá bán phải lớn hơn 0';
    if (detail.soLuong === null || detail.soLuong < 0) errors.soLuong = 'Số lượng không được nhỏ hơn 0';
    if (detail.moTa && detail.moTa.length > 255) errors.moTa = 'Mô tả không được vượt quá 255 ký tự';

    const key = `${detail.mauSacId}-${detail.thuongHieuId}-${detail.kichThuocId}`;
    const duplicates = productDetails
      .map((d, i) => ({ ...d, index: i }))
      .filter((d, i) => i !== index && `${d.mauSacId}-${d.thuongHieuId}-${d.kichThuocId}` === key);
    if (duplicates.length > 0) {
      errors.combination = `Kết hợp màu sắc, thương hiệu, kích thước đã tồn tại ở chi tiết #${duplicates[0].index + 1}`;
    }

    setDetailErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = errors;
      return newErrors;
    });
    return Object.keys(errors).length === 0;
  };

  const handleAddDetail = () => {
    setProductDetails((prev) => [
      ...prev,
      {
        mauSacId: null,
        thuongHieuId: null,
        kichThuocId: null,
        xuatXuId: null,
        chatLieuId: null,
        hinhAnhMauSacId: null,
        giaNhap: null,
        giaBan: null,
        soLuong: null,
        moTa: '',
        trangThai: 1,
      },
    ]);
    setDetailErrors((prev) => [...prev, {}]);
    setDropdownData((prev) => ({
      ...prev,
      hinhAnh: [...prev.hinhAnh, []],
    }));
  };

  const handleRemoveDetail = (index) => {
    setProductDetails((prev) => prev.filter((_, i) => i !== index));
    setDetailErrors((prev) => prev.filter((_, i) => i !== index));
    setDropdownData((prev) => ({
      ...prev,
      hinhAnh: prev.hinhAnh.filter((_, i) => i !== index),
    }));
  };

  const handleDetailChange = (index, field, value) => {
    setProductDetails((prev) => {
      const newDetails = [...prev];
      const parsedValue = ['giaNhap', 'giaBan', 'soLuong'].includes(field)
        ? value
          ? parseFloat(value)
          : null
        : parseInt(value) || value || null;
      newDetails[index] = { ...newDetails[index], [field]: parsedValue };
      if (field === 'mauSacId') {
        fetchHinhAnhByMauSacId(parsedValue, index);
      }
      return newDetails;
    });
  };

  const handleImageSelect = (index, hinhAnhId) => {
    setProductDetails((prev) => {
      const newDetails = [...prev];
      newDetails[index] = { ...newDetails[index], hinhAnhMauSacId: hinhAnhId };
      return newDetails;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isProductValid = await validateProduct();
    const areDetailsValid = productDetails.every((detail, index) => validateDetail(detail, index));

    if (!isProductValid || !areDetailsValid) {
      setAlertMessage('Vui lòng kiểm tra lại thông tin nhập');
      setAlertType('danger');
      const firstErrorField = document.querySelector('.is-invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setConfirmModal({ open: true });
  };

  const confirmSave = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const productToSave = {
        ...productData,
        ma: `SP-${crypto.randomUUID().substring(0, 8)}`,
        ngayTao: now,
        ngaySua: now,
        ngayXoa: null,
      };

      const productResponse = await addSP(productToSave);
      const sanPhamId = productResponse?.id || productResponse?.data?.id;
      if (!sanPhamId) {
        throw new Error('Không nhận được ID sản phẩm từ server');
      }

      for (const detail of productDetails) {
        const detailToSave = {
          ...detail,
          sanPhamId,
          ngayTao: now,
          ngaySua: now,
          ngayXoa: detail.trangThai === 0 ? now : null,
          giaNhap: detail.giaNhap || 0,
          ma: `CT-${crypto.randomUUID().substring(0, 8)}`,
        };
        await addSanPhamCt(detailToSave);
      }

      setAlertMessage('Thêm sản phẩm và chi tiết thành công');
      setAlertType('success');
      setConfirmModal({ open: false });
      setTimeout(() => navigate('/admin/quan-ly-sp/san-pham'), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setAlertMessage(`Thao tác thất bại: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`);
      setAlertType('danger');
      setConfirmModal({ open: false });
    } finally {
      setLoading(false);
    }
  };

  if (dropdownLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p>Đang tải dữ liệu...</p>
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
          aria-label="Quay lại danh sách sản phẩm"
          style={{ borderRadius: '8px', padding: '0.5rem 1rem' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>
        <h1 className="text-center text-black fw-bold flex-grow-1" style={{ letterSpacing: '2px' }}>
          THÊM SẢN PHẨM
        </h1>
      </div>
      <form onSubmit={handleSave} noValidate>
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-light py-3">
            <h5 className="mb-0 fw-bold text-dark">Thông tin sản phẩm</h5>
          </div>
          <div className="card-body p-4">
            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">
                Tên Sản Phẩm <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control shadow-sm ${productErrors.ten ? 'is-invalid' : ''}`}
                value={productData.ten}
                onChange={(e) => setProductData({ ...productData, ten: e.target.value })}
                placeholder=""
                required
                style={{ borderRadius: '8px', padding: '0.75rem' }}
                aria-label="Tên sản phẩm"
              />
              {productErrors.ten && <div className="invalid-feedback">{productErrors.ten}</div>}
            </div>
          </div>
        </div>
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-dark">Chi tiết sản phẩm</h5>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleAddDetail}
              title="Thêm chi tiết sản phẩm"
              aria-label="Thêm chi tiết sản phẩm"
              style={{ borderRadius: '8px', padding: '0.5rem 1rem' }}
            >
              <FontAwesomeIcon icon={faPlus} /> Thêm chi tiết
            </button>
          </div>
          <div className="card-body p-4">
            {productDetails.map((detail, index) => (
              <div key={index} className="border rounded p-3 mb-3 bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-semibold text-dark">Chi tiết #{index + 1}</h6>
                  {productDetails.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      onClick={() => handleRemoveDetail(index)}
                      title="Xóa chi tiết"
                      aria-label="Xóa chi tiết sản phẩm"
                      style={{ width: '30px', height: '30px', padding: '0' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
                {detailErrors[index]?.combination && (
                  <div className="alert alert-danger mb-3 p-2" role="alert">
                    {detailErrors[index].combination}
                  </div>
                )}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Giá Nhập</label>
                      <input
                        type="number"
                        className="form-control shadow-sm"
                        value={detail.giaNhap || ''}
                        onChange={(e) => handleDetailChange(index, 'giaNhap', e.target.value)}
                        placeholder=""
                        min="0"
                        step="1000"
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                        aria-label="Giá nhập"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">
                        Giá Bán <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${detailErrors[index]?.giaBan ? 'is-invalid' : ''}`}
                        value={detail.giaBan || ''}
                        onChange={(e) => handleDetailChange(index, 'giaBan', e.target.value)}
                        placeholder=""
                        min="0"
                        step="1000"
                        required
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                        aria-label="Giá bán"
                      />
                      {detailErrors[index]?.giaBan && (
                        <div className="invalid-feedback">{detailErrors[index].giaBan}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">
                        Số Lượng <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${detailErrors[index]?.soLuong ? 'is-invalid' : ''}`}
                        value={detail.soLuong || ''}
                        onChange={(e) => handleDetailChange(index, 'soLuong', e.target.value)}
                        placeholder=""
                        min="0"
                        required
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                        aria-label="Số lượng"
                      />
                      {detailErrors[index]?.soLuong && (
                        <div className="invalid-feedback">{detailErrors[index].soLuong}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <DropdownField
                      label="Màu Sắc"
                      name="mauSacId"
                      value={detail.mauSacId}
                      options={dropdownData.mauSac}
                      onChange={(e) => handleDetailChange(index, 'mauSacId', e.target.value)}
                      error={detailErrors[index]?.mauSacId}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownField
                      label="Thương Hiệu"
                      name="thuongHieuId"
                      value={detail.thuongHieuId}
                      options={dropdownData.thuongHieu}
                      onChange={(e) => handleDetailChange(index, 'thuongHieuId', e.target.value)}
                      error={detailErrors[index]?.thuongHieuId}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownField
                      label="Kích Thước"
                      name="kichThuocId"
                      value={detail.kichThuocId}
                      options={dropdownData.kichThuoc}
                      onChange={(e) => handleDetailChange(index, 'kichThuocId', e.target.value)}
                      error={detailErrors[index]?.kichThuocId}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownField
                      label="Xuất Xứ"
                      name="xuatXuId"
                      value={detail.xuatXuId}
                      options={dropdownData.xuatXu}
                      onChange={(e) => handleDetailChange(index, 'xuatXuId', e.target.value)}
                      error={detailErrors[index]?.xuatXuId}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownField
                      label="Chất Liệu"
                      name="chatLieuId"
                      value={detail.chatLieuId}
                      options={dropdownData.chatLieu}
                      onChange={(e) => handleDetailChange(index, 'chatLieuId', e.target.value)}
                      error={detailErrors[index]?.chatLieuId}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <DropdownField
                      label="Hình Ảnh Màu Sắc"
                      name="hinhAnhMauSacId"
                      value={detail.hinhAnhMauSacId}
                      options={dropdownData.hinhAnh[index] || []}
                      onChange={(e) => handleDetailChange(index, 'hinhAnhMauSacId', e.target.value)}
                      error={detailErrors[index]?.hinhAnhMauSacId}
                    />
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Xem trước hình ảnh</label>
                      <div className="d-flex flex-wrap gap-2">
                        {(dropdownData.hinhAnh[index] || []).map((hinhAnh) => (
                          <div
                            key={hinhAnh.id}
                            className={`border p-1 rounded ${detail.hinhAnhMauSacId === hinhAnh.id ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', maxWidth: '100px' }}
                            onClick={() => handleImageSelect(index, hinhAnh.id)}
                          >
                            <img
                              src={hinhAnh.hinhAnh}
                              alt={hinhAnh.tenMauSac}
                              style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                            />
                          </div>
                        ))}
                        {(!dropdownData.hinhAnh[index] || dropdownData.hinhAnh[index].length === 0) && (
                          <p className="text-muted">Không có hình ảnh cho màu sắc này</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                     {/* <label className="form-label fw-semibold text-dark">Trạng Thái</label>
                      <select
                        className="form-select shadow-sm"
                        value={detail.trangThai}
                        onChange={(e) => handleDetailChange(index, 'trangThai', parseInt(e.target.value))}
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                        aria-label="Trạng thái sản phẩm chi tiết"
                      >
                        <option value={1}>Đang bán</option>
                        <option value={0}>Hết hàng</option>
                      </select> */}
                    </div>
                  </div> 
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Mô Tả</label>
                      <textarea
                        className={`form-control shadow-sm ${detailErrors[index]?.moTa ? 'is-invalid' : ''}`}
                        value={detail.moTa}
                        onChange={(e) => handleDetailChange(index, 'moTa', e.target.value)}
                        placeholder="Nhập mô tả sản phẩm..."
                        rows="3"
                        style={{ borderRadius: '8px', padding: '0.75rem' }}
                        aria-label="Mô tả sản phẩm chi tiết"
                      />
                      {detailErrors[index]?.moTa && (
                        <div className="invalid-feedback">{detailErrors[index].moTa}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-end gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin/quan-ly-sp/san-pham')}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
            aria-label="Hủy thêm sản phẩm"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || dropdownLoading}
            style={{ borderRadius: '8px', padding: '8px 20px' }}
            aria-label="Lưu sản phẩm và chi tiết"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              'Lưu'
            )}
          </button>
        </div>
      </form>
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
            aria-label="Đóng thông báo"
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
      {confirmModal.open && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal({ open: false })}
                  aria-label="Đóng"
                />
              </div>
              <div className="modal-body">
                Bạn có chắc muốn lưu sản phẩm và chi tiết này?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmModal({ open: false })}
                  style={{ borderRadius: '8px' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmSave}
                  disabled={loading}
                  style={{ borderRadius: '8px' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  ) : (
                    <><FontAwesomeIcon icon={faCheck} /> Xác nhận</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductWithDetailsPage;