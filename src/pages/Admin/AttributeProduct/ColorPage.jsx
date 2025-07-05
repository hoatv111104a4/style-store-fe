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
import { getAllMauSac, addMauSac, updateMauSac, deleteMauSac, searchMauSacByKeyword } from '../../../services/Admin/MauSacService';

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

const getColorCode = (color) => {
  if (!color || !color.ma) return '#000000';
  return isValidHex(color.ma) ? color.ma : '#000000';
};

const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

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

const Color = () => {
  const [colors, setColors] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
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

  const fetchData = useCallback(async (page, size, keyword = '') => {
    try {
      setLoading(true);
      if (keyword) setSearchLoading(true);
      setError(null);
      const response = await searchMauSacByKeyword(keyword.trim(), page, size);
      setColors(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu từ server');
    } finally {
      setLoading(false);
      if (keyword) setSearchLoading(false);
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
      errors.ten = 'Tên màu sắc không được để trống';
    } else if (!formData.ten.trim().match(/^[\p{L}\s]+$/u)) {
      errors.ten = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    } else if (formData.ten.length > 50) {
      errors.ten = 'Tên không được vượt quá 50 ký tự';
    } else {
      try {
        const response = await searchMauSacByKeyword(formData.ten.trim(), 0, 10);
        const existingColors = response.content || [];
        const isDuplicate = existingColors.some(
          (color) =>
            color.ten.toLowerCase() === formData.ten.trim().toLowerCase() &&
            (!selectedColor || color.id !== selectedColor.id)
        );
        if (isDuplicate) {
          errors.ten = 'Tên màu sắc đã tồn tại';
        }
      } catch (err) {
        errors.ten = 'Không thể kiểm tra tên màu sắc';
      }
    }
    if (formData.moTa?.length > 255) {
      errors.moTa = 'Mô tả không được vượt quá 255 ký tự';
    }
    if (!formData.ma || !isValidHex(formData.ma)) {
      errors.ma = 'Mã màu phải là mã hex hợp lệ (VD: #FF0000)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedColor]);

  const handleAdd = useCallback(() => {
    const existingCodes = colors.map((c) => c.ma);
    const newMa = generateUniqueHex(existingCodes);
    setFormData({
      ma: newMa,
      ten: '',
      ngayTao: new Date().toISOString(),
      ngaySua: new Date().toISOString(),
      ngayXoa: null,
      moTa: '',
      trangThai: 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedColor(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  }, [colors]);

  const handleViewOrEdit = useCallback((color, viewOnly = false) => {
    setFormData({
      ...color,
      ngayTao: color.ngayTao || '',
      ngaySua: color.ngaySua || '',
      ngayXoa: color.ngayXoa || null,
      trangThai: color.trangThai || 1,
    });
    setFormErrors({});
    setAlertMessage('');
    setSelectedColor(color);
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
        const colorToSave = {
          ...formData,
          ma: formData.ma.toUpperCase(),
          ten: formData.ten.trim(),
          trangThai: 1,
          ngayTao: selectedColor ? formData.ngayTao : now,
          ngaySua: now,
          ngayXoa: formData.trangThai === 0 ? now : null,
        };
        if (selectedColor) {
          await updateMauSac(selectedColor.id, colorToSave);
          setColors((prev) =>
            prev.map((c) => (c.id === selectedColor.id ? { ...c, ...colorToSave } : c))
          );
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
        setAlertType('error');
      }
    },
    [formData, selectedColor, currentPage, pageSize, searchTerm, validateForm, fetchData]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteMauSac(confirmModal.id);
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

  const handleTenChange = useCallback((e) => {
    const newTen = e.target.value;
    const normalizedTen = newTen.toLowerCase();
    const newHex = colorMap[normalizedTen] || formData.ma;
    setFormData({
      ...formData,
      ten: newTen,
      ma: isValidHex(newHex) ? newHex.toUpperCase() : formData.ma,
    });
  }, [formData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="warning" size={60} />
      </Box>
    );
  }
  if (error && !colors.length) {
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
        QUẢN LÝ MÀU SẮC
      </Typography>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={7}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Nhập tên hoặc mã màu..."
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
            Thêm màu sắc
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
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>MÃ MÀU SẮC</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>TÊN MÀU SẮC</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY TẠO</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY SỬA</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>NGÀY XÓA</TableCell>
              <TableCell sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>MÔ TẢ</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '10%', border: 0 }}>TRẠNG THÁI</TableCell>
              <TableCell align="center" sx={{ color: white, fontWeight: 700, width: '15%', border: 0 }}>HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(colors) && colors.length > 0 ? (
              colors.map((color, index) => (
                <TableRow
                  key={color.id}
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
                    {color.ma}
                  </TableCell>
                  <TableCell sx={{ color: black, fontWeight: 500, border: 0 }}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        width: 16,
                        height: 16,
                        backgroundColor: getColorCode(color),
                        border: '1px solid #ccc',
                        borderRadius: '50%',
                        mr: 1,
                        verticalAlign: 'middle',
                      }}
                    />
                    {color.ten}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {color.ngayTao?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {color.ngaySua?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {color.ngayXoa?.slice(0, 10) || '-'}
                  </TableCell>
                  <TableCell sx={{ color: black, border: 0 }}>
                    {color.moTa || '-'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 0 }}>
                    <Chip
                      label={color.trangThai === 1 ? 'Đang Hoạt Động' : 'Ngừng Hoạt Động'}
                      sx={{
                        bgcolor: color.trangThai === 1 ? '#a3e635' : '#6c757d',
                        color: color.trangThai === 1 ? '#1a2e05' : white,
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
                        onClick={() => handleViewOrEdit(color, true)}
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
                        onClick={() => handleViewOrEdit(color, false)}
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
                        onClick={() => setConfirmModal({ open: true, id: color.id })}
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
                    {searchTerm ? `Không tìm thấy màu sắc với tên hoặc mã "${searchTerm}"` : 'Không có màu sắc nào'}
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
          Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages} ({totalElements} màu sắc)
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
          {isViewMode ? 'Xem Màu Sắc' : selectedColor ? 'Chỉnh sửa Màu Sắc' : 'Thêm mới Màu Sắc'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSave}>
            {selectedColor && (
              <TextField
                label="Mã Màu Sắc"
                value={formData.ma}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: '#f8f9fa', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
            <TextField
              label="Tên Màu Sắc"
              value={formData.ten}
              onChange={(e) => !isViewMode && handleTenChange(e)}
              fullWidth
              margin="normal"
              required={!isViewMode}
              error={!!formErrors.ten}
              helperText={formErrors.ten}
              InputProps={{ readOnly: isViewMode }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <TextField
                label="Mã Hex"
                value={formData.ma}
                onChange={(e) => !isViewMode && setFormData({ ...formData, ma: e.target.value.toUpperCase() })}
                fullWidth
                margin="normal"
                required={!isViewMode}
                error={!!formErrors.ma}
                helperText={formErrors.ma}
                InputProps={{ readOnly: isViewMode }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <input
                type="color"
                value={isValidHex(formData.ma) ? formData.ma : '#000000'}
                onChange={(e) => !isViewMode && setFormData({ ...formData, ma: e.target.value.toUpperCase() })}
                disabled={isViewMode}
                style={{ width: 40, height: 40, padding: 0, border: 'none' }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: isValidHex(formData.ma) ? formData.ma : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '50%',
                }}
              />
            </Box>
            <TextField
              label="Mô Tả"
              value={formData.moTa || ''}
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
                  {selectedColor ? 'Cập nhật' : 'Thêm mới'}
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
            Bạn có chắc muốn thay đổi trạng thái màu sắc này?
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

export default Color;