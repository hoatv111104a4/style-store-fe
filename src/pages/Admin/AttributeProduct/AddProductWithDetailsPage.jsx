import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getSanPhamCtBySanPhamId,
  addSanPhamCt,
  updateSanPhamCt,
  deleteSanPhamCt,
  searchSanPhamCtByMa,
  filterSanPhamCt,
  axiosPublicInstance,
} from '../../../services/Admin/SanPhamCTService';
import { getHinhAnhByMauSacId, uploadHinhAnhMauSac } from '../../../services/Admin/HinhAnhMauSacService';
import {
  Box,
  Button,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  useMediaQuery,
  styled,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Define BASE_URL and STATIC_URL
const BASE_URL = 'http://localhost:8080/api';
const STATIC_URL = 'http://localhost:8080';
const DEFAULT_IMAGE = '/default-image.jpg';

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

// Generate unique hex code
const generateUniqueHex = (existingCodes) => {
  let newHex;
  let isUnique = false;
  const maxAttempts = 100;
  let attempts = 0;

  while (!isUnique && attempts < maxAttempts) {
    newHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()}`;
    isUnique = !existingCodes.includes(newHex);
    attempts++;
  }
  if (!isUnique) throw new Error('Không thể tạo mã hex duy nhất sau nhiều lần thử.');
  return newHex;
};

// Validate hex code
const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

// Format VND currency
const formatVND = (value) => {
  if (!value || isNaN(value)) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value).replace('₫', '').trim();
};

// Parse VND string to number
const parseVND = (value) => {
  if (!value) return null;
  const cleanedValue = value.replace(/[^0-9]/g, '');
  return cleanedValue ? parseFloat(cleanedValue) : null;
};

// Custom styled button
const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff8800',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#ff9900',
  },
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(255,136,0,0.08)',
}));

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
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  // Determine if the input value matches any existing option
  const isInputValid = inputValue && !options.some(opt => opt.ten.toLowerCase() === inputValue.trim().toLowerCase());
  // Add "Thêm nhanh" option if input doesn't match any existing option
  const augmentedOptions = isInputValid
    ? [...options, { id: 'add-new', ten: `Thêm nhanh "${inputValue}"` }]
    : options;

  return (
    <Box mb={2} sx={{ minWidth: 300, width: '100%' }}>
      <Typography variant="body2" fontWeight={600} color="#222" mb={0.5}>
        {label} {required && <span style={{ color: '#e53935' }}>*</span>}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Autocomplete
          disabled={disabled}
          value={options.find((opt) => opt.id === value) || null}
          onChange={(event, newValue) => {
            if (newValue && newValue.id === 'add-new') {
              onCreateOption(inputValue);
            } else {
              onChange({ target: { name, value: newValue ? newValue.id : '' } });
            }
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={augmentedOptions}
          getOptionLabel={(option) => option.ten || `Hình ${option.id}`}
          isOptionEqualToValue={(option, val) => option.id === val.id}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={options.length > 0 ? `Chọn hoặc nhập ${label.toLowerCase()}...` : `Không có ${label.toLowerCase()} khả dụng`}
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                },
              }}
            />
          )}
          sx={{ flex: 1 }}
          freeSolo={!!onCreateOption}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest} style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {option.ten}
                {name === 'mauSacId' && option.ma && (
                  <>
                    {' '}
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        width: 16,
                        height: 16,
                        backgroundColor: isValidHex(option.ma) ? option.ma : '#000000',
                        border: '1px solid #ccc',
                        borderRadius: '50%',
                        verticalAlign: 'middle',
                        marginLeft: 1,
                      }}
                    />
                    <span style={{ marginLeft: 4 }}>{option.ma}</span>
                  </>
                )}
              </li>
            );
          }}
        />
        {showImageButton && (
          <IconButton
            sx={{
              color: '#1976d2',
              bgcolor: '#f4f8fd',
              borderRadius: '50%',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: '#e3f2fd', color: '#0d47a1' },
            }}
            onClick={onImageButtonClick}
            disabled={!value}
            title="Chọn hình ảnh"
          >
            <ImageIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

const AddProductWithDetailsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      giaBanGoc: null,
      soLuong: null,
      moTa: '',
      trangThai: 1,
      ma: `CT-${crypto.randomUUID().substring(0, 8)}`,
      imagePreview: null,
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
    hinhAnhMauSac: [],
    trangThai: [
      { id: 1, ten: 'Hoạt Động' },
      { id: 0, ten: 'Hết Hàng' },
    ],
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [imageModal, setImageModal] = useState({ open: false, detailIndex: null });
  const [newAttributeModal, setNewAttributeModal] = useState({
    open: false,
    attributeType: '',
    inputValue: '',
    moTa: '',
    detailIndex: null,
    ma: '',
  });
  const imageCache = new Map();

  const fetchDropdownData = useCallback(async (signal) => {
    try {
      setDropdownLoading(true);
      const [sanPhamRes, mauSacRes, thuongHieuRes, kichThuocRes, xuatXuRes, chatLieuRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin-san-pham/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/mau-sac/active`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/thuong-hieu/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/kich-thuoc/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/xuat-xu/all`, { params: { page: 0, size: 100 }, signal }),
        axios.get(`${BASE_URL}/chat-lieu/active`, { params: { page: 0, size: 100 }, signal }),
      ]);

      const newDropdownData = {
        sanPham: sanPhamRes.data.content || [],
        mauSac: (mauSacRes.data.content || []).map(item => ({
          id: item.id,
          ten: item.ten,
          ma: item.ma || '',
        })),
        thuongHieu: thuongHieuRes.data.content || [],
        kichThuoc: kichThuocRes.data.content || [],
        xuatXu: xuatXuRes.data.content || [],
        chatLieu: chatLieuRes.data.content || [],
        hinhAnhMauSac: [],
        trangThai: [
          { id: 1, ten: 'Hoạt Động' },
          { id: 0, ten: 'Hết Hàng' },
        ],
      };

      setDropdownData(newDropdownData);

      Object.keys(newDropdownData).forEach((key) => {
        if (key !== 'hinhAnhMauSac' && key !== 'trangThai' && newDropdownData[key].length === 0) {
          setAlertMessage(`Danh sách ${key} trống. Vui lòng kiểm tra API hoặc thêm mới.`);
          setAlertType('error');
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        // console.error('Error fetching dropdown data:', err.response?.data || err.message);
        // setAlertMessage(`Không thể tải dữ liệu dropdown: ${err.response?.data?.message || err.message}`);
        // setAlertType('error');
      }
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  const fetchHinhAnhByMauSacId = useCallback(async (mauSacId, detailIndex) => {
    if (!mauSacId) return;
    if (imageCache.has(mauSacId)) {
      const cachedImages = imageCache.get(mauSacId);
      setDropdownData((prev) => ({
        ...prev,
        hinhAnhMauSac: [
          ...prev.hinhAnhMauSac.filter((img) => img.mauSacId !== mauSacId),
          ...cachedImages,
        ],
      }));
      return;
    }

    try {
      setImageLoading(true);
      const response = await getHinhAnhByMauSacId(mauSacId);
      const images = response || [];
      imageCache.set(mauSacId, images);
      setDropdownData((prev) => ({
        ...prev,
        hinhAnhMauSac: [
          ...prev.hinhAnhMauSac.filter((img) => img.mauSacId !== mauSacId),
          ...images,
        ],
      }));
    } catch (err) {
      console.error(`Error fetching images for mauSacId ${mauSacId}:`, err);
      setAlertMessage(`Không thể tải hình ảnh: ${err.message}`);
      setAlertType('error');
    } finally {
      setImageLoading(false);
    }
  }, []);

  const handleImageUpload = async (e, detailIndex) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('Vui lòng chọn một file hình ảnh');
      return;
    }
    if (!productDetails[detailIndex].mauSacId) {
      toast.error('Vui lòng chọn màu sắc trước khi tải ảnh');
      return;
    }
    // Client-side file validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ định dạng .jpg, .png, .gif');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setImageLoading(true);
      const mauSacId = productDetails[detailIndex].mauSacId;
      const response = await uploadHinhAnhMauSac(file, mauSacId);
      // Normalize URL to match backend convention
      const imageUrl = response.hinhAnh.startsWith('/uploads/')
        ? `${STATIC_URL}${response.hinhAnh}`
        : `${STATIC_URL}/uploads/${response.hinhAnh}`;

      const newImage = {
        id: response.id,
        hinhAnh: imageUrl,
        mauSacId,
        tenMauSac: dropdownData.mauSac.find((ms) => ms.id === mauSacId)?.ten || '',
      };

      // Update dropdownData.hinhAnhMauSac
      setDropdownData((prev) => ({
        ...prev,
        hinhAnhMauSac: [
          ...prev.hinhAnhMauSac.filter((img) => img.id !== newImage.id),
          newImage,
        ],
      }));

      // Update productDetails for the specific index
      setProductDetails((prev) => {
        const newDetails = [...prev];
        newDetails[detailIndex] = {
          ...newDetails[detailIndex],
          hinhAnhMauSacId: response.id,
          imagePreview: imageUrl,
        };
        return newDetails;
      });

      // Update imageCache
      imageCache.set(mauSacId, [
        ...(imageCache.get(mauSacId) || []).filter((img) => img.id !== newImage.id),
        newImage,
      ]);

      // Refresh image list to ensure consistency
      await fetchHinhAnhByMauSacId(mauSacId, detailIndex);

      toast.success('Tải ảnh lên thành công');
    } catch (err) {
      console.error(`Error uploading image for mauSacId ${productDetails[detailIndex].mauSacId}:`, {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error(`Tải ảnh thất bại: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDropdownData(controller.signal);
    return () => controller.abort();
  }, [fetchDropdownData]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
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

    if (!detail.ma?.trim()) errors.ma = 'Mã sản phẩm chi tiết không được để trống';
    if (!detail.mauSacId) errors.mauSacId = 'Màu sắc không được để trống';
    if (!detail.thuongHieuId) errors.thuongHieuId = 'Thương hiệu không được để trống';
    if (!detail.kichThuocId) errors.kichThuocId = 'Kích thước không được để trống';
    if (!detail.xuatXuId) errors.xuatXuId = 'Xuất xứ không được để trống';
    if (!detail.chatLieuId) errors.chatLieuId = 'Chất liệu không được để trống';
    if (!detail.giaNhap || isNaN(detail.giaNhap) || detail.giaNhap <= 0) {
      errors.giaNhap = 'Giá nhập phải lớn hơn 0';
    }
    if (!detail.giaBanGoc || isNaN(detail.giaBanGoc) || detail.giaBanGoc <= 0) {
      errors.giaBanGoc = 'Giá bán gốc phải lớn hơn 0';
    }
    if (detail.soLuong === null || isNaN(detail.soLuong) || detail.soLuong < 0) {
      errors.soLuong = 'Số lượng không được nhỏ hơn 0';
    }
    if (detail.trangThai === 0 && detail.soLuong !== 0) {
      errors.trangThai = 'Trạng thái Hết Hàng chỉ áp dụng khi số lượng bằng 0';
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
        toast.error(`Sản phẩm chi tiết #${index + 1}: Kết hợp màu sắc, thương hiệu, kích thước đã tồn tại ở chi tiết #${duplicates[0].index + 1}. Vui lòng chọn các thuộc tính khác.`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
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
    } else if (!newAttributeModal.inputValue.trim().match(/^[\p{L}\s]+$/u)) {
      errors.inputValue = `Tên ${newAttributeModal.attributeType} chỉ được chứa chữ cái và khoảng trắng`;
    } else if (newAttributeModal.attributeType === 'mauSac') {
      const existingColors = dropdownData.mauSac;
      const isDuplicate = existingColors.some(
        (color) => color.ten.toLowerCase() === newAttributeModal.inputValue.trim().toLowerCase()
      );
      if (isDuplicate) {
        errors.inputValue = `Tên màu sắc "${newAttributeModal.inputValue}" đã tồn tại`;
      }
    }
    if (newAttributeModal.moTa && newAttributeModal.moTa.length > 255) {
      errors.moTa = `Mô tả ${newAttributeModal.attributeType} không được vượt quá 255 ký tự`;
    }
    if (newAttributeModal.attributeType === 'mauSac' && (!newAttributeModal.ma || !isValidHex(newAttributeModal.ma))) {
      errors.ma = 'Mã màu phải là mã hex hợp lệ (VD: #FF0000)';
    } else if (newAttributeModal.attributeType === 'mauSac') {
      const existingCodes = dropdownData.mauSac.map((c) => c.ma);
      if (existingCodes.includes(newAttributeModal.ma)) {
        errors.ma = 'Mã hex đã tồn tại';
      }
    }
    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenNewAttributeModal = (attributeType, inputValue, index) => {
    const existingCodes = dropdownData.mauSac.map((c) => c.ma);
    const newHex = attributeType === 'mauSac' ? (colorMap[inputValue.trim().toLowerCase()] || generateUniqueHex(existingCodes)) : '';
    setNewAttributeModal({
      open: true,
      attributeType,
      inputValue: inputValue.trim(),
      moTa: '',
      detailIndex: index,
      ma: newHex.toUpperCase(),
    });
  };

  const handleCreateAttribute = async () => {
    if (!validateNewAttributeModal()) {
      toast.error(`Vui lòng kiểm tra lại thông tin ${newAttributeModal.attributeType}`, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      return;
    }

    try {
      setLoading(true);
      const endpointMap = {
        sanPham: `${BASE_URL}/admin-san-pham`,
        mauSac: `${BASE_URL}/mau-sac`,
        thuongHieu: `${BASE_URL}/thuong-hieu`,
        kichThuoc: `${BASE_URL}/kich-thuoc`,
        xuatXu: `${BASE_URL}/xuat-xu`,
        chatLieu: `${BASE_URL}/chat-lieu`,
      };

      const endpoint = endpointMap[newAttributeModal.attributeType];
      if (!endpoint) {
        throw new Error(`Không tìm thấy endpoint cho ${newAttributeModal.attributeType}`);
      }

      const now = new Date().toISOString();
      let payload = {
        ten: newAttributeModal.inputValue.trim(),
        ma: newAttributeModal.attributeType === 'mauSac' ? newAttributeModal.ma.toUpperCase() : `CL-${crypto.randomUUID().substring(0, 8)}`,
        trangThai: 1,
        moTa: newAttributeModal.moTa.trim() || '',
        ngayTao: now,
        ngaySua: now,
        ngayXoa: null,
      };

      console.log('Sending payload for attribute creation:', payload);

      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('API response for attribute creation:', response.data);

      const newItem = response.data;
      setDropdownData((prev) => ({
        ...prev,
        [newAttributeModal.attributeType]: [...prev[newAttributeModal.attributeType], newItem],
      }));

      if (newAttributeModal.attributeType === 'sanPham') {
        setProductData((prev) => ({
          ...prev,
          id: newItem.id,
          ten: newItem.ten,
        }));
      } else if (newAttributeModal.detailIndex !== null) {
        setProductDetails((prev) => {
          const newDetails = [...prev];
          newDetails[newAttributeModal.detailIndex] = {
            ...newDetails[newAttributeModal.detailIndex],
            [`${newAttributeModal.attributeType}Id`]: newItem.id,
          };
          return newDetails;
        });
        if (newAttributeModal.attributeType === 'mauSac') {
          await fetchHinhAnhByMauSacId(newItem.id, newAttributeModal.detailIndex);
        }
      }

      toast.success(`Đã thêm ${newAttributeModal.attributeType} "${newAttributeModal.inputValue}" thành công!`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });

      setNewAttributeModal({ open: false, attributeType: '', inputValue: '', moTa: '', detailIndex: null, ma: '' });
    } catch (err) {
      console.error(`Error creating ${newAttributeModal.attributeType}:`, err.response?.data || err.message);
      toast.error(
        `Không thể thêm ${newAttributeModal.attributeType}: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`,
        {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        }
      );
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
        giaBanGoc: null,
        soLuong: null,
        moTa: '',
        trangThai: 1,
        ma: `CT-${crypto.randomUUID().substring(0, 8)}`,
        imagePreview: null,
      },
    ]);
    setDetailErrors((prev) => [...prev, {}]);
  };

  const handleRemoveDetail = (index) => {
    setProductDetails((prev) => prev.filter((_, i) => i !== index));
    setDetailErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index, field, value) => {
    setProductDetails((prev) => {
      const newDetails = [...prev];
      let parsedValue = value;
      if (['giaNhap', 'giaBanGoc'].includes(field)) {
        parsedValue = parseVND(value);
      } else if (['soLuong'].includes(field)) {
        parsedValue = value && !isNaN(value) ? parseInt(value) : null;
      } else if (['mauSacId', 'thuongHieuId', 'kichThuocId', 'xuatXuId', 'chatLieuId', 'hinhAnhMauSacId', 'trangThai'].includes(field)) {
        parsedValue = value ? parseInt(value) : null;
      } else {
        parsedValue = value || '';
      }
      newDetails[index] = { ...newDetails[index], [field]: parsedValue };
      if (field === 'mauSacId' && parsedValue) {
        fetchHinhAnhByMauSacId(parsedValue, index);
      }
      return newDetails;
    });
  };

  const handleImageSelect = (index, hinhAnhId) => {
    const selectedImage = dropdownData.hinhAnhMauSac.find((img) => img.id === hinhAnhId);
    setProductDetails((prev) => {
      const newDetails = [...prev];
      newDetails[index] = {
        ...newDetails[index],
        hinhAnhMauSacId: hinhAnhId,
        imagePreview: selectedImage?.hinhAnh || DEFAULT_IMAGE,
      };
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
      setAlertType('error');
      const firstErrorField = document.querySelector('.Mui-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setConfirmModal({ open: true });
  };

  const checkDuplicateSPCT = async (sanPhamId, detail) => {
    try {
      const response = await axios.get(`${BASE_URL}/admin-san-pham-chi-tiet/check-duplicate`, {
        params: {
          sanPhamId,
          mauSacId: detail.mauSacId,
          thuongHieuId: detail.thuongHieuId,
          kichThuocId: detail.kichThuocId,
        },
      });
      return response.data.exists; // Assuming backend returns { exists: true/false }
    } catch (err) {
      console.error('Error checking duplicate SPCT:', err.response?.data || err.message);
      return false; // Fail safely to allow save attempt
    }
  };

  const confirmSave = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const productToSave = {
        ...productData,
        ma: `SP-${crypto.randomUUID().substring(0, 8)}`,
        trangThai: 1,
        ngayTao: now,
        ngaySua: now,
        ngayXoa: null,
      };

      console.log('Saving product with payload:', productToSave);

      const productResponse = await axios.post(`${BASE_URL}/admin-san-pham`, productToSave, {
        headers: { 'Content-Type': 'application/json' },
      });
      const sanPhamId = productResponse?.data?.id;
      if (!sanPhamId) {
        throw new Error('Không nhận được ID sản phẩm từ server');
      }

      const results = [];
      let hasErrors = false;
      let failedDetails = [];
      let failedDetailErrors = [...detailErrors];

      for (const [index, detail] of productDetails.entries()) {
        try {
          // Check for duplicates in the database
          const isDuplicate = await checkDuplicateSPCT(sanPhamId, detail);
          if (isDuplicate) {
            failedDetailErrors[index] = {
              ...failedDetailErrors[index],
              combination: `Kết hợp màu sắc, thương hiệu, kích thước đã tồn tại trong cơ sở dữ liệu`,
            };
            results.push({
              index: index + 1,
              status: 'error',
              message: `Sản phẩm chi tiết #${index + 1}: Kết hợp màu sắc, thương hiệu, kích thước đã tồn tại trong cơ sở dữ liệu. Vui lòng chọn các thuộc tính khác.`,
            });
            failedDetails.push(detail);
            hasErrors = true;
            continue;
          }

          const detailToSave = {
            sanPhamId,
            mauSacId: detail.mauSacId,
            thuongHieuId: detail.thuongHieuId,
            kichThuocId: detail.kichThuocId,
            xuatXuId: detail.xuatXuId,
            chatLieuId: detail.chatLieuId,
            hinhAnhMauSacId: detail.hinhAnhMauSacId || null,
            ma: detail.ma || `CT-${crypto.randomUUID().substring(0, 8)}`,
            giaNhap: Number(detail.giaNhap) || 0,
            giaBan: Number(detail.giaBanGoc) || 0,
            giaBanGoc: Number(detail.giaBanGoc) || 0,
            soLuong: Number(detail.soLuong) || 0,
            moTa: detail.moTa || '',
            trangThai: detail.trangThai || 1,
            ngayTao: now,
            ngaySua: now,
            ngayXoa: detail.trangThai === 2 ? now : null,
          };

          console.log(`Saving SPCT #${index + 1} with payload:`, detailToSave);

          await axios.post(`${BASE_URL}/admin-san-pham-chi-tiet`, detailToSave, {
            headers: { 'Content-Type': 'application/json' },
          });

          results.push({
            index: index + 1,
            status: 'success',
            message: `Sản phẩm chi tiết #${index + 1} đã được thêm thành công.`,
          });
        } catch (err) {
          console.error(`Error saving SPCT #${index + 1}:`, {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
          });
          const errorMessage = err.response?.status === 400
            ? (err.response?.data?.message || 'Sản phẩm chi tiết đã tồn tại ')
            : (err.message || 'Lỗi không xác định');
          failedDetailErrors[index] = {
            ...failedDetailErrors[index],
            apiError: `Lỗi: ${errorMessage}`,
          };
          results.push({
            index: index + 1,
            status: 'error',
            message: `Sản phẩm chi tiết #${index + 1}: Thêm thất bại - ${errorMessage}`,
          });
          failedDetails.push(detail);
          hasErrors = true;
        }
      }

      // Update productDetails to only keep failed details
      setProductDetails(failedDetails);
      setDetailErrors(failedDetailErrors);

      // Display results
      results.forEach((result) => {
        if (result.status === 'success') {
          toast.success(result.message, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
          });
        } else {
          toast.error(result.message, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
          });
        }
      });

      if (!hasErrors) {
        // toast.success('Thêm sản phẩm và tất cả chi tiết thành công');
        setConfirmModal({ open: false });
        setTimeout(() => navigate('/admin/quan-ly-sp/san-pham'), 2000);
      } else {
        // setAlertMessage('Một số sản phẩm chi tiết không thể thêm. Vui lòng kiểm tra và sửa lại.');
        setAlertType('error');
        setConfirmModal({ open: false });
        // Reset productData if all details failed to allow re-entering product
        if (failedDetails.length === productDetails.length) {
          setProductData({ ten: '', trangThai: 1, id: null });
        }
      }
    } catch (err) {
      console.error('Error saving product:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error(`Thêm sản phẩm thất bại: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setConfirmModal({ open: false });
    } finally {
      setLoading(false);
    }
  };

  const handleTenChange = (e) => {
    const newTen = e.target.value;
    if (newAttributeModal.attributeType === 'mauSac') {
      const normalizedTen = newTen.trim().toLowerCase();
      const existingCodes = dropdownData.mauSac.map((c) => c.ma);
      const newHex = colorMap[normalizedTen] || generateUniqueHex(existingCodes);
      setNewAttributeModal({
        ...newAttributeModal,
        inputValue: newTen,
        ma: isValidHex(newHex) ? newHex.toUpperCase() : newAttributeModal.ma,
      });
    } else {
      setNewAttributeModal({ ...newAttributeModal, inputValue: newTen });
    }
  };

  if (dropdownLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', p: isMobile ? 1 : 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton
          sx={{
            color: '#1976d2',
            bgcolor: '#f4f8fd',
            borderRadius: '50%',
            mr: 2,
            '&:hover': { bgcolor: '#e3f2fd' },
          }}
          onClick={() => navigate('/admin/quan-ly-sp/san-pham')}
          title="Quay lại"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight={700}
          color="#222"
          sx={{ letterSpacing: 2 }}
        >
          THÊM SẢN PHẨM
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSave}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 3, border: '1px solid #ffe0b2' }}>
          <Typography variant="h6" fontWeight={700} color="#222" mb={2}>
            Thông tin sản phẩm
          </Typography>
          <DropdownField
            label="Tên Sản Phẩm"
            name="ten"
            value={productData.id || null}
            options={dropdownData.sanPham}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedProduct = dropdownData.sanPham.find((opt) => opt.id === selectedId);
              setProductData({
                ...productData,
                id: selectedId,
                ten: selectedProduct ? selectedProduct.ten : '',
              });
            }}
            onCreateOption={(inputValue) => handleOpenNewAttributeModal('sanPham', inputValue, null)}
            error={productErrors.ten}
            required
          />
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, border: '1px solid #ffe0b2' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} color="#222">
              Chi tiết sản phẩm
            </Typography>
            <OrangeButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddDetail}
              sx={{ minWidth: 180 }}
            >
              Thêm chi tiết
            </OrangeButton>
          </Box>
          {productDetails.length === 0 && (
            <Typography color="text.secondary" mb={2}>
              Không còn chi tiết nào cần thêm. Nhấn "Thêm chi tiết" để tiếp tục hoặc quay lại danh sách sản phẩm.
            </Typography>
          )}
          {productDetails.map((detail, index) => {
            const selectedImage = detail.hinhAnhMauSacId
              ? dropdownData.hinhAnhMauSac.find((hinhAnh) => hinhAnh.id === detail.hinhAnhMauSacId)
              : null;
            return (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  border: '1px solid #ffe0b2',
                  bgcolor: '#fffaf3',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography fontWeight={600} color="#222">
                    Chi tiết #{index + 1}
                  </Typography>
                  {productDetails.length > 1 && (
                    <IconButton
                      sx={{
                        color: '#e53935',
                        bgcolor: '#fff6f6',
                        borderRadius: '50%',
                        width: 30,
                        height: 30,
                        '&:hover': { bgcolor: '#ffeaea', color: '#b71c1c' },
                      }}
                      onClick={() => handleRemoveDetail(index)}
                      title="Xóa chi tiết"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {detailErrors[index]?.combination && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {detailErrors[index].combination}
                  </Alert>
                )}
                {detailErrors[index]?.apiError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {detailErrors[index].apiError}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <TextField
                      label="Mã Sản Phẩm Chi Tiết"
                      value={detail.ma}
                      onChange={(e) => handleDetailChange(index, 'ma', e.target.value)}
                      fullWidth
                      required
                      error={!!detailErrors[index]?.ma}
                      helperText={detailErrors[index]?.ma}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <TextField
                      label="Giá Nhập"
                      value={formatVND(detail.giaNhap)}
                      onChange={(e) => handleDetailChange(index, 'giaNhap', e.target.value)}
                      fullWidth
                      required
                      error={!!detailErrors[index]?.giaNhap}
                      helperText={detailErrors[index]?.giaNhap}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
                      placeholder="0"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <TextField
                      label="Giá Bán"
                      value={formatVND(detail.giaBanGoc)}
                      onChange={(e) => handleDetailChange(index, 'giaBanGoc', e.target.value)}
                      fullWidth
                      required
                      error={!!detailErrors[index]?.giaBanGoc}
                      helperText={detailErrors[index]?.giaBanGoc}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
                      placeholder="0"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <TextField
                      label="Số Lượng"
                      type="number"
                      value={detail.soLuong || ''}
                      onChange={(e) => handleDetailChange(index, 'soLuong', e.target.value)}
                      fullWidth
                      required
                      error={!!detailErrors[index]?.soLuong}
                      helperText={detailErrors[index]?.soLuong}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <DropdownField
                      label="Thương Hiệu"
                      name="thuongHieuId"
                      value={detail.thuongHieuId}
                      options={dropdownData.thuongHieu}
                      onChange={(e) => handleDetailChange(index, 'thuongHieuId', e.target.value)}
                      onCreateOption={(inputValue) => handleOpenNewAttributeModal('thuongHieu', inputValue, index)}
                      error={detailErrors[index]?.thuongHieuId}
                      required
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <DropdownField
                      label="Màu Sắc"
                      name="mauSacId"
                      value={detail.mauSacId}
                      options={dropdownData.mauSac}
                      onChange={(e) => handleDetailChange(index, 'mauSacId', e.target.value)}
                      onCreateOption={(inputValue) => handleOpenNewAttributeModal('mauSac', inputValue, index)}
                      error={detailErrors[index]?.mauSacId}
                      required
                      showImageButton
                      onImageButtonClick={() => setImageModal({ open: true, detailIndex: index })}
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <DropdownField
                      label="Kích Thước"
                      name="kichThuocId"
                      value={detail.kichThuocId}
                      options={dropdownData.kichThuoc}
                      onChange={(e) => handleDetailChange(index, 'kichThuocId', e.target.value)}
                      onCreateOption={(inputValue) => handleOpenNewAttributeModal('kichThuoc', inputValue, index)}
                      error={detailErrors[index]?.kichThuocId}
                      required
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <DropdownField
                      label="Xuất Xứ"
                      name="xuatXuId"
                      value={detail.xuatXuId}
                      options={dropdownData.xuatXu}
                      onChange={(e) => handleDetailChange(index, 'xuatXuId', e.target.value)}
                      onCreateOption={(inputValue) => handleOpenNewAttributeModal('xuatXu', inputValue, index)}
                      error={detailErrors[index]?.xuatXuId}
                      required
                    />
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <DropdownField
                      label="Chất Liệu"
                      name="chatLieuId"
                      value={detail.chatLieuId}
                      options={dropdownData.chatLieu}
                      onChange={(e) => handleDetailChange(index, 'chatLieuId', e.target.value)}
                      onCreateOption={(inputValue) => handleOpenNewAttributeModal('chatLieu', inputValue, index)}
                      error={detailErrors[index]?.chatLieuId}
                      required
                    />
                  </Grid>
                  <Grid sx={{ width: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="#222" mb={0.5}>
                      Hình ảnh sản phẩm
                    </Typography>
                    {detail.imagePreview ? (
                      <Box
                        sx={{
                          maxWidth: 230,
                          border: '2px solid #ff8800',
                          borderRadius: 1,
                          p: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <img
                          src={detail.imagePreview}
                          alt="Hình ảnh xem trước"
                          style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        />
                      </Box>
                    ) : (
                      <Typography color="text.secondary">Chưa chọn hình ảnh</Typography>
                    )}
                  </Grid>
                  <Grid sx={{ width: '100%' }}>
                    <TextField
                      label="Mô Tả"
                      value={detail.moTa}
                      onChange={(e) => handleDetailChange(index, 'moTa', e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      error={!!detailErrors[index]?.moTa}
                      helperText={detailErrors[index]?.moTa}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
                      placeholder="Nhập mô tả sản phẩm..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Paper>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/quan-ly-sp/san-pham')}
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <OrangeButton
            type="submit"
            variant="contained"
            disabled={loading || dropdownLoading || imageLoading || productDetails.length === 0}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Lưu'}
          </OrangeButton>
        </Box>
      </Box>
      <Snackbar
        open={!!alertMessage}
        autoHideDuration={4000}
        onClose={() => setAlertMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlertMessage('')}
          severity={alertType}
          sx={{
            bgcolor: alertType === 'success' ? '#ff8800' : '#e53935',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      <Dialog
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}>
          Xác nhận
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography>Bạn có chắc muốn lưu sản phẩm và chi tiết này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmModal({ open: false })}
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <OrangeButton
            variant="contained"
            onClick={confirmSave}
            disabled={loading}
            startIcon={<CheckIcon />}
          >
            Xác nhận
          </OrangeButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={newAttributeModal.open}
        onClose={() => setNewAttributeModal({ open: false, attributeType: '', inputValue: '', moTa: '', detailIndex: null, ma: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}>
          Thêm nhanh {newAttributeModal.attributeType}
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 6 }}>
          <TextField
            label={`Tên ${newAttributeModal.attributeType}`}
            value={newAttributeModal.inputValue}
            onChange={handleTenChange}
            fullWidth
            required
            error={!!productErrors.inputValue}
            helperText={productErrors.inputValue}
            sx={{
              mt: 2, // Lùi xuống dưới một chút
              mb: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
          {newAttributeModal.attributeType === 'mauSac' && (
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                label="Mã Hex"
                value={newAttributeModal.ma}
                onChange={(e) => setNewAttributeModal({ ...newAttributeModal, ma: e.target.value.toUpperCase() })}
                fullWidth
                required
                error={!!productErrors.ma}
                helperText={productErrors.ma}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <input
                type="color"
                value={isValidHex(newAttributeModal.ma) ? newAttributeModal.ma : '#000000'}
                onChange={(e) => setNewAttributeModal({ ...newAttributeModal, ma: e.target.value.toUpperCase() })}
                style={{ width: 40, height: 40, padding: 0, border: 'none' }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: isValidHex(newAttributeModal.ma) ? newAttributeModal.ma : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '50%',
                }}
              />
            </Box>
          )}
          <TextField
            label={`Mô tả ${newAttributeModal.attributeType}`}
            value={newAttributeModal.moTa}
            onChange={(e) => setNewAttributeModal({ ...newAttributeModal, moTa: e.target.value })}
            fullWidth
            multiline
            rows={3}
            error={!!productErrors.moTa}
            helperText={productErrors.moTa}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
            placeholder={`Nhập mô tả ${newAttributeModal.attributeType.toLowerCase()}...`}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setNewAttributeModal({ open: false, attributeType: '', inputValue: '', moTa: '', detailIndex: null, ma: '' })}
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <OrangeButton
            variant="contained"
            onClick={handleCreateAttribute}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Thêm'}
          </OrangeButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={imageModal.open}
        onClose={() => setImageModal({ open: false, detailIndex: null })}
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}>
          Chọn hình ảnh cho màu sắc
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {imageLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress color="warning" />
            </Box>
          ) : (
            <Box>
              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{
                    borderColor: '#ff8800',
                    color: '#ff8800',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1,
                    px: 2,
                    '&:hover': { borderColor: '#ff9900', bgcolor: '#fff7f0' },
                  }}
                >
                  Tải lên ảnh
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, imageModal.detailIndex)} />
                </Button>
              </Box>
              <Grid container spacing={2}>
                {dropdownData.hinhAnhMauSac
                  .filter((hinhAnh) => hinhAnh.mauSacId === productDetails[imageModal.detailIndex]?.mauSacId)
                  .map((hinhAnh) => (
                    <Grid key={hinhAnh.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                      <Box
                        sx={{
                          border: hinhAnh.id === productDetails[imageModal.detailIndex]?.hinhAnhMauSacId
                            ? '2px solid #ff8800'
                            : '1px solid #dee2e6',
                          borderRadius: 1,
                          p: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#fff7f0' },
                        }}
                        onClick={() => handleImageSelect(imageModal.detailIndex, hinhAnh.id)}
                      >
                        <img
                          src={hinhAnh.hinhAnh}
                          alt={hinhAnh.tenMauSac}
                          style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        />
                        <Typography textAlign="center" mt={1}>
                          {hinhAnh.tenMauSac}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
              {dropdownData.hinhAnhMauSac.filter((hinhAnh) => hinhAnh.mauSacId === productDetails[imageModal.detailIndex]?.mauSacId).length === 0 && (
                <Typography textAlign="center" color="text.secondary">
                  Không có hình ảnh nào cho màu sắc này.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setImageModal({ open: false, detailIndex: null })}
            sx={{ borderRadius: 2 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddProductWithDetailsPage;