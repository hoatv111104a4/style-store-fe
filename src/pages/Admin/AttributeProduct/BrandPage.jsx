import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getAllThuongHieu, addThuongHieu, updateThuongHieu, deleteThuongHieu, searchThuongHieuByNameOrCode } from '../../../services/Admin/ThuongHieuService';

const orange = '#ff8800';
const black = '#222';
const white = '#fff';

const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: orange,
  color: white,
  '&:hover': {
    backgroundColor: '#ff9900',
  },
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(255,136,0,0.08)',
}));

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
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
  const [skipFetch, setSkipFetch] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchData = useCallback(async (page, size, search = '') => {
    try {
      setLoading(true);
      if (search) setSearchLoading(true);
      setError(null);
      let response;
      if (search) {
        response = await searchThuongHieuByNameOrCode(search.trim(), page, size);
      } else {
        response = await getAllThuongHieu(page, size);
      }
      setBrands(response.content || []);
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
    if (!skipFetch) {
      fetchData(currentPage, pageSize, searchTerm);
    }
  }, [currentPage, pageSize, searchTerm, fetchData, skipFetch]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (skipFetch && currentPage === 0) {
      setSkipFetch(false);
    }
  }, [currentPage, skipFetch]);

  const validateForm = useCallback(async () => {
    const errors = {};
    if (!formData.ten?.trim()) {
      errors.ten = 'Tên thương hiệu không được để trống';
    } else if (!formData.ten.trim().match(/^[\p{L}\s]+$/u)) {
      errors.ten = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    } else if (formData.ten.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
    } else {
      try {
        const response = await searchThuongHieuByNameOrCode(formData.ten.trim(), 0, 10);
        const existingBrands = response.content || [];
        const isDuplicate = existingBrands.some(
          (brand) =>
            brand.ten.toLowerCase() === formData.ten.trim().toLowerCase() &&
            (!selectedBrand || brand.id !== selectedBrand.id)
        );
        if (isDuplicate) {
          errors.ten = 'Tên thương hiệu đã tồn tại';
        }
      } catch (err) {
        errors.ten = 'Không thể kiểm tra tên thương hiệu';
      }
    }
    if (formData.moTa?.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedBrand]);

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
    setSelectedBrand(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  }, []);

  const handleViewOrEdit = useCallback((brand, viewOnly = false) => {
    setFormData({
      ...brand,
      ngayTao: brand.ngayTao || '',
      ngaySua: brand.ngaySua || '',
      ngayXoa: brand.ngayXoa || null,
      trangThai: brand.trangThai || 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedBrand(brand);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      const isValid = await validateForm();
      if (!isValid) {
        setAlertMessage('Vui lòng kiểm tra lại thông tin nhập');
        setAlertType('error');
        return;
      }
      try {
        const now = new Date().toISOString();
        const brandToSave = {
          ...formData,
          ma: selectedBrand ? formData.ma : `TH-${crypto.randomUUID().substring(0, 8)}`,
          trangThai: 1,
          ngayTao: selectedBrand ? formData.ngayTao : now,
          ngaySua: now,
          ngayXoa: formData.trangThai === 0 ? now : null,
        };
        if (selectedBrand) {
          await updateThuongHieu(selectedBrand.id, brandToSave);
          setBrands((prev) =>
            prev.map((b) => (b.id === selectedBrand.id ? { ...b, ...brandToSave } : b))
          );
          setAlertMessage(`Cập nhật thương hiệu "${brandToSave.ten}" thành công`);
        } else {
          await addThuongHieu(brandToSave);
          await fetchData(currentPage, pageSize, searchTerm);
          setAlertMessage(`Thêm thương hiệu "${brandToSave.ten}" thành công`);
        }
        setAlertType('success');
        setIsModalOpen(false);
      } catch (err) {
        setAlertMessage(`Thao tác thất bại: ${err.response?.data?.message || err.message}`);
        setAlertType('error');
      }
    },
    [formData, selectedBrand, currentPage, pageSize, searchTerm, validateForm, fetchData]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteThuongHieu(confirmModal.id);
      await fetchData(currentPage, pageSize, searchTerm);
      setAlertMessage('Cập nhật trạng thái thành công');
      setAlertType('success');
    } catch (err) {
      setAlertMessage(`Cập nhật trạng thái thất bại: ${err.message}`);
      setAlertType('error');
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  }, [confirmModal.id, currentPage, pageSize, searchTerm, fetchData]);

  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value - 1);
  }, []);

  const handleSearchInput = useCallback((e) => {
    setSearchInput(e.target.value);
    setError(null);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchTerm(searchInput);
    setCurrentPage(0);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(0);
    setError(null);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      handleSearch();
    }
  }, [handleSearch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }
  if (error && !brands.length) {
    return (
      <Box m={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', p: isMobile ? 1 : 4 }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        fontWeight={700}
        color={black}
        align="center"
        sx={{ letterSpacing: 2, mb: 3 }}
      >
        QUẢN LÝ THƯƠNG HIỆU
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={7}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Nhập tên hoặc mã thương hiệu..."
              value={searchInput}
              onChange={handleSearchInput}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error}
              sx={{
                borderRadius: 2,
                bgcolor: '#fafafa',
                maxWidth: 350,
                flex: 1,
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
          </Box>
        </Grid>
        <Grid item xs={12} md={5} display="flex" justifyContent={isMobile ? 'flex-start' : 'flex-end'}>
          <OrangeButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ minWidth: 180, boxShadow: '0 2px 8px rgba(255,136,0,0.08)' }}
          >
            Thêm thương hiệu
          </OrangeButton>
        </Grid>
      </Grid>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          border: '1px solid #ffe0b2',
          mt: 1,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: orange }}>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '5%', border: 0 }}>#</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>MÃ THƯƠNG HIỆU</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>TÊN THƯƠNG HIỆU</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY TẠO</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY SỬA</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY XÓA</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>MÔ TẢ</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>TRẠNG THÁI</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(brands) && brands.length > 0 ? (
              brands.map((brand, index) => (
                <TableRow
                  key={brand.id}
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
                  <TableCell sx={{ fontWeight: 600, color: black, letterSpacing: 1, border: 0 }}>
                    {brand.ma}
                  </TableCell>
                  <TableCell sx={{ color: black, fontWeight: 500, border: 0 }}>
                    {brand.ten}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {brand.ngayTao?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {brand.ngaySua?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {brand.ngayXoa?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {brand.moTa || '-'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
                    <Chip
                      label={brand.trangThai === 1 ? 'Đang Hoạt Động' : 'Ngừng Hoạt Động'}
                      sx={{
                        bgcolor: brand.trangThai === 1 ? '#a3e635' : '#6c757d',
                        color: brand.trangThai === 1 ? '#1a2e05' : white,
                        fontWeight: 600,
                        px: 1.5,
                        fontSize: 14,
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
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#e3f2fd', color: '#0d47a1' },
                        }}
                        onClick={() => handleViewOrEdit(brand, true)}
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
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#ffe0b2', color: '#ff6f00' },
                        }}
                        onClick={() => handleViewOrEdit(brand, false)}
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
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#ffeaea', color: '#b71c1c' },
                        }}
                        onClick={() => setConfirmModal({ open: true, id: brand.id })}
                        size="small"
                      >
                        <SyncIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" fontSize={18}>
                    {searchTerm ? `Không tìm thấy thương hiệu với tên hoặc mã "${searchTerm}"` : 'Không có thương hiệu nào'}
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
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} thương hiệu)
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
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}>
          {isViewMode ? 'Xem Thương Hiệu' : selectedBrand ? 'Chỉnh sửa Thương Hiệu' : 'Thêm mới Thương Hiệu'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSave}>
            {selectedBrand && (
              <TextField
                label="Mã Thương Hiệu"
                value={formData.ma}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: '#f8f9fa', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
            <TextField
              label="Tên Thương Hiệu"
              value={formData.ten}
              onChange={(e) => !isViewMode && setFormData({ ...formData, ten: e.target.value })}
              fullWidth
              margin="normal"
              required={!isViewMode}
              error={!!formErrors.ten}
              helperText={formErrors.ten}
              InputProps={{ readOnly: isViewMode }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Mô Tả"
              value={formData.moTa}
              onChange={(e) => !isViewMode && setFormData({ ...formData, moTa: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              error={!!formErrors.moTa}
              helperText={formErrors.moTa}
              InputProps={{ readOnly: isViewMode }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <OrangeButton type="submit" variant="contained">
                  {selectedBrand ? 'Cập nhật' : 'Thêm mới'}
                </OrangeButton>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn thay đổi trạng thái thương hiệu này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmModal({ open: false, id: null })}
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <OrangeButton variant="contained" onClick={handleDelete}>
            Xác nhận
          </OrangeButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Brand;