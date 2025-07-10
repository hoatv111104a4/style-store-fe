import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  useMediaQuery,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const orange = '#ff8800';
const black = '#222';
const white = '#fff';
const STATIC_URL = import.meta.env.VITE_STATIC_URL || 'http://localhost:8080';
const DEFAULT_IMAGE = '/default-image.jpg';

// Nội dung từ tài liệu image.png
const documentContent = `manage inventory product detail item list catalog stock goods merchandise article supply stockpile assortment collection range variety array selection batch lot bundle package unit piece equipment gear accessory luggage bag backpack rucksack knapsack travel gear travel bag travel pack premium quality high-end top-notch superior excellent fine best top-grade elite luxury upscale premium brand name label maker manufacturer producer supplier vendor retailer seller distributor trader dealer shop store outlet market bazaar emporium mart color hue shade tint tone pigment dye paint coating finish material fabric textile cloth weave thread yarn fiber polyester nylon canvas leather vinyl plastic rubber metal alloy steel aluminum wood bamboo dimensions size length width height depth volume capacity weight measurement scale proportion ratio extent magnitude quantity amount number total sum aggregate bulk mass load cargo freight shipment consignment parcel crate box case container vessel holder carrier packager wrapper cover lid cap top bottom side edge corner angle surface area space room capacity storage warehouse depot shed yard facility plant factory workshop studio atelier loft garage shed barn stable pen coop cage enclosure penfold corral yardage acreage plot tract field ground land terrain territory region zone district area sector division part portion segment section piece fraction component element constituent ingredient factor aspect feature characteristic attribute property quality trait aspect facet side angle perspective view point standpoint position stance posture attitude approach method technique style fashion mode trend vogue craze rage fad hit sensation popularity demand request order booking reservation appointment schedule timetable calendar agenda program plan scheme design blueprint draft outline sketch drawing illustration depiction representation portrayal picture image photo photograph snapshot shot capture record log journal diary chronicle history archive recordkeeping documentation paperwork filing organization arrangement coordination management administration supervision oversight control governance direction leadership guidance instruction command authority rule regulation law policy guideline standard criterion benchmark measure yardstick gauge indicator signal sign mark token symbol emblem logo insignia badge crest seal stamp imprint impression trace track footprint evidence proof confirmation verification validation authentication certification accreditation approval endorsement sanction ratification acceptance recognition acknowledgment admission confession declaration statement announcement proclamation notice bulletin advisory warning alert caution advice recommendation suggestion proposal offer bid quote estimate appraisal evaluation assessment review critique analysis examination inspection scrutiny survey study research investigation exploration probe inquiry search quest pursuit chase hunt seeking tracking tracing following monitoring observation watching viewing looking seeing gazing staring peering glancing peeking spying scouting reconnoitering surveying mapping charting plotting navigating steering guiding piloting directing leading conducting managing handling operating running functioning working performing executing implementing carrying executing fulfilling completing finishing concluding ending terminating closing wrapping up tying off sealing off locking securing fastening binding tying knotting lacing threading weaving stitching sewing knitting crocheting braiding plaiting twisting turning spinning rotating revolving circling orbiting wheeling pivoting swiveling twirling whirling spinning top gyro top spinner whirlgig fidget toy plaything game amusement entertainment recreation pastime hobby interest passion enthusiasm zeal`;

const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: orange,
  color: white,
  '&:hover': {
    backgroundColor: '#ff9900',
  },
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(255,136,0,0.3)',
  padding: '10px 24px',
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: white,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: orange,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: orange,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: black,
    fontSize: '1.1rem',
    '&.Mui-focused': {
      color: orange,
    },
  },
  '& .MuiSelect-select': {
    padding: '14px 16px',
    fontSize: '1rem',
  },
}));

const SanPhamCtPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sanPhamCts, setSanPhamCts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
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
    imagePreview: null,
  });
  const [filterData, setFilterData] = useState({
    sanPhamId: parseInt(id) || null,
    mauSacId: null,
    thuongHieuId: null,
    kichThuocId: null,
    xuatXuId: null,
    chatLieuId: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [imagePage, setImagePage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [imagesPerPage] = useState(12);
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
  const [imageModal, setImageModal] = useState({ open: false });
  const [documentModal, setDocumentModal] = useState({ open: false });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const imageCache = new Map();

  const fetchDropdownData = useCallback(async (signal) => {
    try {
      setLoading(true);
      const [mauSacRes, thuongHieuRes, kichThuocRes, xuatXuRes, chatLieuRes] = await Promise.all([
        axiosPublicInstance.get('/mau-sac/active', { params: { page: 0, size: 100 }, signal }),
        axiosPublicInstance.get('/thuong-hieu/all', { params: { page: 0, size: 100 }, signal }),
        axiosPublicInstance.get('/kich-thuoc/all', { params: { page: 0, size: 100 }, signal }),
        axiosPublicInstance.get('/xuat-xu/all', { params: { page: 0, size: 100 }, signal }),
        axiosPublicInstance.get('/chat-lieu/all', { params: { page: 0, size: 100 }, signal }),
      ]);
      setDropdownData((prev) => ({
        ...prev,
        mauSac: mauSacRes.data.content || [],
        thuongHieu: thuongHieuRes.data.content || [],
        kichThuoc: kichThuocRes.data.content || [],
        xuatXu: xuatXuRes.data.content || [],
        chatLieu: chatLieuRes.data.content || [],
      }));
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return;
      setAlertMessage(`Không thể tải dữ liệu dropdown: ${err.message}`);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHinhAnhByMauSacIds = useCallback(async (mauSacIds) => {
    if (!mauSacIds || mauSacIds.length === 0) return;
    const newMauSacIds = mauSacIds.filter((id) => !imageCache.has(id));
    if (newMauSacIds.length === 0) return;

    try {
      setImageLoading(true);
      const hinhAnhPromises = newMauSacIds.map((mauSacId) =>
        getHinhAnhByMauSacId(mauSacId).catch((err) => {
          console.error(`Error fetching images for mauSacId ${mauSacId}:`, err);
          return [];
        })
      );
      const hinhAnhResponses = await Promise.all(hinhAnhPromises);
      const hinhAnhList = hinhAnhResponses.flat();

      newMauSacIds.forEach((id, index) => imageCache.set(id, hinhAnhResponses[index]));
      setDropdownData((prev) => ({
        ...prev,
        hinhAnhMauSac: [
          ...hinhAnhList,
          ...prev.hinhAnhMauSac.filter((img) => !hinhAnhList.some((newImg) => newImg.id === img.id)),
        ],
      }));
    } catch (err) {
      console.error('Fetch hinh anh error:', err);
      setAlertMessage(`Không thể tải hình ảnh: ${err.message}`);
      setAlertType('error');
    } finally {
      setImageLoading(false);
    }
  }, []);

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
          response = await searchSanPhamCtByMa(searchTerm.trim(), page, size);
        } else if (
          filterData.mauSacId ||
          filterData.thuongHieuId ||
          filterData.kichThuocId ||
          filterData.xuatXuId ||
          filterData.chatLieuId
        ) {
          response = await filterSanPhamCt({
            ...filterData,
            page,
            size,
          });
        } else {
          response = await getSanPhamCtBySanPhamId(id, page, size);
        }
        setSanPhamCts(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        const mauSacIds = [...new Set(response.content.map((spct) => spct.mauSacId).filter(Boolean))];
        await fetchHinhAnhByMauSacIds(mauSacIds);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu từ server');
        setSanPhamCts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [id, searchTerm, filterData, fetchHinhAnhByMauSacIds]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDropdownData(controller.signal);
    fetchData(currentPage, pageSize);
    return () => controller.abort();
  }, [currentPage, pageSize, fetchData, fetchDropdownData]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const validateForm = () => {
    const errors = {};
    if (!formData.sanPhamId || formData.sanPhamId <= 0) errors.sanPhamId = 'ID sản phẩm không hợp lệ';
    if (!formData.mauSacId) errors.mauSacId = 'Màu sắc không được để trống';
    if (!formData.thuongHieuId) errors.thuongHieuId = 'Thương hiệu không được để trống';
    if (!formData.kichThuocId) errors.kichThuocId = 'Kích thước không được để trống';
    if (!formData.xuatXuId) errors.xuatXuId = 'Xuất xứ không được để trống';
    if (!formData.chatLieuId) errors.chatLieuId = 'Chất liệu không được để trống';
    if (formData.giaBan === '' || isNaN(Number(formData.giaBan)) || Number(formData.giaBan) <= 0)
      errors.giaBan = 'Giá bán phải lớn hơn 0';
    if (formData.soLuong === '' || isNaN(Number(formData.soLuong)) || Number(formData.soLuong) < 0)
      errors.soLuong = 'Số lượng không được nhỏ hơn 0';
    if (formData.giaNhap && (isNaN(Number(formData.giaNhap)) || Number(formData.giaNhap) < 0))
      errors.giaNhap = 'Giá nhập không được nhỏ hơn 0';
    if (formData.moTa && formData.moTa.length > 255) errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    if (!formData.ma.trim()) errors.ma = 'Mã sản phẩm chi tiết không được để trống';
    if (Number(formData.soLuong) > 0 && formData.trangThai === 0)
      errors.trangThai = 'Trạng thái Hết Hàng chỉ áp dụng khi số lượng bằng 0';
    if (formData.mauSacId && formData.thuongHieuId && formData.kichThuocId) {
      const key = `${formData.mauSacId}-${formData.thuongHieuId}-${formData.kichThuocId}`;
      const duplicates = sanPhamCts
        .filter((spct) => spct.id !== (selectedSanPhamCt?.id || null))
        .filter((spct) => `${spct.mauSacId}-${spct.thuongHieuId}-${spct.kichThuocId}` === key);
      if (duplicates.length > 0) {
        errors.combination = 'Kết hợp màu sắc, thương hiệu, kích thước đã tồn tại';
      }
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
      ma: `CT-${crypto.randomUUID().substring(0, 8)}`,
      giaNhap: '',
      giaBan: '',
      soLuong: '',
      moTa: '',
      trangThai: 1,
      imagePreview: null,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedSanPhamCt(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewOrEdit = (sanPhamCt, viewOnly = false) => {
    const image = dropdownData.hinhAnhMauSac.find((img) => img.id === sanPhamCt.hinhAnhMauSacId);
    setFormData({
      id: sanPhamCt.id,
      sanPhamId: parseInt(id) || 0,
      mauSacId: sanPhamCt.mauSacId || null,
      thuongHieuId: sanPhamCt.thuongHieuId || null,
      kichThuocId: sanPhamCt.kichThuocId || null,
      xuatXuId: sanPhamCt.xuatXuId || null,
      chatLieuId: sanPhamCt.chatLieuId || null,
      hinhAnhMauSacId: sanPhamCt.hinhAnhMauSacId || null,
      ma: sanPhamCt.ma || `CT-${crypto.randomUUID().substring(0, 8)}`,
      giaNhap: sanPhamCt.giaNhap || '',
      giaBan: sanPhamCt.giaBan || '',
      soLuong: sanPhamCt.soLuong || '',
      moTa: sanPhamCt.moTa || '',
      trangThai: sanPhamCt.trangThai || 1,
      imagePreview: image ? image.hinhAnh : null,
    });
    if (!image && sanPhamCt.mauSacId) {
      fetchHinhAnhByMauSacIds([sanPhamCt.mauSacId]);
    }
    setFormErrors({});
    setAlertMessage('');
    setSelectedSanPhamCt(sanPhamCt);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('Vui lòng chọn một file hình ảnh');
      return;
    }
    if (!formData.mauSacId) {
      toast.error('Vui lòng chọn màu sắc trước khi tải ảnh');
      return;
    }
    try {
      const response = await uploadHinhAnhMauSac(file, formData.mauSacId);
      const imageUrl = response.hinhAnh.startsWith('/uploads/')
        ? `${STATIC_URL}${response.hinhAnh}`
        : `${STATIC_URL}/uploads/${response.hinhAnh}`;
      setFormData({
        ...formData,
        hinhAnhMauSacId: response.id,
        imagePreview: imageUrl,
      });
      toast.success('Tải ảnh lên thành công');
      await fetchHinhAnhByMauSacIds([formData.mauSacId]);
    } catch (err) {
      toast.error(`Tải ảnh thất bại: ${err.message}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAlertMessage('Vui lòng kiểm tra lại thông tin nhập');
      setAlertType('error');
      const firstErrorField = document.querySelector('.Mui-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    try {
      setLoading(true);
      let updatedTrangThai = formData.trangThai;
      if (Number(formData.soLuong) === 0 && formData.trangThai !== 2) {
        updatedTrangThai = 0;
      } else if (Number(formData.soLuong) > 0 && formData.trangThai === 0) {
        updatedTrangThai = 1;
      }
      const sanPhamCtToSave = {
        ...formData,
        giaNhap: formData.giaNhap === '' ? null : Number(formData.giaNhap),
        giaBan: Number(formData.giaBan),
        soLuong: Number(formData.soLuong),
        trangThai: updatedTrangThai,
        ngayTao: selectedSanPhamCt ? formData.ngayTao : new Date().toISOString(),
        ngaySua: new Date().toISOString(),
        ngayXoa: updatedTrangThai === 2 ? new Date().toISOString() : null,
      };
      if (selectedSanPhamCt) {
        await updateSanPhamCt(selectedSanPhamCt.id, sanPhamCtToSave);
        toast.success(`Cập nhật sản phẩm chi tiết "${sanPhamCtToSave.ma}" thành công`);
      } else {
        await addSanPhamCt(sanPhamCtToSave);
        toast.success(`Thêm sản phẩm chi tiết "${sanPhamCtToSave.ma}" thành công`);
      }
      setIsModalOpen(false);
      await fetchData(currentPage, pageSize);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Thao tác thất bại, vui lòng kiểm tra lại';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteSanPhamCt(confirmModal.id);
      toast.success('Cập nhật trạng thái sản phẩm chi tiết thành Tạm Ngưng thành công');
      await fetchData(currentPage, pageSize);
    } catch (err) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setConfirmModal({ open: false, id: null });
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData({
      ...filterData,
      [name]: value === '' ? null : parseInt(value),
    });
    setCurrentPage(0);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value - 1);
  };

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
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

  const handleImageSelect = (hinhAnhId) => {
    const selectedImage = dropdownData.hinhAnhMauSac.find((img) => img.id === hinhAnhId);
    setFormData({ ...formData, hinhAnhMauSacId: hinhAnhId, imagePreview: selectedImage?.hinhAnh || DEFAULT_IMAGE });
    setImageModal({ open: false });
  };

  // Lọc hình ảnh theo mauSacId đã chọn
  const displayedImages = formData.mauSacId
    ? dropdownData.hinhAnhMauSac
        .filter((img) => img.mauSacId === formData.mauSacId)
        .slice(imagePage * imagesPerPage, (imagePage + 1) * imagesPerPage)
    : [];

  const handleOpenDocument = () => {
    setDocumentModal({ open: true });
  };

  if (loading && sanPhamCts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', p: isMobile ? 2 : 4 }} className="font-sans">
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/admin/quan-ly-sp/san-pham')} sx={{ color: black, mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight={700}
          color={black}
          align="center"
          sx={{ letterSpacing: 2, flexGrow: 1 }}
        >
          QUẢN LÝ SẢN PHẨM CHI TIẾT
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
          <Button
            onClick={() => {
              setError(null);
              const controller = new AbortController();
              fetchDropdownData(controller.signal);
              fetchData(currentPage, pageSize);
            }}
            sx={{ ml: 2 }}
          >
            Thử lại
          </Button>
        </Alert>
      )}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Tìm kiếm theo mã..."
            value={searchInput}
            onChange={handleSearchInput}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            sx={{
              borderRadius: 2,
              bgcolor: '#f9fafb',
              maxWidth: isMobile ? '100%' : 500,
              width: '100%',
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
            InputProps={{
              endAdornment: (
                <>
                  {searchInput && (
                    <IconButton
                      color="default"
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                      sx={{ mr: searchLoading ? 1 : 0 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                  {searchLoading ? (
                    <CircularProgress size={20} color="warning" />
                  ) : (
                    <IconButton
                      color="warning"
                      onClick={handleSearch}
                      disabled={!!error || !searchInput.trim()}
                      edge="end"
                      size="small"
                    >
                      <SearchIcon />
                    </IconButton>
                  )}
                </>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl sx={{ minWidth: 150, bgcolor: '#f9fafb' }}>
              <InputLabel>Màu Sắc</InputLabel>
              <Select
                name="mauSacId"
                value={filterData.mauSacId || ''}
                onChange={handleFilterChange}
                label="Màu Sắc"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Chọn màu sắc...</MenuItem>
                {dropdownData.mauSac.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150, bgcolor: '#f9fafb' }}>
              <InputLabel>Thương Hiệu</InputLabel>
              <Select
                name="thuongHieuId"
                value={filterData.thuongHieuId || ''}
                onChange={handleFilterChange}
                label="Thương Hiệu"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Chọn thương hiệu...</MenuItem>
                {dropdownData.thuongHieu.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150, bgcolor: '#f9fafb' }}>
              <InputLabel>Kích Thước</InputLabel>
              <Select
                name="kichThuocId"
                value={filterData.kichThuocId || ''}
                onChange={handleFilterChange}
                label="Kích Thước"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Chọn kích thước...</MenuItem>
                {dropdownData.kichThuoc.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150, bgcolor: '#f9fafb' }}>
              <InputLabel>Xuất Xứ</InputLabel>
              <Select
                name="xuatXuId"
                value={filterData.xuatXuId || ''}
                onChange={handleFilterChange}
                label="Xuất Xứ"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Chọn xuất xứ...</MenuItem>
                {dropdownData.xuatXu.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150, bgcolor: '#f9fafb' }}>
              <InputLabel>Chất Liệu</InputLabel>
              <Select
                name="chatLieuId"
                value={filterData.chatLieuId || ''}
                onChange={handleFilterChange}
                label="Chất Liệu"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Chọn chất liệu...</MenuItem>
                {dropdownData.chatLieu.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} display="flex" justifyContent={isMobile ? 'flex-start' : 'flex-end'}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <OrangeButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ minWidth: 180 }}
            >
              Thêm sản phẩm chi tiết
            </OrangeButton>

          </Box>
        </Grid>
      </Grid>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          border: '1px solid #ffe0b2',
          mt: 1,
          maxWidth: '100%', // Đảm bảo chiếm toàn bộ chiều rộng
          minHeight: '60vh', // Chiều cao tối thiểu
          overflowY: 'auto', // Thêm cuộn nếu cần
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: orange }}>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '5%', border: 0 }}>#</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '8%', border: 0 }}>HÌNH ẢNH</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>TÊN</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>MÃ</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>MÀU SẮC</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>KÍCH THƯỚC</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>THƯƠNG HIỆU</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>XUẤT XỨ</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>CHẤT LIỆU</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>GIÁ</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '8%', border: 0 }}>SỐ LƯỢNG</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>TRẠNG THÁI</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '12%', border: 0 }}>HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sanPhamCts.length > 0 ? (
              sanPhamCts.map((spct, index) => {
                const image = dropdownData.hinhAnhMauSac.find((img) => img.id === spct.hinhAnhMauSacId);
                return (
                  <TableRow
                    key={spct.id}
                    hover
                    sx={{
                      transition: 'background 0.2s',
                      '&:hover': { backgroundColor: '#fffaf3' },
                      borderBottom: '1px solid #ffe0b2',
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 600, color: black, border: 0 }}>
                      {index + 1 + currentPage * pageSize}
                    </TableCell>
                    <TableCell align="center" sx={{ border: 0 }}>
                      {image ? (
                        <img
                          src={image.hinhAnh}
                          alt={spct.tenMauSac || 'Hình ảnh'}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        />
                      ) : (
                        <Typography color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: black, border: 0 }}>
                      {spct.tenSanPham && spct.tenMauSac ? `${spct.tenSanPham} màu ${spct.tenMauSac}` : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>{spct.ma || 'N/A'}</TableCell>
                    <TableCell sx={{ border: 0 }}>
                      <Chip
                        label={spct.tenMauSac || 'N/A'}
                        sx={{
                          bgcolor:
                            spct.tenMauSac === 'Green'
                              ? '#a3e635'
                              : spct.tenMauSac === 'Red'
                                ? '#e53935'
                                : '#6c757d',
                          color: spct.tenMauSac === 'Green' ? '#1a2e05' : white,
                          fontWeight: 600,
                          px: 1.5,
                          borderRadius: '16px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>{spct.tenKichThuoc || 'N/A'}</TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>{spct.tenThuongHieu || 'N/A'}</TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>{spct.tenXuatXu || 'N/A'}</TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>{spct.tenChatLieu || 'N/A'}</TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>
                      {spct.giaBan ? spct.giaBan.toLocaleString('vi-VN') + ' đ' : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: black, border: 0 }}>{spct.soLuong}</TableCell>
                    <TableCell align="center" sx={{ border: 0 }}>
                      <Chip
                        label={
                          spct.soLuong === 0
                            ? 'Hết Hàng'
                            : spct.trangThai === 1
                              ? 'Đang Bán'
                              : spct.trangThai === 2
                                ? 'Tạm Ngưng'
                                : 'Hết Hàng'
                        }
                        sx={{
                          bgcolor:
                            spct.soLuong === 0
                              ? '#6c757d'
                              : spct.trangThai === 1
                                ? '#a3e635'
                                : spct.trangThai === 2
                                  ? '#ffca28'
                                  : '#6c757d',
                          color: spct.soLuong === 0 ? white : spct.trangThai === 1 ? '#1a2e05' : white,
                          fontWeight: 600,
                          px: 1.5,
                          borderRadius: '16px',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: 0 }}>
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <IconButton
                          sx={{
                            color: '#1976d2',
                            bgcolor: '#f4f8fd',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            '&:hover': { bgcolor: '#e3f2fd', color: '#0d47a1' },
                          }}
                          onClick={() => handleViewOrEdit(spct, true)}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          sx={{
                            color: '#ffca28',
                            bgcolor: '#fff7f0',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            '&:hover': { bgcolor: '#ffe0b2', color: '#ff6f00' },
                          }}
                          onClick={() => handleViewOrEdit(spct, false)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          sx={{
                            color: '#e53935',
                            bgcolor: '#fff6f6',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            '&:hover': { bgcolor: '#ffeaea', color: '#b71c1c' },
                          }}
                          onClick={() => setConfirmModal({ open: true, id: spct.id })}
                          size="small"
                        >
                          <SyncIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  <Typography color="text.secondary" fontSize={18}>
                    {searchTerm
                      ? `Không tìm thấy sản phẩm chi tiết với mã "${searchTerm}"`
                      : 'Không tìm thấy sản phẩm chi tiết phù hợp'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} flexWrap="wrap" gap={2}>
        <Pagination
          count={totalPages}
          page={currentPage + 1}
          onChange={handlePageChange}
          color="warning"
          shape="rounded"
        />
        <Typography>
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} sản phẩm chi tiết)
        </Typography>
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
            bgcolor: alertType === 'success' ? orange : '#e53935',
            color: white,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xl" // Tăng kích thước tối đa
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#f9fafb',
            maxWidth: '90vw', // 90% chiều rộng màn hình
            maxHeight: '90vh', // 90% chiều cao màn hình
            overflowY: 'auto', // Thêm cuộn nếu cần
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: orange, color: white, fontWeight: 700, py: 3, px: 4 }}>
          {isViewMode
            ? 'Xem Sản Phẩm Chi Tiết'
            : selectedSanPhamCt
              ? 'Chỉnh sửa Sản Phẩm Chi Tiết'
              : 'Thêm mới Sản Phẩm Chi Tiết'}
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 3, overflowY: 'auto', maxHeight: '70vh' }}>
          <Box component="form" onSubmit={handleSave} className="space-y-6">
            <Box className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Typography variant="h6" fontWeight={600} color={black} mb={3}>
                Thông tin cơ bản
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mã Sản Phẩm Chi Tiết"
                    value={formData.ma}
                    onChange={(e) => !isViewMode && setFormData({ ...formData, ma: e.target.value })}
                    fullWidth
                    required={!isViewMode}
                    error={!!formErrors.ma}
                    helperText={formErrors.ma}
                    InputProps={{ readOnly: isViewMode }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: white,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: orange },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: orange, borderWidth: '2px' },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: black,
                        fontSize: '1.1rem',
                        '&.Mui-focused': { color: orange },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Số Lượng"
                    type="number"
                    value={formData.soLuong}
                    onChange={(e) => !isViewMode && setFormData({ ...formData, soLuong: e.target.value })}
                    fullWidth
                    required={!isViewMode}
                    error={!!formErrors.soLuong}
                    helperText={formErrors.soLuong}
                    InputProps={{
                      readOnly: isViewMode,
                      inputProps: { min: 0 },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: white,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: orange },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: orange, borderWidth: '2px' },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: black,
                        fontSize: '1.1rem',
                        '&.Mui-focused': { color: orange },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Giá Nhập"
                    type="number"
                    value={formData.giaNhap}
                    onChange={(e) => !isViewMode && setFormData({ ...formData, giaNhap: e.target.value })}
                    fullWidth
                    error={!!formErrors.giaNhap}
                    helperText={formErrors.giaNhap}
                    InputProps={{ readOnly: isViewMode }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: white,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: orange },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: orange, borderWidth: '2px' },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: black,
                        fontSize: '1.1rem',
                        '&.Mui-focused': { color: orange },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Giá Bán"
                    type="number"
                    value={formData.giaBan}
                    onChange={(e) => !isViewMode && setFormData({ ...formData, giaBan: e.target.value })}
                    fullWidth
                    required={!isViewMode}
                    error={!!formErrors.giaBan}
                    helperText={formErrors.giaBan}
                    InputProps={{ readOnly: isViewMode }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: white,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: orange },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: orange, borderWidth: '2px' },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: black,
                        fontSize: '1.1rem',
                        '&.Mui-focused': { color: orange },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Typography variant="h6" fontWeight={600} color={black} mb={3}>
                Thuộc tính sản phẩm
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledFormControl fullWidth error={!!formErrors.mauSacId}>
                    <InputLabel>Màu Sắc</InputLabel>
                    <Select
                      value={formData.mauSacId || ''}
                      onChange={(e) => {
                        if (!isViewMode) {
                          const newMauSacId = parseInt(e.target.value) || null;
                          setFormData({
                            ...formData,
                            mauSacId: newMauSacId,
                            hinhAnhMauSacId: null,
                            imagePreview: null,
                          });
                          fetchHinhAnhByMauSacIds([newMauSacId]);
                        }
                      }}
                      label="Màu Sắc"
                      disabled={isViewMode}
                      startAdornment={<ImageIcon sx={{ color: orange, mr: 1 }} />}
                    >
                      <MenuItem value="">Chọn màu sắc...</MenuItem>
                      {dropdownData.mauSac.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.ten}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!formErrors.mauSacId && (
                      <Typography color="error" variant="caption">{formErrors.mauSacId}</Typography>
                    )}
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledFormControl fullWidth error={!!formErrors.thuongHieuId}>
                    <InputLabel>Thương Hiệu</InputLabel>
                    <Select
                      name="thuongHieuId"
                      value={formData.thuongHieuId || ''}
                      onChange={(e) =>
                        !isViewMode &&
                        setFormData({ ...formData, thuongHieuId: parseInt(e.target.value) || null })
                      }
                      label="Thương Hiệu"
                      disabled={isViewMode}
                    >
                      <MenuItem value="">Chọn thương hiệu...</MenuItem>
                      {dropdownData.thuongHieu.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.ten}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!formErrors.thuongHieuId && (
                      <Typography color="error" variant="caption">{formErrors.thuongHieuId}</Typography>
                    )}
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledFormControl fullWidth error={!!formErrors.kichThuocId}>
                    <InputLabel>Kích Thước</InputLabel>
                    <Select
                      name="kichThuocId"
                      value={formData.kichThuocId || ''}
                      onChange={(e) =>
                        !isViewMode &&
                        setFormData({ ...formData, kichThuocId: parseInt(e.target.value) || null })
                      }
                      label="Kích Thước"
                      disabled={isViewMode}
                    >
                      <MenuItem value="">Chọn kích thước...</MenuItem>
                      {dropdownData.kichThuoc.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.ten}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!formErrors.kichThuocId && (
                      <Typography color="error" variant="caption">{formErrors.kichThuocId}</Typography>
                    )}
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledFormControl fullWidth error={!!formErrors.xuatXuId}>
                    <InputLabel>Xuất Xứ</InputLabel>
                    <Select
                      name="xuatXuId"
                      value={formData.xuatXuId || ''}
                      onChange={(e) =>
                        !isViewMode &&
                        setFormData({ ...formData, xuatXuId: parseInt(e.target.value) || null })
                      }
                      label="Xuất Xứ"
                      disabled={isViewMode}
                    >
                      <MenuItem value="">Chọn xuất xứ...</MenuItem>
                      {dropdownData.xuatXu.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.ten}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!formErrors.xuatXuId && (
                      <Typography color="error" variant="caption">{formErrors.xuatXuId}</Typography>
                    )}
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledFormControl fullWidth error={!!formErrors.chatLieuId}>
                    <InputLabel>Chất Liệu</InputLabel>
                    <Select
                      name="chatLieuId"
                      value={formData.chatLieuId || ''}
                      onChange={(e) =>
                        !isViewMode &&
                        setFormData({ ...formData, chatLieuId: parseInt(e.target.value) || null })
                      }
                      label="Chất Liệu"
                      disabled={isViewMode}
                    >
                      <MenuItem value="">Chọn chất liệu...</MenuItem>
                      {dropdownData.chatLieu.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.ten}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!formErrors.chatLieuId && (
                      <Typography color="error" variant="caption">{formErrors.chatLieuId}</Typography>
                    )}
                  </StyledFormControl>
                </Grid>
              </Grid>
            </Box>
            <Box className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Typography variant="h6" fontWeight={600} color={black} mb={3}>
                Hình ảnh sản phẩm
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  {!isViewMode && (
                    <Box>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<ImageIcon />}
                        sx={{
                          borderColor: orange,
                          color: orange,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          px: 3,
                          '&:hover': { borderColor: '#ff9900', bgcolor: '#fff7f0' },
                        }}
                      >
                        Tải lên ảnh
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ImageIcon />}
                        onClick={() => setImageModal({ open: true })}
                        disabled={!formData.mauSacId}
                        sx={{
                          borderColor: orange,
                          color: orange,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          px: 3,
                          ml: 2,
                          '&:hover': { borderColor: '#ff9900', bgcolor: '#fff7f0' },
                        }}
                      >
                        Chọn từ thư viện
                      </Button>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {formData.imagePreview ? (
                    <Box
                      className="border-2 border-orange-400 rounded-lg p-2"
                      sx={{ maxWidth: 150, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <img
                        src={formData.imagePreview}
                        alt="Hình ảnh xem trước"
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      />
                    </Box>
                  ) : (
                    <Typography color="text.secondary" fontStyle="italic">
                      Chưa chọn hình ảnh
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
            <Box className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <Typography variant="h6" fontWeight={600} color={black} mb={3}>
                Trạng thái và mô tả
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledFormControl fullWidth>
                    <InputLabel>Trạng Thái</InputLabel>
                    <Select
                      value={formData.trangThai}
                      onChange={(e) =>
                        !isViewMode && setFormData({ ...formData, trangThai: parseInt(e.target.value) })
                      }
                      label="Trạng Thái"
                      disabled={isViewMode}
                    >
                      <MenuItem value={1}>Đang Bán</MenuItem>
                      <MenuItem value={0} disabled={Number(formData.soLuong) > 0}>Hết Hàng</MenuItem>
                      <MenuItem value={2}>Tạm Ngưng</MenuItem>
                    </Select>
                    {!!formErrors.trangThai && (
                      <Typography color="error" variant="caption">{formErrors.trangThai}</Typography>
                    )}
                  </StyledFormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mô Tả"
                    value={formData.moTa}
                    onChange={(e) => !isViewMode && setFormData({ ...formData, moTa: e.target.value })}
                    fullWidth
                    multiline
                    rows={4}
                    error={!!formErrors.moTa}
                    helperText={formErrors.moTa}
                    InputProps={{ readOnly: isViewMode }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: white,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: orange },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: orange, borderWidth: '2px' },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: black,
                        fontSize: '1.1rem',
                        '&.Mui-focused': { color: orange },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            {formErrors.combination && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {formErrors.combination}
              </Alert>
            )}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                sx={{
                  borderRadius: 2,
                  borderColor: '#d1d5db',
                  color: black,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': { borderColor: orange, bgcolor: '#fff7f0' },
                }}
              >
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <OrangeButton type="submit" variant="contained" disabled={loading}>
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : selectedSanPhamCt ? (
                    'Cập nhật'
                  ) : (
                    'Thêm mới'
                  )}
                </OrangeButton>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={imageModal.open}
        onClose={() => setImageModal({ open: false })}
        maxWidth="md" // Tăng kích thước
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: black }}>Chọn Hình Ảnh</DialogTitle>
        <DialogContent>
          {imageLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress color="warning" />
            </Box>
          ) : (
            <Box>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {displayedImages.length > 0 ? (
                  displayedImages.map((hinhAnh) => (
                    <Box
                      key={hinhAnh.id}
                      border={formData.hinhAnhMauSacId === hinhAnh.id ? 2 : 1}
                      borderColor={formData.hinhAnhMauSacId === hinhAnh.id ? orange : 'grey.500'}
                      p={1}
                      borderRadius={2}
                      sx={{
                        cursor: 'pointer',
                        maxWidth: '120px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          borderColor: orange,
                        },
                      }}
                      onClick={() => handleImageSelect(hinhAnh.id)}
                    >
                      <img
                        src={hinhAnh.hinhAnh}
                        alt={hinhAnh.tenMauSac || 'Hình ảnh'}
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" fontStyle="italic">
                    Không có hình ảnh cho màu sắc này
                  </Typography>
                )}
              </Box>
              {displayedImages.length > imagesPerPage && (
                <Pagination
                  count={Math.ceil(displayedImages.length / imagesPerPage)}
                  page={imagePage + 1}
                  onChange={(e, value) => setImagePage(value - 1)}
                  color="warning"
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setImageModal({ open: false })}
            sx={{
              borderRadius: 2,
              borderColor: '#d1d5db',
              color: black,
              fontWeight: 600,
              '&:hover': { borderColor: orange, bgcolor: '#fff7f0' },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={documentModal.open}
        onClose={() => setDocumentModal({ open: false })}
        maxWidth="xl" // Tăng kích thước tối đa
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#f9fafb',
            maxWidth: '90vw', // 90% chiều rộng màn hình
            maxHeight: '90vh', // 90% chiều cao màn hình
            overflowY: 'auto', // Thêm cuộn nếu cần
          },
        }}
      >
        
        <DialogContent sx={{ p: 4, pt: 3, overflowY: 'auto', maxHeight: '70vh' }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: black }}>
            {documentContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setDocumentModal({ open: false })}
            sx={{
              borderRadius: 2,
              borderColor: '#d1d5db',
              color: black,
              fontWeight: 600,
              '&:hover': { borderColor: orange, bgcolor: '#fff7f0' },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: black }}>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn thay đổi trạng thái sản phẩm chi tiết này thành Tạm Ngưng?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmModal({ open: false, id: null })}
            sx={{
              borderRadius: 2,
              borderColor: '#d1d5db',
              color: black,
              fontWeight: 600,
              '&:hover': { borderColor: orange, bgcolor: '#fff7f0' },
            }}
          >
            Hủy
          </Button>
          <OrangeButton
            variant="contained"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận'}
          </OrangeButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SanPhamCtPage;