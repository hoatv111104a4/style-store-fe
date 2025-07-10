import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSP } from '../../../services/Admin/SanPhamAdminService';
import { addSanPhamCt, getHinhAnhByMauSacId } from '../../../services/Admin/SanPhamCTService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faArrowLeft, faCheck, faImage } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CreatableSelect from 'react-select';

// Định nghĩa BASE_URL và STATIC_URL
const BASE_URL = 'http://localhost:8080/api';
const STATIC_URL = 'http://localhost:8080';

// Hàm định dạng tiền tệ VND
const formatVND = (value) => {
  if (!value || isNaN(value)) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
};

// Hàm chuyển đổi chuỗi VND thành số
const parseVND = (value) => {
  if (!value) return null;
  const cleanedValue = value.replace(/[^0-9]/g, '');
  return cleanedValue ? parseFloat(cleanedValue) : null;
};

const DropdownField = ({
  label,
  name,
  value,
  options,
  onChange,
  onCreateOption,
  error,
  disabled,
  required,
  showImageButton,
  onImageButtonClick,
  onPlusButtonClick,
}) => (
  <div className="mb-3 position-relative" style={{ minWidth: '300px', width: '100%' }}>
    <label className="form-label fw-semibold text-dark">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <div className="d-flex align-items-center" style={{ width: '100%', overflow: 'visible' }}>
      <CreatableSelect
        isClearable
        isDisabled={disabled}
        value={
          value && options.find((opt) => opt.id === value)
            ? { value, label: options.find((opt) => opt.id === value).ten || '' }
            : null
        }
        onChange={(selectedOption) => {
          console.log('DropdownField onChange:', { name, value: selectedOption ? selectedOption.value : '' }); // Debug
          onChange({ target: { name, value: selectedOption ? selectedOption.value : '' } });
        }}
        onCreateOption={(inputValue) => {
          console.log('onCreateOption triggered:', inputValue); // Debug
          onCreateOption(inputValue);
        }}
        options={options.map((option) => ({
          value: option.id,
          label: option.ten || `Hình ${option.id}`,
        }))}
        placeholder={options.length > 0 ? `Chọn hoặc nhập ${label.toLowerCase()}...` : `Không có ${label.toLowerCase()} khả dụng`}
        className={error ? 'is-invalid' : ''}
        isValidNewOption={(inputValue, selectValue, selectOptions) => {
          const isValid =
            inputValue.trim().length > 0 &&
            !selectOptions.some((option) => {
              const isMatch = option.label.toLowerCase() === inputValue.trim().toLowerCase();
              console.log('Checking option:', { label: option.label, inputValue, isMatch }); // Debug
              return isMatch;
            });
          console.log('isValidNewOption:', { inputValue, isValid, selectOptions: selectOptions.map(opt => opt.label) }); // Debug
          return isValid;
        }}
        formatCreateLabel={(inputValue) => `Thêm nhanh "${inputValue.trim()}"`}
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '8px',
            padding: '0.25rem',
            boxShadow: error ? '0 0 0 0.2rem rgba(220, 53, 69, 0.25)' : 'none',
            borderColor: error ? '#dc3545' : base.borderColor,
            minWidth: '250px',
            flex: '1 1 auto',
            minHeight: '38px',
            whiteSpace: 'normal !important',
            wordBreak: 'break-word !important',
            overflow: 'visible !important',
          }),
          menu: (base) => ({
            ...base,
            zIndex: 1050,
            width: 'auto',
            minWidth: '250px',
            whiteSpace: 'normal !important',
            wordBreak: 'break-word !important',
          }),
          option: (base) => ({
            ...base,
            whiteSpace: 'normal !important',
            wordBreak: 'break-word !important',
            padding: '8px 12px',
          }),
          singleValue: (base) => ({
            ...base,
            whiteSpace: 'normal !important',
            wordBreak: 'break-word !important',
            maxWidth: 'none !important',
            overflow: 'visible !important',
            display: 'block',
          }),
          input: (base) => ({
            ...base,
            whiteSpace: 'normal !important',
            wordBreak: 'break-word !important',
          }),
        }}
      />
      {showImageButton && (
        <button
          type="button"
          className="btn btn-outline-primary ms-2"
          onClick={onImageButtonClick}
          disabled={!value}
          title="Chọn hình ảnh"
          aria-label="Chọn hình ảnh cho màu sắc"
          style={{ borderRadius: '8px', padding: '0.5rem' }}
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
      )}
      <button
        type="button"
        className="btn btn-outline-success ms-2"
        onClick={onPlusButtonClick}
        title={`Thêm nhanh ${label.toLowerCase()}`}
        aria-label={`Thêm nhanh ${label.toLowerCase()}`}
        style={{ borderRadius: '8px', padding: '0.5rem' }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
    {error && <div className="invalid-feedback" style={{ display: 'block' }}>{error}</div>}
  </div>
);

const AddProductWithDetailsPage = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    ten: '',
    trangThai: 1,
    id: null,
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
    sanPham: [],
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
  const [imageModal, setImageModal] = useState({ open: false, detailIndex: null });
  const [newAttributeModal, setNewAttributeModal] = useState({
    open: false,
    attributeType: '',
    inputValue: '',
    moTa: '',
    detailIndex: null,
  });

  const fetchDropdownData = useCallback(async (signal) => {
    console.log('Fetching dropdown data...');
    try {
      setDropdownLoading(true);
      const [sanPhamRes, mauSacRes, thuongHieuRes, kichThuocRes, xuatXuRes, chatLieuRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin-san-pham/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/mau-sac/active`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/thuong-hieu/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/kich-thuoc/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/xuat-xu/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/chat-lieu/all`, { params: { page: 0, size: 100 }, signal }),
      ]);

      const newDropdownData = {
        sanPham: sanPhamRes.data.content || [],
        mauSac: mauSacRes.data.content || [],
        thuongHieu: thuongHieuRes.data.content || [],
        kichThuoc: kichThuocRes.data.content || [],
        xuatXu: xuatXuRes.data.content || [],
        chatLieu: chatLieuRes.data.content || [],
        hinhAnh: [],
      };

      // Kiểm tra dữ liệu trùng lặp
      Object.keys(newDropdownData).forEach((key) => {
        if (key !== 'hinhAnh') {
          const duplicates = newDropdownData[key].filter(
            (item, index, self) => self.findIndex((i) => i.ten.toLowerCase() === item.ten.toLowerCase()) !== index
          );
          if (duplicates.length > 0) {
            console.warn(`Duplicate entries in ${key}:`, duplicates);
            setAlertMessage(`Danh sách ${key} chứa các mục trùng lặp: ${duplicates.map(d => d.ten).join(', ')}`);
            setAlertType('warning');
          }
        }
      });

      console.log('Dropdown data:', newDropdownData);
      setDropdownData(newDropdownData);

      // Kiểm tra danh sách rỗng
      Object.keys(newDropdownData).forEach((key) => {
        if (key !== 'hinhAnh' && newDropdownData[key].length === 0) {
          setAlertMessage(`Danh sách ${key} trống. Vui lòng kiểm tra API hoặc thêm mới.`);
          setAlertType('warning');
        }
      });
    } catch (err) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log('Request bị hủy do AbortController hoặc Axios cancel');
        return;
      }
      console.error('Dropdown fetch error:', err.response?.data || err.message);
      setAlertMessage(`Không thể tải dữ liệu dropdown: ${err.response?.data?.message || err.message}`);
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
    if (window.bootstrap && window.bootstrap.Tooltip) {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }, [dropdownData, productDetails]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const validateProduct = async () => {
    const errors = {};
    const trimmedName = productData.ten?.trim() || '';

    if (!trimmedName) {
      errors.ten = 'Tên sản phẩm không được để trống';
    } else if (!/^[\p{L}\s-]+$/u.test(trimmedName)) {
      errors.ten = 'Tên chỉ được chứa chữ cái, khoảng trắng hoặc dấu gạch ngang';
    } else if (trimmedName.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
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

    if (!detail.giaNhap || isNaN(detail.giaNhap) || detail.giaNhap <= 0) {
      errors.giaNhap = 'Giá nhập phải lớn hơn 0';
    }

    if (!detail.giaBan || isNaN(detail.giaBan) || detail.giaBan <= 0) {
      errors.giaBan = 'Giá bán phải lớn hơn 0';
    }

    if (detail.soLuong === null || isNaN(detail.soLuong) || detail.soLuong < 0) {
      errors.soLuong = 'Số lượng không được nhỏ hơn 0';
    }

    if (detail.moTa && detail.moTa.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }

    if (detail.mauSacId && detail.thuongHieuId && detail.kichThuocId) {
      const key = `${detail.mauSacId}-${detail.thuongHieuId}-${detail.kichThuocId}`;
      const duplicates = productDetails
        .map((d, i) => ({ ...d, index: i }))
        .filter((d, i) => i !== index && `${d.mauSacId}-${d.thuongHieuId}-${d.kichThuocId}` === key);
      if (duplicates.length > 0) {
        errors.combination = `Kết hợp màu sắc, thương hiệu, kích thước đã tồn tại ở chi tiết #${duplicates[0].index + 1}`;
      }
    }

    setDetailErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = errors;
      return newErrors;
    });
    return Object.keys(errors).length === 0;
  };

  const validateNewAttributeModal = () => {
    const errors = {};
    if (!newAttributeModal.inputValue || newAttributeModal.inputValue.trim().length > 50) {
      errors.inputValue = `Tên ${newAttributeModal.attributeType} không hợp lệ hoặc vượt quá 50 ký tự`;
    }
    if (newAttributeModal.moTa && newAttributeModal.moTa.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }
    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenNewAttributeModal = (attributeType, inputValue, index) => {
    console.log('Opening new attribute modal:', { attributeType, inputValue, index }); // Debug
    setNewAttributeModal({
      open: true,
      attributeType,
      inputValue: inputValue.trim(),
      moTa: '',
      detailIndex: index,
    });
  };

  const handleCreateAttribute = async () => {
    if (!validateNewAttributeModal()) {
      setAlertMessage(`Vui lòng kiểm tra lại thông tin ${newAttributeModal.attributeType}`);
      setAlertType('danger');
      return;
    }

    const normalizedInput = newAttributeModal.inputValue.trim().toLowerCase();
    const existingItem = dropdownData[newAttributeModal.attributeType].find(
      (item) => item.ten.toLowerCase() === normalizedInput
    );
    if (existingItem) {
      setAlertMessage(
        `${newAttributeModal.attributeType} "${newAttributeModal.inputValue}" đã tồn tại (ID: ${existingItem.id}). Vui lòng chọn từ danh sách hoặc nhập giá trị khác.`
      );
      setAlertType('warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/${newAttributeModal.attributeType}`, {
        ten: newAttributeModal.inputValue,
        moTa: newAttributeModal.moTa || null,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const newItem = response.data;

      console.log('Created new item:', newItem); // Debug

      setDropdownData((prev) => ({
        ...prev,
        [newAttributeModal.attributeType]: [...prev[newAttributeModal.attributeType], newItem],
      }));

      setProductDetails((prev) => {
        const newDetails = [...prev];
        if (newAttributeModal.detailIndex !== null) {
          newDetails[newAttributeModal.detailIndex] = {
            ...newDetails[newAttributeModal.detailIndex],
            [`${newAttributeModal.attributeType}Id`]: newItem.id,
          };
          if (newAttributeModal.attributeType === 'mauSac') {
            fetchHinhAnhByMauSacId(newItem.id, newAttributeModal.detailIndex);
          }
        }
        return newDetails;
      });

      if (newAttributeModal.attributeType === 'sanPham') {
        setProductData((prev) => {
          const newData = { ...prev, id: newItem.id, ten: newItem.ten };
          console.log('Updated productData:', newData); // Debug
          return newData;
        });
      }

      setAlertMessage(`Thêm ${newAttributeModal.attributeType} "${newAttributeModal.inputValue}" thành công`);
      setAlertType('success');
      setNewAttributeModal({ open: false, attributeType: '', inputValue: '', moTa: '', detailIndex: null });
    } catch (err) {
      console.error(`Add ${newAttributeModal.attributeType} error:`, err.response?.data || err.message);
      setAlertMessage(`Thêm ${newAttributeModal.attributeType} thất bại: ${err.response?.data?.message || err.message}`);
      setAlertType('danger');
    } finally {
      setLoading(false);
    }
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
      let parsedValue = value;
      if (['giaNhap', 'giaBan'].includes(field)) {
        parsedValue = parseVND(value);
      } else if (['soLuong'].includes(field)) {
        parsedValue = value && !isNaN(value) ? parseInt(value) : null;
      } else if (['mauSacId', 'thuongHieuId', 'kichThuocId', 'xuatXuId', 'chatLieuId', 'hinhAnhMauSacId'].includes(field)) {
        parsedValue = value ? parseInt(value) : null;
      } else {
        parsedValue = value || '';
      }
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
    setImageModal({ open: false, detailIndex: null });
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
      console.error('Save error:', err.response?.data || err.message);
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
              <DropdownField
                label="Tên Sản Phẩm"
                name="ten"
                value={productData.id || null}
                options={dropdownData.sanPham}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedProduct = dropdownData.sanPham.find(opt => opt.id === selectedId);
                  setProductData({ 
                    ...productData, 
                    id: selectedId, 
                    ten: selectedProduct ? selectedProduct.ten : '' 
                  });
                  console.log('Selected product:', { id: selectedId, ten: selectedProduct?.ten }); // Debug
                }}
                onCreateOption={(inputValue) => handleOpenNewAttributeModal('sanPham', inputValue, null)}
                onPlusButtonClick={() => handleOpenNewAttributeModal('sanPham', '', null)}
                error={productErrors.ten}
                required
              />
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
            {productDetails.map((detail, index) => {
              const selectedImage = detail.hinhAnhMauSacId
                ? (dropdownData.hinhAnh[index] || []).find((hinhAnh) => hinhAnh.id === detail.hinhAnhMauSacId)
                : null;

              return (
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
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          Giá Nhập <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control shadow-sm ${detailErrors[index]?.giaNhap ? 'is-invalid' : ''}`}
                          value={formatVND(detail.giaNhap)}
                          onChange={(e) => handleDetailChange(index, 'giaNhap', e.target.value)}
                          placeholder="0 VND"
                          style={{ borderRadius: '8px', padding: '0.75rem' }}
                          aria-label="Giá nhập"
                        />
                        {detailErrors[index]?.giaNhap && (
                          <div className="invalid-feedback">{detailErrors[index].giaNhap}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          Giá Bán <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control shadow-sm ${detailErrors[index]?.giaBan ? 'is-invalid' : ''}`}
                          value={formatVND(detail.giaBan)}
                          onChange={(e) => handleDetailChange(index, 'giaBan', e.target.value)}
                          placeholder="0 VND"
                          required
                          style={{ borderRadius: '8px', padding: '0.75rem' }}
                          aria-label="Giá bán"
                        />
                        {detailErrors[index]?.giaBan && (
                          <div className="invalid-feedback">{detailErrors[index].giaBan}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
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
                    <div className="col-12 col-md-6">
                      <DropdownField
                        label="Màu Sắc"
                        name="mauSacId"
                        value={detail.mauSacId}
                        options={dropdownData.mauSac}
                        onChange={(e) => handleDetailChange(index, 'mauSacId', e.target.value)}
                        onCreateOption={(inputValue) => handleOpenNewAttributeModal('mauSac', inputValue, index)}
                        onPlusButtonClick={() => handleOpenNewAttributeModal('mauSac', '', index)}
                        error={detailErrors[index]?.mauSacId}
                        required
                        showImageButton
                        onImageButtonClick={() => setImageModal({ open: true, detailIndex: index })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <DropdownField
                        label="Thương Hiệu"
                        name="thuongHieuId"
                        value={detail.thuongHieuId}
                        options={dropdownData.thuongHieu}
                        onChange={(e) => handleDetailChange(index, 'thuongHieuId', e.target.value)}
                        onCreateOption={(inputValue) => handleOpenNewAttributeModal('thuongHieu', inputValue, index)}
                        onPlusButtonClick={() => handleOpenNewAttributeModal('thuongHieu', '', index)}
                        error={detailErrors[index]?.thuongHieuId}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <DropdownField
                        label="Kích Thước"
                        name="kichThuocId"
                        value={detail.kichThuocId}
                        options={dropdownData.kichThuoc}
                        onChange={(e) => handleDetailChange(index, 'kichThuocId', e.target.value)}
                        onCreateOption={(inputValue) => handleOpenNewAttributeModal('kichThuoc', inputValue, index)}
                        onPlusButtonClick={() => handleOpenNewAttributeModal('kichThuoc', '', index)}
                        error={detailErrors[index]?.kichThuocId}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <DropdownField
                        label="Xuất Xứ"
                        name="xuatXuId"
                        value={detail.xuatXuId}
                        options={dropdownData.xuatXu}
                        onChange={(e) => handleDetailChange(index, 'xuatXuId', e.target.value)}
                        onCreateOption={(inputValue) => handleOpenNewAttributeModal('xuatXu', inputValue, index)}
                        onPlusButtonClick={() => handleOpenNewAttributeModal('xuatXu', '', index)}
                        error={detailErrors[index]?.xuatXuId}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <DropdownField
                        label="Chất Liệu"
                        name="chatLieuId"
                        value={detail.chatLieuId}
                        options={dropdownData.chatLieu}
                        onChange={(e) => handleDetailChange(index, 'chatLieuId', e.target.value)}
                        onCreateOption={(inputValue) => handleOpenNewAttributeModal('chatLieu', inputValue, index)}
                        onPlusButtonClick={() => handleOpenNewAttributeModal('chatLieu', '', index)}
                        error={detailErrors[index]?.chatLieuId}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">Hình ảnh đã chọn</label>
                        {selectedImage ? (
                          <div
                            className="border p-1 rounded border-primary"
                            style={{ maxWidth: '100px' }}
                          >
                            <img
                              src={selectedImage.hinhAnh}
                              alt={selectedImage.tenMauSac}
                              style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                              onError={(e) => (e.target.src = '/default-image.jpg')}
                            />
                          </div>
                        ) : (
                          <p className="text-muted">Chưa chọn hình ảnh</p>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
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
              );
            })}
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
      {newAttributeModal.open && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm nhanh {newAttributeModal.attributeType}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNewAttributeModal({ open: false, attributeType: '', inputValue: '', moTa: '', detailIndex: null })}
                  aria-label="Đóng"
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">
                    Tên {newAttributeModal.attributeType} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control shadow-sm ${productErrors.inputValue ? 'is-invalid' : ''}`}
                    value={newAttributeModal.inputValue}
                    onChange={(e) => setNewAttributeModal({ ...newAttributeModal, inputValue: e.target.value })}
                    placeholder={`Nhập tên ${newAttributeModal.attributeType}...`}
                    style={{ borderRadius: '8px', padding: '0.75rem' }}
                    aria-label={`Tên ${newAttributeModal.attributeType}`}
                  />
                  {productErrors.inputValue && <div className="invalid-feedback">{productErrors.inputValue}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">Mô Tả</label>
                  <textarea
                    className={`form-control shadow-sm ${productErrors.moTa ? 'is-invalid' : ''}`}
                    value={newAttributeModal.moTa}
                    onChange={(e) => setNewAttributeModal({ ...newAttributeModal, moTa: e.target.value })}
                    placeholder={`Nhập mô tả ${newAttributeModal.attributeType}...`}
                    rows="3"
                    style={{ borderRadius: '8px', padding: '0.75rem' }}
                    aria-label={`Mô tả ${newAttributeModal.attributeType}`}
                  />
                  {productErrors.moTa && <div className="invalid-feedback">{productErrors.moTa}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setNewAttributeModal({ open: false, attributeType: '', inputValue: '', moTa: '', detailIndex: null })}
                  style={{ borderRadius: '8px' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateAttribute}
                  disabled={loading}
                  style={{ borderRadius: '8px' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  ) : (
                    'Thêm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {imageModal.open && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chọn hình ảnh cho màu sắc</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setImageModal({ open: false, detailIndex: null })}
                  aria-label="Đóng"
                />
              </div>
              <div className="modal-body">
                {(dropdownData.hinhAnh[imageModal.detailIndex] || []).length > 0 ? (
                  <div className="row">
                    {(dropdownData.hinhAnh[imageModal.detailIndex] || []).map((hinhAnh) => (
                      <div key={hinhAnh.id} className="col-4 mb-3">
                        <div
                          className="border p-2 rounded cursor-pointer"
                          onClick={() => handleImageSelect(imageModal.detailIndex, hinhAnh.id)}
                          style={{ borderColor: hinhAnh.id === productDetails[imageModal.detailIndex]?.hinhAnhMauSacId ? '#0d6efd' : '#dee2e6' }}
                        >
                          <img
                            src={hinhAnh.hinhAnh}
                            alt={hinhAnh.tenMauSac}
                            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                            onError={(e) => (e.target.src = '/default-image.jpg')}
                          />
                          <p className="text-center mt-1">{hinhAnh.tenMauSac}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">Không có hình ảnh nào cho màu sắc này.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImageModal({ open: false, detailIndex: null })}
                  style={{ borderRadius: '8px' }}
                >
                  Đóng
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